var express = require('express')
var router = express.Router()
var Streamify = require('../utils/Streamify')
var APIManager = require('../utils/APIManager')
var path = require('path')
var aws = require('aws-sdk')
var superagent = require('superagent')
var Promise = require('bluebird')
var fs = require('fs')

var fetchFile = function(path){
	return new Promise(function (resolve, reject){

		fs.readFile(path, null, function (err, data) {
			if (err) {reject(err) }
			else { resolve(data) }
		})
	})
}

router.get('/', function(req, res, next) {
    try {
      var url = req.query.video
      // res.setHeader('Content-disposition', 'attachment; filename=file.mp3')
      // res.setHeader('Content-type', 'audio/mpeg')
      // Streamify.streamify(url).pipe(res)

	  var filePath = path.join('tmp', 'file.mp3').replace('routes/', '')
      var stream = Streamify.streamify(url, {file: filePath})
      stream.on('finish', function(){

		// upload to S3:
		var s3 = new aws.S3()
		const s3Params = {
		    Bucket: 'thevarsity',
		    Key: 'file.mp3',
		    Expires: 3600,
		    ContentType: 'audio/mpeg',
		    ACL: 'public-read'
		}

		s3.getSignedUrl('putObject', s3Params, function(err, uploadUrl) {
		    if (err){
			    console.log('S3 ERROR: '+err)
			    return
		    }

			var filePath = path.join('tmp', 'file.mp3').replace('routes/', '')
			fetchFile(filePath)
			.then(function(file){
//				console.log('FILE FETCHED: '+file.size)
				superagent
				.put(uploadUrl)
				.send(file)
				.set('Content-Type', 'audio/mpeg')
				.end(function(err, res) {
					if (err){
					    console.log('UPLOAD ERROR: '+error)
						reject(err)
						return
					}
					
				    console.log('UPLOAD SUCCESS: https://thevarsity.s3.amazonaws.com/file.mp3')
				})
			})
			.catch(function(err){
			    console.log('FETCH FILE ERROR: '+err)
			})
		})
      })

      res.json({
      	confirmation: 'success',
      	path: '/file.mp3'
      })

    } 
    catch (exception) {
      res.status(500).send(exception)
    }
})

module.exports = router

