*quick and dirty stripping comments utility*

---

* **html** Removes html comments via [html-minifier][]
  with only `removeComments` and `removeCommentsFromCDATA` turned on.

* **css** Removes CSS comments via regexp replacement (borrowed to
  https://github.com/ded/sqwish)

[html-minifier]: https://github.com/kangax/html-minifier


### Install

The gist has a valid `package.json` so npm may be used to directly install the
package as a tiny global binary utility.

```sh
$ npm install https://gist.github.com/gists/11b15861be04ae8f4a50/download -g
```

If you're having problem with this command (like me), you're likely
behind a proxy and ssl redirections in npm / request may be not
supported.

You may have to clone / download locally the package, untar / cd to it
and run the `npm install` command (with `-g` to install the package
globally).

**To Uninstall**

```sh
$ npm install strip-comments -g
```

Nothing is forcing the global install, the little node script can be used
independently, ex:

```
$ node strip-bin.js --file index.html --output index.html
```

### Usage

If installed globally: `strip-comments html [options]`. If install locally: `node strip-bin.js [options]`

```sh

  Usage: strip-comments [options]

  Options:

    -h, --help     output usage information
    -v, --version  output the version number
    -f, --file     input file
    -o, --output   output file

  Examples:

    $ strip-comments --file index.html --output index.html
    $ strip-comments --file css/style.css > css/style.css
    $ cat css/*.css | strip-comments >> stripped.css
    $ curl http://example.com/css/style.css -s | strip-comments

```

#### html

```sh
$ node strip-bin.js --file index.html --output index.html

# with the binary
$ strip-comments --file index.html --output index.html
```

#### css

```sh
$ node strip-bin.js --file css/style.css --output css/style.css

# with the binary
$ strip-comments --file css/style.css --output css/style.css
```

###### As streams

The commands are implemented as valid node Stream. Commands are designed so that
you can pipe unix command (like cat or curl) and pipe the result to another
subprocess.

If the `--file` option is not set, then the command will try to collect data
from `stdin`.

```sh
$ curl https://raw.github.com/h5bp/html5-boilerplate/master/css/style.css | strip-comments --output style.css
```

If the `--output` option is not set, then the command won't write anything but
output the result to standard ouptut.

```sh
$ strip-comments --file style.css >> style.stripped.css
```

If both are not set, then commands like this should behave as we would expect.

```sh
$ curl https://raw.github.com/h5bp/html5-boilerplate/master/css/style.css | strip-comments >> style.css
```

That's pretty much all it does :)
