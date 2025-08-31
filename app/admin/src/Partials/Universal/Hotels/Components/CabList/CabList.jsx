import React from 'react'
import AddCab from './Components/AddCab'
import EditCab from './Components/EditCab'
import CabListTable from './Components/CabListTable'

const CabList = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Cab List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-items">Add Cab</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <CabListTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddCab/>
        <EditCab/>
    </div>
  )
}

export default CabList