
var fs        = require('fs');
var path      = require('path');
var spawn     = require('child_process').spawn;

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
    var opts = grunt.helper('component:opts', grunt.cli.options);

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
    grunt.log.write('... ' + path.basename(bin) + ' ' + args.join(' ') + '...');
    console.log('-->', args);
    var proc = spawn(bin, args);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('exit', function(code) {
      cb(code === 0);
    });
  });


  // build interface
  grunt.registerTask('component', 'Build interface to component', function() {
    var config = grunt.config('component');

    var component = grunt.file.readJSON('component.json');

    // do the globbing and resolve scripts / styles / templates
    ['scripts', 'styles', 'templates'].forEach(function(key) {
      var files = config[key];
      component[key] = files ? grunt.file.expandFiles(files) : [];
    });

    var body = JSON.stringify(component, null, 2);
    grunt.verbose.writeln().write('Writing component.json with:\n' + body).writeln();
    grunt.file.write('component.json', body);
    grunt.log.write('Updating component.json...').ok();


    var builder = path.join(basedir, 'bin/component-build');

    var opts = grunt.config('component.options') || {};
    var args = grunt.helper('component:opts', opts);

    var cb = this.async();
    grunt.log.write('... component-build ' + args.join(' ') + '...');
    var proc = spawn(builder, args);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('exit', function(code) {
      grunt.log.ok();
      cb(code === 0);
    });

  });

  grunt.registerHelper('component:opts', function(opts) {
    return Object.keys(opts || {}).filter(function(key) {
      return !(/tasks|npm/).test(key);
    }).map(function(key) {
      var val = opts[key];
      if(val === false) return '';
      if(val === true) return '--' + key;
      return '--' + key + ' ' + val;
    }).join(' ').split(' ');
  });

};
