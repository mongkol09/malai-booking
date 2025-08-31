import React from 'react'
import EmpLoanTable from './Components/EmpLoanTable'
import AddLoan from './Components/AddLoan'
import EditLoan from './Components/EditLoan'

const EmployeeLoan = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Employee Loan</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark btn-set-task w-sm-100" data-bs-toggle="modal" data-bs-target="#LoanAdd">Add Loan</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card p-4">
                    <EmpLoanTable/>
                </div>
            </div>
        </div>
        <AddLoan/>
        <EditLoan/>
    </div>
  )
}

export default EmployeeLoan