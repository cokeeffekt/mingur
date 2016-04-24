var fs = require('fs'),
  request = require('request'),
  shortid = require('shortid'),
  _ = require('lodash');

var sys = require('util');
var exec = require('child_process').exec;


var express = require('express');
var app = express();

var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
};
app.use(allowCrossDomain);

function puts(error, stdout, stderr) {
  //  console.log(stdout)
}
//'http://i.imgur.com/1dgCnen.jpg',

var download = function (uri, filename, callback, failed) {
  request.head(uri, function (err, res, body) {
    if (err)
      return failed(err);
    if (!_.includes(res.headers['content-type'], 'image')) {
      return failed('Failed Headers: ', res.headers['content-type'], 'not supported');
    }
    request(uri).pipe(fs.createWriteStream('images/' + filename)).on('close', function (err) {
      if (err) {
        return failed(err);
      }
      var cliDo = ["convert -resize 320 'images/" + filename + "' 'images/" + filename + "'",
                   " && ",
                   "convert -strip -quality 85% 'images/" + filename + "' 'images/" + filename + "'",
                   " && ",
                   "jpegtran -optimize -progressive -copy none -outfile 'images/" + filename + "' 'images/" + filename + "'"
                  ].join('');
      exec(cliDo, puts);
      callback();
      console.log(cliDo);
    });
  });
};

app.get('/', function (req, res) {
  res.send('Give me a url and ill store it... /put?url=http://');
});

app.get('/put', function (req, res) {

  if (req.url.substr(0, 9) != '/put?url=') {
    res.header("Content-Type", "text/plain");
    res.send(500, 'nope');
    return false;
  }
  var url = req.url.replace('/put?url=', '');
  console.log('Fetching: ', url);
  var name = shortid.generate() + '.jpg';
  download(url, name, function () {
    console.log('Success: ', name);
    res.header("Content-Type", "text/plain");
    res.send('http://mingur.mooo.com/' + name);
  }, function (err) {
    console.log('Failed Fetch', url, err);
    res.send(500, 'failed');
  });

});

app.listen(4000);
