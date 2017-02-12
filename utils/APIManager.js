var superagent = require('superagent')
var Promise = require('bluebird')


var queue = [] // only queue the GET requests, for now

module.exports = {
	handleGet: function(endpoint, params) {
		return new Promise(function(resolve, reject) {
			if (queue.indexOf(endpoint) != -1) // request already running, ignore
				return
			
			queue.push(endpoint)

			superagent
			.get(endpoint)
			.query(params)
			.set('Accept', 'application/json')
			.end(function(err, res) {
				let index = queue.indexOf(endpoint)
				queue.splice(index, 1)

				if (err){ 
					reject(err)
					return
				}

				if (res.body.confirmation != 'success'){
					reject(new Error(res.body.message))
					return
				}

				resolve(res.body)
			})
		})
	},

	// using superagent here because for some reason, cookies don't get installed using fetch (wtf)
	handlePost: function(endpoint, body) {
		return new Promise(function(resolve, reject) {
			superagent
			.post(endpoint)
			.send(body)
			.set('Accept', 'application/json')
			.end(function(err, res) {
				if (err){ 
					reject(err)
					return
				} 

				if (res.body.confirmation != 'success'){
					reject(new Error(res.body.message))
		    		return
				}

				resolve(res.body)
			})
		})
	},

	// upload to aws s3:
	directUpload: function(file, url) {
		return new Promise(function(resolve, reject) {
			superagent
			.put(url)
			.send(file)
			.set('Content-Type', file.type)
			.end(function(err, res) {
				if (err){
					reject(err)
					return
				}
				
				resolve(res)
			})
		})
	}

}