/**
 * @file A parser for the Appeon PowerBuilder 2022 R3 scripting language 'PowerScript'
 * @author Mortimer Gibbons <mkirchermeier@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "powerscript",
  externals: ($) => [$.block_comment],
  conflicts: ($) => [
    [$._expression, $.case_expression],
    [$.binary_expression, $.relational_expression],
  ],
  extras: ($) => [
    /\s/,
    $.block_comment,
    $.line_comment,
    token(seq("&", /\r?\n/)),
  ],

  rules: {
    source_file: ($) => repeat($._statement),

    /* PowerBuilder 2022 Language Basics */
    /* Comments */
    line_comment: (_) => token(seq("//", /[^\n]*/)),

    /* Identifiers */
    identifier: (_) =>
      token(new RegExp("[a-zA-Z_]" + "[a-zA-Z0-9_\\-\\$#%]{0,39}")),

    /* Literals */
    number: (_) => /\d+(\.\d+)?/,
    string: ($) =>
      seq('"', repeat(choice($.string_fragment, $.escape_sequence)), '"'),
    string_fragment: (_) => token.immediate(/[^"~\n]+/),
    escape_sequence: (_) =>
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
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        "}",
      ),

    /* Types */
    _type: ($) => choice($.primitive_type),
    primitive_type: (_) =>
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
    _expression: ($) =>
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
        $.assignment_expression,
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
              field("left", $._expression),
              field("operator", operator),
              field("right", $._expression),
            ),
          ),
        ),
      ),
    relational_expression: ($) =>
      prec.left(
        5,
        seq(
          field("left", $._expression),
          field("operator", choice("<", "<=", ">", ">=", "=", "<>")),
          field("right", $._expression),
        ),
      ),
    partial_relational_expression: ($) =>
      seq(field("operator", choice("<", "<=", ">", ">=", "=", "<>")), $._expression),
    parenthesized_expression: ($) => seq("(", $._expression, ")"),
    member_expression: ($) =>
      prec.left(
        18,
        seq(
          field("object", $._expression),
          ".",
          field("property", $.identifier),
        ),
      ),
    call_expression: ($) =>
      prec.left(
        21,
        seq(
          field("function", $._expression),
          "(",
          optional(
            field(
              "arguments",
              seq($._expression, repeat(seq(",", $._expression))),
            ),
          ),
          ")",
        ),
      ),
    assignment_expression: ($) =>
      prec.right(
        -1,
        seq(field("left", $.identifier), "=", field("right", $._expression)),
      ),

    /* Statements */
    _statement: ($) =>
      seq(
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
        choice("\n", ";"),
      ),
    label_statement: ($) => seq(field("name", $.identifier), ":"),
    goto_statement: ($) => seq("goto", field("label", $.identifier)),
    expression_statement: ($) => seq($._expression),
    if_statement: ($) =>
      choice(
        seq(
          "if",
          field("condition", $._expression),
          "then",
          field("consequence", $._statement),
        ),
        seq(
          "if",
          field("condition", $._expression),
          "then",
          repeat($._statement),
          repeat($.elseif_clause),
          optional($.else_clause),
          "end",
          "if",
        ),
      ),
    _if_statement: ($) =>
      seq(
        "if",
        field("condition", $._expression),
        "then",
        choice(
          prec(1, $.return_statement),
          seq(
            repeat($._statement),
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
        field("condition", $._expression),
        "then",
        repeat($._statement),
      ),
    else_clause: ($) => seq("else", repeat($._statement)),
    for_statement: ($) =>
      seq(
        "for",
        field("start", $.assignment_expression),
        "to",
        field("end", $._expression),
        optional(field("step", seq("step", $._expression))),
        field("body", repeat($._statement)),
        choice("next", seq("end", "for")),
      ),
    loop_statement: ($) =>
      seq(
        "do",
        choice(
          seq(
            "until",
            field("condition", $._expression),
            field("body", repeat($._statement)),
            "loop",
          ),
          seq(
            "while",
            field("condition", $._expression),
            field("body", repeat($._statement)),
            "loop",
          ),
          seq(
            field("body", repeat($._statement)),
            "loop",
            choice(
              seq("while", field("condition", $._expression)),
              seq("until", field("condition", $._expression)),
            ),
          ),
        ),
      ),
    return_statement: ($) => prec.right(seq("return", optional($._expression))),
    throw_statement: ($) => seq("throw", field("expression", $._expression)),
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
    create_statement: ($) => seq("create", optional("using"), $.identifier),
    destroy_statement: ($) => seq("destroy", $.identifier),
    halt_statement: (_) => seq("halt", optional("close")),
    choose_statement: ($) =>
      seq(
        "choose",
        "case",
        field("value", $._expression),
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
      seq(
        optional("is"),
        choice(
          $.range_expression,
          $.relational_expression,
          $.binary_expression,
          $.partial_relational_expression,
          $.number,
          $.identifier,
          $.string,
        ),
      ),
    range_expression: ($) => seq($.number, "to", $.number),
    call_statement: ($) =>
      seq(
        "call",
        field("ancestor_object", $.identifier),
        optional(seq("`", field("control_name", $.identifier))),
        "::",
        field("event", $.identifier),
      ),

    modifiers: () => choice("public", "private", "global"),
    variable_declarator: ($) =>
      seq(
        field("name", $.identifier),
        optional($.array_dimensions),
        optional(seq("=", field("value", $._expression))),
      ),
    variable_declaration: ($) =>
      seq(
        optional($.modifiers),
        $._type,
        $.variable_declarator,
        repeat(seq(",", $.variable_declarator)),
      ),
    array_dimensions: ($) =>
      seq(
        "[",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
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
    keyword: (_) =>
      choice(
        "alias",
        "and",
        "autoinstantiate",
        "call",
        "case",
        "catch",
        "choose",
        "close*",
        "commit",
        "connect",
        "constant",
        "continue",
        "create*",
        "cursor",
        "declare",
        "delete",
        "describe*",
        "descriptor",
        "destroy",
        "disconnect",
        "do",
        "dynamic",
        "else",
        "elseif",
        "end",
        "enumerated",
        "event",
        "execute",
        "exit",
        "external",
        "false",
        "fetch",
        "finally",
        "first",
        "for",
        "forward",
        "from",
        "function",
        "global",
        "goto",
        "halt",
        "if",
        "immediate",
        "indirect",
        "insert",
        "into",
        "intrinsic",
        "is",
        "last",
        "library",
        "loop",
        "namespace",
        "native",
        "next",
        "not",
        "of",
        "on",
        "open*",
        "or",
        "parent",
        "post*",
        "prepare",
        "prior",
        "private",
        "privateread",
        "privatewrite",
        "procedure",
        "protected",
        "protectedread",
        "protectedwrite",
        "prototypes",
        "public",
        "readonly",
        "ref",
        "return",
        "rollback",
        "rpcfunc",
        "select",
        "selectblob",
        "shared",
        "static",
        "step",
        "subroutine",
        "super",
        "system",
        "systemread",
        "systemwrite",
        "then",
        "this",
        "throw",
        "throws",
        "to",
        "trigger",
        "true",
        "try",
        "type",
        "until",
        "update*",
        "updateblob",
        "using",
        "variables",
        "while",
        "with",
        "within",
        "xor",
        "_debug",
      ),
  },
});
