
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  spawn = require('child_process').spawn,
  events = require('events'),
  request = require('request');

var prcheck = module.exports;

// Git interface
function Git(cmd, redirect) {
  events.EventEmitter.call(this);
  var self = this;
  this.cmd = cmd;

  this.child = spawn('git', cmd.split(' '));
  this.child.stdout.on('data', this.emit.bind(this, 'data'));

  if(redirect) {
    this.child.stdout.pipe(process.stdout);
    this.child.stderr.pipe(process.stderr);
  }

  var out = '';
  this.child.stdout.on('data', function(buffer) { out += buffer; });
  this.child.on('exit', function(code) {
    if(code !== 0) return self.emit('error', 'Cmd (' + self.cmd + ') code:' + code);
    self.emit('end', out);
  });

}

util.inherits(Git, events.EventEmitter);

Git.remote = function remote(cb) {
  var cmd = new Git('remote -v');
  cmd.on('end', function(stdout) {
    // Check for origin remote
    var remotename = /origin/.test(stdout) ? 'origin' :
      /upstream/.test(stdout) ? 'upstream' :
      '';

    if(!remotename) return cb(new Error('Unable to find a remote for origin or upstream'));
    var line = stdout.split('\n').filter(function(l) {
      return l.indexOf(remotename) !== -1;
    })[0];

    var infos = line.match(/github\.com[:\/]([^\/]+)\/([^\.]+)/);
    return cb(null, infos[1], infos[2]);
  });

  cmd.on('error', prcheck.error.bind(prcheck));
};


Git.fetch = function _fetch(user, repo, cb) {
  var remote = 'git://github.com/' + user + '/' + repo + '.git';
  // first remote add, then fetch
  var cmd = new Git('remote add ' + user + ' ' + remote);
  cmd.on('end', function(out) {
    console.log('... Added new remote ' + user + ' ' + remote);

    var fetch = new Git('fetch ' + user, true);
    fetch.on('error', prcheck.error.bind(prcheck));
    fetch.on('end', function(out) {
      console.log('... Fetched remote ' + user + ' ' + remote);
      cb();
    });
  });

  // silent fail in case we try to readd a already existing remote
  cmd.on('error', function() {
    cmd.emit('end');
  });
};


Git.branch = function _branch(user, branch, cb) {
  var cob = new Git('checkout -b ' + branch + ' ' + user + '/' + branch);
  cob.on('end', function() {
    cb();
  });

  // on error, most likely already create branch. Checkout into it.
  cob.on('error', function() {
    var co = new Git('checkout ' + branch);
    co.on('error', prcheck.error.bind(prcheck));
    co.on('end', function() {
      cob.emit('end');
    });
  });
};

prcheck.error = function error(e) {
  if(!(e instanceof Error)) e = new Error(e);
  console.error('...', e.message, '...');
  process.exit(1);
};

// Load is taking care of figuring out the config, and should be called before
// any other method.
//
// Returns the config object with `remote` property (of the current `origin` remote)
prcheck.load = function load(cb) {
  Git.remote(function(err, user, repo) {
    if(err) return cb(err);
    return cb(null, {
      user: user,
      repo: repo,
      remote: user + '/' + repo
    });
  });
};


// Request helper, to trigger a request on
//
//    https://api.github.com/repos/:user/:repo/pulls/:number
//
// - user   - Github user name
// - repo   - Github repository name
// - num    - PR number.
// - cb     - callback to call on completion with result (or error as first
//            arg)
//
// Returns the Pull Request remote head, with information on github user and
// remote branch.
prcheck.request = function _request(user, repo, num, cb) {
  var url = 'https://api.github.com/repos/:user/:repo/pulls/:number'
    .replace(':user', user)
    .replace(':repo', repo)
    .replace(':number', num);

  console.log('... Requesting URL', url, '...');
  request({ json: true, url: url }, function(err, res, result) {
    if(err) return cb(err);
    console.log('  PR:          ', '#' + result.number);
    console.log('  Title:       ', result.title);
    console.log('  Body:        ', result.body);
    console.log('  User:        ', result.user.login);
    console.log('');
    console.log('');
    console.log(' Remote info:  ', result.user.login + '/' + result.head.ref);

    cb(null, result.user.login, result.head.ref);
  });
};

// Fetch helper, takes a user name and a repo name. Then try to add a new
// remote on that endpoint, and perform a git fetch.
prcheck.fetch = function fetch(user, repo, cb) {
  Git.fetch(user, repo, function(err) {
    if(err) return cb(err);
    return cb();
  });
};

// Branch out a new git branch, based on the user name and branch provided.
prcheck.branch = function branch(user, branch, cb) {
  Git.branch(user, branch, function(err) {
    if(err) return cb(err);
    return cb();
  });
};
