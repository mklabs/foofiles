#!/usr/bin/env node

var fs = require('fs'),
  path = require('path'),
  join = path.join,
  nopt = require('nopt'),
  spawn = require('child_process').spawn;

// cli args

var opts = nopt({
  help: Boolean,
  version: Boolean
}, {
  h: '--help',
  v: '--version'
});

// available templates
var themeDir = join(__dirname, '../themes');
var templates = fs.readdirSync(themeDir).map(function(f) {
  var pkg = require(join(themeDir, f, 'package.json'));
  pkg.dirname = f;
  return pkg;
});

var names = templates.map(function(t) {
  return t.name;
});


// `--help`

if(opts.help) return fs.createReadStream(join(__dirname, 'gh-pager.txt'))
  .on('end', function() {
    var output = [
      '  Templates:',
      templates.map(function(t) {
        return '    - ' + t.name  + ': ' + t.description
      }).join('\n'),
      ''
    ];

    console.log(output.join('\n'));
  })
  .pipe(process.stdout);

// `--version`

if(opts.version) return console.log(require('./package.json').version);

var name = opts.argv.remain[0];

if(!name) return console.error('Must supply a template buddy. Try --help');

if(!~names.indexOf(name)) return console.error('Invalid template. Try --help');


var template = templates.filter(function(t) {
  return t.name === name;
})[0];

var scriptfile = join(__dirname, template.dirname, template.bin);

//
// todo:
// - prepare env with usefull info
// - cmd /c for windows
//

var sh = spawn('sh', ['-c', scriptfile]);
sh.stdout.pipe(process.stdout);
sh.stderr.pipe(process.stderr);
process.openStdin().pipe(sh.stdin);

sh.on('exit', function(code) {
  if(code) return console.error('Oh snap! Exit code for', scriptfile + ':', code);
});

