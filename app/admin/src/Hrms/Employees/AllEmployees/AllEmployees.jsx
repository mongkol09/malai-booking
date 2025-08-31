import React from 'react'
import { Link } from 'react-router-dom'

import { empData } from './Components/AllEmpData'
import AddEmp from './Components/AddEmp'

const AllEmployees = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-12">
                <div className="px-0 d-flex align-items-center justify-content-between">
                    <h3 className="fw-bold flex-fill mb-0">All Employee</h3>
                    <button type="button" className="btn btn-dark me-1 mt-1 w-sm-100" data-bs-toggle="modal" data-bs-target="#createemp">Add Employee</button>
                    <div className="dropdown">
                        <button className="btn btn-primary dropdown-toggle mt-1  w-sm-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">Status</button>
                        <ul className="dropdown-menu dropdown-menu-end p-2 p-xl-3 shadow rounded-4" >
                            <li><Link className="dropdown-item rounded-pill" to="/">All</Link></li>
                            <li><Link className="dropdown-item rounded-pill" to="/">Task Assign Members</Link></li>
                            <li><Link className="dropdown-item rounded-pill" to="/">Not Assign Members</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            {empData.map((data, index) => {
                return(
                <div className="col-lg-6 col-md-12" key={index}>
                    <div className="card p-lg-3">
                        <div className="card-body d-flex flex-column flex-sm-row text-center text-sm-start">
                            <div className="profile-av text-center">
                                <img src={data.empImg} alt="" className="avatar xl rounded-circle img-thumbnail shadow"/>
                            </div>
                            <div className="flex-grow-1 ms-0 ms-sm-4">
                                <h5 className="mb-1 mt-2">{data.empName}</h5>
                                <p className="text-muted mb-0 small">{data.role}</p>
                                <p>{data.jobDescription}</p>
                                
                                <Link className="btn btn-sm btn-dark" to="/employee-profile">View Profile</Link>
                            </div>
                        </div>
                    </div>
                </div>
                )
            })}
        </div>
        <AddEmp/>
    </div>
  )
}

export default AllEmployees