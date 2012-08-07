
all: build index.html

BUILDID=$(shell date +%Y-%m-%dT%H:%M)

icons:
	node scripts/fetch.js > all-icons.txt

build:
	cat css/head.css | sed 's/:date/$(BUILDID)/' > emojis.css
	./scripts/build.sh

index.html: templates/head.html templates/tail.html
	cat emojis.css \
	| grep --color=never { \
	| sed 's/^\./<li><span class="/' \
	| sed 's/{/"><\/span><\/li>/' \
	| cat templates/head.html - templates/tail.html \
	> $@

templates/%.html:
	cat $@

.PHONY: index.html
