
# foofiles

Personal playground for growing packages.

---

Most of the content of the repo are independent little scripts that can
be used either from the cli or the stream API.

Each scripts should conform to the following interface:

* `<cmd> <file, ...>`, with file mapping a remote url or a local file.

* if no `--output` is provided, then prints results to stdout.

The node scripts here should be usable in an unix-like way, they can
take readable stream and pipe the output to writable stream.

It's easy to use, automate or integrate in a given build process.

---

experimental stuff goes in `experiments/**`. Usually
`experiments/**/readme.md` files includes more info.

This include some test and experimental package, some might gain their
own repo, most won't.

