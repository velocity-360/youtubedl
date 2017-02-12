var express = require('express')
var router = express.Router()
var Streamify = require('../utils/Streamify')
//var fs = require('fs')
var path = require('path')

router.get('/', function(req, res, next) {
    try {
      var url = req.query.video
      // res.setHeader('Content-disposition', 'attachment; filename=file.mp3')
      // res.setHeader('Content-type', 'audio/mpeg')
      // Streamify.streamify(url).pipe(res)

	  var filePath = path.join(__dirname, 'public', 'file.mp3').replace('routes/', '')
      var stream = Streamify.streamify(url, {file: filePath})
//      console.log('STREAM: '+JSON.stringify(stream))

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

