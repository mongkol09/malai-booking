import React from 'react'

const RoleAssign = () => {
  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            <div className="row g-3">
                <div className="col-sm-12">
                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <h3 className="fw-bold mb-0">Role Assign</h3>
                    </div>
                </div>
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label text-muted">User Name <span className="text-danger">*</span></label>
                                        <select className="form-control">
                                            <option>Jone Pit</option>
                                            <option>Jenny Dillow</option>
                                            <option>Depo Pillo</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label text-muted me-1">Role *</label>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="checkbox" id="inlineCheckbox1" defaultValue="option1" />
                                        <label className="form-check-label" htmlFor="inlineCheckbox1">Booking</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="checkbox" id="inlineCheckbox2" defaultValue="option2" />
                                        <label className="form-check-label" htmlFor="inlineCheckbox2">Moderator</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="checkbox" id="inlineCheckbox3" defaultValue="option3" />
                                        <label className="form-check-label" htmlFor="inlineCheckbox3">Manager</label>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-primary">Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-12">
						<div className="card">
							<div className="card-header">
								<h6 className="card-title mb-0">Default Settings Permission</h6>
							</div>
							<div className="card-body">
								<div className="table-responsive">
									<table className="table table-striped custom-table mb-0">
										<thead>
											<tr>
												<th>Comman Permission</th>
												<th className="text-center">Read</th>
												<th className="text-center">Write</th>
												<th className="text-center">Create</th>
												<th className="text-center">Delete</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td className="fw-bold">Password Set</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
											</tr>
											<tr>
												<td className="fw-bold">Commission List</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
											</tr>
											<tr>
												<td className="fw-bold">Booking List</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
											</tr>
											<tr>
												<td className="fw-bold">Room Status</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
											</tr>
											<tr>
												<td className="fw-bold">Transaction Dashboard</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
											</tr>
											<tr>
												<td className="fw-bold">Transaction Dashboard</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
											</tr>
											<tr>
												<td className="fw-bold">Cab Booking</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
												<td className="text-center">
													<input className="form-check-input" type="checkbox" value=""/>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<div className="col-md-12 mt-3 text-end">
									<button type="button" className="btn btn-primary">Save</button>
								</div>
							</div>
						</div>
					</div>
            </div>
        </div>
    )
}

export default RoleAssign