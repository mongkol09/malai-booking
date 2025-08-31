import React from 'react'

const AddItems = () => {
  return (
    <div className="modal fade" id="add-items" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Add Items</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                <form>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Unit Name</label>
						<select className="form-select">
							<option value="1">Kilogram</option>
							<option value="2">Liter</option>
							<option value="3">Milligram</option>
							<option value="4">Tonne</option>
							<option value="5">Gram</option>
							<option value="6">Per Pieces</option>
							<option value="7">Per Cup</option>
							<option value="8">Pound</option>
						</select>
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Category Name</label>
						<select className="form-select">
							<option value="1">House Keeping</option>
							<option value="2">Food Items</option>
							<option value="3">Facility</option>
						</select>
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Item Name</label>
						<input type="text" className="form-control" placeholder="Add Item Name"/>
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Total Item</label>
						<input type="text" className="form-control" placeholder="Total Item"/>
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Item Used</label>
						<input type="text" className="form-control" placeholder="Item Used"/>
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Laundry Item</label>
						<select className="form-select">
							<option value="1">Yes</option>
							<option value="2">No</option>
						</select>
					</div>
					<div className="form-group mb-3">
						<label className="form-label text-muted">Status Type</label>
						<select className="form-select">
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