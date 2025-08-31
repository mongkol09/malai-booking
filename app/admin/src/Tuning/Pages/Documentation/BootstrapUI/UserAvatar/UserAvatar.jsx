import React from 'react'

import avatar1 from '../../../../../assets/images/xs/avatar1.jpg';
import avatar2 from '../../../../../assets/images/xs/avatar2.jpg';
import avatar3 from '../../../../../assets/images/xs/avatar3.jpg';
import avatar4 from '../../../../../assets/images/xs/avatar4.jpg';
import { Link } from 'react-router-dom';

const UserAvatar = () => {

	const avatarCode = `<img className="avatar rounded me-3 xs" src={avatar1} alt="avatar" title="Avatar xs"/>
<img className="avatar rounded me-3 sm" src={avatar1} alt="avatar" title="Avatar sm"/>
<img className="avatar rounded me-3" src={avatar1} alt="avatar" title="Avatar"/>
<img className="avatar rounded me-3 lg" src={avatar1} alt="avatar" title="Avatar lg"/>
<img className="avatar rounded me-3 xl" src={avatar1} alt="avatar" title="Avatar xl"/>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Avatar</h4>
				<p className="lead">Toggle contextual overlays for displaying lists of links and more with the Bootstrap dropdown plugin.</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{avatarCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<img className="avatar rounded me-3 xs" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar xs"/>
						<img className="avatar rounded me-3 sm" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar sm"/>
						<img className="avatar rounded me-3" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar"/>
						<img className="avatar rounded me-3 lg" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar lg"/>
						<img className="avatar rounded me-3 xl" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar xl"/>
						<div className="d-flex align-items-center mt-3">
							<span className="me-3 avatar rounded xs no-thumbnail small">xs</span>
							<span className="me-3 avatar rounded sm no-thumbnail">sm</span>
							<span className="me-3 avatar rounded no-thumbnail">ME</span>
							<span className="me-3 avatar rounded lg no-thumbnail fs-3">lg</span>
							<span className="me-3 avatar rounded xl no-thumbnail fs-1">xl</span>
						</div>
						<hr/>
					</div>
					<div className="col-12">
						<h6>Avatar Rounded Circle</h6>
						<img className="avatar rounded-circle me-4 xs" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar xs"/>
						<img className="avatar rounded-circle me-4 sm" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar sm"/>
						<img className="avatar rounded-circle me-4" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar"/>
						<img className="avatar rounded-circle me-4 lg" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar lg"/>
						<img className="avatar rounded-circle me-4 xl" src={avatar1} alt="avatar" data-bs-toggle="tooltip" data-bs-placement="top" title="Avatar xl"/>
						<div className="d-flex align-items-center mt-3">
							<span className="me-4 avatar rounded-circle xs no-thumbnail small">ME</span>
							<span className="me-4 avatar rounded-circle sm no-thumbnail">ME</span>
							<span className="me-4 avatar rounded-circle no-thumbnail">ME</span>
							<span className="me-4 avatar rounded-circle lg no-thumbnail fs-3">ME</span>
							<span className="me-4 avatar rounded-circle xl no-thumbnail fs-1">ME</span>
						</div>
						<hr/>
					</div>
					<div className="col-12">
						<h6>Avatar team groups list</h6>
						<div className="d-flex align-items-center mb-3">
							<label className="me-3">Team:</label>
							<Link to="/"><img className="avatar xs rounded-circle lift me-1" src={avatar1} alt="avatar" data-bs-toggle="tooltip" title="Avatar xs"/></Link>
							<Link to="/"><img className="avatar xs rounded-circle lift me-1" src={avatar2} alt="avatar" data-bs-toggle="tooltip" title="Avatar xs"/></Link>
							<Link to="/"><img className="avatar xs rounded-circle lift me-1" src={avatar3} alt="avatar" data-bs-toggle="tooltip" title="Avatar xs"/></Link>
							<Link to="/"><img className="avatar xs rounded-circle lift me-1" src={avatar4} alt="avatar" data-bs-toggle="tooltip" title="Avatar xs"/></Link>
						</div>
						<div className="d-flex align-items-center mb-3">
							<label className="me-3">Team:</label>
							<Link to="/"><img className="avatar sm rounded-circle lift me-1" src={avatar1} alt="avatar" data-bs-toggle="tooltip" title="Avatar sm"/></Link>
							<Link to="/"><img className="avatar sm rounded-circle lift me-1" src={avatar2} alt="avatar" data-bs-toggle="tooltip" title="Avatar sm"/></Link>
							<Link to="/"><img className="avatar sm rounded-circle lift me-1" src={avatar3} alt="avatar" data-bs-toggle="tooltip" title="Avatar sm"/></Link>
							<Link to="/"><img className="avatar sm rounded-circle lift me-1" src={avatar4} alt="avatar" data-bs-toggle="tooltip" title="Avatar sm"/></Link>
						</div>
						<div className="d-flex align-items-center mb-3">
							<label className="me-3">Team:</label>
							<Link to="/"><img className="avatar rounded-circle lift me-1" src={avatar1} alt="avatar" data-bs-toggle="tooltip" title="Avatar"/></Link>
							<Link to="/"><img className="avatar rounded-circle lift me-1" src={avatar2} alt="avatar" data-bs-toggle="tooltip" title="Avatar"/></Link>
							<Link to="/"><img className="avatar rounded-circle lift me-1" src={avatar3} alt="avatar" data-bs-toggle="tooltip" title="Avatar"/></Link>
							<Link to="/"><img className="avatar rounded-circle lift me-1" src={avatar4} alt="avatar" data-bs-toggle="tooltip" title="Avatar"/></Link>
						</div>
						<div className="d-flex align-items-center">
							<label className="me-3">Team:</label>
							<Link to="/"><img className="avatar lg rounded-circle lift me-1" src={avatar1} alt="avatar" data-bs-toggle="tooltip" title="Avatar lg"/></Link>
							<Link to="/"><img className="avatar lg rounded-circle lift me-1" src={avatar2} alt="avatar" data-bs-toggle="tooltip" title="Avatar lg"/></Link>
							<Link to="/"><img className="avatar lg rounded-circle lift me-1" src={avatar3} alt="avatar" data-bs-toggle="tooltip" title="Avatar lg"/></Link>
							<Link to="/"><img className="avatar lg rounded-circle lift me-1" src={avatar4} alt="avatar" data-bs-toggle="tooltip" title="Avatar lg"/></Link>
						</div>
					</div>
				</div>
			</div>	
		</div>
    )
}

export default UserAvatar