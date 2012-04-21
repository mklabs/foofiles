
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  zlib = require('zlib'),
  tar = require('tar'),
  events = require('events'),
  request = require('request');

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
  cmd = cmd.split(' ').slice(1).join(' ');
  var args = cmd.match(/([\d]+)\s?(.+)?/);
  if(!args) {
    console.error('get <id> <location>'.yellow);
    return cb();
  }

  var id = args[1],
    target = args[2] || './gists/' + id,
    url = 'https://gist.github.com/gists/' + id + '/download';

  console.log(url, target);
  fetch(url, target, function(e) {
    if(e) return self.emit('error', e);
    console.log('... Gist', id, 'fetched in', target, '...');
    cb();
  });
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
}

function fetch(tarball, target, cb) {
  // tarball untar opts
  var extractOpts = { type: 'Directory', path: target, strip: 1 };

  // remote request --> zlib.Unzip() --> untar into h5bp/root
  var req = request.get(tarball).on('error', cb);

  req.on('data', function() { process.stdout.write('.'); });

  return req
    // first gzip
    .pipe(zlib.Unzip())
    .on('error', function(err) {
      console.error('unzip error', err);
      cb(err);
    })
    .pipe(tar.Extract(extractOpts))
    .on('entry', function(entry) {
      entry.props.uid = entry.uid = 501;
      entry.props.gid = entry.gid = 20;
    })
    .on('error', function(err) {
      console.error('untar error', err);
      cb(err);
    })
    .on('close', cb);
}
