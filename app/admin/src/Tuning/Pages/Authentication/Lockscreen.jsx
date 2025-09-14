import React from 'react'
import { Link } from 'react-router-dom'

import profile_av from '../../../assets/images/profile_av.png';

const Lockscreen = () => {
  return (
        <div className="px-xl-5 px-4 auth-body">
			<form>
				<ul className="row g-3 list-unstyled li_animate">
					<li className="col-12 mb-3">
						<div className="d-flex align-items-end">
							<img className="rounded-4 img-thumbnail shadow avatar xl" src={profile_av} data-bs-toggle="tooltip" title="avatar" alt="Avatar"/>
							<div className="ms-3">
								<Link className="fs-4" to="/" title="">Michelle Hughes</Link>
								<p className="mb-0">brian.hughes@example.com</p>
							</div>
						</div>
					</li>
					<li className="col-12">
						<div className="mb-2">
							<div className="form-label">Enter Password</div>
							<input type="password" className="form-control form-control-lg" placeholder="***************"/>
						</div>
					</li>
					<li className="col-12 my-lg-4">
						<Link className="btn btn-lg w-100 btn-primary text-uppercase mb-2" to="/index" title="">SIGN IN</Link>
					</li>
					<li className="col-12 text-center">
						<span className="text-muted">ระบบสำหรับผู้ดูแลเท่านั้น</span>
					</li>
				</ul>
			</form>
		</div>
    )
}

export default Lockscreen