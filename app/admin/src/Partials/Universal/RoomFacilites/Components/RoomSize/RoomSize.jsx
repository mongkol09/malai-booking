import React, { useState } from 'react';
import RoomSizeTable from './Components/RoomSizeTable';
import AddRoom from './Components/AddRoom';
import EditRoom from './Components/EditRoom';
import { roomSizeData } from './Components/RoomSizeTableData'; // Assuming this is where your data is stored

const RoomSizeList = () => {
  const [data, setData] = useState(roomSizeData);

  const handleDelete = (id) => {
    setData(prevData => prevData.filter(item => item.roomId !== id));
  };

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      <div className="row g-3">
        <div className="col-sm-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <h3 className="fw-bold mb-0">Room Size List</h3>
            <div className="col-auto d-flex w-sm-100">
              <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-room">Add Room</button>
            </div>
          </div>
        </div>
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <RoomSizeTable data={data} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      </div>
      <AddRoom />
      <EditRoom />
    </div>
  )
}

export default RoomSizeList;
