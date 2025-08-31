import React from 'react'
import visaCard from '../../../../../../../assets/images/payment/visa-card.svg';
import masterCard from '../../../../../../../assets/images/payment/mastercard.svg';
import { Link } from 'react-router-dom';

const Billing = () => {
  return (
    <div className="tab-pane fade" id="setting-billing" role="tabpanel">
        <ul className="row g-3 list-unstyled li_animate mb-0">
            <li className="col-12">
                <div className="card">
                    <div className="card-body">
                        <div className="alert alert-danger">
                            <i className="zmdi zmdi-info me-1"></i> You are near your API limits.
                        </div>
                        <div className="row align-items-center">
                            <div className="col">
                                <span className="text-muted">Current plan</span>
                                <h4 className="mb-0 mt-2">$39/ per month</h4>
                            </div>
                            <div className="col-auto">
                                <Link className="btn btn-sm btn-dark" to="/">Upgrade</Link>
                            </div>
                        </div> 
                    </div>
                </div>
            </li>
            <li className="col-12 mb-4">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title mb-0">Payment methods</h6>
                        <Link className="btn btn-sm btn-primary" to="/">Add method</Link>
                    </div>
                    <div className="card-body">
                        <div className="list-group list-group-flush my-2">
                            <div className="list-group-item">
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <img className="img-fluid" src={visaCard} alt="..." style={{maxWidth: "38px"}}/>
                                    </div>
                                    <div className="col ml-n2">
                                        <h6 className="mb-0">Visa ending in 7878</h6>
                                        <small className="text-muted">Expires 08/2022</small>
                                    </div>
                                    <div className="col-auto mr-n3">
                                        <span className="badge bg-light text-dark">Default</span>
                                    </div>

                                    {/* <!--[ Dropdown ]--> */}
                                    <div className="col-auto">
                                        <Link to="/" className="dropdown-toggle after-none" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi bi-three-dots"></i></Link>
                                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2 rounded-4">
                                            <li><Link className="dropdown-item" to="/">File Info</Link></li>
                                            <li><Link className="dropdown-item" to="/">Copy to</Link></li>
                                            <li><Link className="dropdown-item" to="/">Move to</Link></li>
                                            <li><Link className="dropdown-item" to="/">Rename</Link></li>
                                            <li><Link className="dropdown-item" to="/">Block</Link></li>
                                            <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                        </ul>
                                    </div>
                                </div> 
                            </div>
                            <div className="list-group-item">
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <img className="img-fluid" src={masterCard} alt="..." style={{maxWidth: "38px"}}/>                            
                                    </div>
                                    <div className="col ml-n2">
                                        <h6 className="mb-0">Mastercard ending in 2525</h6>
                                        <small className="text-muted">Expires 11/2024</small>
                                    </div>

                                    {/* <!--[ Dropdown ]--> */}
                                    <div className="col-auto">
                                        <Link to="/" className="dropdown-toggle after-none" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi bi-three-dots"></i></Link>
                                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2 rounded-4">
                                            <li><Link className="dropdown-item" to="/">File Info</Link></li>
                                            <li><Link className="dropdown-item" to="/">Copy to</Link></li>
                                            <li><Link className="dropdown-item" to="/">Move to</Link></li>
                                            <li><Link className="dropdown-item" to="/">Rename</Link></li>
                                            <li><Link className="dropdown-item" to="/">Block</Link></li>
                                            <li><Link className="dropdown-item" to="/">Delete</Link></li>
                                        </ul>
                                    </div>

                                </div> 
                            </div>
                        </div>
                    </div>
                </div>
            </li>
            <li className="col-12">
                <h5 className="fw-normal mb-0">Invoices</h5>
                <p className="text-muted">Showing data from</p>
                <div className="table-responsive">
                    <table className="table table-border table-hover table-nowrap mb-0">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody className="font-size-base">
                            <tr>
                                <td><Link to="/">Invoice #10022</Link></td>
                                <td>Oct. 24, 2020</td>
                                <td>$29.00</td>
                                <td><span className="badge bg-secondary">Outstanding</span></td>
                            </tr>
                            <tr>
                                <td><Link to="/">Invoice #10012</Link></td>
                                <td>Aug. 11, 2020</td>
                                <td>$29.00</td>
                                <td><span className="badge bg-success">Paid</span></td>
                            </tr>
                            <tr>
                                <td><Link to="/">Invoice #10043</Link></td>
                                <td>July. 5, 2020</td>
                                <td>$29.00</td>
                                <td><span className="badge bg-success">Paid</span></td>
                            </tr>
                            <tr>
                                <td><Link to="/">Invoice #10045</Link></td>
                                <td>Jun. 16, 2020</td>
                                <td>$29.00</td>
                                <td><span className="badge bg-success">Paid</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </li>
            <li className="col-12">
                <small className="text-muted">Don’t need anymore? <Link to="/">Cancel your account</Link></small>
            </li>
        </ul> 
    </div>
  )
}

export default Billing