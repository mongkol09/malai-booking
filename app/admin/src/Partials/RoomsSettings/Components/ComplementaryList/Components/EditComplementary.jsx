import React from 'react'

const EditComplementary = () => {
  return (
    <div className="modal fade" id="edit-complementary" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Complementary</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Room Type <span className="text-danger">*</span></label>
                            <select className="form-select" defaultValue="">
                                <option value="">Family Room</option>
                                <option value="1">Standard Room</option>
                                <option value="2">Singal</option>
                                <option value="3">Studio</option>
                                <option value="4">Queen</option>
                                <option value="6">King</option>
                                <option value="7">Cabana</option>
                                <option value="8">Connecting</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Complementary</label>
                            <input type="text" className="form-control" defaultValue="Online"/>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-muted">Commission Rate</label>
                            <input type="text" className="form-control"  defaultValue="5%"/>
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

export default EditComplementary