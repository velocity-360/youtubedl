import superagent from 'superagent'
import Promise from 'bluebird'
import sha1 from 'sha1'


var queue = [] // only queue the GET requests, for now

export default {
	handleGet: (endpoint, params) => {
		return new Promise((resolve, reject) => {
			if (queue.indexOf(endpoint) != -1) // request already running, ignore
				return
			
			queue.push(endpoint)

			superagent
			.get(endpoint)
			.query(params)
			.set('Accept', 'application/json')
			.end((err, res) => {
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
	handlePost: (endpoint, body) => {
		return new Promise((resolve, reject) => {
			superagent
			.post(endpoint)
			.send(body)
			.set('Accept', 'application/json')
			.end((err, res) => {
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

	handlePut: (endpoint, body) => {
		return new Promise((resolve, reject) => {
			superagent
			.put(endpoint)
			.send(body)
			.set('Accept', 'application/json')
			.end((err, res) => {
				if (err){ 
					reject(err)
					return
				}
				
				const json = res.body
				if (json.confirmation != 'success'){
					reject(new Error(json.message))
		    		return
				}

				resolve(json)
			})
		})
	},

	// upload to aws s3:
	directUpload: (file, url) => {
		return new Promise((resolve, reject) => {
			superagent
			.put(url)
			.send(file)
			.set('Content-Type', file.type)
			.end((err, res) => {
				if (err){
					reject(err)
					return
				}
				
				resolve(res)
			})
		})
	},

	upload: (file, completion) => {
		const mimeTypes = ['image', 'pdf'] 
		let mime = null
		mimeTypes.forEach((type, i) => { // only accepts image and pdf
			if (file.type.indexOf(type) != -1){
				mime = type
			}
		})

		if (mime == null)
			return

		if (mime == 'image') // only accepts 'images' or 'pdf'
			mime = 'images'

		superagent
		.get('https://media-service.appspot.com/api/upload')
		.query({media: mime})
		.set('Accept', 'application/json')
		.end((err, res) => {
			if (err){ 
				completion(err, null)
				return
			}

			if (res.body.confirmation != 'success'){
	    		completion({message:res.body.message}, null)
	    		return
			}

	        var uploadRequest = superagent.post(res.body.upload)
	        uploadRequest.attach('file', file)
	        uploadRequest.end((err, resp) => {
	        	if (err){
			      	console.log('UPLOAD ERROR: '+JSON.stringify(err))
					completion(err, null)
	              	return
	        	}

			    if (resp.body.confirmation != 'success'){
					completion(new Error(resp.body.message), null)
					return
			    }

		      	var result = resp.body.image || resp.body.pdf
		      	if (mime == 'pdf')
		      		result['address'] = 'https://media-service.appspot.com/site/pdf/'+result.id

				completion(null, result)
	        })
		})
	},

	uploadPDF: (file, completion) => {
		superagent
		.get('https://media-service.appspot.com/api/upload')
		.query({media:'pdf'})
		.set('Accept', 'application/json')
		.end((err, res) => {
			if (err){ 
				completion(err, null)
				return
			}

			if (res.body.confirmation != 'success'){
	    		completion({message:res.body.message}, null)
	    		return
			}

	        var uploadRequest = superagent.post(res.body.upload)
	        uploadRequest.attach('file', file)
	        uploadRequest.end((err, resp) => {
	        	if (err){
			      	console.log('UPLOAD ERROR: '+JSON.stringify(err))
					completion(err, null)
	              	return
	        	}

			    if (resp.body.confirmation != 'success'){
					completion(new Error(resp.body.message), null)
					return
			    }

		      	var result = resp.body.image || resp.body.pdf
				completion(null, result)
	        })
		})
	},

	uploadCloudinary: (file, mime, completion) => {
		console.log('UPLOAD CLOUDINARY: '+mime)
		if (mime != 'video' && mime != 'raw')
			return
		

		// upload to cloudinary:
		var cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dcxaoww0c/'+mime+'/upload'
        var uploadRequest = superagent.post(cloudinaryUrl)

        uploadRequest.attach('file', file)

		var timestamp = Date.now() / 1000
		var paramsStr = 'timestamp='+timestamp+'&upload_preset=rnxsz09irVxIqxqsbdcxTo4X6bo9rUqkQms'

	    uploadRequest.field('timestamp', timestamp)
	    uploadRequest.field('api_key', '399938195648612')
	    uploadRequest.field('upload_preset', 'rnxsz09i')
	    uploadRequest.field('signature', sha1(paramsStr))

        uploadRequest.end((err, resp) => {
        	if (err){
		      	console.log('UPLOAD ERROR: '+JSON.stringify(err))
				res.json({
					confirmation: 'fail',
					message: err
				})
              	return
        	}

//			console.log('DONE == '+JSON.stringify(resp.body))
			completion(null, resp.body)
			// {"public_id":"gtuwtxddoqpwdhcy6tly","version":1485748482,
			// "signature":"6b63e61d260943e64e07e87d1dc1dba4f4033ad3","width":1366,"height":768,"format":"mov",
			// "resource_type":"video","created_at":"2017-01-30T03:54:42Z","tags":[],"pages":0,"bytes":1465764,
			// "type":"upload","etag":"b71fd51058769437ac717a4cfe5f8c6d",
			// "url":"http://res.cloudinary.com/dcxaoww0c/video/upload/v1485748482/gtuwtxddoqpwdhcy6tly.mov",
			// "secure_url":"https://res.cloudinary.com/dcxaoww0c/video/upload/v1485748482/gtuwtxddoqpwdhcy6tly.mov",
			//"audio":{"codec":"aac","bit_rate":"166689","frequency":44100,"channels":2,"channel_layout":"stereo"},
			// "video":{"pix_format":"yuv420p","codec":"h264","level":42,"profile":"Main","bit_rate":"1511396",
			//"dar":"683:384"},"is_audio":false,"frame_rate":60,"bit_rate":1687210,"duration":6.95,"rotation":0,
			//"original_filename":"testvideo"}			

        })

	},

	submitStripeToken: (token, completion) => {
		var body = {
			stripeToken: token.id,
			email: token.email
		}

		superagent
		.post('/stripe/card')
		.type('form')
		.send(body)
		.set('Accept', 'application/json')
		.end(function(err, res){
			if (completion == null)
				return

			if (err){ 
				completion(err, null)
				return
			}
			
			if (res.body.confirmation != 'success'){
	    		completion({message:res.body.message}, null)
	    		return
			}

	    	completion(null, res.body)
		})
	},	

	submitStripeCharge: (token, amt, type, user, completion) => {
		var body = {
			stripeToken: token.id,
			email: token.email,
			amount: amt,
			type: type,
			description: type,
			profile: JSON.stringify(user)
		}

		superagent
		.post('/stripe/charge')
		.type('form')
		.send(body)
		.set('Accept', 'application/json')
		.end(function(err, res){
			if (completion == null)
				return

			if (err){ 
				completion(err, null)
				return
			}
			
			if (res.body.confirmation != 'success'){
	    		completion({message:res.body.message}, null)
	    		return
			}

	    	completion(null, res.body)
		})
	}
}