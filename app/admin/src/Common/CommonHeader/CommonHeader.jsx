import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setSelectedMod } from '../../Redux/actions/settingsActions'

import CommonSetting from '../CommonSetting/CommonSetting'
import UserDropdown from './Components/UserDropdown'

import avatar1 from '../../assets/images/xs/avatar1.jpg'
import avatar2 from '../../assets/images/xs/avatar2.jpg'
import avatar3 from '../../assets/images/xs/avatar3.jpg'
import avatar4 from '../../assets/images/xs/avatar4.jpg'

import profile_av from '../../assets/images/profile_av.png'

const CommonHeader = ( {toggleSidebar} ) => {

    const dispatch = useDispatch();
    const [selectedMode, setSelectedMode] = useState('light');
 
    const setThemeMode = (mode) => {
        setSelectedMode(mode);
        dispatch(setSelectedMod(mode));
    };
    
    let iconId;
    switch (selectedMode) {
        case 'light':
        iconId = 'sun-fill';
        break;
        case 'dark':
        iconId = 'moon-stars-fill';
        break;
        case 'auto':
        iconId = 'circle-half';
        break;
        default:
        iconId = 'sun-fill';
    };

  return (
    <>
      <header className="px-xl-5 px-lg-4 px-3 sticky-top" id='headerDark' data-bs-theme="none">
          <div className="d-flex justify-content-between align-items-center py-2 w-100">
              <div className="d-flex align-items-center pe-4">
                <button className="btn d-inline-flex d-xl-none border-0 p-0 pe-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_Navbar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 21a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3" /><path d="M21 6v12a3 3 0 0 1 -6 0v-12a3 3 0 0 1 6 0z" fill="var(--accent-color)" /><path d="M15 12h-8" /><path d="M10 9l-3 3l3 3" /></svg>
                </button>
                <button className="btn d-xl-inline-flex d-none border-0 p-0 pe-2 sidebar-toggle-btn" type="button" onClick={toggleSidebar}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 21a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3" /><path d="M21 6v12a3 3 0 0 1 -6 0v-12a3 3 0 0 1 6 0z" fill="var(--accent-color)" /><path d="M15 12h-8" /><path d="M10 9l-3 3l3 3" /></svg>
                </button>
                {/* <!--[ Start:: Brand Logo icon ]--> */}
                <Link to="/" className="brand-icon text-decoration-none d-flex align-items-center" title="Malai Admin Template">
                    <img
                        src="/MALAI_LOGO.png"
                        alt="Malai Logo"
                        className="brand-logo"
                        style={{ height: '40px', width: 'auto' }}
                    />
                </Link>
                <span className="fw-bold ps-2 fs-5 d-none d-xl-inline-flex text-gradient">Malai</span>
            </div>
            <form className="dropdown main-search me-md-4 w-100 d-none d-md-inline-flex">
                <div className="w-100" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                    <svg className="svg-stroke search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                        <path d="M21 21l-6 -6"></path>
                    </svg>
                    <input type="text" className="form-control" placeholder="Search..." aria-label="Search..." />
                </div>
                <div className="dropdown-menu shadow rounded-4 p-3 p-xl-4 w-100">
                    <h6 className="fl-title" style={{ "--dynamic-color": "var(--theme-color1)" }}>Recent Search</h6>
                    <div className="tagcloud mb-4">
                        <Link to="/" className="tag-link rounded-pill border px-3" style={{ "--hover-color": "var(--theme-color1)" }}>Vite</Link>
                        <Link to="/" className="tag-link rounded-pill border px-3" style={{ "--hover-color": "var(--theme-color2)" }}>Bootstra 5</Link>
                        <Link to="/" className="tag-link rounded-pill border px-3" style={{ "--hover-color": "var(--theme-color1)" }}>Contact's</Link>
                    </div>
                    <h6 className="fl-title" style={{ "--dynamic-color": "var(--theme-color2)" }}>Help</h6>
                    <div className="d-flex flex-column mb-4">
                        <Link className="mb-1" to="/">
                            <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                                <path d="M11 13l9 -9"></path>
                                <path d="M15 4h5v5"></path>
                            </svg>
                            <span> New around here? Sign up</span>
                        </Link>
                        <Link className="mb-1" to="/">
                            <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                                <path d="M11 13l9 -9"></path>
                                <path d="M15 4h5v5"></path>
                            </svg>
                            <span> How to setup theme?</span>
                        </Link>
                        <Link className="mb-1" to="/">
                            <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                                <path d="M11 13l9 -9"></path>
                                <path d="M15 4h5v5"></path>
                            </svg>
                            <span> View detail documentation</span>
                        </Link>
                    </div>
                    <h6 className="fl-title" style={{ "--dynamic-color": "var(--theme-color3)" }}>New users</h6>
                    <div className="d-flex flex-column">
                        <Link to="/" className="d-flex align-items-center mb-2">
                            <img className="avatar rounded-circle border border-3 me-2" src={avatar1} alt="avatar" />
                            Kevin Gill
                        </Link>
                        <Link to="/" className="d-flex align-items-center mb-2">
                            <img className="avatar rounded-circle border border-3 me-2" src={avatar2} alt="avatar" />
                            Michelle Glover
                        </Link>
                        <Link to="/" className="d-flex align-items-center mb-2">
                            <img className="avatar rounded-circle border border-3 me-2" src={avatar3} alt="avatar" />
                            Jony Doe
                        </Link>
                    </div>
                </div>
            </form>
            <ul className="header-menu flex-grow-1">
                {/* <!--[ Start:: notification ]--> */}
                <li className="nav-item dropdown px-md-1 d-none d-md-inline-flex">
                    <Link className="dropdown-toggle gray-6" to="/" role="button" data-bs-toggle="dropdown" aria-expanded="false" title="notification">
                        <span className="bullet-dot bg-primary animation-blink"></span>
                        <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"></path>
                            <path d="M9 17v1a3 3 0 0 0 6 0v-1"></path>
                            <path d="M21 6.727a11.05 11.05 0 0 0 -2.794 -3.727"></path>
                            <path d="M3 6.727a11.05 11.05 0 0 1 2.792 -3.727"></path>
                        </svg>
                    </Link>
                    <div className="dropdown-menu shadow rounded-4 notification" id="NotificationsDiv">
                        <div className="card border-0">
                            <div className="card-header d-flex justify-content-between align-items-center py-3">
                                <h4 className="mb-0 text-gradient title-font">Notifications</h4>
                                <Link to="/" className="btn btn-link" title="view all">View all</Link>
                            </div>
                            <ul className="card-body p-0 list-unstyled mb-0 custom_scroll ps-2" style={{ height: "400px" }}>
                                <li className="pe-2">
                                    <Link className="d-flex p-lg-3 p-2 rounded-3" to="/">
                                        <div className="avatar sm">
                                            <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3"></path>
                                            </svg>
                                        </div>
                                        <div className="flex-fill ms-3">
                                            <span className="d-flex justify-content-between"><small className="text-primary">Holiday Sale</small><small className="text-muted">11:30 AM Today</small></span>
                                            <p className="mb-0 mt-1">Your New Campaign sale live on themeforest and our store is approved.</p>
                                        </div>
                                    </Link>
                                </li>
                                <li className="pe-2">
                                    <Link className="d-flex p-lg-3 p-2 rounded-3" to="/">
                                        <div className="avatar sm">
                                            <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h5.697"></path>
                                                <path d="M18 14v4h4"></path>
                                                <path d="M18 11v-4a2 2 0 0 0 -2 -2h-2"></path>
                                                <path d="M8 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path>
                                                <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
                                                <path d="M8 11h4"></path>
                                                <path d="M8 15h3"></path>
                                            </svg>
                                        </div>
                                        <div className="flex-fill ms-3">
                                            <span className="d-flex justify-content-between"><small className="text-info">Reports</small><small className="text-muted">04:00 PM Today</small></span>
                                            <p className="mb-0 mt-1">Website visits from Twitter is 27% higher than last week.</p>
                                        </div>
                                    </Link>
                                </li>
                                <li className="pe-2">
                                    <Link className="d-flex p-lg-3 p-2 rounded-3 align-items-start" to="/">
                                        <img className="avatar sm rounded-circle" src={avatar4} alt="avatar" />
                                        <div className="flex-fill ms-3">
                                            <span className="d-flex justify-content-between"><small className="text-warning">HTML Code</small><small className="text-muted">1day</small></span>
                                            <p className="mb-0 mt-1">Update new code in github and share deteail</p>
                                        </div>
                                    </Link>
                                </li>
                                <li className="pe-2">
                                    <div className="d-flex p-lg-3 p-2 rounded-3">
                                        <img className="avatar sm rounded-circle" src={avatar1} alt="avatar" />
                                        <div className="flex-fill ms-3">
                                            <span className="d-flex justify-content-between"><small className="text-success">New Request</small><small className="text-muted">1day</small></span>
                                            <p className="mb-0 mt-1"><strong>Tina Harris</strong> is requesting to upgrade Plan</p>
                                            <div className="mt-2">
                                                <Link to="/" className="btn btn-sm bg-accent text-white me-1">Accept</Link>
                                                <Link to="/" className="btn btn-sm btn-dark text-white">Decline</Link>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li className="pe-2">
                                    <Link className="d-flex p-lg-3 p-2 rounded-3" to="/">
                                        <div className="avatar sm">
                                            <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                                                <path d="M12 8v4"></path>
                                                <path d="M12 16h.01"></path>
                                            </svg>
                                        </div>
                                        <div className="flex-fill ms-3">
                                            <span className="d-flex justify-content-between"><small className="text-danger">Error 404</small><small className="text-muted">Yesterday</small></span>
                                            <p className="mb-0 mt-1">Malai admin template on website analytics configurations</p>
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </li>
                <li className="nav-item py-2 py-md-1 col-auto">
                    <div className="vr d-none d-sm-flex h-100 mx-sm-2"></div>
                </li>
                {/* <!--[ Start:: language ]--> */}
                <li className="nav-item dropdown px-md-1 d-none d-md-inline-flex">
                    <Link className="dropdown-toggle gray-6" to="/" data-bs-toggle="dropdown" role="button" title="language">
                        <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                            <path d="M3.6 9h16.8"></path>
                            <path d="M3.6 15h16.8"></path>
                            <path d="M11.5 3a17 17 0 0 0 0 18"></path>
                            <path d="M12.5 3a17 17 0 0 1 0 18"></path>
                        </svg>
                    </Link>
                    <ul className="dropdown-menu shadow rounded-4 p-2 p-xl-3 li_animate">
                        <li className="mb-1"><Link className="dropdown-item rounded-pill active" to="/" title="language">English</Link></li>
                        <li className="mb-1"><Link className="dropdown-item rounded-pill" to="/" title="language">Hindi</Link></li>
                        <li className="mb-1"><Link className="dropdown-item rounded-pill" to="/" title="language">Spanish</Link></li>
                        <li className="mb-1"><Link className="dropdown-item rounded-pill" to="/" title="language">Arabic</Link></li>
                        <li className="mb-1"><Link className="dropdown-item rounded-pill" to="/" title="language">French</Link></li>
                    </ul>
                </li>
                {/* <!--[ Start:: theme light/dark ]--> */}
                <li className="nav-item dropdown px-md-1">
                    <Link className="dropdown-toggle gray-6" to="/" id="bd-theme" data-bs-toggle="dropdown" aria-expanded="false">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="theme-icon-active"><use href={`#${iconId}`}></use></svg>
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-2 p-xl-3 shadow rounded-4" aria-labelledby="bd-theme">
                        <li className="mb-1"><Link className={`dropdown-item rounded-pill ${selectedMode === 'light' ? 'active' : ''}`} to="/" data-bs-theme-value="light" onClick={() => setThemeMode('light')}><svg className="avatar xs me-2 opacity-50 theme-icon" fill="currentColor"><use to="#sun-fill"></use></svg> Light</Link></li>
                        <li className="mb-1"><Link className={`dropdown-item rounded-pill ${selectedMode === 'dark' ? 'active' : ''}`} to="/" data-bs-theme-value="dark" onClick={() => setThemeMode('dark')}><svg className="avatar xs me-2 opacity-50 theme-icon" fill="currentColor"><use to="#moon-stars-fill"></use></svg> Dark</Link></li>
                        <li className="mb-1"><Link className={`dropdown-item rounded-pill ${selectedMode === 'auto' ? 'active' : ''}`} to="/" data-bs-theme-value="auto" onClick={() => setThemeMode('auto')}><svg className="avatar xs me-2 opacity-50 theme-icon" fill="currentColor"><use to="#circle-half"></use></svg> Auto</Link></li>
                    </ul>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ display: "none" }}>
                        <symbol id="sun-fill" viewBox="0 0 16 16">
                            <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
                        </symbol>
                        <symbol id="moon-stars-fill" viewBox="0 0 16 16">
                            <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
                            <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z" />
                        </symbol>
                        <symbol id="circle-half" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
                        </symbol>
                    </svg>
                </li>
                {/* <!--[ Start:: theme setting ]--> */}
                <div className="nav-item dropdown px-md-1">
                    <Link className="dropdown-toggle gray-6" to="#offcanvas_setting" data-bs-toggle="offcanvas" aria-expanded="false" title="template setting">
                        <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                        </svg>
                    </Link>
                </div>
                <li className="nav-item py-2 py-md-1 col-auto">
                    <div className="vr d-none d-sm-flex h-100 mx-sm-2"></div>
                </li>
                {/* <!--[ Start:: user detail ]--> */}
                <li className="nav-item user ms-3">
                    <Link className="dropdown-toggle gray-6 d-flex text-decoration-none align-items-center lh-sm p-0" to="/" role="button" data-bs-toggle="dropdown" aria-expanded="false" title="User" data-bs-auto-close="outside">
                        <img className="avatar rounded-circle border border-3" src={profile_av} alt="avatar" />
                        <span className="ms-2 fs-6 d-none d-sm-inline-flex">Michelle</span>
                    </Link>
                    <UserDropdown/>
                </li>
            </ul>
        </div>
      </header>
      <CommonSetting selectedMode={selectedMode} />
    </>
  )
}

export default CommonHeader