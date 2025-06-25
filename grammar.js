/**
 * @file A parser for the Appeon PowerBuilder 2022 R3 scripting language
 * @author Mortimer Gibbons <mkirchermeier@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "powerbuilder",
  externals: $ => [
    $.block_comment,
  ],
  conflicts: ($) => [[$.expression, $.call_expression]],
  extras: ($) => [/\s/, $.block_comment, $.line_comment],

  rules: {
    source_file: ($) => repeat($._statement),

    /* PowerBuilder 2022 Language Basics */
    /* Comments */
    comment: ($) => choice($.line_comment, $.block_comment),
    line_comment: (_) => token(seq("//", /.*/)),

    /* Identifiers */
    identifier: ($) =>
      token(new RegExp("[a-zA-Z_]" + "[a-zA-Z0-9_\\-\\$#%]{0,39}")),

    /* Literals */
    number: ($) => /\d+(\.\d+)?/,
    string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            // Normal characters except for quotes and tildes
            token.immediate(/[^\n"~]+/),
            // Escaped tilde sequences
            $.escape_sequence,
          ),
        ),
        '"',
      ),
    escape_sequence: ($) =>
      token.immediate(
        seq(
          "~",
          choice(
            // Common escapes
            /[ntvrfb"'\~]/,
            // Decimal ASCII (~000 to ~255)
            /[0-9]{3}/,
            // Hexadecimal (~h01 to ~hFF)
            /h[0-9A-Fa-f]{2}/,
            // Octal (~o000 to ~o377)
            /o[0-7]{3}/,
          ),
        ),
      ),
    boolean: (_) => choice("true", "false"),
    null: (_) => "null",
    array_literal: ($) =>
      seq(
        "{",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        "}",
      ),

    /* Types */
    _type: ($) => choice($.primitive_type),
    primitive_type: ($) =>
      choice(
        "any",
        "blob",
        "boolean",
        "byte",
        "char",
        "character",
        "date",
        "datetime",
        "decimal",
        "dec",
        "double",
        "integer",
        "int",
        "longlong",
        "long",
        "longptr",
        "real",
        "string",
        "time",
        "unsignedinteger",
        "unsignedint",
        "uint",
        "unsignedlong",
        "ulong",
      ),

    /* Expressions */
    expression: ($) =>
      choice(
        $.binary_expression,
        $.call_expression,
        $.member_expression,
        $.identifier,
        $.number,
        $.string,
        $.boolean,
        $.null,
        $.parenthesized_expression,
        $.array_literal,
      ),
    assignment: ($) => seq($.identifier, "=", $.expression),
    member_expression: ($) =>
      prec.left(
        18,
        seq(
          field("object", $.expression),
          ".",
          field("property", $.identifier),
        ),
      ),
    binary_expression: ($) =>
      choice(
        ...[
          ["+", 10],
          ["-", 10],
          ["*", 20],
          ["/", 20],
          ["<", 5],
          [">", 5],
          ["<=", 5],
          [">=", 5],
          ["<>", 5],
          ["=", 5],
          ["and", 2],
          ["or", 1],
        ].map(([operator, precedence]) =>
          prec.left(
            precedence,
            seq(
              field("left", $.expression),
              operator,
              field("right", $.expression),
            ),
          ),
        ),
      ),
    parenthesized_expression: ($) => seq("(", $.expression, ")"),
    call_expression: ($) =>
      seq(
        field("function", $.identifier),
        "(",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        ")",
      ),

    /* Statements */
    _statement: ($) =>
      choice(
        $.label_statement,
        $.goto_statement,
        $.expression_statement,
        $.variable_declaration,
        $.if_statement,
        $.for_statement,
        $.loop_statement,
        $.return_statement,
        $.try_statement,
        $.throw_statement,
        $.create_statement,
        $.destroy_statement,
        $.halt_statement,
        $.choose_statement,
        $.call_statement,
      ),
    label_statement: ($) => seq(field("name", $.identifier), ":"),
    goto_statement: ($) =>
      seq("goto", field("label", $.identifier), optional(";")),
    expression_statement: ($) => seq($.expression, optional(";")),
    if_statement: ($) =>
      seq(
        "if",
        field("condition", $.expression),
        "then",
        choice(
          prec(1, $.return_statement),
          seq(repeat($._statement),
            repeat($.elseif_clause),
            optional($.else_clause),
            "end",
            "if",
          ),
        ),
      ),
    elseif_clause: ($) =>
      seq(
        "elseif",
        field("condition", $.expression),
        "then",
        repeat($._statement),
      ),
    else_clause: ($) => seq("else", repeat($._statement)),
    for_statement: ($) =>
      seq(
        "for",
        field("start", $.assignment),
        "to",
        field("end", $.expression),
        optional(field("step", seq("step", $.expression))),
        field("body", repeat($._statement)),
        choice("next", seq("end", "for")),
      ),
    loop_statement: ($) =>
      seq(
        "do",
        choice(
          seq(
            "until",
            field("condition", $.expression),
            field("body", repeat($._statement)),
            "loop",
          ),
          seq(
            "while",
            field("condition", $.expression),
            field("body", repeat($._statement)),
            "loop",
          ),
          seq(
            field("body", repeat($._statement)),
            "loop",
            choice(
              seq("while", field("condition", $.expression)),
              seq("until", field("condition", $.expression)),
            ),
          ),
        ),
      ),
    return_statement: ($) =>
      prec.right(seq("return", optional($.expression), optional(";"))),
    throw_statement: ($) =>
      seq("throw", field("expression", $.expression), optional(";")),
    try_statement: ($) =>
      seq(
        "try",
        repeat($._statement),
        repeat($.catch_clause),
        optional($.finally_clause),
        "end",
        "try",
      ),
    catch_clause: ($) =>
      seq(
        "catch",
        "(",
        field("exception_type", $.identifier),
        field("exception_name", $.identifier),
        ")",
        repeat($._statement),
      ),
    finally_clause: ($) => seq("finally", repeat($._statement)),
    create_statement: ($) =>
      seq("create", optional("using"), $.identifier, optional(";")),
    destroy_statement: ($) => seq("destroy", $.identifier, optional(";")),
    halt_statement: ($) => seq("halt", optional("close"), optional(";")),
    choose_statement: ($) =>
      seq(
        "choose",
        "case",
        field("value", $.expression),
        repeat($.case_clause),
        optional($.case_else_clause),
        "end",
        "choose",
      ),
    case_clause: ($) =>
      seq(
        "case",
        field("conditions", $.case_expression_list),
        repeat($._statement),
      ),
    case_else_clause: ($) => seq("case", "else", repeat($._statement)),
    case_expression_list: ($) =>
      seq($.case_expression, repeat(seq(",", $.case_expression))),
    case_expression: ($) =>
      choice(
        $.expression,
        seq("is", choice("<", ">", "<=", ">=", "<>", "="), $.expression),
        seq($.expression, "to", $.expression),
      ),
    call_statement: ($) =>
      seq(
        "call",
        field("ancestor_object", $.identifier),
        optional(seq("`", field("control_name", $.identifier))),
        "::",
        field("event", $.identifier),
      ),

    modifiers: ($) => choice("public", "private", "global"),
    variable_declarator: ($) =>
      seq(
        field("name", $.identifier),
        optional($.array_dimensions),
        optional(seq("=", field("value", $.expression))),
      ),
    variable_declaration: ($) =>
      seq(
        optional($.modifiers),
        $._type,
        $.variable_declarator,
        repeat(seq(",", $.variable_declarator)),
        optional(";"),
      ),
    array_dimensions: ($) =>
      seq(
        "[",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        "]",
      ),
    operator: (_) =>
      token(
        choice(
          "+",
          "-",
          "*",
          "/",
          "=",
          "<",
          ">",
          "<=",
          ">=",
          "<>",
          "==",
          "and",
          "or",
          "not",
        ),
      ),
    keywords: (_) =>
      choice(
        "if",
        "then",
        "else",
        "elseif",
        "end if",
        "for",
        "to",
        "next",
        "do",
        "loop",
        "while",
        "try",
        "catch",
        "finally",
        "return",
        "function",
        "end function",
        "global",
        "public",
        "private",
        "integer",
        "string",
        "boolean",
        "long",
        "blob",
        "decimal",
      ),
  },
});
