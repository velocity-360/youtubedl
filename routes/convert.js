var express = require('express')
var router = express.Router()
var Streamify = require('../utils/Streamify')

router.get('/', function(req, res, next) {
    try {
      var url = req.query.video
      // res.setHeader('Content-disposition', 'attachment; filename=file.mp3')
      // res.setHeader('Content-type', 'audio/mpeg')
      // Streamify.streamify(url).pipe(res)

      Streamify.streamify(url).pipe(res)

    } 
    catch (exception) {
      res.status(500).send(exception)
    }
})

module.exports = router

