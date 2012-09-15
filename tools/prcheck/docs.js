
var fs = require('fs'),
  path = require('path'),
  hogan = require('hogan');

var template = hogan.compile(fs.readFileSync(path.join(__dirname, 'docs.mustache'), 'utf8'));

var json = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk){
  json += chunk;
}).on('end', function(){
  json = JSON.parse(json);
  render(json);
}).resume();

function render(obj) {
  obj = obj.filter(function(o) {
    if(!o.ctx) return false;
    return o.ctx.type === 'method';
  });

  process.stdout.write(template.render({
    comments: obj
  }));

}
