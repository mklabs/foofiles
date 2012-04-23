
var fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn;

var files = process.argv.slice(2);
(function next(file) {
  if(!file) return;
  var ext = path.extname(file),
    basename = path.basename(file);

  if(basename === 'Makefile') return make(file, files, next)
  if(ext === '.html') return html(file, files, next);
})(files.shift());

function make(file, files, next) {
  var make = spawn('make', ['index.html'], {
    cwd: path.resolve(path.dirname(file))
  });

  console.log();
  console.log('----- Make index.html ', file, '-----');

  make.stdout.pipe(process.stdout);
  make.stderr.pipe(process.stdout);
  make.on('exit', function(code) {
    if(code) return console.error('Oh snap, code different than 0. Code:', code);
    next(files.shift());
  });
}

function html(file, files, next) {
  var links = files.concat(file).map(function(l) {
    return '* [' + path.dirname(l) + '](./' + l + ')';
  }).join('\n');

  return fs.createReadStream('readme.md')
    .on('data', function (c) { html.body += c })
    .on('end', function() {
      html.body = html.body.replace(/---/, function(match) {
        var output = [
          '',
          links,
          '',
          ''
        ].join('\n');

        return output + match;
      });
      console.log(html.body);
    });
}
