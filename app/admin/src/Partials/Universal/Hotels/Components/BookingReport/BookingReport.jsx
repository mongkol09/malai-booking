import React from 'react'
import BookingReportTable from './Components/BookingReportTable'

const BookingReport = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Booking Reports</h3>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Search Reports Here</h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">From <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-calendar-plus"></i></span>
                                        <input type="date" className="form-control"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">To<span className="text-danger"> *</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-calendar-minus"></i></span>
                                        <input type="date" name="datefilter" className="form-control"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Booking Status</label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-house"></i></span>
                                        <select className="form-select">
                                            <option defaultValue='selected'>Find Booking Status</option>
                                            <option value="1">Pendding</option>
                                            <option value="2">Cancle</option>
                                            <option value="3">Check In</option>
                                            <option value="4">Check Out</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Payment Status</label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-cash"></i></span>
                                        <select className="form-select">
                                            <option defaultValue='selected'>Find Payment Status</option>
                                            <option value="1">Pendding</option>
                                            <option value="2">Cancle</option>
                                            <option value="3">Complete</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12 text-end">
                                <button type="button" className="btn btn-primary py-2 px-5">Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <BookingReportTable/>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default BookingReport