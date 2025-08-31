import React from 'react'
import ExpenseReportTable from './Components/ExpenseReport/ExpenseReportTable'
import InvoiceReportTable from './Components/InvoiceReport/InvoiceReportTable'
import { Link } from 'react-router-dom'

const PayrollReport = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="card bg-transparent border-0">
            <ul className="nav nav-tabs li_animate fs-5" role="tablist">
                <li className="nav-item" role="presentation"><Link className="nav-link px-lg-4 py-lg-3 active" data-bs-toggle="tab" to="#ExpenseReport" aria-selected="true" role="tab"><i className="bi bi-credit-card"></i> Expense Report</Link></li>
                <li className="nav-item" role="presentation"><Link className="nav-link px-lg-4 py-lg-3" data-bs-toggle="tab" to="#InvoiceReport" aria-selected="false" tabIndex="-1" role="tab"><i className="bi bi-journal-text"></i><span className="d-none d-sm-inline-flex ps-1">Invoice Report</span></Link></li>
            </ul>
            <div className="tab-content bg-card p-3 border border-top-0 rounded-bottom">
                {/* <!--[ Start:: Expense Report ]--> */}
                <div className="tab-pane fade show active" id="ExpenseReport" role="tabpanel">
                    <ExpenseReportTable/>
                </div>
                {/* <!--[ Start:: Invoice Report ]--> */}
                <div className="tab-pane fade" id="InvoiceReport" role="tabpanel">
                    <InvoiceReportTable/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PayrollReport