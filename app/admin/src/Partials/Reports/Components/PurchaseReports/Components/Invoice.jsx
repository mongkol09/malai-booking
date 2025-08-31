import React from 'react'
import InvoiceTable from './InvoiceTable'

const Invoice = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title fw-normal mb-0">Invoice List</h5>
                    </div>
                    <div className="card-body">
                        <InvoiceTable/>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Invoice