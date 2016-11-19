var express = require('express');
var app = express();
var unirest = require('unirest');
var bodyParser = require('body-parser');
var header = {
	'Authorization':'Bearer NjZmYWM3N2ItODBjNS00MjEzLTljN2YtZjE2Mjk3OTk1ODZkM2E5YTdlOGQtYmFl',
	'Content-Type':'application/json'
};
var messageId="";
var message="";
var email="";
var nameId="";
var name="";
var roomId="";

app.use( bodyParser.json() );

app.post('/', function(req, res) {
	res.end("ok");
	console.log("Ok, receieved");
	messageId = req.body.data.id;
	nameId = req.body.data.personId;
	console.log(messageId);

	var sendMessageID = "https://api.ciscospark.com/v1/messages/" + messageId;
	var sendNameID = "https://api.ciscospark.com/v1/people/"+nameId;

	unirest.get(sendMessageID).headers(header)
	.end(function(res){
		if (email.indexOf("TrusTD") !== -1){
			return;
		} else {
			message = res.body.text;
			console.log("Message: ", message);

			email = res.body.personEmail;
			console.log("Email: ", email);

			unirest.get(sendNameID).headers(header)
			.end(function(res){

				name = res.body.displayName;
				console.log("Name: ", name);

			});

			unirest.post("https://api.ciscospark.com/v1/messages")
			.headers(header)
			.send({
				'roomId': res.body.roomId,
				'text' : 'I receieved: "'+ message + '" from ' + name
			})
			.end(function(req, res){
				console.log(res);
			});
		}
	});
});

app.listen(8080, function() {
	console.log('listening on *: ' + 8080);
});

function GetMessage(){

}
function GetName(){

}
