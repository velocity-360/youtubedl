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

	convertVideo(event){
		event.preventDefault()

		// automatically invoke download:
		window.location.href = '/convert?video='+this.state.youtube+'&format=stream'

	}

	render(){
		return (
			<nav className="navbar navbar-default">
			    <div className="container-fluid">
				    <div className="navbar-header">
						<form className="navbar-form navbar-left" role="search">
						    <div className="form-group">
								<input className="form-control" onChange={this.updateYoutubeLink.bind(this)} type="text" placeholder="YouTube Link" />
						    </div>
							<button style={{marginLeft:12}} className="btn btn-default" onClick={this.convertVideo.bind(this)}>Convert File</button>
						</form>
				    </div>
			    </div>
			</nav>

		)
	}
}

export default Convert