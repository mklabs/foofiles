
var fs = require('fs'),
  path = require('path'),
  _ = require('underscore');

// Build up a hash of precompiled (underscore) templates, automatically
// from the list of html files in this given directory.
var templates = module.exports;
fs.readdirSync(__dirname).forEach(function(file) {
  if(file === 'index.js') return;

  var content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  templates[file.replace(path.extname(file), '')] = _.template(content);
});
