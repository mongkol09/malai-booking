import React from 'react'
import EditServices from './Components/EditServices'

const AllSettings = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Personalised Settings</h3>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card mb-3">
                    <div className="card-header">
                        <h6 className="card-title">Personalised Service Add</h6>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label text-muted">Service Name</label>
                                        <input type="text" className="form-control"  placeholder="Add Service Name"/>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label text-muted">Service Time Slot</label>
                                        <div className="input-group">
                                            <input type="time" className="form-control"/>
                                            <input type="time" className="form-control"/>
                                            <button className="btn btn-outline-secondary" type="button"><svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label text-muted">Category One</label>
                                        <input type="text" className="form-control" placeholder="Add Category"/>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label text-muted">Category Two</label>
                                        <input type="text" className="form-control" placeholder="Add Category"/>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label text-muted">Category Three</label>
                                        <input type="text" className="form-control" placeholder="Add Category"/>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label text-muted d-block">Add New</label>
                                        <button type="button" className="btn btn-primary">Add Category</button>
                                    </div>
                                </div>
                                <div className="col-lg-12 text-end">
                                    <button type="button" className="btn btn-primary">Apply</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="card mb-3">
                    <div className="card-header">
                        <h6 className="card-title">List Personalised Service</h6>
                    </div>
                    <div className="card-body">
                        <table className="table dataTable align-middle table-hover table-body" style={{width: "100%"}}>
                            <thead>
                                <tr>
                                    <th>Service Id</th>
                                    <th>Service Name</th>
                                    <th>Category</th>
                                    <th>Time Slot</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
									<tr className="odd">
											<td className="dtr-control sorting_1" tabIndex="0">02</td>
											<td>Swimming Pool</td>
											<td>
												<div className="p-1 border">
													Swimming Lessons
												</div>
												<div className="p-1 border">
													Water Aerobics
												</div>
												<div className="p-1 border">
													Competitive Swimming
												</div>
											</td>
											<td>
												<div className="p-1 border">
													10 to 12
												</div>
												<div className="p-1 border">
													12 to 02
												</div>
												<div className="p-1 border">
													04 to 06
												</div>
											</td>
											<td>
												<button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-service"><i className="bi bi-pencil-square"></i></button>
												<button type="button" className="btn deleterow"><i className="bi bi-trash text-danger"></i></button>
											</td>
										</tr><tr className="even">
											<td className="dtr-control sorting_1" tabIndex="0">03</td>
											<td>Spa</td>
											<td>
												<div className="p-1 border">
													Massage Therapy
												</div>
												<div className="p-1 border">
													Facial Treatments
												</div>
												<div className="p-1 border">
													Aromatherapy
												</div>
											</td>
											<td>
												<div className="p-1 border">
													10 to 12
												</div>
												<div className="p-1 border">
													12 to 02
												</div>
												<div className="p-1 border">
													04 to 06
												</div>
											</td>
											<td>
												<button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-service"><i className="bi bi-pencil-square"></i></button>
												<button type="button" className="btn deleterow"><i className="bi bi-trash text-danger"></i></button>
											</td>
										</tr><tr className="odd">
											<td className="dtr-control sorting_1" tabIndex="0">04</td>
											<td>Pedicure</td>
											<td>
												<div className="p-1 border">
													Classic Pedicures
												</div>
												<div className="p-1 border">
													Gel Pedicures
												</div>
												<div className="p-1 border">
													French Pedicures
												</div>
											</td>
											<td>
												<div className="p-1 border">
													10 to 12
												</div>
												<div className="p-1 border">
													12 to 02
												</div>
												<div className="p-1 border">
													04 to 06
												</div>
											</td>
											<td>
												<button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-service"><i className="bi bi-pencil-square"></i></button>
												<button type="button" className="btn deleterow"><i className="bi bi-trash text-danger"></i></button>
											</td>
										</tr><tr className="even">
											<td className="dtr-control sorting_1" tabIndex="0">05</td>
											<td>Theater</td>
											<td>
												<div className="p-1 border">
													Movie
												</div>
												<div className="p-1 border">
													Match
												</div>
												<div className="p-1 border">
													Auction
												</div>
											</td>
											<td>
												<div className="p-1 border">
													10 to 01
												</div>
												<div className="p-1 border">
													02 to 05
												</div>
												<div className="p-1 border">
													06 to 09 
												</div>
											</td>
											<td>
												<button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-service"><i className="bi bi-pencil-square"></i></button>
												<button type="button" className="btn deleterow"><i className="bi bi-trash text-danger"></i></button>
											</td>
										</tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <EditServices/>
    </div>
  )
}

export default AllSettings