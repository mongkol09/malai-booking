import React from 'react'
import EmpSalaryTable from './Components/EmpSalaryTable'

const EmployeeSalary = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <h3 className="fw-bold">Employee Salary</h3>
        <div className="card">
            <div className="card-body">
                <EmpSalaryTable/>
            </div>
        </div>
    </div>
  )
}

export default EmployeeSalary