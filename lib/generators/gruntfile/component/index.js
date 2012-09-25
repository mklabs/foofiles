
var util       = require('util');
var path       = require('path');
var generators = require('yeoman-generators');

module.exports = Generator;

function Generator() {
  generators.Base.apply(this, arguments);

  // to be replace by emit error, once API fleshed out and proper listener added
  this.on('error', function(err) {
    console.log('Oh no', err);
    process.exit(1);
  });
}

util.inherits(Generator, generators.Base);

Generator.prototype.configure = function configure() {
  // Do you have a gruntfile ?
  if(!this.exists('Gruntfile.js')) {
    return this.emit('error', new Error('Missing Gruntfile at ' + process.cwd()));
  }

  var gruntfile = this.read(path.resolve('Gruntfile.js'));

  // best-guess here, ok for most of gruntfile, but fancy one would go
  // through... Just checking the `};` closing the whole gruntfile function,
  // start of the line.

  var snippet = [
    '',
    '  // Load the tasks builtin yeoman-component plugin',
    '  grunt.loadNpmTasks(\'yeoman-component\');',
    '',
    '};'
  ].join('\n');

  if(gruntfile.indexOf(snippet) === -1) {
    gruntfile = gruntfile.replace(/^\};/gm, snippet);
  }

  var config = [
    '',
    '    component: {',
    '      scripts: [\'app/scripts/*.js\', \'app/scripts/src/**/*.js\'],',
    '      options: {',
    '        out: \'temp/\',',
    '        verbose: true',
    '      }',
    '    },',
    ''
  ].join('\n');

  var placeholder = [
    '    // Project configuration',
    '    // ---------------------'
  ].join('\n');

  if(gruntfile.indexOf(config) === -1) {
    gruntfile = gruntfile.replace(placeholder, placeholder + config);
  }

  this.write('Gruntfile.js', gruntfile);
};

Generator.prototype.editIndex = function editIndex() {
  var filename = path.resolve('app/index.html');
  if(!this.exists(filename)) {
    return;
  }

  var body = this.read(filename);

  var snippet = ['<script src="build.js"></script>'];

  if(body.indexOf(snippet) === -1) {
    body = body.replace(/^(\s*)<\/body>/m, '$1' + '  ' + snippet + '\n$1</body>');
  }

  this.write(filename, body);
};
