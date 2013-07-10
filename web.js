var express = require('express'),
    fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var filename = "./index.html";
  var buf = new Buffer(fs.readFileSync(filename));
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(buf.toString());
  response.end();
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
