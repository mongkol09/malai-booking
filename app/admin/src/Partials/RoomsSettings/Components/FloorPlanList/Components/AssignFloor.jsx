import React from 'react'

const AssignFloor = () => {
  return (
    <div className="modal fade" id="assign-floor" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Assign Floor</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Floor Select <span className="text-danger">*</span></label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Floor</option>
                                <option value="1">First Floor</option>
                                <option value="2">Second Floor</option>
                                <option value="3">Third Floor</option>
                                <option value="4">Four Floor</option>
                                <option value="6">Fifth Floor</option>
                                <option value="7">Six Floor</option>
                                <option value="8">Fouteenth Floor</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Start Room Number</label>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-muted">Number Of Rooms</label>
                            <input type="text" className="form-control"  placeholder="Number Of Rooms"/>
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

export default AssignFloor