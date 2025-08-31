import React from 'react'

const EditRoomImages = () => {
  return (
    <div className="modal fade" id="edit-image" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Edit Room Image</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Room Type</label>
                            <select className="form-select" defaultValue="">
                                <option value="">VIP-Guest</option>
                                <option value="1">VIP</option>
                                <option value="2">Triple Room</option>
                                <option value="3">Single Room</option>
                                <option value="4">Twin Room</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-muted">Room Images</label>
                            <input type="file" className="form-control"/>
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

export default EditRoomImages