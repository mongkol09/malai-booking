import React from 'react'
import General from './Components/General'
import Billing from './Components/Billing'
import Members from './Components/Members'
import Security from './Components/Security'
import Notifications from './Components/Notifications'
import { Link } from 'react-router-dom'

const AccountSettings = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row mb-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Accounts</h3>
                </div>
            </div>
        </div>
        <div className="card bg-transparent border-0">
            <ul className="nav nav-tabs li_animate" role="tablist">
                <li className="nav-item" role="presentation"><Link className="nav-link active" data-bs-toggle="tab" to="#setting-general" aria-selected="true" role="tab"><i className="bi bi-gear"></i><span className="ps-1">General</span></Link></li>
                <li className="nav-item" role="presentation"><Link className="nav-link" data-bs-toggle="tab" to="#setting-billing" aria-selected="false" tabIndex="-1" role="tab"><i className="bi bi-credit-card"></i><span className="d-none d-sm-inline-flex ps-1">Billing</span></Link></li>
                <li className="nav-item" role="presentation"><Link className="nav-link" data-bs-toggle="tab" to="#setting-members" aria-selected="false" tabIndex="-1" role="tab"><i className="bi bi-person"></i><span className="d-none d-sm-inline-flex ps-1">Members</span></Link></li>
                <li className="nav-item" role="presentation"><Link className="nav-link" data-bs-toggle="tab" to="#setting-security" aria-selected="false" tabIndex="-1" role="tab"><i className="bi bi-shield-check"></i><span className="d-none d-sm-inline-flex ps-1">Security</span></Link></li>
                <li className="nav-item" role="presentation"><Link className="nav-link" data-bs-toggle="tab" to="#setting-notifications" aria-selected="false" tabIndex="-1" role="tab"><i className="bi bi-bell"></i><span className="d-none d-sm-inline-flex ps-1">Notifications</span></Link></li>
            </ul>
            <div className="tab-content bg-card p-3 border border-top-0 rounded-bottom">
                {/* <!--[ Start:: general]--> */}
                <General/>
                {/* <!--[ Start:: billing ]--> */}
                <Billing/>
                {/* <!--[ Start:: members ]--> */}
                <Members/>
                {/* <!--[ Start:: security ]--> */}
                <Security/>
                {/* <!--[ Start:: notifications]--> */}
                <Notifications/>
            </div>
        </div>
    </div>
  )
}

export default AccountSettings