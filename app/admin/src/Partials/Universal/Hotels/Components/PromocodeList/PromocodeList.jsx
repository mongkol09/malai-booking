import React from 'react'
import AddPromocode from './Components/AddPromocode'
import EditPromocode from './Components/EditPromocode'
import PromocodeListTable from './Components/PromocodeListTable'

const PromocodeList = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Promocode List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-promocode">Add Promocode</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <PromocodeListTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddPromocode/>
        <EditPromocode/>
    </div>
  )
}

export default PromocodeList