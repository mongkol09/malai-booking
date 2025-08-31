import React from 'react'
import { guestInfo, roomInfo } from './Components/RoomCheckoutData'

const RoomCheckout = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Check Out</h3>
                    <div className="col-auto d-flex w-sm-100">
                        <select className="form-select">
                            <option defaultValue='selected'>Choose Room No</option>
                            <option value="1">Room-101</option>
                            <option value="2">Room-102</option>
                            <option value="3">Room-704</option>
                            <option value="4">Room-904</option>
                            <option value="5">Room-1114</option>
                            <option value="6">Room-1214</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Customer Details</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-sm table-bordered mb-0">
                                <tbody>
                                {guestInfo.map((data, index) => (
                                    Object.keys(data).map((key, subIndex) => (
                                        <tr key={index + "-" + subIndex}>
                                            <th scope="row">{key}</th>
                                            <td>{data[key]}</td>
                                        </tr>
                                    ))
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Billing Details</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-sm table-bordered mb-0">
                                <tbody>
                                {roomInfo.map((data, index) => (
                                    Object.keys(data).map((key, subIndex) => (
                                        <tr key={index + "-" + subIndex}>
                                            <th scope="row">{key}</th>
                                            <td>{data[key]}</td>
                                        </tr>
                                    ))
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Bill Details</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                             <div className="table-wrapper">
                                <table className="table table-bordered mb-0">
                                    <thead>
                                        <tr>
                                            <th>Room No.</th>
                                            <th>Date</th>
                                            <th>Room Type</th>
                                            <th>Guest Details</th>
                                            <th className="text-center">Room Rent Details</th>
                                            <th>Tax Details</th>
                                            <th>Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td rowSpan="2">
                                                <strong className="d-block">102</strong>
                                                <span>Single Room</span>
                                            </td>
                                            <td rowSpan="2">
                                                <div>
                                                    23rd Mar 0300 to
                                                    25th Mar 0300 
                                                </div>
                                            </td>
                                            <td rowSpan="2">Single Room</td>
                                            <td>
                                                <div className="text-muted">Adults: 1 </div>
                                            </td>
                                            <td rowSpan="2">
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>From Date</th>
                                                            <th>To Date</th>
                                                            <th>NoD</th>
                                                            <th>($) Rent/ Day</th>
                                                            <th>($) Rent Discount</th>
                                                            <th>($) Tot. Rent</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>1</td>
                                                            <td>2023-03-23</td>
                                                            <td>2023-03-25</td>
                                                            <td>2</td>
                                                            <td>1600</td>
                                                            <td>0</td>
                                                            <td>2560</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td>
                                                <div className="text-muted">Tax Details:</div>
                                                <div>(RST3.00% )76.8</div>
                                                <div>(GST4.00% )102.4</div>
                                                <div>(DST4.00% )102.4</div>
                                                <div>(MSL3.50% )89.6</div>
                                            </td>
                                            <td rowSpan="2">2931.2</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="text-muted">Children: 0 </div>
                                            </td>
                                            <td>
                                                <div className="text-muted">Subtotal:</div>
                                                <div>2560</div>
                                                <div className="text-muted">Total Tax:</div>
                                                <div>371.2</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Additional Charges</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-sm table-bordered mb-0">
                                <tbody>
                                <tr>
                                    <th scope="row">Additional Charges</th>
                                    <td><input type="number" className="form-control" placeholder="Extra Charge"/></td>
                                </tr>
                                <tr>
                                    <th scope="row">Comments</th>
                                    <td><textarea className="form-control"></textarea></td>
                                </tr>
                                </tbody>
                            </table>
                            <hr/>
                            <h6 className="card-title mb-3">Payments Details</h6>
                            <table className="table table-sm table-bordered mb-0">
                                <tbody>
                                <tr>
                                    <th scope="row">Net Payable Amt</th>
                                    <td>$3110.4</td>
                                </tr>
                                <tr>
                                    <th scope="row">Special Discount Amtt</th>
                                    <td>$0.0</td>
                                </tr>
                                <tr>
                                    <th scope="row">Payable Amt</th>
                                    <td>$3110.4</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Special Discount</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-sm table-bordered mb-0">
                                <tbody>
                                <tr>
                                    <th scope="row">Discount Type</th>
                                    <td>
                                        <select className="form-select">
                                            <option defaultValue='selected'>Choose Discount</option>
                                            <option value="1">Friends</option>
                                            <option value="2">Regular Customer</option>
                                            <option value="3">MD Guest</option>
                                            <option value="4">Allocation</option>
                                            <option value="5">Business Seminar</option>
                                            <option value="6">Wedding</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Discount Amt</th>
                                    <td><input type="number" className="form-control" placeholder="Discount Amt"/></td>
                                </tr>
                                <tr>
                                    <th scope="row">Remarks</th>
                                    <td><textarea className="form-control"></textarea></td>
                                </tr>
                                </tbody>
                            </table>
                            <hr/>
                            <h6 className="card-title mb-3">Balance Details</h6>
                            <table className="table table-sm table-bordered mb-0">
                                <tbody>
                                <tr>
                                    <th scope="row">Remain Amt</th>
                                    <td>$3110.4</td>
                                </tr>
                                <tr>
                                    <th scope="row">Collected Amt</th>
                                    <td>$0.0</td>
                                </tr>
                                <tr>
                                    <th scope="row">Change Amt</th>
                                    <td>$3110.4</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-sm-12 text-end">
                <button type="button" className="btn btn-primary">Checkout</button>
            </div>
        </div>
    </div>
  )
}

export default RoomCheckout