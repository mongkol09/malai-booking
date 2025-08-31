import React from 'react'
import { Link } from 'react-router-dom'

const TwoStep = () => {
  return (
        <div className="px-xl-5 px-4 auth-body">
			<form>
				<ul className="row g-3 list-unstyled li_animate">
					<li className="col-3">
						<input type="text" className="form-control form-control-lg text-center" placeholder="-" maxLength="1" />
					</li>
					<li className="col-3">
						<input type="text" className="form-control form-control-lg text-center" placeholder="-" maxLength="1" />
					</li>
					<li className="col-3">
						<input type="text" className="form-control form-control-lg text-center" placeholder="-" maxLength="1" />
					</li>
					<li className="col-3">
						<input type="text" className="form-control form-control-lg text-center" placeholder="-" maxLength="1" />
					</li>
					<li className="col-12 my-lg-4">
						<Link className="btn btn-lg w-100 btn-primary text-uppercase mb-2" to="/index" title="" aria-label="Verify my account">Verify my account</Link>
					</li>
					<li className="col-12 text-center">
						<span className="text-muted">Haven't received it? <Link to="/" aria-label="Resend a new code">Resend a new code.</Link></span>
					</li>
				</ul>
			</form>
		</div>
    )
}

export default TwoStep