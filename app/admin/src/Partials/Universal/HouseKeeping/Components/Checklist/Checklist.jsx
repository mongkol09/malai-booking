import React from 'react'
import AddChecklist from './Components/AddChecklist'
import EditChecklist from './Components/EditChecklist'
import ChecklistTable from './Components/ChecklistTable'

const Checklist = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Housekeeping Checklist</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-checklist">Add Checklist</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <ChecklistTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddChecklist/>
        <EditChecklist/>
    </div>
  )
}

export default Checklist