import React from 'react'
import LeaveRequestTable from './Components/LeaveRequestTable'
import AddLeave from './Components/AddLeave'
import ApproveLeave from './Components/ApproveLeave'
import RejectLeave from './Components/RejectLeave'

const LeaveRequest = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Leave Request</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark btn-set-task w-sm-100" data-bs-toggle="modal" data-bs-target="#leaveadd">Add Leave</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <LeaveRequestTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddLeave/>
        <ApproveLeave/>
        <RejectLeave/>
    </div>
  )
}

export default LeaveRequest