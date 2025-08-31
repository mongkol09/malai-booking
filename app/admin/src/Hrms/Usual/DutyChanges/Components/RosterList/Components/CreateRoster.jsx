import React from 'react'

const CreateRoster = () => {
  return (
    <div className="modal fade" id="add-roster" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Create Roster</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Shift Name</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Shift</option>
                                <option value="1">Morning Shift</option>
                                <option value="2">Night Shift</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Roster Start Date</label>
                            <input type="date" className="form-control" />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Roster End Date</label>
                            <input type="date" className="form-control" />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Roster days</label>
                            <input type="text" className="form-control"/>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Add</button>
                </div>
            </div>
		</div>
	</div>
  )
}

export default CreateRoster