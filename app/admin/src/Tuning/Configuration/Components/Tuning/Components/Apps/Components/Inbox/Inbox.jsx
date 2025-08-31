import React from 'react'
import { inboxData } from './Components/InboxData'

import avatar1 from '../../../../../../../../assets/images/xs/avatar1.jpg'
import ComposeEmail from './Components/ComposeEmail'
import { Link } from 'react-router-dom'

const Inbox = () => {
  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            <div className="sub-layout d-flex flex-row align-items-stretch">
                {/* <!--[ Start:: user list ]--> */}
                <div className="order-1 overflow-hidden border bg-card rounded-3 sticky-lg-top">
                    <ul className="nav nav-tabs tab-card border-0 li_animate p-3 bg-dark z-2 position-relative" role="tablist" data-bs-theme="dark">
                        <li className="nav-item dropdown">
                            <Link className="nav-link px-0 me-xl-4 me-3 dropdown-toggle fs-6" to="/" role="button" data-bs-toggle="dropdown">Inbox</Link>
                            <ul className="li_animate dropdown-menu shadow rounded-4 p-2">
                                <li><Link className="dropdown-item rounded-pill" to="/">Primary</Link></li>
                                <li><Link className="dropdown-item rounded-pill" to="/">Updates</Link></li>
                                <li><Link className="dropdown-item rounded-pill" to="/">Promotions</Link></li>
                                <li><Link className="dropdown-item rounded-pill" to="/">Social</Link></li>
                                <li><hr className="dropdown-divider"/></li>
                                <li><Link className="dropdown-item rounded-pill" to="/">Create Label</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item"><Link className="nav-link px-0 me-xl-4 me-3 fs-6" data-bs-toggle="tab" to="#inbox-trash">Trash</Link></li>
                        <li className="nav-item ms-auto">
                            <button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#Compose">Compose</button>
                        </li>
                    </ul>
                    <ul className="list-group list-group-flush user-list mb-0 custom_scroll z-1" role="tablist">
                        {inboxData.map((data, index) => {
                            return(
                            <li className="list-group-item py-3 d-flex" key={index}>
                                {data.avatar ? (
                                    <img className="avatar rounded-circle" src={data.avatar} alt=""/>
                                ) : (
                                    <span className={`avatar rounded-circle no-thumbnail ${data.themeColor}`}>{data.avatarText}</span>
                                )}
                                <div className="flex-grow-1 ms-3">
                                    <Link to="/" className="d-flex justify-content-between">
                                        <small>{data.name}<i className={`fa fa-circle ms-1 status ${data.activeColor}`}></i></small>
                                        <small className="time">{data.time}</small>
                                    </Link>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-truncate user-msg">{data.subject}</span>
                                        <div className="d-flex align-items-center">
                                            <i className="fa fa-star gray-3 me-2 text-primary"></i>
                                            <input className="form-check-input m-0" type="checkbox" defaultValue="option1"/>
                                        </div>
                                    </div>
                                    <span className="small text-muted">{data.text}</span>
                                </div>
                            </li>
                            )
                        })}
                    </ul>
                </div>
                {/* <!--[ Start:: email details ]--> */}
                <div className="order-2 flex-grow-1 ms-lg-4 border bg-card rounded">
                    <div className="px-xl-4 action-header">
                        <ul className="navbar-nav flex-row me-auto">
                            <li className="nav-item"><Link className="btn btn-sm gray-6" to="/"><i className="fa fa-archive"></i></Link></li>
                            <li className="nav-item"><Link className="btn btn-sm gray-6" to="/"><i className="fa fa-trash"></i></Link></li>
                            <li className="nav-item"><Link className="btn btn-sm gray-6" to="/"><i className="fa fa-exclamation-circle"></i></Link></li>
                            <li className="nav-item"><Link className="btn btn-sm gray-6" to="/"><i className="fa fa-tasks"></i><span className="ms-2 d-none d-lg-inline-block">Add to tasks</span></Link></li>
                            <li className="nav-item"><Link className="btn btn-sm gray-6" to="/"><i className="fa fa-arrow-circle-right"></i><span className="ms-2 d-none d-lg-inline-block">Move to</span></Link></li>
                        </ul>
                        <button type="button" className="btn btn-sm btn-outline-danger close-toggle"><i className="fe fe-settings mr-2"></i>Close</button>
                    </div>
                    <div className="px-xl-4 bg-body p-3">
                        <div className="row align-items-center">
                            <div className="col-auto pe-0">
                                <Link to="/"><img src={avatar1} alt="..." className="avatar rounded-circle"/></Link>
                            </div>
                            <div className="col ml-n2">
                                <div className="fw-bold">Andrew Patrick</div>
                                <div className="dropdown"> To: <Link className="btn btn-link dropdown-toggle p-0" to="/" role="button" data-bs-toggle="dropdown">Me</Link>
                                    <div className="dropdown-menu p-3 border-0 shadow w240 rounded-4">
                                        <div className="mb-2">
                                            <div className="mb-0">from:</div>
                                            <small className="text-muted">Info-tQ <Link to="/">info@example.com</Link></small>
                                        </div>
                                        <div className="mb-2">
                                            <div className="mb-0">to:</div>
                                            <small className="text-muted">Stephen McLean <Link to="/">Chris.Fox@example.com</Link></small>
                                        </div>
                                        <div className="mb-2">
                                            <div className="mb-0">cc:</div>
                                            <small className="text-muted"><Link to="/">Joge.Lucky@example.com</Link></small>
                                        </div>
                                        <div className="mb-2">
                                            <div className="mb-0">date:</div>
                                            <small className="text-muted">Aug 2, 2022, 11:27 AM</small>
                                        </div>
                                        <div className="mb-2">
                                            <div className="mb-0">subject:</div>
                                            <small className="text-muted">#1706254810 | Payment Request</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-auto d-none d-xl-inline-block"><span>Jul 29, 2019, 4:37 PM</span></div>
                            <div className="col-auto">
                                <Link to="/" className="btn btn-sm btn-link d-none d-md-inline-block"><i className="fa fa-mail-reply"></i></Link>
                            </div>
                        </div>
                    </div>
                    <div className="px-xl-4 action-body">
                        <p>Hello <strong>Frank Baker</strong>,</p><br/>
                        <h6>I am project outsourcer if need any type of project (website / apps any IT Project ) please read.</h6>
                        <p><strong>I will provide 2 Type of service.</strong></p>
                        <ul>
                            <li>standard dummy text ever when an unknown printer</li>
                            <li>Lorem Ipsum has been the industry's standard dummy</li>
                            <li>Ipsum has been the industry's standard dummy</li>
                            <li>Lorem Ipsum has been the standard dummy</li>
                            <li>Lorem has been the industry's standard dummy</li>
                        </ul>
                        <p><strong>I will provide 2 Type of service.</strong></p>
                        <ul>
                            <li>standard dummy text ever since the 1500s, when an unknown printer</li>
                            <li>Lorem Ipsum has been the industry's standard dummy</li>
                        </ul>
                        <div className="file_folder d-flex flex-wrap py-3 my-3">
                            <Link className="py-2 px-3 m-1 rounded text-decoration-none bg-card" to="/">
                                <div className="avatar rounded-circle no-thumbnail bg-light">
                                    <i className="fa fa-bar-chart text-success fa-lg"></i>
                                </div>
                                <div className="ms-3">
                                    <p className="mb-0">Report2017.xls</p>
                                    <small className="text-muted">Size: 68KB</small>
                                </div>
                            </Link>
                            <Link className="py-2 px-3 m-1 rounded text-decoration-none bg-card" to="/">
                                <div className="avatar rounded-circle no-thumbnail bg-light">
                                    <i className="fa fa-file-text-o text-info fa-lg"></i>
                                </div>
                                <div className="ms-3">
                                    <p className="mb-0">Report2017.doc</p>
                                    <small className="text-muted">Size: 68KB</small>
                                </div>
                            </Link>
                        </div>
                        <p>Thank you,<br/><strong>Wendy Abbott</strong></p>
                    </div>
                    <div className="px-xl-4 action-footer">
                        <Link className="btn btn-outline-primary me-1" to="/">Reply</Link>
                        <Link className="btn btn-outline-secondary" to="/">Forward</Link>
                    </div>
                </div>
            </div>
            <ComposeEmail/>
        </div>
    )
}

export default Inbox