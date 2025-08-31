import React from 'react'

const EditCab = () => {
  return (
    <div className="modal fade" id="edit-items" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Cab</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Car</label>
                            <input type="text" className="form-control"  defaultValue="Innova"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Car Number</label>
                            <input type="text" className="form-control"  defaultValue="AB-GB-0158"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Car Type</label>
                            <input type="text" className="form-control"  defaultValue="MPV"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Fuel Type</label>
                            <input type="text" className="form-control"  defaultValue="Disel"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Seat Capacity</label>
                            <input type="number" className="form-control"  defaultValue="8"/>
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

export default EditCab