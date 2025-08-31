import React from 'react'
import { NavLink, Link } from 'react-router-dom'

const TuningSidebar = ({iconColor}) => {
  return (
    <div className="tab-pane fade" id="tab_settings" role="tabpanel">
        <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Configuration</h6>
        <ul className={`list-unstyled mb-4 menu-list ${iconColor}`}>
            <li>
                <NavLink to="/tuning" aria-label="tuning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                    </svg>
                    <span className="mx-3">Tuning</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/common-settings" aria-label="payment set">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M3 21l18 0" />
                        <path d="M5 21v-14l8 -4v18" />
                        <path d="M19 21v-10l-6 -4" />
                        <path d="M9 9l0 .01" />
                        <path d="M9 12l0 .01" />
                        <path d="M9 15l0 .01" />
                        <path d="M9 18l0 .01" />
                    </svg>
                    <span className="mx-3">Common</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/payment-set" aria-label="payment set">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 19h-6a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5" />
                        <path d="M3 10h18" />
                        <path d="M16 19h6" />
                        <path d="M19 16l3 3l-3 3" />
                        <path d="M7.005 15h.005" />
                        <path d="M11 15h2" />
                    </svg>
                    <span className="mx-3">Payment Set</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/accounts-setting" aria-label="Accounts Setting">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                        <path d="M9 7l1 0"></path>
                        <path d="M9 13l6 0"></path>
                        <path d="M13 17l2 0"></path>
                    </svg>
                    <span className="mx-3">Accounts</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/holiday-pricing" aria-label="Holiday Pricing">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"></path>
                        <path d="M16 3v4"></path>
                        <path d="M8 3v4"></path>
                        <path d="M4 11h16"></path>
                        <path d="M8 15h2v2h-2z"></path>
                    </svg>
                    <span className="mx-3">Holiday Pricing</span>
                </NavLink>
            </li>
            <li className="py-2 mt-2">
                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>User Management</h6>
                <ul className="list-unstyled">
                    <li><NavLink to="/user-list" aria-label="User List">รายการผู้ใช้</NavLink></li>
                    <li><NavLink to="/user-management/add" aria-label="Add User">เพิ่มผู้ใช้</NavLink></li>
                </ul>
            </li>
            <li className="py-2 mt-2">
                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Role Managment</h6>
                <ul className="list-unstyled">
                    <li><NavLink to="/role-add" aria-label="Role Add">Role Add</NavLink></li>
                    <li><NavLink to="/role-list" aria-label="Role List">Role List</NavLink></li>
                    <li><NavLink to="/role-permission" aria-label="Role Permission">Role Permission</NavLink></li>
                    <li><NavLink to="/role-create-list" aria-label="Role Create List">Role Create</NavLink></li>
                    <li><NavLink to="/role-assign" aria-label="Role Assign">Role Assign</NavLink></li>
                    <li><NavLink to="/role-access-list" aria-label="Role Access">Role Access</NavLink></li>
                </ul>
            </li>
            <li className="py-2 mt-2">
                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Front Pages</h6>
                <ul className="list-unstyled">
                    <li><NavLink to="/about-us" aria-label="About Us">About Us</NavLink></li>
                    <li><NavLink to="/contact-us" aria-label="Contact Us">Contact Us</NavLink></li>
                    <li><NavLink to="/privacy-policy" aria-label="Privacy Policy">Privacy Policy</NavLink></li>
                    <li><NavLink to="/terms-conditions" aria-label="Terms Conditions">Terms Conditions</NavLink></li>
                </ul>
            </li>
            <li className="py-2 mt-2">
                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Application</h6>
                <ul className="list-unstyled">
                    <li><NavLink to="/calendar" aria-label="Calendar">My Calendar</NavLink></li>
                    <li><NavLink to="/inbox" aria-label="Inbox">Inbox (98)</NavLink></li>
                    <li><NavLink to="/chat" aria-label="Chat">Chat (2)</NavLink></li>
                    <li><NavLink to="/blog" aria-label="Blog">Blog Article</NavLink></li>
                    <li><NavLink to="/filemanager" aria-label="File Manager">File Manager</NavLink></li>
                </ul>
            </li>
        </ul>
        {/* <!-- start: More Pages --> */}
        <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color4)"}}>Pages</h6>
        <ul className={`list-unstyled mb-4 menu-list ${iconColor}`}>
            <li>
                <Link to="#Authentication" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Authentication">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2"></path>
                        <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                        <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
                        <path d="M20 21l2 -2l-2 -2"></path>
                        <path d="M17 17l-2 2l2 2"></path>
                    </svg>
                    <span className="mx-3">Authentication</span>
                </Link>
                <ul className="collapse list-unstyled" id="Authentication">
                    <li><NavLink to="/signin">Sign in</NavLink></li>
                    <li><NavLink to="/signup">Sign up</NavLink></li>
                    <li><NavLink to="/password-reset">Password reset</NavLink></li>
                    <li><NavLink to="/two-step">2-Step Authentication</NavLink></li>
                    <li><NavLink to="/lockscreen">Lockscreen</NavLink></li>
                    <li><NavLink to="/maintenance">Maintenance</NavLink></li>
                    <li><NavLink to="/404">404</NavLink></li>
                </ul>
            </li>
            <li>
                <NavLink to="/search" aria-label="Search page">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                        <path d="M21 21l-6 -6"></path>
                    </svg>
                    <span className="mx-3">Search page</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/docs" aria-label="Template documentation">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1"></path>
                    </svg>
                    <span className="mx-3">Documentation</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/changelog" title="Template Changelog" aria-label="Template Changelog">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M10.09 4.01l.496 -.495a2 2 0 0 1 2.828 0l7.071 7.07a2 2 0 0 1 0 2.83l-7.07 7.07a2 2 0 0 1 -2.83 0l-7.07 -7.07a2 2 0 0 1 0 -2.83l3.535 -3.535h-3.988"></path>
                        <path d="M7.05 11.038v-3.988"></path>
                    </svg>
                    <span className="mx-3">Changelog: <b>v1.0</b></span>
                </NavLink>
            </li>
        </ul>
    </div>
  )
}

export default TuningSidebar