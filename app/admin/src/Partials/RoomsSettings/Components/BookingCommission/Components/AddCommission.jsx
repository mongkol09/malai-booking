import React from 'react'

const AddCommission = () => {
  return (
    <div className="modal fade" id="add-commission" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Add Commission</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Booking Type <span className="text-danger">*</span></label>
                            <select className="form-select">
                                <option defaultValue='selected'>Wedding</option>
                                <option value="1">Groups</option>
                                <option value="2">Allocation</option>
                                <option value="3">Business Seminar</option>
                                <option value="4">Instant</option>
                                <option value="6">Advance</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Booking Source</label>
                            <input type="text" className="form-control"  placeholder="Booking Source Name"/>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-muted">Commission Rate</label>
                            <input type="text" className="form-control"  placeholder="Commission Rate"/>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                </div>
            </div>
		</div>
	</div>
  )
}

export default AddCommission