import React from 'react'

import HotelTabSidebar from './Components/HotelTabSidebar'
import HRTabSidebar from './Components/HRTabSidebar'
import TuningSidebar from './Components/TuningSidebar'

import profile_av from '../../assets/images/profile_av.png'
import { Link } from 'react-router-dom'

const CommonSidebar = ({iconColor}) => {
  return (
    	<aside className="ps-xl-5 ps-lg-4 ps-3 pe-2 py-3 sidebar sticky-top" id='sidebarDark' data-bs-theme="none">
			<nav className="navbar navbar-expand-xl py-0">
				<div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="offcanvas_Navbar">
					<div className="offcanvas-header">
						<span className="fw-bold fs-5 text-gradient">Malai</span>
						<button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
					</div>
					<div className="offcanvas-body flex-column custom_scroll ps-4 ps-xl-0">
						<div className="d-flex align-items-start mb-4">
							<img className="avatar lg rounded-circle border border-3" src={profile_av} alt="avatar"/>
							<div className="ms-3 mt-1">
								<h4 className="mb-0 text-gradient title-font">Anny glover</h4>
								<span className="text-muted">Super Admin</span>
							</div>
						</div>
						{/* <!-- start: Menu tab --> */}
						<ul className="nav nav-tabs tab-dynamic px-0 mb-4" role="tablist" style={{"--dynamic-color": "var(--accent-color)"}}>
							<li className="nav-item" role="presentation"><Link className="ps-2 pe-3 nav-link active" data-bs-toggle="tab" to="#tab_hotels" role="tab" aria-selected="false" tabIndex="-1">HOTELS</Link></li>
              				<li className="nav-item" role="presentation"><Link className="ps-2 pe-3 nav-link" data-bs-toggle="tab" to="#tab_hrms" role="tab" aria-selected="true">HRMS</Link></li>
							<li className="nav-item" role="presentation"><Link className="ps-2 pe-3 nav-link" data-bs-toggle="tab" to="#tab_settings" role="tab" aria-selected="false" tabIndex="-1">TUNING</Link></li>
            			</ul>
						{/* <!-- start: Menu content --> */}
						<div className="tab-content">
							<HotelTabSidebar iconColor={iconColor}/>
							<HRTabSidebar iconColor={iconColor}/>
							<TuningSidebar iconColor={iconColor}/>
						</div>
					</div>
				</div>
			</nav>
		</aside>
  	)
}

export default CommonSidebar