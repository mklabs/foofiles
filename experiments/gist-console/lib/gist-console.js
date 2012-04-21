

var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  http = require('http'),
  exec = require('child_process').exec,
  events = require('events'),
  crypto = require('crypto'),
  request = require('request'),
  rimraf = require('rimraf'),
  HttpConsole = require('http-console').Console,
  fstream = require('fstream'),
  Commands = require('./commands'),
  _ = require('underscore');


module.exports = GistConsole;
GistConsole.HttpConsole = HttpConsole;

//
// todo
//
// - flags to switch from v2 to v3 api
// - logref logger
//


function GistConsole(options) {
  options = options || {};
  events.EventEmitter.call(this);

  this.routes = [];
  this.commands = [];

  // HttpConsole api
  this.host = options.host || 'api.github.com';
  this.port = parseInt(options.port || '443', 10);
  this.options = options;
  this.timeout = this.options.timeout ? 5000 : 0;
  this.path = [];
  this.socket = null;
  this.cookies = {};
  this.options.useSSL = true;
  this.options.json = true;

  this.gist = new Commands({
    readline: this
  });

  this.prefix = options.prompt || '☺ >> ';
  this.historyPath = options.history || path.join(__dirname, 'history.txt');
  this.history = fs.createWriteStream(this.historyPath, { flags: 'a' });

  this.cachedir = path.join(__dirname, '../_cache');

  // set up routes and commands
  this.configure();
}

util.inherits(GistConsole, events.EventEmitter);
_.extend(GistConsole.prototype, HttpConsole.prototype);

GistConsole.prototype.configure = function() {
  var o = this.options;
  this.options.prompt = (o.prompt || 'gist »') + ' ';

  this.command('help', 'h', this.help);
};

//
// HttpConsole API overrides
//

GistConsole.prototype.initialize = function() {
  var self = this;
  // init config from git-vars and environment
  this.config(function(err) {
    if(err) return self.emit('error', err);
    HttpConsole.prototype.initialize.apply(self, arguments);
    // for support upcoming history across session
    self.readline.setPrompt(self.options.prompt, self.options.prompt.length);

    self.readline.on('line', function(cmd) {
      self.history.write(cmd + '\n');
    });
  });
  return this;
};

GistConsole.prototype.prompt = function() {
  var prompt = this.options.prompt + this.path.join('/'),
    color = this.options.color || 'grey';

  if(!this.readline) return;
  this.readline.setPrompt(prompt[color], prompt.length);
  this.readline.prompt();
};

var matcher = /^(GET|POST|PUT|HEAD|DELETE)\s([^\s]+)/i;
GistConsole.prototype.exec = function (cmd, cb) {
  var args = cmd.match(matcher)
    self = this;

  // only dealing with GET request for now
  if(cmd === 'help') return this.help();
  if(/^list\s?/.test(cmd)) return this.gist.ls(cmd, this.prompt.bind(this));
  if(/^ls\s?/.test(cmd)) return this.gist.ls(cmd, this.prompt.bind(this));
  if(/^ll\s?/.test(cmd)) return this.gist.ll(cmd, this.prompt.bind(this));
  if(/^la\s?/.test(cmd)) return this.gist.la(cmd, this.prompt.bind(this));

  if(cmd === 'ls-remote') return this.gist.ls(cmd, true, this.prompt.bind(this));
  if(cmd === 'get') return this.gist.get(cmd, this.prompt.bind(this));
  if(cmd === 'cache clear') return rimraf(this.cachedir, function(e) {
    console.log(e || '... Cleared cache ...');
    self.prompt();
  });

  if(!args) {
    if(cmd) console.log(('Unknown command ' + cmd).bold.yellow);
    return this.prompt();
  }

  // GET /github/api/subpath/with/:some/:param/maybe
  var method = args[1],
    url = args[2];

  // replace `:param`
  var params = url.match(/\:[a-z]+/gi) || [];

  (function ask(param) {
    if(!param) {
      return self.request(method, url, cb || function (err, res, body) {
        self.printResponse(res, body, self.prompt.bind(self));
      });
    }

    var p = param.slice(1),
      def = self.options[p];

    // skip the prompt if default options for this param has been passed
    // in
    if(def) {
      url = url.replace(param, def);
      return ask(params.shift(), self);
    }

    self.readline.question(msg, function(res) {
      if(!res && !def) return ask(param, self);
      url = url.replace(param, res || def);
      ask(params.shift(), self);
    });
  })(params.shift())
};

GistConsole.prototype.printResponse = function (res, body, cb) {
  var version = res.httpVersion,
    code = res.statusCode,
    msg = http.STATUS_CODES[code],
    output = '';

  var status = ('HTTP/' + [version, code, msg].join(' ')).bold;

  var color = code >= 500 ? 'red' :
    code >= 400 ? 'yellow' :
    code >= 300 ? 'cyan' :
    'green';

  console.log(status[color]);

  this.printHeaders(res.headers);

  try { this.inspect(JSON.parse(body)) }
  catch(e) {
    console.error('Oh snap!');
    this.inspect(body);
    this.inspect(e);
  };

  // update prompt color with latest status color, if ok, let it be
  var self = this,
    prompt = this.options.prompt;

  cb = prompt === 'green' ? cb : function() {
    self.readline.setPrompt(prompt[color], prompt.length);
    self.readline.prompt();
  };

  // Make sure the buffer is flushed before
  // we display the prompt.
  if(process.stdout.write('')) return cb();
  process.stdout.on('drain', cb);
};


GistConsole.prototype.request = function(method, url, cb) {
  var self = this,
    cache = path.join(this.cachedir, this.sha1(url)),
    body = '';

  var req = request({
    medhod: method,
    url: 'https://' + this.host + url,
    json: true
  });

  function end() {
    cb(null, req.res, JSON.parse(body));
  }

  req.on('end', end).on('error', cb).pause();

  var cachefile = fs.createReadStream(cache)
    .on('error', function(e) {
      console.log('... Caching file', cache, '...');
      console.log('... Request ', 'https://' + self.host + url, '...');
      // pipe the response to the cache file
      req.pipe(fstream.Writer(cache));
      req.resume();
    })
    .once('data', function() { req.abort(); })
    .on('data', function(c) { body += c })
    .on('end', end);

  return req;
};


//
// GistConsole API
//

// init config from git-vars and environment variables
GistConsole.prototype.config = function(cb) {
  var self = this,
    params = this.options;

  this.gitvar(function(e, vars) {
    if(e) return self.emit('error', e);
    self.vars = vars;
    params.user = params.user || vars['github.user'];
    cb();
  });
};

// compute a sha1 for given url
GistConsole.prototype.sha1 = function(url) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(url);
  return sha1.digest('hex');
};

GistConsole.prototype.gitvar = function(cb) {
  exec('git config -l', function(e, out, err) {
    if(e) return cb('error', e);
    var o = out.trim().split('\n').map(function(line) {
      var parts = line.split('=');
      return {
        name: parts[0],
        value: parts[1]
      }
    }).reduce(function(o, line) {
      var value = line.value;

      // coerce to appropriate type
      value = value === 'true' ? true :
        value === 'false' ? false :
        value === 'null' ? null :
        !isNaN(Number(value)) ? Number(value) :
        value;

      o[line.name] = value;
      return o;
    }, {})

    cb(null, o);
  });
};

GistConsole.prototype.command = function(cmd, shorthand, fn) {
  if(!fn) fn = short, short = '';

  this.emit('command', cmd, fn);
  this.commands = this.commands.concat({
    reg: new RegExp('^' + cmd + '$'),
    shorthand: shorthand,
    fn: fn
  });
};

GistConsole.prototype.route = function(reg, fn) {
  this.emit('route', reg, fn);
  this.routes = this.routes.concat({ reg: reg, fn: fn });
};

GistConsole.prototype.help = function() {
  var help = fs.createReadStream(path.join(__dirname, 'help/commands.txt'))
    .on('end', this.prompt.bind(this))
    .pipe(process.stdout);
};

var lf = process.platform === 'win32' ? '\r\n' : '\n';
GistConsole.prototype.inspect = function inspect(o) {
  var output = (lf + util.inspect(o, false, 2, true) + lf).split(lf)
    .forEach(function(line) {
      console.log(line);
    });
}

function join() {
  var args = Array.prototype.slice.call(arguments);
  return path.join.apply(path, args).replace(/\\/g, '/');
}
