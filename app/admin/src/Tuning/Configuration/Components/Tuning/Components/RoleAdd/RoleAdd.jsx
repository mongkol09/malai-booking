import React from 'react'

const RoleAdd = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Role Add</h3>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">First Name</label>
                                    <input type="text" className="form-control" placeholder="Add First Name"/>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Last Name</label>
                                    <input type="text" className="form-control" placeholder="Add Last Name"/>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Email</label>
                                    <input type="email" className="form-control" placeholder="Add Email"/>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Password</label>
                                    <input type="Password" className="form-control" placeholder="Add Password"/>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="form-label text-muted">About</label>
                                    <textarea className="form-control" rows="9"></textarea>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <input type="file" className="form-control"/>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                                    <input type="radio" className="btn-check" name="btnradio" id="btnradio1" defaultChecked/>
                                    <label className="btn btn-outline-primary" htmlFor="btnradio1">Active</label>
                                
                                    <input type="radio" className="btn-check" name="btnradio" id="btnradio2"/>
                                    <label className="btn btn-outline-primary" htmlFor="btnradio2">In Active</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default RoleAdd