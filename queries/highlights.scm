;; ----------------------------------------
;; Comments
;; ----------------------------------------

(block_comment) @comment
(line_comment) @comment

;; ----------------------------------------
;; Literals
;; ----------------------------------------

(number) @number
(string) @string
(string_fragment) @string
(escape_sequence) @string.special

(boolean) @constant.builtin
(null) @constant.builtin
(array_literal) @constant

;; ----------------------------------------
;; Identifiers and Variables
;; ----------------------------------------

(identifier) @variable

;; In function calls
(call_expression
  function: (identifier) @function)

;; In method/property access
(member_expression
  property: (identifier) @property)

;; In label declarations
(label_statement
  name: (identifier) @label)

;; In goto
(goto_statement
  label: (identifier) @label)

;; ----------------------------------------
;; Types
;; ----------------------------------------

(primitive_type) @type.builtin

;; ----------------------------------------
;; Operators
;; ----------------------------------------

(binary_expression
  (_)? @operator)

(assignment_expression
  "=" @operator)

(relational_expression
  (_)? @operator)

(partial_relational_expression
  (_)? @operator)

;; ----------------------------------------
;; Keywords and Control Flow
;; ----------------------------------------

[
  "if" "then" "elseif" "else" "end"
  "for" "to" "step" "next"
  "do" "while" "until" "loop"
  "return" "throw"
  "try" "catch" "finally"
  "create" "destroy"
  "choose" "case" "else" "end"
  "goto" "call" "using"
  "halt" "::" "is"
] @keyword

(modifiers) @keyword

;; ----------------------------------------
;; Punctuation
;; ----------------------------------------

["(" ")" "[" "]" "," ";"] @punctuation.delimiter
"." @punctuation.delimiter
":" @punctuation.delimiter


