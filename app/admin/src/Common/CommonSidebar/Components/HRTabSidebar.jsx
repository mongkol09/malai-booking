import React from 'react'
import {Link, NavLink} from 'react-router-dom'

const HRTabSidebar = ({iconColor}) => {
  return (
    <div className="tab-pane fade" id="tab_hrms" role="tabpanel">
        <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Usual</h6>
        <ul className={`list-unstyled mb-4 menu-list ${iconColor}`}>
            <li>
                <NavLink to="/index-hr" aria-label="HRMS Dashboard">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
                        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
                        <path d="M10 12h4v4h-4z"></path>
                    </svg>
                    <span className="mx-3">HR Dashboard</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/hrms" aria-label="hrms">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg"  width="24"  viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M7 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M5 22v-5l-1 -1v-4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4l-1 1v5" />
                        <path d="M17 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M15 22v-4h-2l2 -6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1l2 6h-2v4" />
                    </svg>
                    <span className="mx-3">HRMS</span>
                </NavLink>
            </li>
            <li>
                <Link to="#DutyMenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Users">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M3 12a9 9 0 0 0 5.998 8.485m12.002 -8.485a9 9 0 1 0 -18 0" />
                        <path d="M12 7v5" /><path d="M12 15h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2" />
                        <path d="M18 15v2a1 1 0 0 0 1 1h1" />
                        <path d="M21 15v6" />
                    </svg>
                    <span className="mx-3">Duty Changes</span>
                </Link>
                <ul className="collapse list-unstyled" id="DutyMenu">
                    <li><NavLink to="/duty-assigned-list" aria-label="Assigned List">Assigned List</NavLink></li>
                    <li><NavLink to="/duty-shift-list" aria-label="Hotel Images">Shift List</NavLink></li>
                    <li><NavLink to="/duty-roster-list" aria-label="Hotel Images">Roster List</NavLink></li>
                </ul>
            </li>
            <li className="py-2 mt-2">
                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Employees [ <strong>58</strong> ]</h6>
                <ul className="list-unstyled">
                    <li><NavLink to="/employees-all" aria-label="All Employees">All Employees</NavLink></li>
                    <li><NavLink to="/employees-leave" aria-label="Leave Tracking">Leave Tracking</NavLink></li>
                    <li><NavLink to="/employees-attendance" aria-label="Employees Attendance">Attendance</NavLink></li>
                    <li><NavLink to="/employees-departments" aria-label="Departments">Departments</NavLink></li>
                    <li><NavLink to="/employees-loan" aria-label="Employees Loan">Employees Loan</NavLink></li>
                    <li><NavLink to="/employees-appraisal" aria-label="Appraisal">Appraisal</NavLink></li>
                    <li><NavLink to="/employees-add" className="fw-bold" aria-label="New Project">Add Employees</NavLink></li>
                </ul>
            </li>
            <li className="py-2 mt-2">
                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Payroll</h6>
                <ul className="list-unstyled">
                    <li><NavLink to="/payroll-employee-salary" aria-label="Employee Salary">Employee Salary</NavLink></li>
                    <li><NavLink to="/payroll-payslip" aria-label="payslip">Payslip</NavLink></li>
                    <li><NavLink to="/payroll-report" aria-label="General Settings">Report</NavLink></li>
                </ul>
            </li>
        </ul>
    </div>
  )
}

export default HRTabSidebar