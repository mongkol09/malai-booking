import React from 'react'

const EditShift = () => {
  return (
    <div className="modal fade" id="edit-shift" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Shift</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Shift Name</label>
                            <input type="text" className="form-control"  defaultValue="Morning Shift"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Shift Start</label>
                            <input type="text" className="form-control"  defaultValue="00:00"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Shift End</label>
                            <input type="text" className="form-control" defaultValue="12:00"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Shift Hour</label>
                            <input type="text" className="form-control"  defaultValue="12:00"/>
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

export default EditShift