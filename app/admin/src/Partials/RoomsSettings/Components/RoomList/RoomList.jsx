import React, { useRef } from 'react'
import RoomListTable from './Components/RoomListTable'
import AddRoom from './Components/AddRoom'
import EditRoom from './Components/EditRoom'

const RoomList = () => {
  const roomListTableRef = useRef();

  const handleRoomAdded = (newRoom) => {
    // Refresh the room list table
    if (roomListTableRef.current && roomListTableRef.current.refreshData) {
      roomListTableRef.current.refreshData();
    }
  };

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Room List</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="offcanvas" data-bs-target="#add-room" aria-controls="add-room">Add Room</button>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <RoomListTable ref={roomListTableRef} />
                    </div>
                </div>
            </div>
        </div>
        <AddRoom onRoomAdded={handleRoomAdded} />
        <EditRoom/>
    </div>
  )
}

export default RoomList