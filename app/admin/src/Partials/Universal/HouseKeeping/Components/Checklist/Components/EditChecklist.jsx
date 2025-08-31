import React from 'react'

const EditChecklist = () => {
  return (
    <div className="modal fade" id="edit-checklist" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Checklist</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Task Name</label>
                            <input type="text" className="form-control"  defaultValue="Washing"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Type</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Laundry</option>
                                <option value="1">Laundry</option>
                                <option value="2">House Keeper</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary">Update changes</button>
                </div>
            </div>
		</div>
	</div>
  )
}

export default EditChecklist