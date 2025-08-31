import React from 'react'

const EditCategory = () => {
  return (
    <div className="modal fade" id="edit-items" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Category</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group">
                            <label className="form-label text-muted">Category Name</label>
                            <input type="text" className="form-control"  defaultValue="House Keeping" />
                        </div>
                        <div className="btn-group mt-3" role="group" aria-label="Basic radio toggle button group">
                            <input type="radio" className="btn-check" name="btnradio" id="btnradio1" defaultChecked/>
                            <label className="btn btn-outline-primary" htmlFor="btnradio1">Active</label>
                        
                            <input type="radio" className="btn-check" name="btnradio" id="btnradio2"/>
                            <label className="btn btn-outline-primary" htmlFor="btnradio2">In Active</label>
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

export default EditCategory