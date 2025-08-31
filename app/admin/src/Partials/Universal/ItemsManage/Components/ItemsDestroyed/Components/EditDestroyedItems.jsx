import React from 'react'

const EditDestroyedItems = () => {
  return (
    <div className="modal fade" id="edit-items" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
		<div className="modal-content">
			<div className="modal-header">
				<h1 className="modal-title fs-5">Edit Items</h1>
				<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div className="modal-body">
				<form>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Item Name</label>
						<input type="text" className="form-control" defaultValue="Bed Cover"/> 
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Category Name</label>
						<select className="form-select" defaultValue="">
							<option value="">House Keeping</option>
							<option value="1">House Keeping</option>
							<option value="2">Food Items</option>
							<option value="3">Facility</option>
						</select>
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Destroyed Quantity</label>
						<input type="text" className="form-control" defaultValue="4"/> 
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Comment</label>
						<textarea className="form-control" defaultValue="Dark Spot Not Remove"/>
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

export default EditDestroyedItems	