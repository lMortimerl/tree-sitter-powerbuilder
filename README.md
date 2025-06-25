# tree-sitter-powerbuilder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Tree-sitter parser for the Appeon PowerBuilder 2022 R3 scripting language.

---

## General Information

This project provides a parser grammar for PowerBuilder scripting language (Appeon PowerBuilder 2022 R3) based on Tree-sitter. The motivation behind this work is to enable better tooling support for PowerBuilder scripts — such as syntax highlighting, code navigation, and static analysis — by providing a reliable and formal grammar specification. PowerBuilder remains widely used in legacy enterprise applications, and modernizing its development experience is critical for maintainability and productivity.

The parser grammar is designed to be lightweight and extensible, focusing on the core syntax elements that appear most commonly in real-world PowerBuilder scripts.

---

## Currently Supported Language Features

- **Basic Types**  
  Support for PowerBuilder primitive types: `integer`, `string`, `boolean`, `blob`, `decimal`, `long`, `any`, `date`, `datetime`, and more.

- **Variables**  
  Declaration with optional modifiers (`public`, `private`, `global`), support for arrays with dimensions, and optional initializers.

- **Expressions**

  - Literals: numbers, strings (with escape sequences), booleans (`true`, `false`), and `null`
  - Identifiers and member access (`object.property`)
  - Binary expressions with common operators (`+`, `-`, `*`, `/`, comparison operators, `and`, `or`)
  - Function calls with argument lists and nested expressions
  - Parenthesized expressions and array literals

- **Statements**
  - Label and `goto` statements
  - Expression statements
  - Conditional statements: `if...then...elseif...else...end if`
  - Looping constructs: `for...to...step...next/end for`, `do...while/until...loop`
  - `return` and `throw` statements
  - `try...catch...finally...end try` error handling
  - Object lifecycle: `create`, `destroy`
  - `halt` statement with optional `close`
  - `choose case` statements with `case` and `case else`
  - `call` statement to invoke ancestor scripts and controls

---

## Roadmap

The following features and improvements are planned for future releases:

- **Enhanced Expression Support**

  - More complex expression parsing (ternary operators, unary operators, typecasting)
  - Support for function definitions and nested functions

- **More Complete Syntax Coverage**

  - Full support for PowerBuilder events and window/control-specific syntax
  - Advanced control structures and scripting constructs

- **Semantic Analysis**

  - Type checking and symbol resolution for better error detection
  - Ancestor object hierarchy resolution for `call` statements

- **Integration**

  - Integration with popular editors and IDEs for syntax highlighting and autocomplete
  - Tooling support for refactoring and code navigation

- **Testing and Validation**
  - Extensive test suite with real-world PowerBuilder scripts
  - Performance optimizations and bug fixes

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to contribute or raise issues to help improve this parser!

---

_Author:_ Mortimer Gibbons  
_Contact:_ mkirchermeier@gmail.com  
_Repository:_ [https://github.com/lmortimerl/tree-sitter-powerbuilder](https://github.com/lmortimerl/tree-sitter-powerbuilder)
