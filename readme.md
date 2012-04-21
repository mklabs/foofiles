
Personal playground for growing packages.

---

Most of the content of the repo are independent little scripts that can
be used either from the cli or the stream API.

Each scripts should conform to the following interface:

* if no `--file` is provided, then takes input from stdin

* if no `--output` is provided, then prints results to stdout.

The node scripts here should be usable in an unix-like way, you can pipe
things to it and pipe the output to anything.

It's easy to use, to automate or integrate in a given build process.


