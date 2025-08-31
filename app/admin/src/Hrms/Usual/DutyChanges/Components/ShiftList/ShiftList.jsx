import React from 'react'
import ShiftListTable from './Components/ShiftListTable'
import AddShift from './Components/AddShift'
import EditShift from './Components/EditShift'

const ShiftList = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Duty Shift List</h3>    
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-shift">Add Shift</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <ShiftListTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddShift/>
        <EditShift/>
    </div>
  )
}

export default ShiftList