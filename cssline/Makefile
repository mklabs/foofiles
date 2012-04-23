
SRC = $(shell find *.md)
HTML = $(SRC:.md=.html)
TMPL ?= basics

all: index.html

docs: $(HTML)

%.html: %.md
	@echo ... Generating $@ from $< ...
	cat $< | node ../gh-pages/gh-pager.js $(TMPL) > $@
	@echo ... Done ...

index.html: docs
	mv readme.html index.html

.PHONY: docs

