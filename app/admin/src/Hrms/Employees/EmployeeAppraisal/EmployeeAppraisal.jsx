import React from 'react'
import { empAppraisalData } from './Components/EmpAppraisalData'
import EmployeeReview from './Components/EmployeeReview'

const EmployeeAppraisal = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Employee Appraisal</h3>
                </div>
            </div>
            <div className="col-sm-12">
                <ul className="row g-1 li_animate list-unstyled" id="MyClients">
                    {empAppraisalData.map((data, index) => {
                        return(
                        <li className="col-12" key={index}>
                            <div className="bg-card p-3 rounded-4">
                                <div className="row g-3 align-items-center">
                                    <div className="col-lg-3 col-md-12">
                                        <div className="d-flex gap-3 align-items-center">
                                            <img className="avatar lg rounded-circle img-thumbnail shadow" src={data.empImg} alt=""/>
                                            <div>
                                                <h6 className="mb-1">{data.name}</h6>
                                                <span className="text-muted">{data.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-9 col-md-12">
                                        <ul className="list-unstyled d-flex justify-content-between gap-xl-4 gap-3 mb-0 flex-column flex-md-row">
                                            <li>
                                                <div className="vr d-none d-md-flex h-100 mx-lg-2 text-black"></div>
                                                <hr className="d-lg-none my-0 text-black-50"/>
                                            </li>
                                            <li>
                                                <h6 className="mb-1">Ratings</h6>
                                                <span className="small text-warning">
                                                <i className={`bi ${data.ratings[0].star}`}></i>{' '}
                                                    <i className={`bi ${data.ratings[1].star}`}></i>{' '}
                                                    <i className={`bi ${data.ratings[2].star}`}></i>{' '}
                                                    <i className={`bi ${data.ratings[3].star}`}></i>{' '}
                                                    <i className={`bi ${data.ratings[4].star}`}></i>
                                                </span>
                                            </li>
                                            <li>
                                                <h6 className="mb-1">Comments</h6>
                                                <span className="small text-muted">{data.comments}</span>
                                            </li>
                                            <li>
                                                <div className="vr d-none d-md-flex h-100 mx-lg-2 text-black"></div>
                                                <hr className="d-lg-none my-0 text-black-50"/>
                                            </li>
                                            <li>
                                                <h6 className="mb-1">Salary</h6>
                                                <span className="small text-muted">{data.salary}</span>
                                            </li>
                                            <li>
                                                <div className="vr d-none d-md-flex h-100 mx-lg-2 text-black"></div>
                                                <hr className="d-lg-none my-0 text-black-50"/>
                                            </li>
                                            <li>
                                                <h6 className="mb-1">Reviewer</h6>
                                                <span className="small text-muted">{data.reviewer}</span>
                                            </li>
                                            <li>
                                                <div className="vr d-none d-md-flex h-100 mx-lg-2 text-black"></div>
                                                <hr className="d-lg-none my-0 text-black-50"/>
                                            </li>
                                            <li>
                                                <button type="button" className="btn btn-accent" data-bs-toggle="modal" data-bs-target="#ViewMore">View More</button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </li>
                        )
                    })}
                </ul>
            </div>
        </div>
        <EmployeeReview/>
    </div>
  )
}

export default EmployeeAppraisal