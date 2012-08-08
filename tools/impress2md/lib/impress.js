
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  mime = require('mime'),
  marked = require('marked'),
  stream = require('stream'),
  Template = require('./template'),
  highlight = require('highlight.js').highlightAuto,
  _ = require('underscore');

module.exports = Impress;
Impress.Template = Template;


// converter - takes a raw markdown content, pass it through
// [marked](https://github.com/chjj/marked), builds a list of sections
// delimited by level-1 heading

function Impress(options) {
  var self = this;
  this.readable = this.writable = true;
  stream.Stream.call(this);

  this.options = options || {};

  this._sections = [];
  this.chunks = [];
  this.data = _.defaults(this.options, {
    name: '',
    page: 0
  });
}

util.inherits(Impress, stream.Stream);


// stream API

Impress.prototype.write = function write(chunk) {
  this.chunks = this.chunks.concat(chunk + '');
};

Impress.prototype.end = function end(chunk) {
  this.body = this.chunks.join('');
  this.tokens = marked.lexer(this.body);

  // read the template file if provided
  this.template = new Template(this.options)
    .on('ready', this.generate.bind(this));
};

// Impress parser / converter API

Impress.prototype.generate = function generate() {
  this
    // build the section list
    .sections()

    // highlight snippet of code
    .highlight()

    // compute the html
    .html()

    // emit data (print to stdout if piped to process.stdout)
    .output();
};

Impress.prototype.sections = function _sections(tokens) {
  var self = this;

  tokens = tokens || this.tokens;

  // the section list to build
  var sections = this._sections;

  // the data object holder passed in to template
  var data = this.data;

  var last = {};
  tokens.forEach(function(t) {
    var heading = t.type === 'heading' || t.type === 'hr',
      level = t.depth;

    // a heading (or hr), create a new sections, and update the last ref
    if(heading) {
      sections = sections.concat(last = {
        title: t.text,
        tokens: [],
        attributes: self.attributes(last)
      });
      data.page++;
    }
    last && last.tokens && last.tokens.push(t);
  });

  this._sections = sections;

  return this;
};

Impress.prototype.attributes = function attributes(last) {
  var attrs = last.attributes || {},
    x = attrs.x,
    y = attrs.y,
    z = attrs.z;

  return {
    x       : x ? x + 1050 : 1,
    y       : y || -1000,
    z       : z || 0,
    rx      : 0,
    ry      : 0,
    rz      : 0,
    scale   : 1
  };
};

Impress.prototype.highlight = function _highlight() {
  this.tokens = this.tokens.map(function(t) {
    if(t.type === 'code') {
      t.text = highlight(t.text).value;
      t.escaped = true;
    }
  });

  return this;
};

var link = /<link.+href="([^"]+)".+\/?>/gm,
  img = /<img.+src="([^"]+)".+\/?>/gm;

Impress.prototype.assets = function(html) {
  var links = html.match(link) || [],
    scripts = html.match(scripts) || []

  /* * /
  var base = this.template.dirname;
  html = html.replace(link, function(match, href) {
    if(/\/\//.test(href)) return match;
    var filepath = path.join(base, href),
        file = fs.readFileSync(filepath, 'utf8');
    return '<style>\n' + file + '\n</style>';
  });

  html = html.replace(img, function(match, src) {
    var ext = /\/\//.test(src);
    return base64img(ext ? '' : src);
  });
  /* */

  return html;
};

Impress.prototype.html = function() {
  var self = this;
  this._sections.forEach(function(section, i) {
    section.html = marked.parser(section.tokens);
    // marked seems to "consume" the tokens while compiling to html
    delete section.tokens;

    var attrs = section.attributes;
    section.attributes = [
      'data-x="$x" data-y="$y" data-z="$z" data-rotate-x="$rx"',
      'data-rotate-y="$ry" data-rotate-z="$rz" data-scale="$scale"'
    ].join(' ')
      .replace('$x', attrs.x)
      .replace('$y', attrs.y)
      .replace('$z', attrs.z)
      .replace('$rx', attrs.rx)
      .replace('$ry', attrs.ry)
      .replace('$rz', attrs.rz)
      .replace('$scale', attrs.scale);
  });
  return this;
};

Impress.prototype.output = function() {
  // bring back the template data, and attach there the sections guess from
  // markdown
  var data = _.extend(this.data, { sections: this._sections });
  // compile and render the final html
  var output = this.assets(this.template.render(data));
  this.emit('data', output);
  return this;
};

function base64img(file) {
  var media = mime.lookup(file),
    body = file ? fs.readFileSync(file, 'base64') : '$base64';

  return '<img src="data:$media;base64,$base64"/>'
    .replace('$media', media)
    .replace('$base64', body)
}
