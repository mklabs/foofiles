
SRC = $(shell find */Makefile experiments/*/Makefile)

TMPL ?= basics

all: index.html

docs:
	@echo && echo ... Generating $@ from $(SRC) ... && echo
	node support/docs.js $(SRC)
	@echo && echo ... Done ... && echo

index.md:
	node support/docs.js $(shell find */index.html experiments/*/index.html) \
		| sed  's/undefined//' > index.md

index.html: docs index.md
	@echo ... Generating $@ from readme.md ...
	cat index.md | gh-pages $(TMPL) > $@
	rm index.md
	@echo ... Done ...

.PHONY: index.html docs index.md


