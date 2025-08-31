import React from 'react'
import FloorPlanListTable from './Components/FloorPlanListTable'
import AddFloor from './Components/AddFloor'
import AssignFloor from './Components/AssignFloor'
import EditFloor from './Components/EditFloor'

const FloorPlanList = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Floor Plan List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-secondary me-2" data-bs-toggle="modal" data-bs-target="#add-floor">Add Floor</button>
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#assign-floor">Assign Floor</button>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="alert alert-primary" role="alert">
                    <ol className="mb-0">
                        <li>Add Floor Name</li>
                        <li>Assign Floor</li>
                    </ol>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <FloorPlanListTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddFloor/>
        <AssignFloor/>
        <EditFloor/>
    </div>
  )
}

export default FloorPlanList