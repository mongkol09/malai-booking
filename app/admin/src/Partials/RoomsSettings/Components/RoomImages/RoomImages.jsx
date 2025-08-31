import React from 'react'
import RoomImagesTable from './Components/RoomImagesTable'
import AddRoomImages from './Components/AddRoomImages'
import EditRoomImages from './Components/EditRoomImages'

const RoomImages = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Room Images</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#add-image">Add Room Images</button>
                    </div>
                </div>
            </div>
                <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <RoomImagesTable/>
                    </div>
                </div>
            </div>
        </div>
        <AddRoomImages/>
        <EditRoomImages/>
    </div>
  )
}

export default RoomImages