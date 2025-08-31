import React from 'react'

const CommonSettings = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row mb-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Common Settings</h3>
                </div>
            </div>
        </div>
        <div className="card border-0 mb-3">
            <div className="card-header">
                <h6 className="card-title mb-0">Filled Hotel Settings</h6>
            </div>
            <div className="card-body pt-0">
                <form>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="col-form-label">Site Logo</label>
                            <input type="file" className="form-control"/>
                        </div>
                        <div className="col-md-6">
                            <label className="col-form-label">Site Favicon</label>
                            <input type="file" className="form-control"/>
                        </div>
                        <div className="col-md-6">
                            <label className="col-form-label">Site Title</label>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="col-md-6">
                            <label className="col-form-label">Support Email</label>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="col-md-6">
                            <label className="col-form-label">Support Number</label>
                            <input type="number" className="form-control"/>
                        </div>
                        <div className="col-md-12">
                            <label className="col-form-label">Address</label>
                            <textarea  className="form-control" rows="4"></textarea >
                        </div>
                        <div className="col-md-6">
                            <label className="col-form-label">Short Description</label>
                            <textarea  className="form-control" rows="4"></textarea >
                        </div>
                        <div className="col-md-6">
                            <label className="col-form-label">Copyright Details</label>
                            <textarea  className="form-control" rows="4"></textarea >
                        </div>
                        <div className="col-md-6">
                            <label className="col-form-label">Map Iframe</label>
                            <textarea  className="form-control" rows="4"></textarea >
                        </div>
                        <div className="col-md-6">
                            <label className="col-form-label">Meta Keywords</label>
                            <textarea  className="form-control" rows="4"></textarea >
                        </div>
                        <div className="col-md-12">
                            <label className="col-form-label">Meta Description</label>
                            <textarea  className="form-control" rows="3"></textarea >
                        </div>
                        <div className="col-md-12">
                            <button type="reset" className="btn btn-warning mt-2 me-1">Reset</button>
                            <button type="submit" className="btn btn-primary mt-2">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}

export default CommonSettings