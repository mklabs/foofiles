
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  Stream = require('stream').Stream,
  marked = require('marked'),
  hogan = require('hogan');

module.exports = Generator;

marked.setOptions({ gfm : true })

function Generator(m) {
  this.readable = this.writable = true;
  this.chunks = [];
  this.filename = m.filename;
  this.dirname = path.dirname(m.filename);

  this.head = this.read('head.html');
  this.tail = this.read('tail.html');

  var self = this;
  // wait for tail / head stream
  this.on('pipe', function(input) {
    self.input = input;
    input.pause();
  });

  this.once('resume', function() { self.input.resume() });

  Stream.call(this);
}

util.inherits(Generator, Stream);

Generator.prototype.write = function(c) {
  this.chunks = this.chunks.concat(c);
};

Generator.prototype.end = function() {
  var template = this.headBody + this.tailBody;

  var md = this.chunks.join('');

  var tokens = marked.lexer(md);

  // title is the first heading / text element,
  var found = false;
  var title = tokens.filter(function(t) {
    if(found) return false;
    return t.type === 'text' || t.type === 'heading';
  })[0];

  // intro is anything before the first hr element. If no hr were found,
  // no intro. Everything but the title element may go in intro.
  var hr = false;
  var intro = tokens.filter(function(t) {
    if(t.type === 'hr') hr = true;
    if(t.depth === 1) return false;
    if(hr) return false;
    return true;
  });

  // if no hr, then no intro
  if(!hr) intro = [];

  var links = intro.links = tokens.links;
  tokens = tokens.slice(intro.length + 1);
  if(tokens[0].type === 'hr') tokens = tokens.slice(1);
  tokens.links = links;
  this.emit('data', hogan.compile(template).render({
    title: title.text,
    intro: marked.parser(intro),
    body: marked.parser(tokens)
  }));
};

Generator.prototype.read = function(file) {
  var self = this,
    name = file.replace(path.extname(file), ''),
    body = name + 'Body';

  self[body] = '';
  return fs.createReadStream(path.join(this.dirname, file))
    .on('data', function(c) { self[body] += c })
    .on('end', function() {
      var ready = !!self.tailBody && !!self.headBody;
      if(ready) self.emit('resume');
    });
};

