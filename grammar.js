/**
 * @file A parser for the Appeon PowerBuilder 2022 R3 scripting language
 * @author Mortimer Gibbons <mkirchermeier@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "powerbuilder",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
