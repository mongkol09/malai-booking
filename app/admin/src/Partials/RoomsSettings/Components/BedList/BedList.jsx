import React from 'react'
import BedListTable from './Components/BedListTable'
import AddBed from './Components/AddBed'
import EditBed from './Components/EditBed'

const BedList = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Bed List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-bed">Add Bed</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <BedListTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddBed/>
        <EditBed/>
    </div>
  )
}

export default BedList