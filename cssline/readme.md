
*small program/library to convert style sheets from multi-line CSS to single-line, and vice-versa*

This tool internally uses [recess][] to parse CSS files, and work on top
of `recess.definitions` as parsed by the LESS tokenizer.

---

## Synopsis

You can "single-line" a "multi-line" css

    $ cat ./path/to/some/file.css | cssline --oneline

And you can "multi-line" a "single-line" css

    $ css ./path/to/some/file.css | cssline --multiline

You can also convert directly a remote file, it just needs to have `//` in
it to be considered as a remote url.

    $ css https://raw.github.com/necolas/suit/master/css/suit.css --oneline

[recess]: http://twitter.github.com/recess

