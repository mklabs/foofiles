
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

Commands.prototype.la = function(cmd, cb) {
  var self = this;
  this.list(cmd, function(g) {
    self.log(g.id, g.description.bold);
    self.log('Created: ', g.created_at.cyan);
    self.log('Updated: ', g.updated_at.cyan);
    self.log('Git URL: ', g.git_pull_url.cyan);
    self.log('    URL: ', g.url.cyan);
  }, cb);
};

Commands.prototype.ls = function(cmd, cb) {
  var self = this;
  this.list(cmd, function(g) {
    self.log(g.id, '  ', g.description.cyan);
  }, cb);
};

Commands.prototype.ll = function(cmd, cb) {
  if(!cb) cb = remote, remote = false;
  var self = this;
  this.list(cmd, function(g) {
    self.log(g.id, '  ', g.description.bold);
    self.readline.inspect(g);
  }, cb);
};

// main list function, does the walking of pages to fetch the whole set
// of gists for a user
Commands.prototype.list = function(cmd, logger, cb) {
  if(!cb) cb = remote, remote = false;

  var filter = cmd.split(' ').slice(1).join(' ');
  if(filter) filter = new RegExp(filter, 'i');

  var rl = this.readline;
  (function next(page) {
    rl.exec('GET /users/:user/gists?page=' + page, function(err, res, gists) {
      if(!gists.length) return cb();
      // normalize description
      gists = gists.map(function(g) {
        g.description = g.description || '';
        return g;
      });

      // filter on description
      gists = gists.filter(function(g) {
        if(!filter) return true;
        return filter.test(g.id) || filter.test(g.description);
      });

      gists.forEach(logger);
      next(page + 1);
    });
  })(1);
};

Commands.prototype.get = function(cmd, cb) {
  console.log('Get?', cmd);
};

Commands.prototype.log = function() {
  var args = Array.prototype.slice.call(arguments);
  args[0] = pad(args[0], 10);
  args[0] = args[0].bold;
  console.log.apply(console, args);
};

function pad(str, max) {
  return str.length > max ? str :
    str + new Array(max - str.length + 1).join(' ');
};

