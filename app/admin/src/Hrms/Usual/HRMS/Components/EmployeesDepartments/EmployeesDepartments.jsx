import React from 'react'
import EmpDepartmentsTable from './Components/EmpDepartmentsTable'
import AddDepartment from './Components/AddDepartment'
import EditDepartment from './Components/EditDepartment'
import Userlist from './Components/Userlist'

const EmployeesDepartments = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Departments</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark btn-set-task w-sm-100" data-bs-toggle="modal" data-bs-target="#depadd">Add Department</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card p-4">
                    <EmpDepartmentsTable/>
                </div>
            </div>
        </div>
        <AddDepartment/>
        <EditDepartment/>
        <Userlist/>
    </div>
  )
}

export default EmployeesDepartments