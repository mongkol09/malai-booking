import React from 'react'
import ItemsListTable from './Components/ItemsListTable'
import AddItems from './Components/AddItems'
import EditItems from './Components/EditItems'

const ItemsList = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Items List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-items">Add Items</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <ItemsListTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddItems/>
        <EditItems/>
    </div>
  )
}

export default ItemsList