
# gist-console

*gist readlines utilities, make exploring your gists easier*

---

Lightweight wrapper to
[http-console](https://github.com/cloudhead/http-console) to make
exploring your gists easier.

* List all your (or another user's) public gists
* Fetch and cache all of or some of your gists locally
* Create a new gists (private by default)
* Fetch is done using raw tarball
  * To clone the git repo, `git clone` is pretty good for that.
* ...

## Synopsis

**Start the gist repl**

    $ gist-console
    gist »

**See list of available commands**

    gist » help
    help          show this help text

    ls            list remote gists
    la            list remote gists with extended information
    ll            list remote gists with full information

    get           fetch a remote gist locally


**List your remote gist**

    gist » ls

Or for a particular user:

    gist » ls <user>

If `user` is omitted, then the local `github.user` value is used (`git
config --get github.user`).

    gist » ls

A range of page can be specified, or `all` by default, handling
pagination for you (depending on the number of your gists, this might
take a while).

**Fetch a gist**

    gist » get <gist-id> <location>

`gist-id` is mandatory, `location` is optional and defaults to
`./gists/<gist-id>`.

> todo

**create** create a gist either from a single files or a whole
directory.

**delete** delete a gist (or set of gists), locally / remotely

**list**: private gists

## Cache

> todo

Every request sent to `https://api.github.com` is fetched and cached
locally. Every subsequent request to a particular url is pulled in from
the cache afterwards.

You can manually force the cache clean with `gist-console clear-cache`,
or `cache clear` from within the repl.

