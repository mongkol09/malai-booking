import React from 'react'

const AddChecklist = () => {
  return (
    <div className="modal fade" id="add-checklist" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Add Checklist</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Task Name</label>
                            <input type="text" className="form-control"  placeholder="Add Task Name"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Type</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Select Type</option>
                                <option value="1">Laundry</option>
                                <option value="2">House Keeper</option>
                            </select>
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

export default AddChecklist