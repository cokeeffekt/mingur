var fs = require('fs'),
  request = require('request'),
  shortid = require('shortid'),
  _ = require('lodash');

var sys = require('util')
var exec = require('child_process').exec;


var express = require('express');
var app = express();

function puts(error, stdout, stderr) {
  //  console.log(stdout)
}
//'http://i.imgur.com/1dgCnen.jpg',

var download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    if (!_.includes(res.headers['content-type'], 'image')) {
      console.log(res.headers['content-type'], 'not supported');
      return false;
    }
    request(uri).pipe(fs.createWriteStream('images/' + filename)).on('close', function () {
      var cliDo = ["convert -resize 320 'images/" + filename + "' 'images/" + filename + "'",
                   " && ",
                   "convert -strip -quality 85% 'images/" + filename + "' 'images/" + filename + "'",
                   " && ",
                   "jpegtran -optimize -progressive -copy none -outfile 'images/" + filename + "' 'images/" + filename + "'"
                  ].join('');
      exec(cliDo, puts);
      console.log(cliDo);
    });
  });
};

app.get('/', function (req, res) {
  res.send('Give me a url and ill store it... /put?url=http://')
})

app.get('/put', function (req, res) {

  if (req.url.substr(0, 9) != '/put?url=') {
    res.send('nope');
    return false;
  }
  var url = req.url.replace('/put?url=', '');
  console.log('fetching ', url);
  var name = shortid.generate() + '.jpg';
  download(url, name, function () {
    console.log(name);
  });
  res.send(name);
});

app.listen(4000);
