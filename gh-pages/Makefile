
TMPL ?= basics

all: index.html

index.html: readme.md
	@echo ... Generating $@ from $< ...
	cat $< | gh-pages $(TMPL) > $@
	@echo ... Done ...

.PHONY: index.html

