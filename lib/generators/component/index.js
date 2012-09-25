
var path       = require('path');
var util       = require('util');
var generators = require('yeoman-generators');

module.exports = Generator;

function Generator() {
  generators.Base.apply(this, arguments);
  // ensure the context is always component
  this.hookFor('gruntfile', { as: 'component' });
}

util.inherits(Generator, generators.NamedBase);

Generator.prototype.componentFile = function componentFile() {
  var name = this.name || path.basename(process.cwd());

  var component = {
    name: name,
    dependencies: {},
    scripts: [],
    styles: [],
    templates: []
  };


  this.write('component.json', JSON.stringify(component, null, 2));
};
