var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs  = require('fs');

var app = express();

app.use(cors());
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/generateWallet', function (req, res) {
	console.log('request user action', req.body);
	res.send('POST request to the user API');
});

app.post('/api/verifyPerson', function (req, res) {
	console.log('request user action', req.body);
	res.send('POST request to the user API');
});

app.post('/api/vote', function (req, res) {
	console.log('request user action', req.body);
	res.send('POST request to the user API');
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});