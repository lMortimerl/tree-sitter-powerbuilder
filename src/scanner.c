#include <tree_sitter/parser.h>
#include <stdbool.h>

enum TokenType {
  BLOCK_COMMENT = 0,
};

void *tree_sitter_powerbuilder_external_scanner_create() {
  return NULL;
}

void tree_sitter_powerbuilder_external_scanner_destroy(void *payload) {
}

void tree_sitter_powerbuilder_external_scanner_reset(void *payload) {
}

unsigned tree_sitter_powerbuilder_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_powerbuilder_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
}

bool tree_sitter_powerbuilder_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  if (!valid_symbols[BLOCK_COMMENT]) return false;

  if (lexer->lookahead == '/') {
    lexer->advance(lexer, true);
    if (lexer->lookahead == '*') {
      lexer->advance(lexer, false);

      int depth = 1;

      while (depth > 0) {
        if (lexer->eof(lexer)) return false;

        if (lexer->lookahead == '/') {
          lexer->advance(lexer, false);
          if (lexer->lookahead == '*') {
            lexer->advance(lexer, false);
            depth++;
          }
        } else if (lexer->lookahead == '*') {
          lexer->advance(lexer, false);
          if (lexer->lookahead == '/') {
            lexer->advance(lexer, false);
            depth--;
          }
        } else {
          lexer->advance(lexer, false);
        }
      }

      lexer->result_symbol = BLOCK_COMMENT;
      return true;
    }
  }

  return false;
}

