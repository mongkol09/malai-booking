import React from 'react'

const EditKeeping = () => {
  return (
    <div className="modal fade" id="edit-kipping" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Room Cleaning</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Room No</label>
                            <input type="text" className="form-control"  defaultValue="103"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Assign To</label>
                            <input type="text" className="form-control"  defaultValue="Jone"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Date </label>
                            <input type="Date" className="form-control"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Status</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Under Process</option>
                                <option value="1">Ready</option>
                                <option value="2">Under Process</option>
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

export default EditKeeping