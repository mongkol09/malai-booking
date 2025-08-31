import React from 'react'

const EditFacilites = () => {
  return (
    <div className="modal fade" id="edit-facilites" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Facility</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Add Facility Type <span className="text-danger">*</span></label>
                            <select className="form-select">
                                <option defaultValue='selected'>Aroma</option>
                                <option value="1">Cleanliness</option>
                                <option value="2">Internet</option>
                                <option value="3">Cozy beds</option>
                                <option value="4">Lighting</option>
                                <option value="6">Delicious Food</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Facility Name</label>
                            <input type="text" className="form-control"  defaultValue="Cairo Tate"/>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-muted">Facility Image</label>
                            <input type="file" className="form-control"/>
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

export default EditFacilites