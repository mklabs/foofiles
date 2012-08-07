
var request = require('request'),
  path = require('path');

// https://github.com/api/v2/json/blob/all/arvida/emoji-cheat-sheet.com/master

request({
  url: 'https://github.com/api/v2/json/blob/all/arvida/emoji-cheat-sheet.com/master',
  json: true
}, function(err, res, files) {
  if(err) throw err;
  var imgs = Object.keys(files.blobs || {}).filter(function(file) {
    return path.extname(file) === '.png';
  }).forEach(function(f) {
    var url = 'https://github.com/arvida/emoji-cheat-sheet.com/raw/master/' + f;
    process.stdout.write(url + '\n');
  });
});
