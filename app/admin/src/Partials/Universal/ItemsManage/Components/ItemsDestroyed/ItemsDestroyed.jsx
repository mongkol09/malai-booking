import React from 'react'
import ItemsDestroyedTable from './Components/ItemsDestroyedTable'
import AddDestroyedItems from './Components/AddDestroyedItems'
import EditDestroyedItems from './Components/EditDestroyedItems'

const ItemsDestroyed = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Items Destroyed List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-items">Add Destroyed Items</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <ItemsDestroyedTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddDestroyedItems/>
        <EditDestroyedItems/>
    </div>
  )
}

export default ItemsDestroyed