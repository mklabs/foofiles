
SRC = $(shell find *.md)
HTML = $(SRC:.md=.html)
TMPL ?= basics

all: index.html

docs: clean $(HTML)

clean:
	@echo ... Cleaning previously built  html files ...
	@rm *.html

%.html: %.md
	@echo ... Generating $@ from $< ...
	cat $< | node gh-pager.js $(TMPL) > $@
	@echo ... Done ...

index.html: docs
	mv readme.html index.html

.PHONY: docs

