
var fs        = require('fs');
var path      = require('path');
var spawn     = require('child_process').spawn;
var component = require('component');

// TODO: Implement specific tasks for component commands not catched up by yeoman as part
// of a bower command: convert, create, open, ...
//
// TODO: figure out a better name for bower task, abstract away. manager?

module.exports = function(grunt) {

  // figure out component install location and list of bin
  var basedir = path.dirname(require.resolve('component'));
  var bins = require(path.join(basedir, 'package.json')).bin;

  // /^install|^uninstall|^search|^list|^ls|^lookup|^update/
  grunt.registerTask('bower', 'Component facade to grunt', function(cmd) {
    // get rid of the commands in the arg array
    var args = this.args.slice(1);

    // cli flags
    var opts = Object.keys(grunt.cli.options).filter(function(key) {
      return !/tasks|npm/.test(key);
    });

    if(opts.length) opts = opts.map(function(key) {
      var val = grunt.cli.options[key];
      if(val === false) return '';
      if(val === true) return '--' + key;
      return '--' + key + ' ' + val;
    }).join(' ').split(' ');

    // alias list to ls
    cmd = cmd === 'list' ? 'ls' : cmd;

    // bin file to invoke
    var bin = 'component-' + cmd;
    if(!bins[bin]) {
      grunt.log.error(cmd + ' is not a valid component command.');
      return false;
    }

    bin = path.join(basedir, 'bin', bin);

    var cb = this.async();
    // stdio: inherit in 0.8
    args = args.concat(opts);
    console.log('spawning', args, opts);
    var proc = spawn(bin, args);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('exit', function(code) {
      cb(code === 0);
    });
  });
};
