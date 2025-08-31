import React from 'react'

import avatar1 from '../../../../../../../../assets/images/xs/avatar1.jpg';
import avatar2 from '../../../../../../../../assets/images/xs/avatar2.jpg';
import avatar3 from '../../../../../../../../assets/images/xs/avatar3.jpg';
import avatar4 from '../../../../../../../../assets/images/xs/avatar4.jpg';
import avatar5 from '../../../../../../../../assets/images/xs/avatar5.jpg';
import avatar6 from '../../../../../../../../assets/images/xs/avatar6.jpg';
import avatar7 from '../../../../../../../../assets/images/xs/avatar7.jpg';

import g1 from '../../../../../../../../assets/images/gallery/1.jpg';
import g2 from '../../../../../../../../assets/images/gallery/2.jpg';
import { Link } from 'react-router-dom';

const Chat = () => {
  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            <div className="sub-layout d-flex flex-row align-items-stretch">
                {/* <!--[ Start:: user list ]--> */}
                <div className="order-1 overflow-hidden bg-card rounded-3 border sticky-lg-top">
                    <div className="c-list p-3">
                        <input type="search" className="form-control" placeholder="Search for..."/>
                    </div>
                    <ul className="list-group list-group-flush user-list mb-0 custom_scroll ps-2" role="tablist">
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar1} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Stephen McLean</span> <small className="msg-time">12:37 PM</small></h6>
                                    <span className="text-muted small">changed an issue from "In Progress" to</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <div className="avatar rounded-circle no-thumbnail">FG</div>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Friends Group</span> <small className="msg-time">10:45 AM</small></h6>
                                    <span className="text-muted small">It is a long established fact that a reader will be distracted</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar3} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Gordon Butler</span> <small className="msg-time">10:11 AM</small></h6>
                                    <span className="text-muted small">There are many variations of passages</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex active">
                                <img className="avatar rounded-circle" src={avatar4} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Barbara Kelly</span> <small className="msg-time">Sat</small></h6>
                                    <span className="text-muted small">Contrary to popular belief</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar5} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Robert Hammer</span> <small className="msg-time">Fri</small></h6>
                                    <span className="text-muted small">making it over 2000 years old</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar6} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Gordon Butler</span> <small className="msg-time">Fri</small></h6>
                                    <span className="text-muted small">There are many variations of passages</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar7} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Rose Rivera</span> <small className="msg-time">Thu</small></h6>
                                    <span className="text-muted small">The generated Lorem Ipsum</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar1} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Stephen McLean</span> <small className="msg-time">Wed</small></h6>
                                    <span className="text-muted small">changed an issue from "In Progress" to</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <div className="avatar rounded-circle no-thumbnail">RH</div>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Robert Hammer</span> <small className="msg-time">Wed</small></h6>
                                    <span className="text-muted small">It is a long established fact that a reader will be distracted</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar3} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Gordon Butler</span> <small className="msg-time">13/10/2020</small></h6>
                                    <span className="text-muted small">There are many variations of passages</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar4} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Barbara Kelly</span> <small className="msg-time">13/10/2020</small></h6>
                                    <span className="text-muted small">Contrary to popular belief</span>
                                </div>
                            </Link>
                        </li>
                        <li className="list-group-item b-dashed">
                            <Link to="/" className="d-flex">
                                <img className="avatar rounded-circle" src={avatar5} alt=""/>
                                <div className="flex-fill ms-3">
                                    <h6 className="d-flex justify-content-between mb-0"><span>Robert Hammer</span> <small className="msg-time">22/10/2020</small></h6>
                                    <span className="text-muted small">making it over 2000 years old</span>
                                </div>
                            </Link>
                        </li>
                    </ul>
                </div>
                {/* <!--[ Start:: details ]--> */}
                <div className="order-2 flex-grow-1 ms-lg-4 bg-card border rounded">
                    <div className="action-header px-xl-4">
                        <Link className="d-flex" to="#group_detail" data-bs-toggle="offcanvas" title="">
                            <div className="avatar rounded-circle no-thumbnail">FG</div>
                            <div className="ms-3">
                                <h6 className="mb-0">Friends Group</h6>
                                <small className="text-muted">Online</small>
                            </div>
                        </Link>
                        <div className="d-flex align-items-center">
                            <Link className="gray-5 px-3" to="/" data-bs-toggle="collapse" data-bs-target="#chat-search"><i className="fa fa-search"></i></Link>
                            <Link className="gray-5 px-3 d-none d-lg-block" to="/" data-bs-toggle="modal" data-bs-target="#video_call"><i className="fa fa-video-camera"></i></Link>
                            <Link className="gray-5 px-3 d-none d-lg-block" to="/"><i className="fa fa-gear"></i></Link>
                            <button type="button" className="btn btn-sm btn-danger close-toggle ms-4"><i className="fe fe-settings mr-2"></i>Close</button>
                        </div>
                    </div>
                    <div className="collapse bg-body py-2" id="chat-search">
                        <div className="input-group px-lg-4 px-3">
                            <input type="search" className="form-control border-0" placeholder="Search. Components, Layouts, etc..."/>
                            <div className="input-group-append ms-3">
                                <button className="btn btn-primary" type="submit">Search</button>
                            </div>
                        </div>
                    </div>
                    <div className="action-body custom_scroll px-xl-4">
                        <ul className="list-unstyled mb-0">
                            {/* <!--[ Chat: left ]--> */}
                            <li className="mb-4 d-flex flex-row align-items-end">
                                <div className="max-width-70">
                                    <div className="user-info mb-1">
                                        <img className="avatar xs rounded-circle me-1" src={avatar2} alt="avatar"/>
                                        <span className="text-muted small">10:10 AM, Today</span>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-2 rounded">
                                        <div className="message">Are we meeting today?</div>
                                    </div>
                                </div>
                                {/* <!--[ More option ]--> */}
                                <div className="dropdown">
                                    <Link to="/" className="nav-link py-2 px-3 text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></Link>
                                    <ul className="dropdown-menu border-0 shadow">
                                        <li><Link className="dropdown-item" to="/">Edit</Link></li>
                                        <li><Link className="dropdown-item" to="/">Share</Link></li>
                                        <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                    </ul>
                                </div>
                            </li>
                            {/* <!--[ Chat: left ]--> */}
                            <li className="mb-4 d-flex flex-row align-items-end">
                                <div className="max-width-70">
                                    <div className="user-info mb-1">
                                        <img className="avatar xs rounded-circle me-1" src={avatar6} alt="avatar"/>
                                        <span className="text-muted small">10:10 AM, Today</span>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-2 rounded">
                                        <div className="message">Hi Aiden, how are you? How is the project coming along?</div>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-2 mt-1 rounded">
                                        <div className="message">Are we meeting today?</div>
                                    </div>
                                </div>
                                {/* <!--[ More option ]--> */}
                                <div className="dropdown">
                                    <Link to="/" className="nav-link py-2 px-3 text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></Link>
                                    <ul className="dropdown-menu border-0 shadow">
                                        <li><Link className="dropdown-item" to="/">Edit</Link></li>
                                        <li><Link className="dropdown-item" to="/">Share</Link></li>
                                        <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                    </ul>
                                </div>
                            </li>
                            {/* <!--[ Chat: right ]--> */}
                            <li className="mb-4 d-flex flex-row-reverse align-items-end">
                                <div className="max-width-70 text-end">
                                    <div className="user-info mb-1">
                                        <span className="text-muted small">10:12 AM, Today</span>
                                    </div>
                                    <div className="p-2 bg-body rounded">
                                        <div className="message">Project has been already finished and I have results to show you.</div>
                                    </div>
                                </div>
                                {/* <!--[ More option ]--> */}
                                <div className="dropdown">
                                    <Link to="/" className="nav-link py-2 px-3 text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></Link>
                                    <ul className="dropdown-menu border-0 shadow">
                                        <li><Link className="dropdown-item" to="/">Edit</Link></li>
                                        <li><Link className="dropdown-item" to="/">Share</Link></li>
                                        <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                    </ul>
                                </div>
                            </li>
                            {/* <!--[ Chat: left ]--> */}
                            <li className="mb-4 d-flex flex-row align-items-end">
                                <div className="max-width-70">
                                    <div className="user-info mb-1">
                                        <img className="avatar xs rounded-circle me-1" src={avatar3} alt="avatar"/>
                                        <span className="text-muted small">10:10 AM, Today</span>
                                    </div>
                                    <div className="bg-danger bg-opacity-10 p-2 rounded">
                                        <div className="message"> It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</div>
                                    </div>
                                </div>
                                {/* <!--[ More option ]--> */}
                                <div className="dropdown">
                                    <Link to="/" className="nav-link py-2 px-3 text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></Link>
                                    <ul className="dropdown-menu border-0 shadow">
                                        <li><Link className="dropdown-item" to="/">Edit</Link></li>
                                        <li><Link className="dropdown-item" to="/">Share</Link></li>
                                        <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                    </ul>
                                </div>
                            </li>
                            {/* <!--[ Chat: left ]--> */}
                            <li className="mb-4 d-flex flex-row align-items-end">
                                <div className="max-width-70">
                                    <div className="user-info mb-1">
                                        <img className="avatar xs rounded-circle me-1" src={avatar4} alt="avatar"/>
                                        <span className="text-muted small">10:10 AM, Today</span>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 p-2 rounded">
                                        <div className="message"> Contrary to popular belief, Lorem Ipsum is not simply random text.</div>
                                    </div>
                                </div>
                                {/* <!--[ More option ]--> */}
                                <div className="dropdown">
                                    <Link to="/" className="nav-link py-2 px-3 text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></Link>
                                    <ul className="dropdown-menu border-0 shadow">
                                        <li><Link className="dropdown-item" to="/">Edit</Link></li>
                                        <li><Link className="dropdown-item" to="/">Share</Link></li>
                                        <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                    </ul>
                                </div>
                            </li>
                            {/* <!--[ Chat: right ]--> */}
                            <li className="mb-4 d-flex flex-row-reverse align-items-end">
                                <div className="max-width-70 text-end">
                                    <div className="user-info mb-1">
                                        <span className="text-muted small">10:12 AM, Today</span>
                                    </div>
                                    <div className="p-2 bg-body rounded">
                                        <div className="message">
                                            Yes, Orlando Allredy done <br/> There are many variations of passages of Lorem Ipsum available
                                        </div>
                                    </div>
                                </div>
                                {/* <!--[ More option ]--> */}
                                <div className="dropdown">
                                    <Link to="/" className="nav-link py-2 px-3 text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></Link>
                                    <ul className="dropdown-menu border-0 shadow">
                                        <li><Link className="dropdown-item" to="/">Edit</Link></li>
                                        <li><Link className="dropdown-item" to="/">Share</Link></li>
                                        <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                    </ul>
                                </div>
                            </li>
                            {/* <!--[ Chat: left ]--> */}
                            <li className="mb-4 d-flex flex-row align-items-end">
                                <div className="max-width-70">
                                    <div className="user-info mb-1">
                                        <img className="avatar xs rounded-circle me-1" src={avatar1} alt="avatar"/>
                                        <span className="text-muted small">10:10 AM, Today</span>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-2 rounded">
                                        <div className="message">
                                            <p>Please find attached images</p>
                                            <img className="img-thumbnail me-1" src={g1} alt="" style={{width: "100px"}} />
                                            <img className="img-thumbnail" src={g2} alt="" style={{width: "100px"}} />
                                        </div>
                                    </div>
                                </div>
                                {/* <!--[ More option ]--> */}
                                <div className="dropdown">
                                    <Link to="/" className="nav-link py-2 px-3 text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></Link>
                                    <ul className="dropdown-menu border-0 shadow">
                                        <li><Link className="dropdown-item" to="/">Edit</Link></li>
                                        <li><Link className="dropdown-item" to="/">Share</Link></li>
                                        <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                    </ul>
                                </div>
                            </li>
                            {/* <!--[ Chat: right ]--> */}
                            <li className="mb-4 d-flex flex-row-reverse align-items-end">
                                <div className="max-width-70 text-end">
                                    <div className="user-info mb-1">
                                        <span className="text-muted small">10:12 AM, Today</span>
                                    </div>
                                    <div className="p-2 bg-body rounded">
                                        <div className="message">Okay, will check and let you know.</div>
                                    </div>
                                </div>
                                {/* <!--[ More option ]--> */}
                                <div className="dropdown">
                                    <Link to="/" className="nav-link py-2 px-3 text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></Link>
                                    <ul className="dropdown-menu border-0 shadow">
                                        <li><Link className="dropdown-item" to="/">Edit</Link></li>
                                        <li><Link className="dropdown-item" to="/">Share</Link></li>
                                        <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="action-footer chat-msg d-flex px-xl-4">
                        <div className="btn btn-link file-input">
                            <input type="file" className="form-control" name="file-input" id="file-input"/>
                            <label htmlFor="file-input" className="fa fa-paperclip"></label>
                        </div>
                        <input type="text" className="form-control bg-transparent border-0" placeholder="Enter text here..."/>
                        <button className="btn btn-dark text-uppercase" type="button">Send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat