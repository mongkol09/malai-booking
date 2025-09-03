import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { bootstrapTitleMapping, docComponents, generalTitleMapping } from './DocumentationSidebarData';

const Documentation = () => {

    const location = useLocation();
    const pathname = location.pathname;
    const docTitle = generalTitleMapping[pathname] || bootstrapTitleMapping[pathname] || "";

    return (
        <div data-ha="theme-PurpleHeart" className="svgstroke-a docs">

            <button className="btn btn-primary d-inline-flex d-xl-none position-fixed bottom-0 end-0 p-2 me-3 mb-3 z-3 shadow avatar rounded-circle" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_Navbar">
                <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 6l16 0"></path>
                    <path d="M4 12l16 0"></path>
                    <path d="M4 18l16 0"></path>
                </svg>
            </button>

            <main className="container-xl px-0">
                {/* <!-- start: page menu link --> */}
                <aside className="ps-xl-5 ps-lg-4 ps-3 pe-2 py-3 sidebar sticky-top" data-bs-theme="none">
                    <nav className="navbar navbar-expand-xl py-0">
                        <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="offcanvas_Navbar">
                            <div className="offcanvas-header">
                                <span className="fw-bold fs-5 text-gradient">Malai</span>
                                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                            </div>
                            <div className="offcanvas-body flex-column custom_scroll ps-3 ps-xl-0">
                                <div className="d-flex align-items-start mb-4 d-none d-xl-inline-flex">
                                    <Link to="/index" className="brand-icon text-decoration-none d-flex align-items-center" title="Malai Admin Template">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
                                            <path d="M9 8l0 8" />
                                            <path d="M9 12l6 0" />
                                            <path d="M15 8l0 8" />
                                        </svg>
                                        <span className="fw-bold ps-2 fs-5 text-gradient">Malai</span>
                                    </Link>
                                </div>
                                {/* <!-- start: Menu tab --> */}
                                <ul className="nav nav-tabs tab-dynamic px-0 mb-4" role="tablist" style={{ "--dynamic-color": "var(--accent-color)" }}>
                                    <li className="nav-item" role="presentation"><Link className={`ps-2 pe-3 nav-link ${generalTitleMapping[pathname] ? 'active' : ''}`} data-bs-toggle="tab" to="#tab_General" role="tab" aria-selected="false" tabIndex="-1">General</Link></li>
                                    <li className="nav-item" role="presentation"><Link className={`ps-2 pe-3 nav-link ${bootstrapTitleMapping[pathname] ? 'active' : ''}`} data-bs-toggle="tab" to="#tab_Bootstrtap" role="tab" aria-selected="true">Bootstrtap</Link></li>
                                </ul>
                                {/* <!-- start: Menu content --> */}
                                <div className="tab-content">
                                    {/* <!-- start: General tab--> */}
                                    <div className={`tab-pane fade show ${generalTitleMapping[pathname] ? 'active' : ''}`} id="tab_General" role="tabpanel">
                                        <ul className="list-unstyled mb-4 menu-list">
                                            <li>
                                                <Link className={`${pathname === '/docs' ? 'active' : ''}`} to="/docs" aria-label="Documentation">
                                                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                        <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
                                                        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
                                                        <path d="M10 12h4v4h-4z"></path>
                                                    </svg>
                                                    <span className="mx-3">Documentation</span>
                                                </Link>
                                            </li>
                                            <li className="py-2 mt-2">
                                                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{ "--dynamic-color": "var(--theme-color1)" }}>Widgets</h6>
                                                <ul className="list-unstyled">
                                                    <li><NavLink className="ms-link" to="/docs/widgets-basic-card" aria-label="Widgets Basic card">Basic card</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/widgets-card-tiles" aria-label="Widgets tiles">Card tiles</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/widgets-card-tab" aria-label="Widgets Tabbed">Tabbed card</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/widgets-tables" aria-label="Widgets Tables">Tables example</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/widgets-forms" aria-label="Widgets Forms">Forms example</NavLink></li>
                                                </ul>
                                            </li>
                                            <li className="py-2 mt-2">
                                                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{ "--dynamic-color": "var(--theme-color1)" }}>Charts</h6>
                                                <ul className="list-unstyled">
                                                    <li><NavLink className="ms-link" to="/docs/apex" aria-label="Apex chart">Apex chart</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/peity" aria-label="Peity chart">Peity chart</NavLink></li>
                                                </ul>
                                            </li>
                                            <li className="py-2 mt-2">
                                                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{ "--dynamic-color": "var(--theme-color1)" }}>Plugin (NPM)</h6>
                                                <ul className="list-unstyled">
                                                    <li><NavLink className="ms-link" to="/docs/datatables" aria-label="Datatables">Datatables</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/flatpickr" aria-label="Flatpickr">Flatpickr</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/inputmask" aria-label="Inputmask">Inputmask</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/jsvectormap" aria-label="Jsvectormap">Jsvectormap</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/sortablejs" aria-label="Sortablejs">Sortablejs</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/sweetalert2" aria-label="Sweet alert 2">Sweet alert 2</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/tagify" aria-label="Tagify">Tagify</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/tiny-slider" aria-label="Tiny slider">Tiny slider</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/full-calendar" aria-label="Calendar">Calendar</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/summernote" aria-label="Summernote">Summernote</NavLink></li>
                                                </ul>
                                            </li>
                                            <li className="py-2 mt-2">
                                                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{ "--dynamic-color": "var(--theme-color1)" }}>Font icon</h6>
                                                <ul className="list-unstyled">
                                                    <li><NavLink className="ms-link" to="/docs/bootstrap-icon" aria-label="Bootstrap Icon">Bootstrap Icon</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/flag-icon" aria-label="Country Flag">Country Flag icon</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/fontawesome-icon" aria-label="Font awesome">Font awesome</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/linear-icon" aria-label="Simple line">Simple line icon</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/weather-icon" aria-label="Weather icon">Weather icon</NavLink></li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                    {/* <!-- start: Bootstrtap tab --> */}
                                    <div className={`tab-pane fade show ${bootstrapTitleMapping[pathname] ? 'active' : ''}`} id="tab_Bootstrtap" role="tabpanel">
                                        <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{ "--dynamic-color": "var(--theme-color1)" }}>Bootstrtap</h6>
                                        <ul className="list-unstyled mb-4 menu-list">
                                            <li className="py-2 mt-2">
                                                <ul className="list-unstyled">
                                                    <li><NavLink className="ms-link" to="/docs/accordion" aria-label="Accordion">Accordion</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/alerts" aria-label="Alerts">Alerts</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/avatar" aria-label="User Avatar">User Avatar</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/badges" aria-label="Badges">Badges</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/breadcrumb" aria-label="Breadcrumb">Breadcrumb</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/buttons" aria-label="Buttons">Buttons</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/cards" aria-label="Cards">Cards</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/carousel" aria-label="Carousel">Carousel</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/collapse" aria-label="Collapse">Collapse</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/dropdowns" aria-label="Dropdowns">Dropdowns</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/listgroup" aria-label="List group">List group</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/modal" aria-label="Modal">Modal</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/navbar" aria-label="Navbar">Navbar</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/navstabs" aria-label="Navs and tabs">Navs and tabs</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/offcanvas" aria-label="Offcanvas">Offcanvas</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/pagination" aria-label="Pagination">Pagination</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/placeholders" aria-label="Placeholders">Placeholders</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/popovers" aria-label="Popovers">Popovers</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/progress" aria-label="Progress">Progress</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/spinners" aria-label="Spinners">Spinners</NavLink></li>
                                                    <li><NavLink className="ms-link" to="/docs/toasts" aria-label="Toasts">Toasts</NavLink></li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                </aside>
                {docComponents[docTitle]}
            </main>
        </div>
    )
}

export default Documentation