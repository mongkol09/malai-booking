import React from 'react'
import { qrListData } from './Components/QrListData'

const QrList = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Room QR-List</h3>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-body">
                        <div className="row g-3">
                            {qrListData.map((data, index) => {
                                return (
                                <div className="col-md-4 col-lg-3" key={index}>
                                    <div className="room-select border p-3 rounded">
                                        <img src={data.qrImg} className="img-fluid" alt="" />
                                        <div className="text-center">
                                            <span className="fw-bold d-block text-primary">{data.roomNo}</span>
                                        </div>
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default QrList