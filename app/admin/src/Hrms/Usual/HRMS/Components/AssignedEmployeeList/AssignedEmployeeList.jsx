import React from 'react'
import AssignedEmpListTable from './Components/AssignedEmpListTable'
import AddAssign from './Components/AddAssign'

const AssignedEmployeeList = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Assigned Employee List</h3>    
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-roster">Assign</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <AssignedEmpListTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddAssign/>
    </div>
  )
}

export default AssignedEmployeeList