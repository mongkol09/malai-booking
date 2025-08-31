import React from 'react'

const AddAssign = () => {
  return (
    <div className="modal fade" id="add-roster" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Assigned Employee</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Emp Name</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Emp Name</option>
                                <option value="1">Jony Morg</option>
                                <option value="2">Alka Murty</option>
                                <option value="3">Tommy Leo</option>
                                <option value="4">Panda Prty</option>
                                <option value="5">Aky Reo</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Shift</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Shift</option>
                                <option value="1">Morning Shift</option>
                                <option value="2">Night Shift</option>
                            </select>
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

export default AddAssign