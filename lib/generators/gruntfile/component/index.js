
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
  console.log(gruntfile);

  // best-guess here, ok for most of gruntfile, but fancy one would go
  // through... Just checking the `};` closing the whole gruntfile function,
  // start of the line.

  var snippet = [
    '',
    '  // Load the tasks builtin yeoman-component plugin',
    '  grunt.loadNpmTasks(\'yeoman-component\');',
    '',
    '};'
  ];

  gruntfile = gruntfile.replace(/^\};/gm, snippet.join('\n'));

  this.write('Gruntfile.js', gruntfile);
};
