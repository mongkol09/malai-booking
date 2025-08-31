import React from 'react'

import avatar1 from '../../../../assets/images/xs/avatar1.jpg'
import avatar2 from '../../../../assets/images/xs/avatar2.jpg'
import avatar3 from '../../../../assets/images/xs/avatar3.jpg'
import avatar4 from '../../../../assets/images/xs/avatar4.jpg'
import avatar5 from '../../../../assets/images/xs/avatar5.jpg'
import avatar6 from '../../../../assets/images/xs/avatar6.jpg'
import avatar7 from '../../../../assets/images/xs/avatar7.jpg'
import avatar8 from '../../../../assets/images/xs/avatar8.jpg'
import avatar9 from '../../../../assets/images/xs/avatar9.jpg'
import avatar10 from '../../../../assets/images/xs/avatar10.jpg'
import { Link } from 'react-router-dom'

const Tables = () => {
  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
            <h3 className="title-font mb-3">Table example</h3>
            <div className="row g-3">
                <div className="col-lg-12 col-md-12">
                    <div className="card mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom-0">
                            <h6 className="m-0">Patients Status</h6>
                            <div className="form-check form-switch table-toggle-one">
                                <input className="form-check-input" type="checkbox" role="switch" id="table-toggle-one"/>
                                <label className="form-check-label" htmlFor="table-toggle-one">Show Code</label>
                            </div>
                        </div>
                        <div className="card-body table-main-one">
                            <table className="myDataTable table table-hover align-middle mb-0" style={{width: "100%"}}>
                                <thead>
                                    <tr>
                                        <th>Patients</th>
                                        <th>Adress</th>
                                        <th>Admited</th>
                                        <th>Discharge</th>
                                        <th>Progress</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><img src={avatar3} className="avatar sm rounded me-2" alt="profile-image"/><span>Jony</span></td>
                                        <td>2861 Geneva Street, New York, 10016</td>
                                        <td>Mar 17, 2023</td>
                                        <td>Mar 19, 2023</td>
                                        <td>
                                            <div className="progress" style={{height: "3px"}}>
                                                <div className="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style={{width: "40%"}}> <span className="sr-only">40% Complete</span> </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-info">Admit</span></td>
                                    </tr>
                                    <tr>
                                        <td><img src={avatar1} className="avatar sm rounded me-2" alt="profile-image"/><span>Marco Sent</span></td>
                                        <td>3387 Caldwell Road, Rochester,  14620</td>
                                        <td>Mar 17, 2023</td>
                                        <td>Mar 22, 2023</td>
                                        <td>
                                            <div className="progress" style={{height: "3px"}}>
                                                <div className="progress-bar bg-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{width: "100%"}}> <span className="sr-only">100% Complete</span> </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-success">Discharge</span></td>
                                    </tr>
                                    <tr>
                                        <td><img src={avatar2} className="avatar sm rounded me-2" alt="profile-image"/><span>Marco Sent</span></td>
                                        <td>3958 Kuhl Avenue, Smyrna,  64507</td>
                                        <td>Mar 17, 2023</td>
                                        <td>Mar 19, 2023</td>
                                        <td>
                                            <div className="progress" style={{height: "3px"}}>
                                                <div className="progress-bar bg-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{width: "100%"}}> <span className="sr-only">100% Complete</span> </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-success">Discharge</span></td>
                                    </tr>
                                    <tr>
                                        <td><img src={avatar4} className="avatar sm rounded me-2" alt="profile-image"/><span>Dean Otto</span></td>
                                        <td>3387 Caldwell Road, Rochester,  14620</td>
                                        <td>Mar 17, 2023</td>
                                        <td>Mar 23, 2023</td>
                                        <td>
                                            <div className="progress" style={{height: "3px"}}>
                                                <div className="progress-bar bg-info" role="progressbar" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100" style={{width: "15%"}}> <span className="sr-only">15% Complete</span> </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-info">Admit</span></td>
                                    </tr>
                                    <tr>
                                        <td><img src={avatar5} className="avatar sm rounded me-2" alt="profile-image"/><span>Hughe L.</span></td>
                                        <td>3958 Kuhl Avenue, Smyrna,  64507</td>
                                        <td>Apr 23, 2023</td>
                                        <td>Apr 23, 2023</td>
                                        <td>
                                            <div className="progress" style={{height: "3px"}}>
                                                <div className="progress-bar bg-danger" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" style={{width: "85%"}}> <span className="sr-only">85% Complete</span> </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-info">Admit</span></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="table-code">
            <pre className="language-html m-0" data-lang="html"><code className="language-html">&lt;table className=&quot;myDataTable table table-hover align-middle mb-0&quot; style=&quot;width: 100%;&quot;&gt;
                &lt;thead&gt;
                    &lt;tr&gt;
                        &lt;th&gt;Patients&lt;/th&gt;
                        &lt;th&gt;Adress&lt;/th&gt;
                        &lt;th&gt;Admited&lt;/th&gt;
                        &lt;th&gt;Discharge&lt;/th&gt;
                        &lt;th&gt;Progress&lt;/th&gt;
                        &lt;th&gt;Status&lt;/th&gt;
                    &lt;/tr&gt;
                &lt;/thead&gt;
                &lt;tbody&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar3.jpg&quot; className=&quot;avatar sm rounded me-2&quot; alt=&quot;profile-image&quot;&gt;&lt;span&gt;Jony&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;2861 Geneva Street, New York, 10016&lt;/td&gt;
                        &lt;td&gt;Mar 17, 2023&lt;/td&gt;
                        &lt;td&gt;Mar 19, 2023&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot; style=&quot;height: 3px;&quot;&gt;
                                &lt;div className=&quot;progress-bar progress-bar-warning&quot; role=&quot;progressbar&quot; aria-valuenow=&quot;40&quot; aria-valuemin=&quot;0&quot; aria-valuemax=&quot;100&quot; style=&quot;width: 40%;&quot;&gt; &lt;span className=&quot;sr-only&quot;&gt;40% Complete&lt;/span&gt; &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-info&quot;&gt;Admit&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar1.jpg&quot; className=&quot;avatar sm rounded me-2&quot; alt=&quot;profile-image&quot;&gt;&lt;span&gt;Marco Sent&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;3387 Caldwell Road, Rochester,  14620&lt;/td&gt;
                        &lt;td&gt;Mar 17, 2023&lt;/td&gt;
                        &lt;td&gt;Mar 22, 2023&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot; style=&quot;height: 3px;&quot;&gt;
                                &lt;div className=&quot;progress-bar bg-success&quot; role=&quot;progressbar&quot; aria-valuenow=&quot;100&quot; aria-valuemin=&quot;0&quot; aria-valuemax=&quot;100&quot; style=&quot;width: 100%;&quot;&gt; &lt;span className=&quot;sr-only&quot;&gt;100% Complete&lt;/span&gt; &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;Discharge&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar2.jpg&quot; className=&quot;avatar sm rounded me-2&quot; alt=&quot;profile-image&quot;&gt;&lt;span&gt;Marco Sent&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;3958 Kuhl Avenue, Smyrna,  64507&lt;/td&gt;
                        &lt;td&gt;Mar 17, 2023&lt;/td&gt;
                        &lt;td&gt;Mar 19, 2023&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot; style=&quot;height: 3px;&quot;&gt;
                                &lt;div className=&quot;progress-bar bg-success&quot; role=&quot;progressbar&quot; aria-valuenow=&quot;100&quot; aria-valuemin=&quot;0&quot; aria-valuemax=&quot;100&quot; style=&quot;width: 100%;&quot;&gt; &lt;span className=&quot;sr-only&quot;&gt;100% Complete&lt;/span&gt; &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;Discharge&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar4.jpg&quot; className=&quot;avatar sm rounded me-2&quot; alt=&quot;profile-image&quot;&gt;&lt;span&gt;Dean Otto&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;3387 Caldwell Road, Rochester,  14620&lt;/td&gt;
                        &lt;td&gt;Mar 17, 2023&lt;/td&gt;
                        &lt;td&gt;Mar 23, 2023&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot; style=&quot;height: 3px;&quot;&gt;
                                &lt;div className=&quot;progress-bar bg-info&quot; role=&quot;progressbar&quot; aria-valuenow=&quot;15&quot; aria-valuemin=&quot;0&quot; aria-valuemax=&quot;100&quot; style=&quot;width: 15%;&quot;&gt; &lt;span className=&quot;sr-only&quot;&gt;15% Complete&lt;/span&gt; &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-info&quot;&gt;Admit&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar5.jpg&quot; className=&quot;avatar sm rounded me-2&quot; alt=&quot;profile-image&quot;&gt;&lt;span&gt;Hughe L.&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;3958 Kuhl Avenue, Smyrna,  64507&lt;/td&gt;
                        &lt;td&gt;Apr 23, 2023&lt;/td&gt;
                        &lt;td&gt;Apr 23, 2023&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot; style=&quot;height: 3px;&quot;&gt;
                                &lt;div className=&quot;progress-bar bg-danger&quot; role=&quot;progressbar&quot; aria-valuenow=&quot;85&quot; aria-valuemin=&quot;0&quot; aria-valuemax=&quot;100&quot; style=&quot;width: 85%;&quot;&gt; &lt;span className=&quot;sr-only&quot;&gt;85% Complete&lt;/span&gt; &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-info&quot;&gt;Admit&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                &lt;/tbody&gt;
            &lt;/table&gt;</code></pre>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-3">
                        <div className="card-header py-3 d-flex flex-wrap justify-content-between align-items-center bg-transparent border-bottom-0">
                            <h6 className="card-title m-0">Website Performance</h6>
                            <div className="form-check form-switch table-toggle-two">
                                <input className="form-check-input" type="checkbox" role="switch" id="table-toggle-two"/>
                                <label className="form-check-label" htmlFor="table-toggle-two">Show Code</label>
                            </div>
                        </div>
                        <div className="card-body table-main-two">
                            <div className="table-responsive">
                                <table className="table table-borderless table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Source</th>
                                            <th>Visits</th>
                                            <th>Avg. Time</th>
                                            <th>Bounce Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td><Link to="https://themeforest.net/user/pixelwibes/portfolio" target="_blank">https://themeforest.net</Link>
                                            </td>
                                            <td>980</td>
                                            <td>55s</td>
                                            <td>5.2%</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td><Link to="https://themeforest.net/user/pixelwibes/portfolio" target="_blank">https://themeforest.net</Link>
                                            </td>
                                            <td>851</td>
                                            <td>16s</td>
                                            <td>8.0%</td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td><Link to="https://themeforest.net/user/pixelwibes/portfolio" target="_blank">https://themeforest.net</Link>
                                            </td>
                                            <td>321</td>
                                            <td>10s</td>
                                            <td>5.7%</td>
                                        </tr>
                                        <tr>
                                            <td>4</td>
                                            <td><Link to="https://themeforest.net/user/pixelwibes/portfolio" target="_blank">https://themeforest.net</Link>
                                            </td>
                                            <td>205</td>
                                            <td>57s</td>
                                            <td>5.3%</td>
                                        </tr>
                                        <tr>
                                            <td>5</td>
                                            <td><Link to="https://themeforest.net/user/pixelwibes/portfolio" target="_blank">https://themeforest.net</Link>
                                            </td>
                                            <td>89</td>
                                            <td>45s</td>
                                            <td>6.1%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="table-code">
            <pre className="language-html m-0" data-lang="html"><code className="language-html">&lt;div className=&quot;table-responsive&quot;&gt;
                &lt;table className=&quot;table table-borderless table-hover mb-0&quot;&gt;
                    &lt;thead&gt;
                        &lt;tr&gt;
                            &lt;th&gt;#&lt;/th&gt;
                            &lt;th&gt;Source&lt;/th&gt;
                            &lt;th&gt;Visits&lt;/th&gt;
                            &lt;th&gt;Avg. Time&lt;/th&gt;
                            &lt;th&gt;Bounce Rate&lt;/th&gt;
                        &lt;/tr&gt;
                    &lt;/thead&gt;
                    &lt;tbody&gt;
                        &lt;tr&gt;
                            &lt;td&gt;1&lt;/td&gt;
                            &lt;td&gt;&lt;a href=&quot;https://themeforest.net&quot; target=&quot;_blank&quot;&gt;https://themeforest.net&lt;/a&gt;
                            &lt;/td&gt;
                            &lt;td&gt;980&lt;/td&gt;
                            &lt;td&gt;55s&lt;/td&gt;
                            &lt;td&gt;5.2%&lt;/td&gt;
                        &lt;/tr&gt;
                        &lt;tr&gt;
                            &lt;td&gt;2&lt;/td&gt;
                            &lt;td&gt;&lt;a href=&quot;https://themeforest.net&quot; target=&quot;_blank&quot;&gt;https://themeforest.net&lt;/a&gt;
                            &lt;/td&gt;
                            &lt;td&gt;851&lt;/td&gt;
                            &lt;td&gt;16s&lt;/td&gt;
                            &lt;td&gt;8.0%&lt;/td&gt;
                        &lt;/tr&gt;
                        &lt;tr&gt;
                            &lt;td&gt;3&lt;/td&gt;
                            &lt;td&gt;&lt;a href=&quot;https://themeforest.net&quot; target=&quot;_blank&quot;&gt;https://themeforest.net&lt;/a&gt;
                            &lt;/td&gt;
                            &lt;td&gt;321&lt;/td&gt;
                            &lt;td&gt;10s&lt;/td&gt;
                            &lt;td&gt;5.7%&lt;/td&gt;
                        &lt;/tr&gt;
                        &lt;tr&gt;
                            &lt;td&gt;4&lt;/td&gt;
                            &lt;td&gt;&lt;a href=&quot;https://themeforest.net&quot; target=&quot;_blank&quot;&gt;https://themeforest.net&lt;/a&gt;
                            &lt;/td&gt;
                            &lt;td&gt;205&lt;/td&gt;
                            &lt;td&gt;57s&lt;/td&gt;
                            &lt;td&gt;5.3%&lt;/td&gt;
                        &lt;/tr&gt;
                        &lt;tr&gt;
                            &lt;td&gt;5&lt;/td&gt;
                            &lt;td&gt;&lt;a href=&quot;https://themeforest.net&quot; target=&quot;_blank&quot;&gt;https://themeforest.net&lt;/a&gt;
                            &lt;/td&gt;
                            &lt;td&gt;89&lt;/td&gt;
                            &lt;td&gt;45s&lt;/td&gt;
                            &lt;td&gt;6.1%&lt;/td&gt;
                        &lt;/tr&gt;
                    &lt;/tbody&gt;
                &lt;/table&gt;
            &lt;/div&gt;</code></pre>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-3">
                        <div className="card-header py-3 d-flex flex-wrap justify-content-between align-items-center bg-transparent border-bottom-0">
                            <h6 className="card-title m-0">Project Status</h6>
                            <div className="form-check form-switch table-toggle-three">
                                <input className="form-check-input" type="checkbox" role="switch" id="table-toggle-three"/>
                                <label className="form-check-label" htmlFor="table-toggle-three">Show Code</label>
                            </div>
                        </div>
                        <div className="card-body table-main-three">
                            <table className="myDataTable table table-hover align-middle mb-0" style={{width:"100%"}}>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Date Start</th>
                                        <th>Days to Deadline</th>
                                        <th>Progress</th>
                                        <th>Priority</th>
                                        <th>Leader</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><Link to="/">Ebazar</Link></td>
                                        <td>12-02-2023</td>
                                        <td>12 days</td>
                                        <td>
                                            <div className="progress">
                                                <div className="progress-bar" data-transitiongoal="95" aria-valuenow="95" style={{width: "95%"}}>95%</div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-warning">MEDIUM</span></td>
                                        <td><img src={avatar1} alt="Avatar" className="avatar sm rounded me-2"/><Link to="/">Irene</Link></td>
                                        <td><span className="badge bg-success">ACTIVE</span></td>
                                    </tr>
                                    <tr>
                                        <td><Link to="/">EShop</Link></td>
                                        <td>24-05-2023</td>
                                        <td>30 days</td>
                                        <td>
                                            <div className="progress">
                                                <div className="progress-bar" data-transitiongoal="40" aria-valuenow="40" style={{width: "40%"}}>40%</div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-success">LOW</span></td>
                                        <td><img src={avatar2} alt="Avatar" className="avatar sm rounded me-2"/><Link to="/">Jasmine</Link></td>
                                        <td><span className="badge bg-warning">PENDING</span></td>
                                    </tr>
                                    <tr>
                                        <td><Link to="/">Food Buddy</Link></td>
                                        <td>20-09-2023</td>
                                        <td>50 days</td>
                                        <td>
                                            <div className="progress">
                                                <div className="progress-bar" data-transitiongoal="65" aria-valuenow="65" style={{width: "65%"}}>65%</div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-danger">HIGH</span></td>
                                        <td><img src={avatar3} alt="Avatar" className="avatar sm rounded me-2"/><Link to="/">Jasmine</Link></td>
                                        <td><span className="badge bg-success">ACTIVE</span></td>
                                    </tr>
                                    <tr>
                                        <td><Link to="/">Property Pro</Link></td>
                                        <td>05-10-2023</td>
                                        <td>40 days</td>
                                        <td>
                                            <div className="progress">
                                                <div className="progress-bar" data-transitiongoal="77" aria-valuenow="77" style={{width: "77%"}}>77%</div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-warning">MEDIUM</span></td>
                                        <td><img src={avatar4} alt="Avatar" className="avatar sm rounded me-2"/><Link to="/">Irene</Link></td>
                                        <td><span className="badge bg-success">ACTIVE</span></td>
                                    </tr>
                                    <tr>
                                        <td><Link to="/">Testroutes</Link></td>
                                        <td>15-11-2023</td>
                                        <td>30 days</td>
                                        <td>
                                            <div className="progress">
                                                <div className="progress-bar" data-transitiongoal="25" aria-valuenow="25" style={{width: "25%"}}>25%</div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-success">LOW</span></td>
                                        <td><img src={avatar5} alt="Avatar" className="avatar sm rounded me-2"/><Link to="/">Megan</Link></td>
                                        <td><span className="badge bg-success">ACTIVE</span></td>
                                    </tr>
                                    <tr>
                                        <td><Link to="/">Property Pro</Link></td>
                                        <td>05-10-2023</td>
                                        <td>N/A</td>
                                        <td>
                                            <div className="progress">
                                                <div className="progress-bar progress-bar-default" data-transitiongoal="100" aria-valuenow="100" style={{width: "100%"}}>100%</div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-secondary">MEDIUM</span></td>
                                        <td><img src={avatar6} alt="Avatar" className="avatar sm rounded me-2"/><Link to="/">Irene</Link></td>
                                        <td><span className="badge bg-secondary">CLOSED</span></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="table-code">
            <pre className="language-html m-0" data-lang="html"><code className="language-html">&lt;table className=&quot;myDataTable table table-hover align-middle mb-0&quot; style=&quot;width:100%&quot;&gt;
                &lt;thead&gt;
                    &lt;tr&gt;
                        &lt;th&gt;Title&lt;/th&gt;
                        &lt;th&gt;Date Start&lt;/th&gt;
                        &lt;th&gt;Days to Deadline&lt;/th&gt;
                        &lt;th&gt;Progress&lt;/th&gt;
                        &lt;th&gt;Priority&lt;/th&gt;
                        &lt;th&gt;Leader&lt;/th&gt;
                        &lt;th&gt;Status&lt;/th&gt;
                    &lt;/tr&gt;
                &lt;/thead&gt;
                &lt;tbody&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;a href=&quot;#&quot;&gt;Ebazar&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;12-02-2023&lt;/td&gt;
                        &lt;td&gt;12 days&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot;&gt;
                                &lt;div className=&quot;progress-bar&quot; data-transitiongoal=&quot;95&quot; aria-valuenow=&quot;95&quot; style=&quot;width: 95%;&quot;&gt;95%&lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-warning&quot;&gt;MEDIUM&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar1.jpg&quot; alt=&quot;Avatar&quot; className=&quot;avatar sm rounded me-2&quot;&gt;&lt;a href=&quot;#&quot;&gt;Irene&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;ACTIVE&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;a href=&quot;#&quot;&gt;EShop&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;24-05-2023&lt;/td&gt;
                        &lt;td&gt;30 days&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot;&gt;
                                &lt;div className=&quot;progress-bar&quot; data-transitiongoal=&quot;40&quot; aria-valuenow=&quot;40&quot; style=&quot;width: 40%;&quot;&gt;40%&lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;LOW&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar2.jpg&quot; alt=&quot;Avatar&quot; className=&quot;avatar sm rounded me-2&quot;&gt;&lt;a href=&quot;#&quot;&gt;Jasmine&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-warning&quot;&gt;PENDING&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;a href=&quot;#&quot;&gt;Food Buddy&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;20-09-2023&lt;/td&gt;
                        &lt;td&gt;50 days&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot;&gt;
                                &lt;div className=&quot;progress-bar&quot; data-transitiongoal=&quot;65&quot; aria-valuenow=&quot;65&quot; style=&quot;width: 65%;&quot;&gt;65%&lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-danger&quot;&gt;HIGH&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar3.jpg&quot; alt=&quot;Avatar&quot; className=&quot;avatar sm rounded me-2&quot;&gt;&lt;a href=&quot;#&quot;&gt;Jasmine&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;ACTIVE&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;a href=&quot;#&quot;&gt;Property Pro&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;05-10-2023&lt;/td&gt;
                        &lt;td&gt;40 days&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot;&gt;
                                &lt;div className=&quot;progress-bar&quot; data-transitiongoal=&quot;77&quot; aria-valuenow=&quot;77&quot; style=&quot;width: 77%;&quot;&gt;77%&lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-warning&quot;&gt;MEDIUM&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar4.jpg&quot; alt=&quot;Avatar&quot; className=&quot;avatar sm rounded me-2&quot;&gt;&lt;a href=&quot;#&quot;&gt;Irene&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;ACTIVE&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;a href=&quot;#&quot;&gt;Testroutes&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;15-11-2023&lt;/td&gt;
                        &lt;td&gt;30 days&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot;&gt;
                                &lt;div className=&quot;progress-bar&quot; data-transitiongoal=&quot;25&quot; aria-valuenow=&quot;25&quot; style=&quot;width: 25%;&quot;&gt;25%&lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;LOW&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar5.jpg&quot; alt=&quot;Avatar&quot; className=&quot;avatar sm rounded me-2&quot;&gt;&lt;a href=&quot;#&quot;&gt;Megan&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;ACTIVE&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;&lt;a href=&quot;#&quot;&gt;Property Pro&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;05-10-2023&lt;/td&gt;
                        &lt;td&gt;N/A&lt;/td&gt;
                        &lt;td&gt;
                            &lt;div className=&quot;progress&quot;&gt;
                                &lt;div className=&quot;progress-bar progress-bar-default&quot; data-transitiongoal=&quot;100&quot; aria-valuenow=&quot;100&quot; style=&quot;width: 100%;&quot;&gt;100%&lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-secondary&quot;&gt;MEDIUM&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;img src=&quot;../assets/images/xs/avatar6.jpg&quot; alt=&quot;Avatar&quot; className=&quot;avatar sm rounded me-2&quot;&gt;&lt;a href=&quot;#&quot;&gt;Irene&lt;/a&gt;&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-secondary&quot;&gt;CLOSED&lt;/span&gt;&lt;/td&gt;
                    &lt;/tr&gt;
                &lt;/tbody&gt;
            &lt;/table&gt;</code></pre>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-3">
                        <div className="card-header bg-transparent py-3 border-0">
                            <h6 className="mb-0 card-title">New Admission List</h6>
                            <div className="form-check form-switch table-toggle-four">
                                <input className="form-check-input" type="checkbox" role="switch" id="table-toggle-four"/>
                                <label className="form-check-label" htmlFor="table-toggle-four">Show Code</label>
                            </div>
                        </div>
                        <div className="card-body table-main-four">
                            <table className="myDataTable table table-hover m-b-0" style={{width: "100%"}}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Age</th>
                                        <th>Address</th>
                                        <th>Number</th>
                                        <th>Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>OU 00456</td>
                                        <td>Joseph</td>
                                        <td>25</td>
                                        <td>2861 Geneva Street, New York, 10016</td>
                                        <td>516-503-6013</td>
                                        <td><span className="badge bg-primary"/>MCA</td>
                                    </tr>
                                    <tr>
                                        <td>KU 00789</td>
                                        <td>Cameron</td>
                                        <td>27</td>
                                        <td>3387 Caldwell Road, Rochester,  14620</td>
                                        <td>516-503-4569</td>
                                        <td><span className="badge bg-warning"/>Medical</td>
                                    </tr>
                                    <tr>
                                        <td>KU 00987</td>
                                        <td>Alex</td>
                                        <td>23</td>
                                        <td>3387 Caldwell Road, Rochester,  14620</td>
                                        <td>516-503-7412</td>
                                        <td><span className="badge bg-info"/>M.COM</td>
                                    </tr>
                                    <tr>
                                        <td>OU 00951</td>
                                        <td>James</td>
                                        <td>23</td>
                                        <td>43958 Kuhl Avenue, Smyrna,  64507</td>
                                        <td>516-503-2589</td>
                                        <td><span className="badge bg-dark"/>MBA</td>
                                    </tr>
                                    <tr>
                                        <td>OU 00953</td>
                                        <td>charlie</td>
                                        <td>21</td>
                                        <td>3387 Caldwell Road, Rochester,  14620</td>
                                        <td>516-503-9632</td>
                                        <td><span className="badge bg-success"/>BBA</td>
                                    </tr>
                                    <tr>
                                        <td>KU 00987</td>
                                        <td>Alex</td>
                                        <td>23</td>
                                        <td>3387 Caldwell Road, Rochester,  14620</td>
                                        <td>516-503-7412</td>
                                        <td><span className="badge bg-info"/>M.COM</td>
                                    </tr>
                                    <tr>
                                        <td>OU 00951</td>
                                        <td>James</td>
                                        <td>23</td>
                                        <td>43958 Kuhl Avenue, Smyrna,  64507</td>
                                        <td>516-503-2589</td>
                                        <td><span className="badge bg-dark"/>MBA</td>
                                    </tr>
                                    <tr>
                                        <td>OU 00456</td>
                                        <td>Joseph</td>
                                        <td>25</td>
                                        <td>2861 Geneva Street, New York, 10016</td>
                                        <td>516-503-6013</td>
                                        <td><span className="badge bg-primary"/>MCA</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="table-code">
            <pre className="language-html m-0" data-lang="html"><code className="language-html">&lt;table className=&quot;myDataTable table table-hover m-b-0&quot; style=&quot;width: 100%;&quot;&gt;
                &lt;thead&gt;
                    &lt;tr&gt;
                        &lt;th&gt;ID&lt;/th&gt;
                        &lt;th&gt;Name&lt;/th&gt;
                        &lt;th&gt;Age&lt;/th&gt;
                        &lt;th&gt;Address&lt;/th&gt;
                        &lt;th&gt;Number&lt;/th&gt;
                        &lt;th&gt;Department&lt;/th&gt;
                    &lt;/tr&gt;
                &lt;/thead&gt;
                &lt;tbody&gt;
                    &lt;tr&gt;
                        &lt;td&gt;OU 00456&lt;/td&gt;
                        &lt;td&gt;Joseph&lt;/td&gt;
                        &lt;td&gt;25&lt;/td&gt;
                        &lt;td&gt;2861 Geneva Street, New York, 10016&lt;/td&gt;
                        &lt;td&gt;516-503-6013&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-primary&quot;&gt;MCA&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;KU 00789&lt;/td&gt;
                        &lt;td&gt;Cameron&lt;/td&gt;
                        &lt;td&gt;27&lt;/td&gt;
                        &lt;td&gt;3387 Caldwell Road, Rochester,  14620&lt;/td&gt;
                        &lt;td&gt;516-503-4569&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-warning&quot;&gt;Medical&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;KU 00987&lt;/td&gt;
                        &lt;td&gt;Alex&lt;/td&gt;
                        &lt;td&gt;23&lt;/td&gt;
                        &lt;td&gt;3387 Caldwell Road, Rochester,  14620&lt;/td&gt;
                        &lt;td&gt;516-503-7412&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-info&quot;&gt;M.COM&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;OU 00951&lt;/td&gt;
                        &lt;td&gt;James&lt;/td&gt;
                        &lt;td&gt;23&lt;/td&gt;
                        &lt;td&gt;43958 Kuhl Avenue, Smyrna,  64507&lt;/td&gt;
                        &lt;td&gt;516-503-2589&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-dark&quot;&gt;MBA&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;OU 00953&lt;/td&gt;
                        &lt;td&gt;charlie&lt;/td&gt;
                        &lt;td&gt;21&lt;/td&gt;
                        &lt;td&gt;3387 Caldwell Road, Rochester,  14620&lt;/td&gt;
                        &lt;td&gt;516-503-9632&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-success&quot;&gt;BBA&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;KU 00987&lt;/td&gt;
                        &lt;td&gt;Alex&lt;/td&gt;
                        &lt;td&gt;23&lt;/td&gt;
                        &lt;td&gt;3387 Caldwell Road, Rochester,  14620&lt;/td&gt;
                        &lt;td&gt;516-503-7412&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-info&quot;&gt;M.COM&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;OU 00951&lt;/td&gt;
                        &lt;td&gt;James&lt;/td&gt;
                        &lt;td&gt;23&lt;/td&gt;
                        &lt;td&gt;43958 Kuhl Avenue, Smyrna,  64507&lt;/td&gt;
                        &lt;td&gt;516-503-2589&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-dark&quot;&gt;MBA&lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;OU 00456&lt;/td&gt;
                        &lt;td&gt;Joseph&lt;/td&gt;
                        &lt;td&gt;25&lt;/td&gt;
                        &lt;td&gt;2861 Geneva Street, New York, 10016&lt;/td&gt;
                        &lt;td&gt;516-503-6013&lt;/td&gt;
                        &lt;td&gt;&lt;span className=&quot;badge bg-primary&quot;&gt;MCA&lt;/td&gt;
                    &lt;/tr&gt;
                &lt;/tbody&gt;
            &lt;/table&gt;</code></pre>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-3 bg-transparent p-2">
                        <div className="card-header border-0">
                            <h6 className="mb-0 card-title">Schedule Table</h6>
                            <div className="form-check form-switch table-toggle-five">
                                <input className="form-check-input" type="checkbox" role="switch" id="table-toggle-five"/>
                                <label className="form-check-label" htmlFor="table-toggle-five">Show Code</label>
                            </div>
                        </div>
                        <div className="card-body table-main-five">
                            <ul className="nav nav-tabs tab-card mb-4" role="tablist">
                                <li className="nav-item"><Link className="nav-link active" data-bs-toggle="tab" to="#nav-week1" role="tab">Week 1</Link></li>
                                <li className="nav-item"><Link className="nav-link" data-bs-toggle="tab" to="#nav-week2" role="tab">Week 2</Link></li>
                                <li className="nav-item"><Link className="nav-link" data-bs-toggle="tab" to="#nav-week3" role="tab">Week 3</Link></li>
                                <li className="nav-item"><Link className="nav-link" data-bs-toggle="tab" to="#nav-week4" role="tab">Week 4</Link></li>
                            </ul>
                            <div className="table-data">
                                <table id="myDataTable_no_filter" className="table align-middle table-bordered mb-0 custom-table dataTable m-0 w-100">
                                    <thead>
                                        <tr>                                       
                                            <th>Day</th>
                                            <th>Yoga Guru</th>
                                            <th>Yoga</th>
                                            <th>Session</th>
                                            <th>Student</th>
                                            {/* <th>Action</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Monday</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src={avatar1} className="rounded sm avatar" alt=""/>
                                                    <div className="ms-2 mb-0">Frank Baker</div>
                                                </div>
                                            </td>
                                            <td>Bridge – Bandha Sarvangasana</td>
                                            <td>5</td>
                                            <td>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar3} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar1} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar7} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar9} alt="friend"/> </Link>
                                            </td>
                                            {/* <td>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Video"><i className="fa fa-youtube-play"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Send Video"><i className="fa fa-envelope"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Download"><i className="fa fa-download"></i></button>
                                            </td> */}
                                        </tr>
                                        <tr>
                                            <td>Tuesday</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src={avatar2} className="rounded sm avatar" alt=""/>
                                                    <div className="ms-2 mb-0">Liam Berry</div>
                                                </div>
                                            </td>
                                            <td>Arm Balance – Pincha Mayurasana</td>
                                            <td>11</td>
                                            <td>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar4} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar5} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar6} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar7} alt="friend"/> </Link>
                                            </td>
                                            {/* <td>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Video"><i className="fa fa-youtube-play"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Send Video"><i className="fa fa-envelope"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Download"><i className="fa fa-download"></i></button>
                                            </td> */}
                                        </tr>
                                        <tr>
                                            <td>Wednesday</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src={avatar3} className="rounded sm avatar" alt=""/>
                                                    <div className="ms-2 mb-0">Stephen McLean</div>
                                                </div>
                                            </td>
                                            <td>Triangle – Trikonasana</td>
                                            <td>4</td>
                                            <td>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar8} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar9} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar10} alt="friend"/> </Link>
                                            </td>
                                            {/* <td>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Video"><i className="fa fa-youtube-play"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Send Video"><i className="fa fa-envelope"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Download"><i className="fa fa-download"></i></button>
                                            </td> */}
                                        </tr>
                                        <tr>
                                            <td>Thursday</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src={avatar1} className="rounded sm avatar" alt=""/>
                                                    <div className="ms-2 mb-0">Frank Baker</div>
                                                </div>
                                            </td>
                                            <td>Child Pose – Balasana</td>
                                            <td>6</td>
                                            <td>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar1} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar2} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar3} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar4} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar5} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar6} alt="friend"/> </Link>
                                            </td>
                                            {/* <td>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Video"><i className="fa fa-youtube-play"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Send Video"><i className="fa fa-envelope"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Download"><i className="fa fa-download"></i></button>
                                            </td> */}
                                        </tr>
                                        <tr>
                                            <td>Friday</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src={avatar1} className="rounded sm avatar" alt=""/>
                                                    <div className="ms-2 mb-0">Frank Baker</div>
                                                </div>
                                            </td>
                                            <td>Downward Dog – Adho Mukha Svanasana</td>
                                            <td>2</td>
                                            <td>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar10} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar5} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar2} alt="friend"/> </Link>
                                            </td>
                                            {/* <td>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Video"><i className="fa fa-youtube-play"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Send Video"><i className="fa fa-envelope"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Download"><i className="fa fa-download"></i></button>
                                            </td> */}
                                        </tr>
                                        <tr>
                                            <td>Saturday</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src={avatar8} className="rounded sm avatar" alt=""/>
                                                    <div className="ms-2 mb-0">Gordon Butler</div>
                                                </div>
                                            </td>
                                            <td>King Dancer – Natarajasana</td>
                                            <td>2</td>
                                            <td>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar4} alt="friend"/> </Link>
                                                <Link to="/" title=""><img className="avatar xs rounded" src={avatar9} alt="friend"/> </Link>
                                            </td>
                                            {/* <td>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Video"><i className="fa fa-youtube-play"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Send Video"><i className="fa fa-envelope"></i></button>
                                                <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Download"><i className="fa fa-download"></i></button>
                                            </td> */}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="table-code">
            <pre className="language-html m-0" data-lang="html"><code className="language-html">&lt;ul className=&quot;nav nav-tabs tab-card mb-4&quot; role=&quot;tablist&quot;&gt;
                &lt;li className=&quot;nav-item&quot;&gt;&lt;a className=&quot;nav-link active&quot; data-bs-toggle=&quot;tab&quot; href=&quot;#nav-week1&quot; role=&quot;tab&quot;&gt;Week 1&lt;/a&gt;&lt;/li&gt;
                &lt;li className=&quot;nav-item&quot;&gt;&lt;a className=&quot;nav-link&quot; data-bs-toggle=&quot;tab&quot; href=&quot;#nav-week2&quot; role=&quot;tab&quot;&gt;Week 2&lt;/a&gt;&lt;/li&gt;
                &lt;li className=&quot;nav-item&quot;&gt;&lt;a className=&quot;nav-link&quot; data-bs-toggle=&quot;tab&quot; href=&quot;#nav-week3&quot; role=&quot;tab&quot;&gt;Week 3&lt;/a&gt;&lt;/li&gt;
                &lt;li className=&quot;nav-item&quot;&gt;&lt;a className=&quot;nav-link&quot; data-bs-toggle=&quot;tab&quot; href=&quot;#nav-week4&quot; role=&quot;tab&quot;&gt;Week 4&lt;/a&gt;&lt;/li&gt;
            &lt;/ul&gt;
            &lt;table id=&quot;myDataTable_no_filter&quot; className=&quot;table align-middle table-bordered mb-0 custom-table dataTable m-0 w-100&quot;&gt;
                &lt;thead&gt;
                    &lt;tr&gt;                                       
                        &lt;th&gt;Day&lt;/th&gt;
                        &lt;th&gt;Yoga Guru&lt;/th&gt;
                        &lt;th&gt;Yoga&lt;/th&gt;
                        &lt;th&gt;Session&lt;/th&gt;
                        &lt;th&gt;Student&lt;/th&gt;
                        &lt;th&gt;Action&lt;/th&gt;
                    &lt;/tr&gt;
                &lt;/thead&gt;
                &lt;tbody&gt;
                    &lt;tr&gt;
                        &lt;td&gt;Monday&lt;/td&gt;
                        &lt;td className=&quot;d-flex align-items-center&quot;&gt;
                            &lt;img src=&quot;../assets/images/xs/avatar1.jpg&quot; className=&quot;rounded sm avatar&quot; alt=&quot;&quot;&gt;
                            &lt;div className=&quot;ms-2 mb-0&quot;&gt;Frank Baker&lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;Bridge &ndash; Bandha Sarvangasana&lt;/td&gt;
                        &lt;td&gt;5&lt;/td&gt;
                        &lt;td&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar3.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar1.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar7.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar9.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                        &lt;/td&gt;
                        &lt;td&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Video&quot;&gt;&lt;i className=&quot;fa fa-youtube-play&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Send Video&quot;&gt;&lt;i className=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Download&quot;&gt;&lt;i className=&quot;fa fa-download&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;Tuesday&lt;/td&gt;
                        &lt;td className=&quot;d-flex align-items-center&quot;&gt;
                            &lt;img src=&quot;../assets/images/xs/avatar2.jpg&quot; className=&quot;rounded sm avatar&quot; alt=&quot;&quot;&gt;
                            &lt;div className=&quot;ms-2 mb-0&quot;&gt;Liam Berry&lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;Arm Balance &ndash; Pincha Mayurasana&lt;/td&gt;
                        &lt;td&gt;11&lt;/td&gt;
                        &lt;td&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar4.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar5.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar6.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar7.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                        &lt;/td&gt;
                        &lt;td&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Video&quot;&gt;&lt;i className=&quot;fa fa-youtube-play&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Send Video&quot;&gt;&lt;i className=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Download&quot;&gt;&lt;i className=&quot;fa fa-download&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;Wednesday&lt;/td&gt;
                        &lt;td className=&quot;d-flex align-items-center&quot;&gt;
                            &lt;img src=&quot;../assets/images/xs/avatar3.jpg&quot; className=&quot;rounded sm avatar&quot; alt=&quot;&quot;&gt;
                            &lt;div className=&quot;ms-2 mb-0&quot;&gt;Stephen McLean&lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;Triangle &ndash; Trikonasana&lt;/td&gt;
                        &lt;td&gt;4&lt;/td&gt;
                        &lt;td&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar8.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar9.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar10.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                        &lt;/td&gt;
                        &lt;td&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Video&quot;&gt;&lt;i className=&quot;fa fa-youtube-play&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Send Video&quot;&gt;&lt;i className=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Download&quot;&gt;&lt;i className=&quot;fa fa-download&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;Thursday&lt;/td&gt;
                        &lt;td className=&quot;d-flex align-items-center&quot;&gt;
                            &lt;img src=&quot;../assets/images/xs/avatar1.jpg&quot; className=&quot;rounded sm avatar&quot; alt=&quot;&quot;&gt;
                            &lt;div className=&quot;ms-2 mb-0&quot;&gt;Frank Baker&lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;Child Pose &ndash; Balasana&lt;/td&gt;
                        &lt;td&gt;6&lt;/td&gt;
                        &lt;td&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar1.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar2.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar3.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar4.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar5.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar6.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                        &lt;/td&gt;
                        &lt;td&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Video&quot;&gt;&lt;i className=&quot;fa fa-youtube-play&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Send Video&quot;&gt;&lt;i className=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Download&quot;&gt;&lt;i className=&quot;fa fa-download&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;Friday&lt;/td&gt;
                        &lt;td className=&quot;d-flex align-items-center&quot;&gt;
                            &lt;img src=&quot;../assets/images/xs/avatar1.jpg&quot; className=&quot;rounded sm avatar&quot; alt=&quot;&quot;&gt;
                            &lt;div className=&quot;ms-2 mb-0&quot;&gt;Frank Baker&lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;Downward Dog &ndash; Adho Mukha Svanasana&lt;/td&gt;
                        &lt;td&gt;2&lt;/td&gt;
                        &lt;td&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar10.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar5.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar2.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                        &lt;/td&gt;
                        &lt;td&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Video&quot;&gt;&lt;i className=&quot;fa fa-youtube-play&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Send Video&quot;&gt;&lt;i className=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Download&quot;&gt;&lt;i className=&quot;fa fa-download&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/td&gt;
                    &lt;/tr&gt;
                    &lt;tr&gt;
                        &lt;td&gt;Saturday&lt;/td&gt;
                        &lt;td className=&quot;d-flex align-items-center&quot;&gt;
                            &lt;img src=&quot;../assets/images/xs/avatar8.jpg&quot; className=&quot;rounded sm avatar&quot; alt=&quot;&quot;&gt;
                            &lt;div className=&quot;ms-2 mb-0&quot;&gt;Gordon Butler&lt;/div&gt;
                        &lt;/td&gt;
                        &lt;td&gt;King Dancer &ndash; Natarajasana&lt;/td&gt;
                        &lt;td&gt;2&lt;/td&gt;
                        &lt;td&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar4.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                            &lt;a href=&quot;#&quot; title=&quot;&quot;&gt;&lt;img className=&quot;avatar xs rounded&quot; src=&quot;../assets/images/xs/avatar9.jpg&quot; alt=&quot;friend&quot;&gt; &lt;/a&gt;
                        &lt;/td&gt;
                        &lt;td&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Video&quot;&gt;&lt;i className=&quot;fa fa-youtube-play&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Send Video&quot;&gt;&lt;i className=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                            &lt;button type=&quot;button&quot; className=&quot;btn btn-link btn-sm text-muted&quot; data-bs-toggle=&quot;tooltip&quot; data-bs-placement=&quot;top&quot; title=&quot;Download&quot;&gt;&lt;i className=&quot;fa fa-download&quot;&gt;&lt;/i&gt;&lt;/button&gt;
                        &lt;/td&gt;
                    &lt;/tr&gt;
                &lt;/tbody&gt;
            &lt;/table&gt;</code></pre>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-3 bg-transparent">
                        <div className="card-header border-0">
                            <h6 className="mb-0 card-title">Timetable Table</h6>
                            <div className="form-check form-switch table-toggle-six">
                                <input className="form-check-input" type="checkbox" role="switch" id="table-toggle-six"/>
                                <label className="form-check-label" htmlFor="table-toggle-six">Show Code</label>
                            </div>
                        </div>
                        <div className="card-body table-main-six">
                            <div className="table-data">
                                <ul className="nav nav-tabs tab-card" role="tablist">
                                    <li className="nav-item dropdown">
                                        <Link className="nav-link dropdown-toggle" data-bs-toggle="dropdown" to="/" role="button" aria-expanded="false">Month</Link>
                                        <ul className="dropdown-menu border-0 shadow py-3 px-2">
                                            <li><Link className="dropdown-item py-2 rounded" to="/">Jan 2021</Link></li>
                                            <li><Link className="dropdown-item py-2 rounded" to="/">Feb 2021</Link></li>
                                            <li><Link className="dropdown-item py-2 rounded" to="/">March 2021</Link></li>
                                            <li><Link className="dropdown-item py-2 rounded" to="/">Apr 2021</Link></li>
                                            <li><Link className="dropdown-item py-2 rounded" to="/">May 2021</Link></li>
                                        </ul>
                                    </li>
                                    <li className="nav-item"><Link className="nav-link active" data-bs-toggle="tab" to="#nav-week1" role="tab">Week 1</Link></li>
                                    <li className="nav-item"><Link className="nav-link" data-bs-toggle="tab" to="#nav-week1" role="tab">Week 2</Link></li>
                                    <li className="nav-item"><Link className="nav-link" data-bs-toggle="tab" to="#nav-week1" role="tab">Week 3</Link></li>
                                    <li className="nav-item"><Link className="nav-link" data-bs-toggle="tab" to="#nav-week1" role="tab">Week 4</Link></li>
                                </ul>
                                <div className="table-responsive">
                                    <table className="table align-middle table-bordered mb-0 custom-table text-center">
                                        <thead>
                                            <tr className="bg-light-gray">
                                                <th>Time</th>
                                                <th>Monday</th>
                                                <th>Tuesday</th>
                                                <th>Wednesday</th>
                                                <th>Thursday</th>
                                                <th>Friday</th>
                                                <th>Saturday</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="align-middle">09:00am</td>
                                                <td>
                                                    <span className="badge bg-info text-dark">Dance</span>
                                                    <div className="mt-2">9:00-10:00</div>
                                                    <div className="small text-muted">Stephen McLean</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-warning text-dark">Yoga</span>
                                                    <div className="mt-2">9:00-10:00</div>
                                                    <div className="small text-muted">Marco Sent</div>
                                                </td>

                                                <td>
                                                    <span className="badge bg-danger">Music</span>
                                                    <div className="mt-2">9:00-10:00</div>
                                                    <div className="small text-muted">Stephen McLean</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success">Dance</span>
                                                    <div className="mt-2">9:00-10:00</div>
                                                    <div className="small text-muted">Stephen McLean</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary">Art</span>
                                                    <div className="mt-2">9:00-10:00</div>
                                                    <div className="small text-muted">Dean Otto</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-dark">English</span>
                                                    <div className="mt-2">9:00-10:00</div>
                                                    <div className="small text-muted">James Smith</div>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="align-middle">10:00am</td>
                                                <td>
                                                    <span className="badge bg-danger">Music</span>
                                                    <div className="mt-2">10:00-11:00</div>
                                                    <div className="small text-muted">Stephen McLean</div>
                                                </td>
                                                <td className="bg-light-gray">

                                                </td>
                                                <td>
                                                    <span className="badge bg-primary">Art</span>
                                                    <div className="mt-2">10:00-11:00</div>
                                                    <div className="small text-muted">Dean Otto</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-warning text-dark">Yoga</span>
                                                    <div className="mt-2">10:00-11:00</div>
                                                    <div className="small text-muted">Marco Sent</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-dark">English</span>
                                                    <div className="mt-2">10:00-11:00</div>
                                                    <div className="small text-muted">James Smith</div>
                                                </td>
                                                <td className="bg-light-gray">

                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="align-middle">11:00am</td>
                                                <td>
                                                    <span className="badge bg-light text-dark">Break</span>
                                                    <div className="mt-2">11:00-12:00</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">Break</span>
                                                    <div className="mt-2">11:00-12:00</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">Break</span>
                                                    <div className="mt-2">11:00-12:00</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">Break</span>
                                                    <div className="mt-2">11:00-12:00</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">Break</span>
                                                    <div className="mt-2">11:00-12:00</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">Break</span>
                                                    <div className="mt-2">11:00-12:00</div>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="align-middle">12:00pm</td>
                                                <td className="bg-light-gray">

                                                </td>
                                                <td>
                                                    <span className="badge bg-primary">Art</span>
                                                    <div className="mt-2">12:00-1:00</div>
                                                    <div className="small text-muted">Dean Otto</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success">Dance</span>
                                                    <div className="mt-2">12:00-1:00</div>
                                                    <div className="small text-muted">Stephen McLean</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-danger">Music</span>
                                                    <div className="mt-2">12:00-1:00</div>
                                                    <div className="small text-muted">Stephen McLean</div>
                                                </td>
                                                <td className="bg-light-gray">

                                                </td>
                                                <td>
                                                    <span className="badge bg-warning text-dark">Yoga</span>
                                                    <div className="mt-2">12:00-1:00</div>
                                                    <div className="small text-muted">Marco Sent</div>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="align-middle">01:00pm</td>
                                                <td>
                                                    <span className="badge bg-dark">English</span>
                                                    <div className="mt-2">1:00-2:00</div>
                                                    <div className="small text-muted">James Smith</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-danger">Music</span>
                                                    <div className="mt-2">1:00-2:00</div>
                                                    <div className="small text-muted">Stephen McLean</div>
                                                </td>
                                                <td className="bg-light-gray">

                                                </td>
                                                <td>
                                                    <span className="badge bg-dark">English</span>
                                                    <div className="mt-2">1:00-2:00</div>
                                                    <div className="small text-muted">James Smith</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-warning text-dark">Yoga</span>
                                                    <div className="mt-2">1:00-2:00</div>
                                                    <div className="small text-muted">Marco Sent</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-danger">Music</span>
                                                    <div className="mt-2">1:00-2:00</div>
                                                    <div className="small text-muted">Stephen McLean</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="table-code">
            <pre className="language-html m-0" data-lang="html"><code className="language-html">&lt;ul className=&quot;nav nav-tabs tab-card&quot; role=&quot;tablist&quot;&gt;
                &lt;li className=&quot;nav-item dropdown&quot;&gt;
                    &lt;a className=&quot;nav-link dropdown-toggle&quot; data-bs-toggle=&quot;dropdown&quot; href=&quot;#&quot; role=&quot;button&quot; aria-expanded=&quot;false&quot;&gt;Month&lt;/a&gt;
                    &lt;ul className=&quot;dropdown-menu border-0 shadow py-3 px-2&quot;&gt;
                        &lt;li&gt;&lt;a className=&quot;dropdown-item py-2 rounded&quot; href=&quot;#&quot;&gt;Jan 2021&lt;/a&gt;&lt;/li&gt;
                        &lt;li&gt;&lt;a className=&quot;dropdown-item py-2 rounded&quot; href=&quot;#&quot;&gt;Feb 2021&lt;/a&gt;&lt;/li&gt;
                        &lt;li&gt;&lt;a className=&quot;dropdown-item py-2 rounded&quot; href=&quot;#&quot;&gt;March 2021&lt;/a&gt;&lt;/li&gt;
                        &lt;li&gt;&lt;a className=&quot;dropdown-item py-2 rounded&quot; href=&quot;#&quot;&gt;Apr 2021&lt;/a&gt;&lt;/li&gt;
                        &lt;li&gt;&lt;a className=&quot;dropdown-item py-2 rounded&quot; href=&quot;#&quot;&gt;May 2021&lt;/a&gt;&lt;/li&gt;
                    &lt;/ul&gt;
                &lt;/li&gt;
                &lt;li className=&quot;nav-item&quot;&gt;&lt;a className=&quot;nav-link active&quot; data-bs-toggle=&quot;tab&quot; href=&quot;#nav-week1&quot; role=&quot;tab&quot;&gt;Week 1&lt;/a&gt;&lt;/li&gt;
                &lt;li className=&quot;nav-item&quot;&gt;&lt;a className=&quot;nav-link&quot; data-bs-toggle=&quot;tab&quot; href=&quot;#nav-week1&quot; role=&quot;tab&quot;&gt;Week 2&lt;/a&gt;&lt;/li&gt;
                &lt;li className=&quot;nav-item&quot;&gt;&lt;a className=&quot;nav-link&quot; data-bs-toggle=&quot;tab&quot; href=&quot;#nav-week1&quot; role=&quot;tab&quot;&gt;Week 3&lt;/a&gt;&lt;/li&gt;
                &lt;li className=&quot;nav-item&quot;&gt;&lt;a className=&quot;nav-link&quot; data-bs-toggle=&quot;tab&quot; href=&quot;#nav-week1&quot; role=&quot;tab&quot;&gt;Week 4&lt;/a&gt;&lt;/li&gt;
            &lt;/ul&gt;
            &lt;div className=&quot;table-responsive&quot;&gt;
                &lt;table className=&quot;table align-middle table-bordered mb-0 custom-table text-center&quot;&gt;
                    &lt;thead&gt;
                        &lt;tr className=&quot;bg-light-gray&quot;&gt;
                            &lt;th&gt;Time&lt;/th&gt;
                            &lt;th&gt;Monday&lt;/th&gt;
                            &lt;th&gt;Tuesday&lt;/th&gt;
                            &lt;th&gt;Wednesday&lt;/th&gt;
                            &lt;th&gt;Thursday&lt;/th&gt;
                            &lt;th&gt;Friday&lt;/th&gt;
                            &lt;th&gt;Saturday&lt;/th&gt;
                        &lt;/tr&gt;
                    &lt;/thead&gt;
                    &lt;tbody&gt;
                        &lt;tr&gt;
                            &lt;td className=&quot;align-middle&quot;&gt;09:00am&lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-info text-dark&quot;&gt;Dance&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;9:00-10:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Stephen McLean&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-warning text-dark&quot;&gt;Yoga&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;9:00-10:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Marco Sent&lt;/div&gt;
                            &lt;/td&gt;

                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-danger&quot;&gt;Music&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;9:00-10:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Stephen McLean&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-success&quot;&gt;Dance&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;9:00-10:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Stephen McLean&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-primary&quot;&gt;Art&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;9:00-10:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Dean Otto&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-dark&quot;&gt;English&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;9:00-10:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;James Smith&lt;/div&gt;
                            &lt;/td&gt;
                        &lt;/tr&gt;

                        &lt;tr&gt;
                            &lt;td className=&quot;align-middle&quot;&gt;10:00am&lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-danger&quot;&gt;Music&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;10:00-11:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Stephen McLean&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td className=&quot;bg-light-gray&quot;&gt;

                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-primary&quot;&gt;Art&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;10:00-11:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Dean Otto&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-warning text-dark&quot;&gt;Yoga&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;10:00-11:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Marco Sent&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-dark&quot;&gt;English&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;10:00-11:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;James Smith&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td className=&quot;bg-light-gray&quot;&gt;

                            &lt;/td&gt;
                        &lt;/tr&gt;

                        &lt;tr&gt;
                            &lt;td className=&quot;align-middle&quot;&gt;11:00am&lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-light text-dark&quot;&gt;Break&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;11:00-12:00&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-light text-dark&quot;&gt;Break&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;11:00-12:00&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-light text-dark&quot;&gt;Break&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;11:00-12:00&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-light text-dark&quot;&gt;Break&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;11:00-12:00&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-light text-dark&quot;&gt;Break&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;11:00-12:00&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-light text-dark&quot;&gt;Break&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;11:00-12:00&lt;/div&gt;
                            &lt;/td&gt;
                        &lt;/tr&gt;

                        &lt;tr&gt;
                            &lt;td className=&quot;align-middle&quot;&gt;12:00pm&lt;/td&gt;
                            &lt;td className=&quot;bg-light-gray&quot;&gt;

                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-primary&quot;&gt;Art&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;12:00-1:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Dean Otto&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-success&quot;&gt;Dance&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;12:00-1:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Stephen McLean&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-danger&quot;&gt;Music&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;12:00-1:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Stephen McLean&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td className=&quot;bg-light-gray&quot;&gt;

                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-warning text-dark&quot;&gt;Yoga&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;12:00-1:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Marco Sent&lt;/div&gt;
                            &lt;/td&gt;
                        &lt;/tr&gt;

                        &lt;tr&gt;
                            &lt;td className=&quot;align-middle&quot;&gt;01:00pm&lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-dark&quot;&gt;English&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;1:00-2:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;James Smith&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-danger&quot;&gt;Music&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;1:00-2:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Stephen McLean&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td className=&quot;bg-light-gray&quot;&gt;

                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-dark&quot;&gt;English&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;1:00-2:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;James Smith&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-warning text-dark&quot;&gt;Yoga&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;1:00-2:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Marco Sent&lt;/div&gt;
                            &lt;/td&gt;
                            &lt;td&gt;
                                &lt;span className=&quot;badge bg-danger&quot;&gt;Music&lt;/span&gt;
                                &lt;div className=&quot;mt-2&quot;&gt;1:00-2:00&lt;/div&gt;
                                &lt;div className=&quot;small text-muted&quot;&gt;Stephen McLean&lt;/div&gt;
                            &lt;/td&gt;
                        &lt;/tr&gt;
                    &lt;/tbody&gt;
                &lt;/table&gt;
            &lt;/div&gt;</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Tables