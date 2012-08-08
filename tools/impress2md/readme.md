impress2md
==========

Little helper to generate basic
[impress](https://github.com/bartaz/impress.js/) based HTML presentation
from raw Markdown.

1. Install
----------

```sh
cd to/this/directory
npm link
```

2. Usage
--------

```sh
impress2md [input]
```

* `input` is optional and if provided is a path to the markdown filename
  to parse and process.

```sh
impress2md ./readme.md > index.html
```

If no input provided, the script awaits data from `stdin`.

```sh
cat readme.md | impress2md > index.html
```

or maybe

```sh
curl
https://raw.github.com/joyent/node/b0950cbea282024a21c735ba20803ac8b05e0b48/README.md
| impress2md > index.html
```

Notes
-----

- Any kind of heading (h1 to h6) or an `<hr />` (markdown: `---`)
  triggers a new section (or page)

- Templates used can be found in templates/default.html.

- `--template` can be used to specify a path to an alternate template
  filename ([undescore template](http://underscorejs.org/#template))


API
---

See `bin/impress` for a really basic example of API usage. This is the
script triggered on `impress2md` command when you have installed this
tool globally.

`Impress` object is a valid readable / writable stream, meaning that you
can pipe it through other streams (such as an `http.ClientRequest` stream, a
`fs.ReadbleStream` or process.stdin)

Options can be passed in `new Impress(options)` where:

- `template`: is the path to an alternate template file. Otherwise,
  defaults to `templates/defaults.htlm`

- Any options you pass are used as a model for the template to compile.

---

```js
var Impress = require('impress2md');

// get the first argument from command line
var input = process.argv.slice(2)[0];

// create the appropriate stream.
//
// got file input, do the file read ourselves, otherwise input stream is stdin
input = input ? fs.createReadStream(input) : process.openStdin();

// pipe.. all the way down!
input.pipe(new Impress()).pipe(process.stdout);
```

Templates
---------

Templates are ([undescore template](http://underscorejs.org/#template)),
and are not restricted to compile to a specific presentation framework
like impress.

They take the following data structure:

```js
{
  name: '',
  page: 7,
  sections: [{
    title: 'impress2md',
    tokens: [],
    attributes: 'data-x="2101" data-y="-1000" data-z="0" data-rotate-x="0" data-rotate-y="0" data-rotate-z="0" data-scale="1"',
    html: '<h1>impress2md</h1>\n<p>Little helper to generate basic\n<a href="https://github.com/bartaz/impress.js/">impress</a> based HTML presentation\nfrom raw Markdown.\n\n</p>\n'
  }, {
    title: '1. Install',
    attributes: 'data-x="1051" data-y="-1000" data-z="0" data-rotate-x="0" data-rotate-y="0" data-rotate-z="0" data-scale="1"',
    html: '<h2>1. Install</h2>\n<pre><code class="lang-sh"><span class="title">cd</span> to/this/directory\n<span class="title">npm</span> link</code></pre>\n'
  }, ...]
}
```

- `name`: Can be used for the `<title>` or w/e.
- `page`: Can be used to attach the page number on each slide if needed,
  with something like `data-page` or something.
- `sections`: Array of section object
  - `title`: The title of each slide
  - `attributes`: Impress specifics. A really basic set of attributes as
    an HTML string suitable to use within templates. The only dynamic
    attributes for now is the `data-x` one, with an offset of 1050.

A basic template looks like the following:

```html
<div class="whatev">

  <% _.each(sections, function(section) { %>
  <section class="step slide" <%= section.attributes %>>
    <%= section.html %>
  </section>
  <% }); %>;

</div>
```

To be done / Might change
-------------------------

- abstract away from impress framework. Should be able to use any
  presentation framework out there (like dzslides).

- if no `--template` provided, switch the defaults to output a raw
  stream of JSON object (like dox does now)

- if `--template` provided, and doesn't include a `/`. Do the lookup in
  internal `templates/` directory (eg. `--template impress` or
  `--template dzslide`)

- if `--template` provided is path-like (has a `/` in it), use it as a
  file path and resolve.

- if `--template` provided is url-like (has something like `http:` or
  `https:` protocol in it), turn the input stream as a request object.

- Provide a few nopt alias for built-in templates:
  - `--tim` --> `--template impress`
  - `--tdz` --> `--template dzslide`
