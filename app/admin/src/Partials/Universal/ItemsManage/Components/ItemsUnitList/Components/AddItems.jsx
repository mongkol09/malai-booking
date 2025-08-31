import React from 'react'

const AddItems = () => {
  return (
    <div className="modal fade" id="add-items" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Add Items Unit</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Item Name</label>
                            <input type="text" className="form-control"  placeholder="Add Item Name"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Short Name</label>
                            <input type="text" className="form-control"  placeholder="Add Short Name"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Status Type</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Status</option>
                                <option value="1">Active</option>
                                <option value="2">In Active</option>
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

export default AddItems