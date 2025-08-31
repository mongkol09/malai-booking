import React from 'react'
import ItemsSuppliersTable from './Components/ItemsSuppliersTable'
import AddSuppliers from './Components/AddSuppliers'
import EditSuppliers from './Components/EditSuppliers'

const ItemsSuppliers = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Items Suppliers List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-items">Add Suppliers</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <ItemsSuppliersTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddSuppliers/>
        <EditSuppliers/>
    </div>
  )
}

export default ItemsSuppliers