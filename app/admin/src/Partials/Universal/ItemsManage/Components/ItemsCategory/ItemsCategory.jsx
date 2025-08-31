import React from 'react'
import ItemsCategoryTable from './Components/ItemsCategoryTable'
import AddCategory from './Components/AddCategory'
import EditCategory from './Components/EditCategory'

const ItemsCategory = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Items Category List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-items">Add Category</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <ItemsCategoryTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddCategory/>
        <EditCategory/>
    </div>
  )
}

export default ItemsCategory