import React from 'react'
import { houseKeepingData } from './Components/HouseKeepingData'

const HouseKeepingAssignRoom = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Assign House Keeping</h3>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4 col-lg-4">
                                <label className="form-label">House Keeper</label>
                                <select className="form-select">
                                    <option defaultValue='selected'>Choose...</option>
                                    <option>...</option>
                                </select>
                            </div>
                            <div className="col-md-4 col-lg-4">
                                <label className="form-label">Room Type</label>
                                <select className="form-select">
                                    <option defaultValue='selected'>Choose...</option>
                                    <option>Twin Room</option>
                                    <option>Single Room</option>
                                    <option>Triple Room</option>
                                </select>
                            </div>
                            <div className="col-md-4 col-lg-4">
                                <label className="form-label">Status</label>
                                <select className="form-select">
                                    <option defaultValue='selected'>Choose...</option>
                                    <option>Ready</option>
                                    <option>Booked</option>
                                    <option>Assign Clean</option>
                                    <option>Maintenance</option>
                                </select>
                            </div>
                            {houseKeepingData.map((data, index) => {
                                return(
                                    <div className="col-md-4 col-lg-3" key={index}>
                                        <div className="room-select border p-3 rounded">
                                            <div className="form-check form-switch form-check-reverse">
                                                <input className="form-check-input" type="checkbox" role="switch"/>
                                            </div>
                                            <div className="text-center">
                                                <span className="fw-bold d-block text-primary">{data.roomNo}</span>
                                                <span className="mt-1">{data.assign}</span>
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            <div className="col-12 text-end">
                                <button type="button" className="btn btn-primary">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default HouseKeepingAssignRoom