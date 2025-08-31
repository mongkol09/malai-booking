import React from 'react'
import avatar1 from '../../../../../../assets/images/xs/avatar1.jpg';
import avatar3 from '../../../../../../assets/images/xs/avatar3.jpg';
import avatar4 from '../../../../../../assets/images/xs/avatar4.jpg';
import avatar5 from '../../../../../../assets/images/xs/avatar5.jpg';
import avatar6 from '../../../../../../assets/images/xs/avatar6.jpg';
import avatar7 from '../../../../../../assets/images/xs/avatar7.jpg';
import { Link } from 'react-router-dom';

const Userlist = () => {
  return (
    <div className="offcanvas offcanvas-end" tabIndex="-1" id="UserList">
		<div className="offcanvas-header">
			<h5 className="offcanvas-title">Department User List</h5>
			<button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
		</div>
		<div className="offcanvas-body custom_scroll">
			<ul className="list-group list-group-flush user-list mb-0 custom_scroll ps-2" role="tablist">
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar1} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Stephen McLean</span></h6>
							<span className="text-muted small">Web Desiger</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<div className="avatar rounded-circle no-thumbnail">FG</div>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Friends Group</span></h6>
							<span className="text-muted small">Web Developemnt</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar3} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Gordon Butler</span></h6>
							<span className="text-muted small">Digitel marketing</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex active">
						<img className="avatar rounded-circle" src={avatar4} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Barbara Kelly</span></h6>
							<span className="text-muted small">Web Desiger</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar5} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Robert Hammer</span></h6>
							<span className="text-muted small">Web Desiger</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar6} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Gordon Butler</span></h6>
							<span className="text-muted small">Web Developemnt</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar7} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Rose Rivera</span></h6>
							<span className="text-muted small">Web Desiger</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar1} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Stephen McLean</span></h6>
							<span className="text-muted small">Web Developemnt</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<div className="avatar rounded-circle no-thumbnail">RH</div>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Robert Hammer</span></h6>
							<span className="text-muted small">Angular Housekeeping Staff</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar3} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Gordon Butler</span></h6>
							<span className="text-muted small">Web Desiger</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar4} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Barbara Kelly</span></h6>
							<span className="text-muted small">Sales Lead</span>
						</div>
					</Link>
				</li>
				<li className="list-group-item b-dashed px-0 py-3">
					<Link to="/" className="d-flex">
						<img className="avatar rounded-circle" src={avatar5} alt=""/>
						<div className="flex-fill ms-3">
							<h6 className="d-flex justify-content-between mb-0"><span>Robert Hammer</span></h6>
							<span className="text-muted small">SEO</span>
						</div>
					</Link>
				</li>
			</ul>
		</div>
	</div>
  )
}

export default Userlist