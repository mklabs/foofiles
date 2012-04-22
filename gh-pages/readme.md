
# gh-pages

Collection of template files for gh-pages creation.

---

Each "theme" is a sub-directory. A typical theme layout is like so:

```sh
└── theme-name
    ├── head.html
    └── tail.html
    └── theme-name.sh
    └── package.json
```

* **head.html** is the template header, usually includes the whole
  `<head />` and beginning of `<body />` content.

* **tail.html** is the template footer, usually the closing `</body>`
  and `</html>` tag.

CSS and JS are inlined for conveniency.

* **package.json** a simple package.json for the given template. A `bin`
  entry should be provided pointing to the template script.

* **theme-name.sh** is the template script executed to build a new html
  page from the template files.

## template script

Can be anything as long as the package.json's `bin` property is set appropriately.

Note that these script files don't have to be nodejs or even javascript
programs. They just have to be some kind of executable file.

They should always conform to the following interface:

* take a markdown stream as stdin

* output to stdout the generated html

## Example

Templates may use the `Generator` base stream in their template script.
It is a convenient object that takes a readable stream and can pipe the
output to any writable stream. Ex:

```js
#!/usr/bin/env node

var fs = require('fs'),
  path = require('path'),
  join = path.join;

// template generator
var Generator = require('../generator');

// from stdin
process.openStdin().pipe(new Generator(module)).pipe(process.stdout);

// from local file
fs.createReadStream('readme.md').pipe(new Generator(module)).pipe(process.stdout);

// from a remote file
var request = require('request');
request('https://raw.github.com/rwldrn/idiomatic.js/master/readme.md')
  .pipe(new Generator(module))
  .pipe(process.stdout);

// same but write to local file instead of stdout
request('https://raw.github.com/rwldrn/idiomatic.js/master/readme.md')
  .pipe(new Generator(module))
  .pipe(fs.createWriteStream('./idiomatic.html'));
```

The `module` object must be passed in to a `new Generator`, the base
template directory is guessed from `module.filename`.


## Head / Tail templates

Two [mustache][] templates (compiled through [hogan][]) are
concatenated rendered using the following data:

* **title**
is guessed from streaming markdown, the very first heading element or
text element is parsed as page title.

* **description**
is a noop right now (probably the first paragraph within `*... some text ...*` markers)

* **intro**
Anything before the very first `<hr />` element (`---` in markdown) is
extracted from body and made available as `data.intro`. Is an html
string (so templates need to use `{{{ intro }}}`. If no `hr` element
were found in the whole document, `intro` remains empty.

* **body**
The rest of the markdown body. Same as intro, is an html string so `{{{
body }}}` should be used.

[mustache]: http://mustache.github.com/
[hogan]: http://twitter.github.com/hogan.js/

