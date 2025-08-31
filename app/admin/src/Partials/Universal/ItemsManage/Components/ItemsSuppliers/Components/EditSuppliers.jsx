import React from 'react'

const EditSuppliers = () => {
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
					<div className="form-group mb-3">
						<label className="form-label text-muted">Suppliers Name</label>
						<input type="text" className="form-control"  defaultValue="jemy" />
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Email</label>
						<input type="email" className="form-control"  defaultValue="jemy@gmail.com" />
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Number</label>
						<input type="text" className="form-control"  defaultValue="(555) 123-4567" />
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Address</label>
						<input type="text" className="form-control"  defaultValue="Sydney New South Wales 2000 Australia" />
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

export default EditSuppliers