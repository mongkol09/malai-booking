import React, { useState } from 'react';
import FacilitesDetailsListTable from './Components/FacilitesDetailsListTable';
import AddFacilites from './Components/AddFacilites';
import EditFacilites from './Components/EditFacilites';
import { facilitesDetailsData } from './Components/FacilitesDetailsListData'; // Assuming this is where your data is stored

const FacilitesDetailsList = () => {
  const [data, setData] = useState(facilitesDetailsData);

  const handleDelete = (id) => {
    setData(prevData => prevData.filter(item => item.facilitesId !== id));
  };

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      <div className="row g-3">
        <div className="col-sm-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <h3 className="fw-bold mb-0">Facilites Details List</h3>
            <div className="col-auto d-flex w-sm-100">
              <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-facilites">Add Facilites</button>
            </div>
          </div>
        </div>
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <FacilitesDetailsListTable data={data} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      </div>
      <AddFacilites />
      <EditFacilites />
    </div>
  )
}

export default FacilitesDetailsList;
