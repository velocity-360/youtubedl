import React, { Component } from 'react'
import { APIClient } from '../utils'

class Convert extends Component {
	constructor(){
		super()
		this.state = {
			youtube: ''
		}
	}

	updateYoutubeLink(event){
		this.setState({
			youtube: event.target.value
		})
	}

	convertVideo(){
//		console.log('convertVideo')

		// automatically invoke download:
//		window.location.href = '/convert?video=https://www.youtube.com/watch?v=1vjAUgaUbMw&format=stream'
		window.location.href = '/convert?video='+this.state.youtube+'&format=stream'

		// APIClient.handleGet('/convert', {video:'https://www.youtube.com/watch?v=1vjAUgaUbMw', format:'stream'})
		// .then(response => {

		// })
		// .catch(err => {

		// })

	}

	render(){
		return (
			<div>
				Convert Component<br />
				<input onChange={this.updateYoutubeLink.bind(this)} type="text" placeholder="YouTube Link" /><br />
				<button onClick={this.convertVideo.bind(this)}>Convert File</button>
			</div>
		)
	}
}

export default Convert