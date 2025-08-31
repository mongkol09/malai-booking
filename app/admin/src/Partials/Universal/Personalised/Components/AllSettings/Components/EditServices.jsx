import React from 'react'

const EditServices = () => {
  return (
    <div className="modal fade" id="edit-service" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Service</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Service Name</label>
                            <input type="text" className="form-control" defaultValue="Jacuzzi"/>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-muted">Service Time Slot</label>
                            <div className="input-group">
                                <input type="time" className="form-control" defaultValue="10:00"/>
                                <input type="time" className="form-control" defaultValue="12:00"/>
                                <button className="btn btn-outline-secondary" type="button"><svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg></button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-muted">Service Time Slot</label>
                            <div className="input-group">
                                <input type="time" className="form-control" defaultValue="12:00"/>
                                <input type="time" className="form-control" defaultValue="02:00"/>
                                <button className="btn btn-outline-secondary" type="button"><svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg></button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-muted">Service Time Slot</label>
                            <div className="input-group">
                                <input type="time" className="form-control" defaultValue="04:00"/>
                                <input type="time" className="form-control" defaultValue="06:00"/>
                                <button className="btn btn-outline-secondary" type="button"><svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg></button>
                            </div>
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

export default EditServices