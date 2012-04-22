
*small program/library to make creation of data URIs for web content quick and easy*

## Synopsis

    $ b64 ./path/to/some/file.png
    # output..
    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAo0AAAHtCAIAAADz09PdAAAPVmlDQ1BJQ0Mg...

You can also encode a remote file

    $ b64 https://github.com/arvida/emoji-cheat-sheet.com/raw/master/public/graphics/emojis/octocat.png

It just needs to have `//` in it to be considered as a remote url.


**css props**

If `b64-css` is used, then the output would be something like

    $ b64-css ../path/to/some/file.png 

    /* b64 encoded ./path/to/some/file.png */
    .file {
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAo0AAAHtCAIAAADz09PdAAAPVmlDQ1BJQ0Mg...)
    }

ready to use in your style sheets (really meant to be use with pbcopy:
`b64-css file.png | pbcopy` for quick copy pasting)

`--css` option can be given a value which is the CSS selector to use to
build the snippet. When no selector is set, this defaults to
`.file-basename` minus extension.

    $ b64-css --css ".icons .octocat" https://github.com/arvida/emoji-cheat-sheet.com/raw/master/public/graphics/emojis/octocat.png
    /* b64 encoded https://github.com/arvida/emoji-cheat-sheet.com/raw/master/public/graphics/emojis/octocat.png */
    .icons .octocat {
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAHtCAIAAADz09PdAAAPVmlDQ1BJQ0Mg...)
    }


