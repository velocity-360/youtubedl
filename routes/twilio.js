var express = require('express')
var router = express.Router()
var accountSid = 'AC817c36f0cdb7e4d489c5e2586a149095'
var authToken = 'fd2430d88835fab8df742d83818eafbd'
var twilio = require('twilio')


router.get('/', function(req, res, next) {
	var client = new twilio.RestClient(accountSid, authToken)


	client.messages.create({
	    body: 'Hello from Node',
	    to: '+12037227160',  // Text this number
	    from: '+16467130087' // From a valid Twilio number
	}, function(err, message) {
	    console.log(message.sid)
	})

    res.send('respond with a resource')
})

router.post('/', function(req, res, next) {
	var client = new twilio.RestClient(accountSid, authToken)


})

module.exports = router
