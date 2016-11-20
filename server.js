var express = require('express');
var app = express();
var unirest = require('unirest');
var bodyParser = require('body-parser');
var firebase = require('firebase');
var header = {
	'Authorization':'Bearer NjZmYWM3N2ItODBjNS00MjEzLTljN2YtZjE2Mjk3OTk1ODZkM2E5YTdlOGQtYmFl',
	'Content-Type':'application/json'
};
var transactionCount=0;
//-------
var config = {
	apiKey: "AIzaSyAlQSYBDwglqnMtesvxRTTNVFrnJm70hEM",
	authDomain: "trustd-3108c.firebaseapp.com",
	databaseURL: "https://trustd-3108c.firebaseio.com",
	storageBucket: "trustd-3108c.appspot.com",
	messagingSenderId: "703231472570"
};

var ref = new firebase.initializeApp(config);
var firebaseDataRef = ref.database().ref();
//-------

var previousMessage="";
var previousName="";
var previousMention="";
var previousAmount="";
var previousEmail="";

app.use( bodyParser.json() );

app.post('/', function(req, res) {
	var messageId="";
	var message="";
	var email="";
	var nameId="";
	var name="";
	var roomId="";
	var mentionedIds=[];
	var mentionedId1="";
	var mentionedId2="";

	res.end("ok");
	console.log("Ok, receieved");
	messageId = req.body.data.id;
	nameId = req.body.data.personId;
	console.log(messageId);

	var sendMessageID = "https://api.ciscospark.com/v1/messages/" + messageId;
	var sendNameID = "https://api.ciscospark.com/v1/people/"+nameId;

	if ('mentionedPeople' in req.body.data){
		mentionedIds = req.body.data.mentionedPeople;
		//Check if anyone other than the bot is mentioned
		if (mentionedIds[1] !== null){
			mentionedId1 = mentionedIds[0];
			mentionedId2 = mentionedIds[1];
		}
	}
	var sendMention = "https://api.ciscospark.com/v1/people/"+mentionedId2;

	unirest.get(sendMessageID).headers(header)
	.end(function(res){
		if (res.body.text.indexOf('yes') !== -1 && mentionedId2 == null){

			unirest.get(sendNameID).headers(header)
			.end(function(response){
				name = response.body.displayName;

				console.log('name ', name);
				console.log('previousMention ', previousMention);
				console.log('rooms ', res.body.roomId);

				if (name === previousMention){
					unirest.post("https://api.ciscospark.com/v1/messages")
					.headers(header)
					.send({
						'roomId': res.body.roomId,
						'text' : 'IOU Confirmed!'
					})
					.end(function(req, resp){
						var myData = {
							'giver': previousName,
							'amount': previousAmount,
							'email': previousEmail
						}
						//Push to database
						if (previousMention !== null){
							transactionCount++;
							DataPush(previousMention, transactionCount, myData);
						}
					});
				}else{
					unirest.post("https://api.ciscospark.com/v1/messages")
					.headers(header)
					.send({
						'roomId': res.body.roomId,
						'text' : 'You\'re not authorized to confirm!'
					})
					.end(function(req, resp){
						//
					});
					return;
				}
			})
		}
		if (res.body.text.indexOf('no') !== -1 && mentionedId2 == null){
			unirest.get(sendNameID).headers(header)
			.end(function(response){
				name = response.body.displayName;
				if (name === previousMention){
					unirest.post("https://api.ciscospark.com/v1/messages")
					.headers(header)
					.send({
						'roomId': res.body.roomId,
						'text' : 'IOU did not go through!'
					})
					.end(function(req, resp){
						//Reset iou perameters
						var previousMessage="";
						var previousName="";
						var previousMention="";
						var previousAmount="";
						var previousEmail="";
						return;
					});
				}else{
					unirest.post("https://api.ciscospark.com/v1/messages")
					.headers(header)
					.send({
						'roomId': res.body.roomId,
						'text' : 'You\'re not authorized to confirm!'
					})
					.end(function(req, resp){
						//
					});
					return;
				}
			})
		}
		if (res.body.personEmail.indexOf("TrusTD") !== -1 || mentionedId2 == null){
			return;
		} 
		if (mentionedId2 !== null){
			message = res.body.text;
			//console.log("Message: ", message);
			//APIQuery(message);

			var amount = message.replace( /^\D+/g, '');
			previousAmount = amount;
			email = res.body.personEmail;
			previousEmail = email;
			console.log("Email: ", email);

			unirest.get(sendNameID).headers(header)
			.end(function(response){

				name = response.body.displayName;
				previousName = name;
				console.log("Name: ", name);


				unirest.get(sendMention).headers(header)
				.end(function(responseName){

					var nameMention = responseName.body.displayName;
					previousMention = nameMention;
					
					unirest.post("https://api.ciscospark.com/v1/messages")
					.headers(header)
					.send({
						'roomId': res.body.roomId,
						'text' : 'Hey: '+ nameMention + ', ' + name + ' says you owe them ' + amount + '. Can you please confirm?'
					})
					.end(function(req, res){
						console.log(res);
					});
				})
			})
		}
	});
});

app.get('/tropo', function(req, res) {
	console.log(req.body);
})

app.listen(8080, function() {
	console.log('listening on *: ' + 8080);
});

function GetMessage(){

}

function GetName(){

}

function DataPush(taker, count, data) {
    firebaseDataRef.child('IOUs').child(taker+count).set(data)
    .then((res) => {
        // Done
        //Reset iou perameters
		var previousMessage="";
		var previousName="";
		var previousMention="";
		var previousAmount="";
		var previousEmail="";
    })
    .catch((err) => {
        // Done
    });
}

(function APIQuery(message){
	// intentName
	// objects
	// given-name
	var message1 = 'calen owes me dinner';
	var queryURL = 'https://api.api.ai/api/query?v=20150910&query='+message1+'&lang=en&sessionId=234948ff-72a1-460f-ad7f-049dd8a24415&timezone=2016-11-19T21:54:43-0500';
	var header = {
		'Authorization':'Bearer 25c026f44982440e9b773e38419d0382',
		'Content-Type':'application/json'
	};
	unirest.get(queryURL).headers(header)
		.end(function(response){
			console.log(response.raw_body.parameters.intentName);
			console.log(response.raw_body.parameters.objects);
		}) 
})();

