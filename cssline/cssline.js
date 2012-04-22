#!/usr/bin/env node

//
// small program/library to make creation of data uris for web content quick and easy
//
//    ./base64 ../path/to/some/file.png | pbcopy
//

var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  nopt = require('nopt'),
  request = require('request'),
  Stream = require('stream').Stream,
  Recess = require('recess').Constructor;

module.exports = cssline;
cssline.CSSLine = CSSLine;

function cssline(file, options) {
  var url = /\/\//.test(file);
  var input = url ? request(file) : fs.createReadStream(file);
  return input.pipe(new CSSLine(options)).pipe(process.stdout);
}

function CSSLine(options) {
  this.readable = this.writable = true;
  this.chunks = [];
  this.options = options || {};
  this.options.indent = options.indent || '  ';

  // unfortunately, recess only allows filepath to be passed-in not raw content
  // so write the file temporary in a local cache, then create a new Recess

  var self = this;
  this.on('pipe', function(input) {
    self.cachefile = path.join(__dirname, '_cache', (+new Date + '').slice(-10) + '.css');
    input.pipe(fs.createWriteStream(self.cachefile));
  });

  this.on('clean', function() {
    fs.unlink(self.cachefile)
  });

  this.on('recess', function(e) {
    var r = self.recess;

    // most likely parsing single line css if no r.output
    var out = !r.output.length ? this.toMulti(r.data) :
      r.definitions.map(self.toCSS).join('\n');

    self.emit('data', out + '\n');
    self.emit('clean');
  });

  Stream.call(this);
}

util.inherits(CSSLine, Stream);

// take a whole stylesheets and convert to multi-line form
CSSLine.prototype.toMulti = function(body) {
  // one at a time
  var lines = body.split(/\r\n|\n/g)
    .map(this.toMultiProps.bind(this));

  console.log(lines.join('\n'));

  return '';
};

// take a single line of css, expand to multi-line style

var matcher = /(^[^\{]+)\{\s*([^\}]+)\}/;
CSSLine.prototype.toMultiProps = function(line) {
  var parts = line.match(matcher  );
  // most likely comment, let them be
  if(!parts) return line;

  var sel = parts[1],
    props = parts[2],
    indent = this.options.indent;

  // handle props splitting
  props = props.trim();

  var out = [
    sel + '{',
    props.split(';').map(function(p) {
      return indent + p.trim() + ';';
    }).join('\n'),
    '}',
    ''
  ].join('\n');

  return out;
};

// take a less token, returns according css
CSSLine.prototype.toCSS = function(t) {
  if(t.value) return '\n' + t.value.trim();

  var sel = t.selectors.map(function(sel) {
    return sel.elements.map(function(el) {
      return el.combinator.value + el.value;
    }).join('');
  }).join(',');

  var rules = t.rules.map(function(r) {
    var value = r.value.value;
    if(!value) return '';
    return r.name + ': ' + value.map(function(v) {
      var val = Array.isArray(v.value) ? v.value : [{
        value: v.value
      }];

      // should probably be better if put as a recursive thing
      function value(parent) { return function(v) {
        var prev = parent.value && parent.value.value;
        // value is an inner prop, build from parent value
        if(typeof v.value === 'object') {
          // is it an url like thing?
          if(v.paths) return 'url(' + v.value.value + ')';
        }

        // is a direct value and not an inner prop
        if(v.value != null) return v.value + (v.unit || '');

        // name is set, iterate over args and build appropriate output
        if(!v.name) return;
        var args = v.args.map(function(a) {
          return a.value.map(value(v.name));
        }).join(', ');
        return v.name + '(' + args + ')';
      }}

      return val.map(value(r)).join(' ').trim();
    }).join('');
  }).join('; ');

  return sel.trim() + ' { ' + rules + ' }';
};

// stream api

CSSLine.prototype.write = function(c) {
  this.chunks = this.chunks.concat(c);
};

CSSLine.prototype.end = function() {
  var body = this.chunks.join('');
  this.recess = new Recess(this.cachefile, {
    compile: true,
    oneline: true
  }, this.emit.bind(this, 'recess'));
};

// cssline api


// run!
var opts = nopt({
  help: Boolean,
  version: Boolean,
  oneline: Boolean,
  multiline: Boolean
}, {
  h: '--help',
  v: '--version',
  o: '--oneline',
  m: '--multiline',
  single: '--oneline',
  multi: '--multiline'
});

var file = opts.argv.remain[0];
if(file) return cssline(file, opts);

if(opts.help) return fs.createReadStream(path.join(__dirname, 'readme.md')).pipe(process.stdout);
if(opts.version) return console.log(require('./package.json').version);

// read from stdin at this point
process.openStdin().pipe(new CSSLine(opts)).pipe(process.stdout);

