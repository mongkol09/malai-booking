import React from 'react'
import { Link } from 'react-router-dom'

const NoPageFound = () => {
	return (
		<div className="px-xl-5 px-4 auth-body">
			<form>
				<ul className="row g-3 list-unstyled li_animate">
					<li className="col-12">
						<h1 className="display-1 fw-bold">4O4</h1>
						<h5>We couldn't find this page.</h5>
					</li>
					<li className="col-12 my-lg-4">
						<Link className="btn btn-lg w-100 btn-primary text-uppercase mb-2" to="/index" title="">Back to Home</Link>
					</li>
				</ul>
			</form>
		</div>
	)
}

export default NoPageFound