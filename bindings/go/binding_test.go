package tree_sitter_powerscript_test

import (
	"testing"

	tree_sitter_powerscript "github.com/lmortimerl/tree-sitter-powerscript/bindings/go"
	tree_sitter "github.com/tree-sitter/go-tree-sitter"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_powerscript.Language())
	if language == nil {
		t.Errorf("Error loading Powerscript grammar")
	}
}
