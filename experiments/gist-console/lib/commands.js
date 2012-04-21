
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  events = require('events');

module.exports = Commands;

function Commands(options) {
  options = options || {};
  this.options = options;
  this.readline = options.readline;
  events.EventEmitter.call(this);
}

util.inherits(Commands, events.EventEmitter);

Commands.prototype.la = function(cmd, remote, cb) {
  if(!cb) cb = remote, remote = false;
  var self = this;
  this.list(function(g) {
    self.log(g.id, g.description.yellow);
    self.log('Created: ', g.created_at.cyan);
    self.log('Updated: ', g.updated_at.cyan);
    self.log('Git URL: ', g.git_pull_url.cyan);
    self.log('    URL: ', g.url.cyan);
  }, cb);
};

Commands.prototype.ls = function(cmd, remote, cb) {
  if(!cb) cb = remote, remote = false;
  var self = this;
  this.list(function(g) {
    self.log(g.id, '  ', g.description.yellow);
  }, cb);
};

Commands.prototype.ll = function(cmd, remote, cb) {
  if(!cb) cb = remote, remote = false;
  var self = this;
  this.list(function(g) {
    self.log(g.id, '  ', g.description.yellow);
    console.log();
    self.readline.inspect(g);
  }, cb);
};

Commands.prototype.list = function(logger, cb) {
  if(!cb) cb = remote, remote = false;

  var rl = this.readline;
  rl.exec('GET /users/:user/gists', function(res, body) {
    var gists = JSON.parse(body);
    gists.forEach(logger);
    cb();
  });
};

Commands.prototype.get = function(cmd, cb) {
  console.log('Get?', cmd);
};

Commands.prototype.log = function() {
  var args = Array.prototype.slice.call(arguments);
  args[0] = pad(args[0].bold, 10);
  console.log.apply(console, args);
};

function pad(str, max) {
  return str.length > max ? str :
    str + new Array(max - str.length + 1).join(' ');
};

