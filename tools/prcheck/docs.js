
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
    if(!o.ctx) return !o.isPrivate;
    return o.ctx.type === 'method' && !o.isPrivate;
  });

  // code or nocode?
  obj = obj.map(function(o) {
    // console.log(o);
    // o.code = false;
    return o;
  });

  process.stdout.write(template.render({
    comments: obj
  }));

}
