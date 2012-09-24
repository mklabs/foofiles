
var util       = require('util');
var generators = require('yeoman-generators');

module.exports = Generator;

function Generator() {
  generators.Base.apply(this, arguments);
  this.hookFor('gruntfile');
}

util.inherits(Generator, generators.NamedBase);
