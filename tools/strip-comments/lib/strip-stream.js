var hm = require('html-minifier'),
  util = require('util'),
  path = require('path'),
  Stream = require('stream').Stream;

// Expose the main StripThings Stream

module.exports = StripThings;

// cache some regexp - match comments in CSS
// (borrowed to ded/sqwuish)
var cm = /\/\*[\s\S]+?\*\//g;

// detect-html-regexp thing. should be improved. pretty sure it would break on
// some stylesheets with `<` or `>` in it (like in comments)
var html = /<[a-z]+[^>]*>(.*?)<\/[a-z]+>/;

//
// StripThings object
//

function StripThings() {
  this.readable = this.writable = true;
  Stream.call(this);
}

util.inherits(StripThings, Stream);

StripThings.prototype.end = function() {};

StripThings.prototype.write = function(chunk) {
  chunk = chunk.toString();
  chunk = html.test(chunk) ? this.stripHtml(chunk) : this.stripCss(chunk);
  this.emit('data', chunk);
};

StripThings.prototype.stripCss = function(css) {
  // we gonna leave a special marker to replace at the end by newlines,
  // only for special block comments like `/** == `

  css = css.replace(cm, function(match) {
    return (/\*\s=/).test(match) ? match : '';
  });

  css = this.trimEmptyLines(css);

  // redo the comment replacement for the comments that we left before deleting empty lines
  // the top-level/block ones.
  css = css.replace(cm, '');

  // prepend the top-level one line banner
  return css;
};

StripThings.prototype.stripHtml = function(html) {
  return this.trimEmptyLines(hm.minify(html, {
    removeComments: true,
    removeCommentsFromCDATA: true
  }));
};

// probably simpler if done with sed, but..
StripThings.prototype.trimEmptyLines = function(str) {
  // first split on /r/n case the file contains some of these char commited somewhere
  // then split on regular /n
  return str.split(/\r\n|\n/)

    // remove empty lines, could it be done in one single regexp?
    .filter(function(l) { return l; })

    // string back
    .join('\n');
};
