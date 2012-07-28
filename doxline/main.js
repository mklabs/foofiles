#!/usr/bin/env node

var dox = require('dox'),
  esprima = require('esprima');

// process stdin
var buf = '';
if(!module.parent) {
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk) { buf += chunk; });
  process.stdin.on('end', function() {
    buf = buf.replace('#!/usr/bin/env node', '');
    var obj = exports.parseComments(buf, { raw: false });
    process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
  }).resume();
}

// Streamline two possible type of comments, lines and blocks.
// Case of lines: is considered a block any subsequent sequences of line
// comment.
//
// Parse comments in the given strinf of `js`.
//
// - js         - A string of JavaScript code to parse
// - options    - A Hash object passed to dox' parseComment
//    - raw     - Wheter to include compiled html or raw markdown
//
// Returns an Array of comments.
exports.parseComments = function parseComments(js, options) {
  options = options || {};
  var tokens = esprima.parse(js, { comment: true }),
    comments = tokens.comments;

  var blocks = [],
    block = '';

  comments.forEach(function(comment, i) {
    var start = comment.range[0] - 1,
      prev = comments[i - 1];

    if(comment.type === 'Block') {
      return blocks.push({
        block: comment.value,
        code: exports.locateCodeBlock(js, prev, comment)
      });
    }

    if(!prev) return;

    comment.value = comment.value.replace(/^\s([^\s])/, '$1');

    if(start === prev.range[1]) {
      block += comment.value + '\n';
      return;
    }

    blocks.push({
      block: block,
      code: exports.locateCodeBlock(js, prev, comment)
    });

    block = comment.value + '\n';
  });

  blocks = blocks.map(function(blk) {
    blk.block = blk.block.replace(/^ *\* ?/gm, '');
    var comment = dox.parseComment(blk.block, options);
    comment.code = blk.code;
    comment.ctx = dox.parseCodeContext(comment.code);
    return comment;
  });

  return blocks;
};

// Parse the given `str` of js.
//
// This method tries to locate the according code block from two block
// comments.  Depending if it's dealing with comment block, matches for the whole line
// or the first in the block.
//
// - str    - A string of js to parse
// - from   - Esprima parsed comment item to search from
// - to     - Esprima parsed comment item to stop to the search
//
// Returns the matching code block.
exports.locateCodeBlock = function locateCodeBlock(str, from, to) {
  var lines = str.split('\n');

  var fromLine = from.type === 'Line' ? from.value :
    from.value.split('\n')[1];

  var toLine = to.type === 'Line' ? to.value :
    to.value.split('\n')[1];

  var end = 0, begin = 0;
  lines.forEach(function(line, i) {
    if(begin && end) return;
    if(!!~line.indexOf(fromLine)) begin = i;
    if(!!~line.indexOf(toLine)) end = i;
  });

  var offset = from.value.split('\n').length,
    code = lines.slice(begin + offset, end);

  return code.join('\n').replace(/^\/\*\*?/gm, '').trim();
};

