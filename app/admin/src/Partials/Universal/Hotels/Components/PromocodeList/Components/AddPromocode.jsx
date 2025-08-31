import React from 'react'

const AddPromocode = () => {
  return (
    <div className="modal fade" id="add-promocode" tabIndex="-1"  aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">Add Promocode List</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Room Type</label>
                            <select className="form-select">
                                <option defaultValue='selected'>Choose Room Type</option>
                                <option value="1">Singal</option>
                                <option value="2">Double</option>
                                <option value="3">Tripal</option>
                                <option value="4">Quad</option>
                                <option value="6">Queen</option>
                                <option value="7">King</option>
                                <option value="8">Others</option>
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">From</label>
                            <input type="date" className="form-control"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">To</label>
                            <input type="date" className="form-control"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Discount</label>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label text-muted">Promocode</label>
                            <input type="text" className="form-control"/>
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

export default AddPromocode