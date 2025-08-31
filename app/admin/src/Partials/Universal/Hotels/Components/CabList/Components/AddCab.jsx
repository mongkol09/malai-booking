import React from 'react'

const AddCab = () => {
  return (
    <div className="modal fade" id="add-items" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Add Cab</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Car</label>
                            <input type="text" className="form-control"  placeholder="Add Car"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Car Number</label>
                            <input type="text" className="form-control"  placeholder="Add Car Number"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Car Type</label>
                            <input type="text" className="form-control"  placeholder="Add Car Type"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Fuel Type</label>
                            <input type="text" className="form-control"  placeholder="Add Fuel Type"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Seat Capacity</label>
                            <input type="number" className="form-control"  placeholder="Seat Capacity"/>
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

export default AddCab