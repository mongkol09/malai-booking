import React from 'react'
import { Link } from 'react-router-dom'

const PageHeaderAction = () => {
  return (
    <>
    <li className="dropdown">
        <Link to="/" data-bs-toggle="dropdown" aria-expanded="false">
            <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 12l6 0"></path>
                <path d="M12 9l0 6"></path>
            </svg>
        </Link>
        <ul className="dropdown-menu dropdown-menu-end p-2 p-xl-3 shadow rounded-4">
            <li><Link className="dropdown-item rounded-pill" to="/">New folder</Link></li>
            <li><Link className="dropdown-item rounded-pill" to="/">File upload</Link></li>
            <li><Link className="dropdown-item rounded-pill" to="/">Google docs</Link></li>
            <li><Link className="dropdown-item rounded-pill" to="/">Google sheets</Link></li>
            <li><hr className="dropdown-divider"/></li>
            <li><Link className="dropdown-item rounded-pill" to="/">+ Invite</Link></li>
            <li><Link className="dropdown-item rounded-pill" to="/">Generate report</Link></li>
            <li><Link className="dropdown-item rounded-pill" to="/">New Reports</Link></li>
        </ul>
    </li>
    <li className="dropdown ms-3">
        <Link to="/" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
            <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z"></path>
            </svg>
        </Link>
        <div className="dropdown-menu dropdown-menu-end p-2 p-xl-3 shadow rounded-4" style={{width: "300px"}}>
            <h6>Filter Options</h6>
            <div className="row g-3 mt-3">
                <div className="col-12">
                    <label className="form-label small text-muted">Sorted by:</label>
                    <input type="search" className="form-control" placeholder="Search"/>
                </div>
                <div className="col-12">
                    <label className="form-label small text-muted">Status:</label>
                    <select className="form-select">
                        <option defaultValue="selected">Choose...</option>
                        <option>...</option>
                    </select>
                </div>
                <div className="col-12">
                    <label className="form-label small text-muted">Notifications:</label>
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch"/>
                        <label className="form-check-label">Enabled</label>
                    </div>
                </div>
                <div className="col-12 text-end mt-4">
                    <button type="reset" className="btn btn-sm btn-light me-1">Reset</button>
                    <button type="submit" className="btn btn-sm btn-primary">Apply</button>
                </div>
            </div>
        </div>
    </li>
    </>
  )
}

export default PageHeaderAction