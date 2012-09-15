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


### prcheck.load()

<p>Load is taking care of figuring out the config, and should be called before<br />any other method.</p>

<p>Returns the config object with <code>remote</code> property (of the current <code>origin</code> remote)</p>

<pre><code>
prcheck.load = function load(cb) {
  Git.remote(function(err, user, repo) {
    if(err) return cb(err);
    return cb(null, {
      user: user,
      repo: repo,
      remote: user + '/' + repo
    });
  });
};</code></pre>


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

<pre><code>
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
};</code></pre>


### prcheck.fetch()

<p>Fetch helper, takes a user name and a repo name. Then try to add a new<br />remote on that endpoint, and perform a git fetch.</p>

<pre><code>
prcheck.fetch = function fetch(user, repo, cb) {
  Git.fetch(user, repo, function(err) {
    if(err) return cb(err);
    return cb();
  });
};</code></pre>

