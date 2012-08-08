
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  events = require('events');

module.exports = Template;

// build up the Hash of possible templates, and expose as "static"
Template.templates = require('../templates');

// template
function Template(o) {
  events.EventEmitter.call(this);

  this.options = o || {};

  // resolve template
  o.template = o.template || 'impress';
  this.pathlike = /\//.test(o.template);
  this.template = this.pathlike ? path.resolve(o.template) : Template.templates[o.template];

  if(!this.template) return this.emit('error', new Error('Unknown template: ' + o.template));

  this.init();
}

util.inherits(Template, events.EventEmitter);

// Template API

Template.prototype.init = function init() {
  if(!this.pathlike) {
    process.nextTick(this.emit.bind(this, 'ready'));
    return this;
  }

  var template = this.template;
  fs.readFile(template, 'utf8', function(err, body) {
    if(err) return self.emit('error', err);
    self.template = _.template(body);
    self.emit('ready');
  });
  return this;
};

Template.prototype.render = function render(data) {
  data = data || {};
  return this.template(data);
};
