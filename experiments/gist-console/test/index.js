var GistConsole = require('../');

var opts = require('nopt')({
  help: Boolean,
  user: String,
  prompt: String,
  color: ['bold', 'grey', 'yellow', 'red', 'green', 'white', 'cyan']
}, {
  h: '--help'
});

var repl = new GistConsole(opts);
if(opts.help) return repl.help();

repl.initialize();
