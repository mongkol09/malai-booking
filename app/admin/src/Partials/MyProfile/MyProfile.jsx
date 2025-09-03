import React from 'react'
import profileImage from '../../assets/images/profile_av.png';
import { Link } from 'react-router-dom';

const MyProfile = () => {
  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            <div className="card border-0">
                <div className="card-header bg-card pb-3">
                    <h6 className="card-title mb-0">My Profile</h6>
                    <div className="d-flex align-items-md-start align-items-center flex-column flex-md-row mt-4 w-100">
                        <img src={profileImage} alt="" className="rounded-4"/>
                        <div className="media-body ms-md-5 m-0 mt-4 mt-md-0 text-md-start text-center">
                            <h4 className="mb-1">Anny glover</h4>
                            <p>anny-glover@malai.com</p>
                            <span className="text-muted">Exploring a chic and contemporary admin template for your upcoming project? Discover our latest Bootstrap admin template! 🚀</span>
                            <div className="my-3">
                                <button className="btn btn-primary me-1">Follow</button>
                                <button className="btn btn-dark">Message</button>
                            </div>
                            <div className="d-flex flex-row flex-wrap align-items-center justify-content-center justify-content-md-start">
                                <div className="bg-body rounded-2 py-2 px-3 me-1 mt-1">
                                    <small className="text-muted">City</small>
                                    <div className="fs-5">New york</div>
                                </div>
                                <div className="bg-body rounded-2 py-2 px-3 me-1 mt-1">
                                    <small className="text-muted">Awards</small>
                                    <div className="fs-5">13</div>
                                </div>
                                <div className="bg-body rounded-2 py-2 px-3 me-1 mt-1">
                                    <small className="text-muted">Experience</small>
                                    <div className="fs-5">10+</div>
                                </div>
                                <div className="bg-body rounded-2 py-2 px-3 me-1 mt-1">
                                    <small className="text-muted">Total Earnings</small>
                                    <div className="fs-5">$8,705</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-body border-top">
                    <div className="row g-4">
                        <div className="col-xl-4 col-lg-5">
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="card-title mb-3">Skills Information</h6>
                                    <p className="text-muted">Fusce tincidunt, eros eget efficitur volutpat, libero dolor dapibus quam, nec pulvinar magna est vel ligula <Link to="/">Read more</Link></p>
                                    <div className="d-flex justify-content-between">
                                        <small className="text-uppercase">Managment:</small>
                                        <small className="text-muted">95</small>
                                    </div>
                                    <div className="progress mt-1 mb-3" style={{height: "2px"}}>
                                        <div className="progress-bar bg-primary" role="progressbar" aria-valuenow="95" aria-valuemin="0" aria-valuemax="100" style={{width: "95%"}}></div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <small className="text-uppercase">Account:</small>
                                        <small className="text-muted">77</small>
                                    </div>
                                    <div className="progress mt-1 mb-3" style={{height: "2px"}}>
                                        <div className="progress-bar bg-primary" role="progressbar" aria-valuenow="77" aria-valuemin="0" aria-valuemax="100" style={{width: "77%"}}></div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <small className="text-uppercase">Organizer:</small>
                                        <small className="text-muted">66</small>
                                    </div>
                                    <div className="progress mt-1 mb-3" style={{height: "2px"}}>
                                        <div className="progress-bar bg-primary" role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100" style={{width: "66%"}}></div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <small className="text-uppercase">Cook:</small>
                                        <small className="text-muted">80</small>
                                    </div>
                                    <div className="progress mt-1 mb-3" style={{height: "2px"}}>
                                        <div className="progress-bar bg-primary" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style={{width: "80%"}}></div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <small className="text-uppercase">Swimming:</small>
                                        <small className="text-muted">85</small>
                                    </div>
                                    <div className="progress mt-1 mb-0" style={{height: "2px"}}>
                                        <div className="progress-bar bg-primary" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" style={{width: "85%"}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-8 col-lg-7">
                            <h4 className="card-title mb-0">Edit Profile</h4>
                            <div className="row g-3 my-3">
                                <div className="col-md-5">
                                    <label className="form-label small text-muted">Company</label>
                                    <input type="text" className="form-control" disabled placeholder="Company" defaultValue="malai"/>
                                </div>
                                <div className="col-sm-6 col-md-3">
                                    <label className="form-label small text-muted">Username</label>
                                    <input type="text" className="form-control" placeholder="Username" defaultValue="Michelle1212"/>
                                </div>
                                <div className="col-sm-6 col-md-4">
                                    <label className="form-label small text-muted">Email address</label>
                                    <input type="email" className="form-control" placeholder="Email"/>
                                </div>
                                <div className="col-sm-6 col-md-6">
                                    <label className="form-label small text-muted">First Name</label>
                                    <input type="text" className="form-control" placeholder="Company" defaultValue="Jane"/>
                                </div>
                                <div className="col-sm-6 col-md-6">
                                    <label className="form-label small text-muted">Last Name</label>
                                    <input type="text" className="form-control" placeholder="Last Name" defaultValue="Pearson"/>
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small text-muted">Address</label>
                                    <input type="text" className="form-control" placeholder="Home Address" defaultValue="455 S. Airport St. Moncks Corner"/>
                                </div>
                                <div className="col-sm-6 col-md-4">
                                    <label className="form-label small text-muted">City</label>
                                    <input type="text" className="form-control" placeholder="City" defaultValue="New York"/>
                                </div>
                                <div className="col-sm-6 col-md-3">
                                    <label className="form-label small text-muted">Postal Code</label>
                                    <input type="number" className="form-control" placeholder="ZIP Code"/>
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label small text-muted">Country</label>
                                    <select className="form-control custom-select">
                                        <option value="">USA</option>
                                    </select>
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small text-muted">About Me</label>
                                    <textarea rows="5" className="form-control" placeholder="Here can be your description" defaultValue="Oh so, your weak rhyme You doubt I'll bother, reading into it I'll probably won't, left to my own devices But that's the difference in our opinions."></textarea>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Update Profile</button>
                        </div>
                    </div> 
                </div>
            </div>
        </div>
    )
}

export default MyProfile