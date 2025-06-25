/**
 * @file A parser for the Appeon PowerBuilder 2022 R3 scripting language
 * @author Mortimer Gibbons <mkirchermeier@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "powerbuilder",

  extras: ($) => [/\s/, $.comment],
  rules: {
    source_file: ($) => repeat($._statement),
    _type: ($) => choice($.primitive_type, $.array_type),
    _definition: ($) => choice(),
    _expression: ($) => choice($.identifier, $.number),
    comment: (_) => token(choice(seq("//", /.*/))),
    identifier: ($) => /[a-zA-Z][a-zA-Z0-9\$\_]*/,
    number: ($) => /\d+(\.\d+)?/,
    string: ($) => token(seq('"', repeat(choice(/[^"\\\n]/, /\\./)), '"')),
    boolean: (_) => choice("true", "false"),
    null: (_) => "null",
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
    array_type: ($) => seq($._type, "[", "]"),
    /* Statements */
    _statement: ($) => choice($.variable_declaration, $.expression_statement),
    variable_declaration: ($) => seq($._type, $.identifier, optional(";")),

    expression_statement: ($) => seq($.expression, optional(";")),
    expression: ($) =>
      choice(
        $.assignment,
        $.binary_expression,
        $.identifier,
        $.number,
        $.string,
        $.boolean,
        $.null,
        $.parenthesized_expression,
      ),
    assignment: ($) => prec.right(seq($.identifier, "=", $.expression)),
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
          ["==", 5],
          ["and", 2],
          ["or", 1],
        ].map(([operator, precedence]) =>
          prec.left(precedence, seq($.expression, operator, $.expression)),
        ),
      ),
    parenthesized_expression: ($) => seq("(", $.expression, ")"),
  },
});
