var express = require('express')
var router = express.Router()
var accountSid = 'AC817c36f0cdb7e4d489c5e2586a149095'
var authToken = 'fd2430d88835fab8df742d83818eafbd'
var twilio = require('twilio')
var Streamify = require('../utils/Streamify')


router.get('/', function(req, res, next) {
	var client = new twilio.RestClient(accountSid, authToken)
	client.messages.create({
	    body: 'Hello from Node',
	    to: '+12037227160',  // Text this number
	    from: '+16467130087' // From a valid Twilio number
	}, function(err, message) {
	    console.log(message.sid)
	})

//    res.send('respond with a resource')
})

// webhook from twilio:
router.post('/', function(req, res, next) {
	// TWILIO: {"ToCountry":"US","ToState":"NY","SmsMessageSid":"SM0a1de785280d9cce83cd5585741354b7",
	// "NumMedia":"0","ToCity":"NEW YORK","FromZip":"10128",
	// "SmsSid":"SM0a1de785280d9cce83cd5585741354b7","FromState":"CT","SmsStatus":"received",
	// "FromCity":"NORWALK","Body":"Test task","FromCountry":"US","To":"+16467130087","ToZip":"10028",
	// "NumSegments":"1","MessageSid":"SM0a1de785280d9cce83cd5585741354b7",
	// "AccountSid":"AC817c36f0cdb7e4d489c5e2586a149095","From":"+12037227160","ApiVersion":"2010-04-01"}

	// var client = new twilio.RestClient(accountSid, authToken)
	// client.messages.create({
	//     body: 'TEST REPLY',
	//     to: '+12037227160',  // Text this number
	//     from: '+16467130087' // From a valid Twilio number
	// }, function(err, message) {
	//     console.log(message.sid)
	// })



	var message = req.body['Body']
	var parts = message.split('?v=')
	console.log('PARTS: '+JSON.stringify(parts))
	if (parts.length < 2){
		//error
	}

	var youtubeId = parts[1]
	if (youtubeId.length < 11){
		//error
	}

	youtubeId = youtubeId.substring(0, 11)
	console.log('YOUTUBE ID: '+youtubeId)
	var url = 'https://www.youtube.com/watch?v='+youtubeId

    try {
//		var url = req.query.video
		res.setHeader('Content-disposition', 'attachment; filename=file.mp3')
		res.setHeader('Content-type', 'audio/mpeg')

		var stream = Streamify.streamify(url)

		var client = new twilio.RestClient(accountSid, authToken)
		client.messages.create({
		    body: stream,
		    to: '+12037227160',  // Text this number
		    from: '+16467130087' // From a valid Twilio number
		}, function(err, message) {
		    console.log(message.sid)
		})
   }
   catch (exception) {
//		res.status(500).send(exception)
		var client = new twilio.RestClient(accountSid, authToken)
		client.messages.create({
		    body: 'ERROR: '+exception.message,
		    to: '+12037227160',  // Text this number
		    from: '+16467130087' // From a valid Twilio number
		}, function(err, message) {
		    console.log(message.sid)
		})
   }

})

module.exports = router
