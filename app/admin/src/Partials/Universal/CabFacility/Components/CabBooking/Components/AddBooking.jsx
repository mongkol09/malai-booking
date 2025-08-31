import React from 'react'

const AddBooking = () => {
  return (
    <div className="modal fade" id="add-booking" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Add Cab Booking</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Car</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Car</option>
                                <option value="1">Innova</option>
                                <option value="2">XUV 700</option>
                                <option value="3">Maruti 800</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Customer Name</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Name</option>
                                <option value="1">Jemmy</option>
                                <option value="2">Max</option>
                                <option value="3">Eden</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Cab Number</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Cab Number</option>
                                <option value="1">AB-GB-0158</option>
                                <option value="2">AB-GB-1158</option>
                                <option value="3">AB-GB-1111</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Driver</label>
                            <input type="text" className="form-control"  placeholder="Driver Name"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Transportation Type</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Cab Number</option>
                                <option value="1">Pick Up</option>
                                <option value="2">Drop</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Transportation Time</label>
                            <input type="time" className="form-control"/>
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

export default AddBooking