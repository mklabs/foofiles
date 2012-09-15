prcheck
=======

Nobe program to help checking PR by providing a single command to automatically:

- Check a PR by its number
- Request GitHub API to get back the remote head
- Perform a `git fetch`
- Create a new branch

Then test it out.

Synopsis
--------

```unicode
$ ~/src/yeoman/yeoman (master) prcheck 451
... Requesting URL https://api.github.com/repos/yeoman/yeoman/pulls/451 ...
  PR:           #451
  Title:        Attempt to fix Issue #443
  Body:         Actually I can't implement correctly a test, mostly because I'm unable to stop the child process that launch the server, and need to wait for the timeout :(
  User:         sleeper


 Remote info:   sleeper/fix_server_test
... Added new remote sleeper git://github.com/sleeper/yeoman.git
From git://github.com/sleeper/yeoman
 * [new branch]      bowerconfig -> sleeper/bowerconfig
 * [new branch]      es6-experiments -> sleeper/es6-experiments
 * [new branch]      externalgenerators -> sleeper/externalgenerators
 * [new branch]      fix_server_test -> sleeper/fix_server_test
 * [new branch]      insight-bin-refactor -> sleeper/insight-bin-refactor
 * [new branch]      installfromnpm -> sleeper/installfromnpm
 * [new branch]      master     -> sleeper/master
 * [new branch]      requirejsconfig -> sleeper/requirejsconfig
 * [new branch]      travis     -> sleeper/travis
... Fetched remote sleeper git://github.com/sleeper/yeoman.git
... We did it! ...
$ ~/src/yeoman/yeoman (fix_server_test)
```

Install
-------

1. Git clone this repo
2. Cd into that directory (tools/prcheck)
3. Run `npm link`
4. You're good to go


API
---
[ { tags: [],
    description: { full: '', summary: '', body: '' },
    code: 'function Git(cmd, redirect) {\n  events.EventEmitter.call(this);\n  var self = this;\n  this.cmd = cmd;\n\n  this.child = spawn(\'git\', cmd.split(\' \'));\n  this.child.stdout.on(\'data\', this.emit.bind(this, \'data\'));\n\n  if(redirect) {\n    this.child.stdout.pipe(process.stdout);\n    this.child.stderr.pipe(process.stderr);\n  }\n\n  var out = \'\';\n  this.child.stdout.on(\'data\', function(buffer) { out += buffer; });\n  this.child.on(\'exit\', function(code) {\n    if(code !== 0) return self.emit(\'error\', \'Cmd (\' + self.cmd + \') code:\' + code);\n    self.emit(\'end\', out);\n  });\n\n}\n\nutil.inherits(Git, events.EventEmitter);\n\nGit.remote = function remote(cb) {\n  var cmd = new Git(\'remote -v\');\n  cmd.on(\'end\', function(stdout) {',
    ctx: { type: 'function', name: 'Git', string: 'Git()' } },
  { tags: [],
    description: 
     { full: '<p>Check for origin remote</p>',
       summary: '<p>Check for origin remote</p>',
       body: '' },
    code: 'var remotename = /origin/.test(stdout) ? \'origin\' :\n      /upstream/.test(stdout) ? \'upstream\' :\n      \'\';\n\n    if(!remotename) return cb(new Error(\'Unable to find a remote for origin or upstream\'));\n    var line = stdout.split(\'\\n\').filter(function(l) {\n      return l.indexOf(remotename) !== -1;\n    })[0];\n\n    var infos = line.match(/github\\.com[:\\/]([^\\/]+)\\/([^\\.]+)/);\n    return cb(null, infos[1], infos[2]);\n  });\n\n  cmd.on(\'error\', prcheck.error.bind(prcheck));\n};\n\n\nGit.fetch = function _fetch(user, repo, cb) {\n  var remote = \'git://github.com/\' + user + \'/\' + repo + \'.git\';',
    ctx: 
     { type: 'declaration',
       name: 'remotename',
       value: '/origin/.test(stdout) ? \'origin\' :',
       string: 'remotename' } },
  { tags: [],
    description: 
     { full: '<p>first remote add, then fetch</p>',
       summary: '<p>first remote add, then fetch</p>',
       body: '' },
    code: 'var cmd = new Git(\'remote add \' + user + \' \' + remote);\n  cmd.on(\'end\', function(out) {\n    console.log(\'... Added new remote \' + user + \' \' + remote);\n\n    var fetch = new Git(\'fetch \' + user, true);\n    fetch.on(\'error\', prcheck.error.bind(prcheck));\n    fetch.on(\'end\', function(out) {\n      console.log(\'... Fetched remote \' + user + \' \' + remote);\n      cb();\n    });\n  });',
    ctx: 
     { type: 'declaration',
       name: 'cmd',
       value: 'new Git(\'remote add \' + user + \' \' + remote)',
       string: 'cmd' } },
  { tags: [],
    description: 
     { full: '<p>silent fail in case we try to readd a already existing remote</p>',
       summary: '<p>silent fail in case we try to readd a already existing remote</p>',
       body: '' },
    code: 'cmd.on(\'error\', function() {\n    cmd.emit(\'end\');\n  });\n};\n\n\nGit.branch = function _branch(user, branch, cb) {\n  var cob = new Git(\'checkout -b \' + branch + \' \' + user + \'/\' + branch);\n  cob.on(\'end\', function() {\n    cb();\n  });' },
  { tags: [],
    description: 
     { full: '<p>on error, most likely already create branch. Checkout into it.</p>',
       summary: '<p>on error, most likely already create branch. Checkout into it.</p>',
       body: '' },
    code: 'cob.on(\'error\', function() {\n    var co = new Git(\'checkout \' + branch);\n    co.on(\'error\', prcheck.error.bind(prcheck));\n    co.on(\'end\', function() {\n      cob.emit(\'end\');\n    });\n  });\n};\n\nprcheck.error = function error(e) {\n  if(!(e instanceof Error)) e = new Error(e);\n  console.error(\'...\', e.message, \'...\');\n  process.exit(1);\n};' },
  { tags: [],
    description: 
     { full: '<p>Load is taking care of figuring out the config, and should be called before<br />any other method.</p>\n\n<p>Returns the config object with <code>remote</code> property (of the current <code>origin</code> remote)</p>',
       summary: '<p>Load is taking care of figuring out the config, and should be called before<br />any other method.</p>',
       body: '<p>Returns the config object with <code>remote</code> property (of the current <code>origin</code> remote)</p>' },
    code: 'prcheck.load = function load(cb) {\n  Git.remote(function(err, user, repo) {\n    if(err) return cb(err);\n    return cb(null, {\n      user: user,\n      repo: repo,\n      remote: user + \'/\' + repo\n    });\n  });\n};',
    ctx: 
     { type: 'method',
       receiver: 'prcheck',
       name: 'load',
       string: 'prcheck.load()' } },
  { tags: [],
    description: 
     { full: '<p>Request helper, to trigger a request on</p>\n\n<pre><code><a href=\'https://api.github.com/repos/:user/:repo/pulls/:number\'>https://api.github.com/repos/:user/:repo/pulls/:number</a>\n</code></pre>\n\n<ul>\n<li>user   - Github user name</li>\n<li>repo   - Github repository name</li>\n<li>num    - PR number.</li>\n<li>cb     - callback to call on completion with result (or error as first\n        arg)</li>\n</ul>\n\n<p>Returns the Pull Request remote head, with information on github user and<br />remote branch.</p>',
       summary: '<p>Request helper, to trigger a request on</p>',
       body: '<pre><code><a href=\'https://api.github.com/repos/:user/:repo/pulls/:number\'>https://api.github.com/repos/:user/:repo/pulls/:number</a>\n</code></pre>\n\n<ul>\n<li>user   - Github user name</li>\n<li>repo   - Github repository name</li>\n<li>num    - PR number.</li>\n<li>cb     - callback to call on completion with result (or error as first\n        arg)</li>\n</ul>\n\n<p>Returns the Pull Request remote head, with information on github user and<br />remote branch.</p>' },
    code: 'prcheck.request = function _request(user, repo, num, cb) {\n  var url = \'https://api.github.com/repos/:user/:repo/pulls/:number\'\n    .replace(\':user\', user)\n    .replace(\':repo\', repo)\n    .replace(\':number\', num);\n\n  console.log(\'... Requesting URL\', url, \'...\');\n  request({ json: true, url: url }, function(err, res, result) {\n    if(err) return cb(err);\n    console.log(\'  PR:          \', \'#\' + result.number);\n    console.log(\'  Title:       \', result.title);\n    console.log(\'  Body:        \', result.body);\n    console.log(\'  User:        \', result.user.login);\n    console.log(\'\');\n    console.log(\'\');\n    console.log(\' Remote info:  \', result.user.login + \'/\' + result.head.ref);\n\n    cb(null, result.user.login, result.head.ref);\n  });\n};',
    ctx: 
     { type: 'method',
       receiver: 'prcheck',
       name: 'request',
       string: 'prcheck.request()' } },
  { tags: [],
    description: 
     { full: '<p>Fetch helper, takes a user name and a repo name. Then try to add a new<br />remote on that endpoint, and perform a git fetch.</p>',
       summary: '<p>Fetch helper, takes a user name and a repo name. Then try to add a new<br />remote on that endpoint, and perform a git fetch.</p>',
       body: '' },
    code: 'prcheck.fetch = function fetch(user, repo, cb) {\n  Git.fetch(user, repo, function(err) {\n    if(err) return cb(err);\n    return cb();\n  });\n};',
    ctx: 
     { type: 'method',
       receiver: 'prcheck',
       name: 'fetch',
       string: 'prcheck.fetch()' } } ]
{ tags: [],
  description: { full: '', summary: '', body: '' },
  code: 'function Git(cmd, redirect) {\n  events.EventEmitter.call(this);\n  var self = this;\n  this.cmd = cmd;\n\n  this.child = spawn(\'git\', cmd.split(\' \'));\n  this.child.stdout.on(\'data\', this.emit.bind(this, \'data\'));\n\n  if(redirect) {\n    this.child.stdout.pipe(process.stdout);\n    this.child.stderr.pipe(process.stderr);\n  }\n\n  var out = \'\';\n  this.child.stdout.on(\'data\', function(buffer) { out += buffer; });\n  this.child.on(\'exit\', function(code) {\n    if(code !== 0) return self.emit(\'error\', \'Cmd (\' + self.cmd + \') code:\' + code);\n    self.emit(\'end\', out);\n  });\n\n}\n\nutil.inherits(Git, events.EventEmitter);\n\nGit.remote = function remote(cb) {\n  var cmd = new Git(\'remote -v\');\n  cmd.on(\'end\', function(stdout) {',
  ctx: { type: 'function', name: 'Git', string: 'Git()' } }
{ tags: [],
  description: 
   { full: '<p>Check for origin remote</p>',
     summary: '<p>Check for origin remote</p>',
     body: '' },
  code: 'var remotename = /origin/.test(stdout) ? \'origin\' :\n      /upstream/.test(stdout) ? \'upstream\' :\n      \'\';\n\n    if(!remotename) return cb(new Error(\'Unable to find a remote for origin or upstream\'));\n    var line = stdout.split(\'\\n\').filter(function(l) {\n      return l.indexOf(remotename) !== -1;\n    })[0];\n\n    var infos = line.match(/github\\.com[:\\/]([^\\/]+)\\/([^\\.]+)/);\n    return cb(null, infos[1], infos[2]);\n  });\n\n  cmd.on(\'error\', prcheck.error.bind(prcheck));\n};\n\n\nGit.fetch = function _fetch(user, repo, cb) {\n  var remote = \'git://github.com/\' + user + \'/\' + repo + \'.git\';',
  ctx: 
   { type: 'declaration',
     name: 'remotename',
     value: '/origin/.test(stdout) ? \'origin\' :',
     string: 'remotename' } }
{ tags: [],
  description: 
   { full: '<p>first remote add, then fetch</p>',
     summary: '<p>first remote add, then fetch</p>',
     body: '' },
  code: 'var cmd = new Git(\'remote add \' + user + \' \' + remote);\n  cmd.on(\'end\', function(out) {\n    console.log(\'... Added new remote \' + user + \' \' + remote);\n\n    var fetch = new Git(\'fetch \' + user, true);\n    fetch.on(\'error\', prcheck.error.bind(prcheck));\n    fetch.on(\'end\', function(out) {\n      console.log(\'... Fetched remote \' + user + \' \' + remote);\n      cb();\n    });\n  });',
  ctx: 
   { type: 'declaration',
     name: 'cmd',
     value: 'new Git(\'remote add \' + user + \' \' + remote)',
     string: 'cmd' } }
{ tags: [],
  description: 
   { full: '<p>silent fail in case we try to readd a already existing remote</p>',
     summary: '<p>silent fail in case we try to readd a already existing remote</p>',
     body: '' },
  code: 'cmd.on(\'error\', function() {\n    cmd.emit(\'end\');\n  });\n};\n\n\nGit.branch = function _branch(user, branch, cb) {\n  var cob = new Git(\'checkout -b \' + branch + \' \' + user + \'/\' + branch);\n  cob.on(\'end\', function() {\n    cb();\n  });' }
{ tags: [],
  description: 
   { full: '<p>on error, most likely already create branch. Checkout into it.</p>',
     summary: '<p>on error, most likely already create branch. Checkout into it.</p>',
     body: '' },
  code: 'cob.on(\'error\', function() {\n    var co = new Git(\'checkout \' + branch);\n    co.on(\'error\', prcheck.error.bind(prcheck));\n    co.on(\'end\', function() {\n      cob.emit(\'end\');\n    });\n  });\n};\n\nprcheck.error = function error(e) {\n  if(!(e instanceof Error)) e = new Error(e);\n  console.error(\'...\', e.message, \'...\');\n  process.exit(1);\n};' }
{ tags: [],
  description: 
   { full: '<p>Load is taking care of figuring out the config, and should be called before<br />any other method.</p>\n\n<p>Returns the config object with <code>remote</code> property (of the current <code>origin</code> remote)</p>',
     summary: '<p>Load is taking care of figuring out the config, and should be called before<br />any other method.</p>',
     body: '<p>Returns the config object with <code>remote</code> property (of the current <code>origin</code> remote)</p>' },
  code: 'prcheck.load = function load(cb) {\n  Git.remote(function(err, user, repo) {\n    if(err) return cb(err);\n    return cb(null, {\n      user: user,\n      repo: repo,\n      remote: user + \'/\' + repo\n    });\n  });\n};',
  ctx: 
   { type: 'method',
     receiver: 'prcheck',
     name: 'load',
     string: 'prcheck.load()' } }
{ tags: [],
  description: 
   { full: '<p>Request helper, to trigger a request on</p>\n\n<pre><code><a href=\'https://api.github.com/repos/:user/:repo/pulls/:number\'>https://api.github.com/repos/:user/:repo/pulls/:number</a>\n</code></pre>\n\n<ul>\n<li>user   - Github user name</li>\n<li>repo   - Github repository name</li>\n<li>num    - PR number.</li>\n<li>cb     - callback to call on completion with result (or error as first\n        arg)</li>\n</ul>\n\n<p>Returns the Pull Request remote head, with information on github user and<br />remote branch.</p>',
     summary: '<p>Request helper, to trigger a request on</p>',
     body: '<pre><code><a href=\'https://api.github.com/repos/:user/:repo/pulls/:number\'>https://api.github.com/repos/:user/:repo/pulls/:number</a>\n</code></pre>\n\n<ul>\n<li>user   - Github user name</li>\n<li>repo   - Github repository name</li>\n<li>num    - PR number.</li>\n<li>cb     - callback to call on completion with result (or error as first\n        arg)</li>\n</ul>\n\n<p>Returns the Pull Request remote head, with information on github user and<br />remote branch.</p>' },
  code: 'prcheck.request = function _request(user, repo, num, cb) {\n  var url = \'https://api.github.com/repos/:user/:repo/pulls/:number\'\n    .replace(\':user\', user)\n    .replace(\':repo\', repo)\n    .replace(\':number\', num);\n\n  console.log(\'... Requesting URL\', url, \'...\');\n  request({ json: true, url: url }, function(err, res, result) {\n    if(err) return cb(err);\n    console.log(\'  PR:          \', \'#\' + result.number);\n    console.log(\'  Title:       \', result.title);\n    console.log(\'  Body:        \', result.body);\n    console.log(\'  User:        \', result.user.login);\n    console.log(\'\');\n    console.log(\'\');\n    console.log(\' Remote info:  \', result.user.login + \'/\' + result.head.ref);\n\n    cb(null, result.user.login, result.head.ref);\n  });\n};',
  ctx: 
   { type: 'method',
     receiver: 'prcheck',
     name: 'request',
     string: 'prcheck.request()' } }
{ tags: [],
  description: 
   { full: '<p>Fetch helper, takes a user name and a repo name. Then try to add a new<br />remote on that endpoint, and perform a git fetch.</p>',
     summary: '<p>Fetch helper, takes a user name and a repo name. Then try to add a new<br />remote on that endpoint, and perform a git fetch.</p>',
     body: '' },
  code: 'prcheck.fetch = function fetch(user, repo, cb) {\n  Git.fetch(user, repo, function(err) {\n    if(err) return cb(err);\n    return cb();\n  });\n};',
  ctx: 
   { type: 'method',
     receiver: 'prcheck',
     name: 'fetch',
     string: 'prcheck.fetch()' } }


### prcheck.load()

<p>Load is taking care of figuring out the config, and should be called before<br />any other method.</p>

<p>Returns the config object with <code>remote</code> property (of the current <code>origin</code> remote)</p>

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

### prcheck.request()

<p>Request helper, to trigger a request on</p>

<pre><code><a href='https://api.github.com/repos/:user/:repo/pulls/:number'>https://api.github.com/repos/:user/:repo/pulls/:number</a>
</code></pre>

<ul>
<li>user   - Github user name</li>
<li>repo   - Github repository name</li>
<li>num    - PR number.</li>
<li>cb     - callback to call on completion with result (or error as first
        arg)</li>
</ul>

<p>Returns the Pull Request remote head, with information on github user and<br />remote branch.</p>

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

### prcheck.fetch()

<p>Fetch helper, takes a user name and a repo name. Then try to add a new<br />remote on that endpoint, and perform a git fetch.</p>

prcheck.fetch = function fetch(user, repo, cb) {
  Git.fetch(user, repo, function(err) {
    if(err) return cb(err);
    return cb();
  });
};
