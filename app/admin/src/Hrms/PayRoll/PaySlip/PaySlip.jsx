import React from 'react'
import avatar1 from '../../../assets/images/lg/avatar1.jpg';
import { Link } from 'react-router-dom';

const PaySlip = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="card">
            <div className="card-body">
                <div className="bg-gradient-dark p-4 text-white rounded">
                    <h5 className="fw-bold mb-0 text-start text-md-center text-white">Payslip for the month of Aug 2023</h5>
                    <hr/>
                    <div className="row g-lg-3 g-2">
                        <div className="col-sm-6">
                            <div className="d-flex">
                                <Link to="/" className="logo">
                                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="var(--primary-color)" d="M0 8C0 3.58172 3.58172 0 8 0H24C28.4183 0 32 3.58172 32 8V32H8C3.58172 32 0 28.4183 0 24V8Z"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M9.17708 13.2C9.17708 12.7582 9.53152 12.4 9.96875 12.4H16.5C16.9372 12.4 17.2917 12.7582 17.2917 13.2C17.2917 13.6418 16.9372 14 16.5 14H9.96875C9.53152 14 9.17708 13.6418 9.17708 13.2Z" fill="white"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7 8.8C7 8.35817 7.35444 8 7.79167 8H12.1458C12.5831 8 12.9375 8.35817 12.9375 8.8C12.9375 9.24183 12.5831 9.6 12.1458 9.6H7.79167C7.35444 9.6 7 9.24183 7 8.8Z" fill="white"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M9.96875 8C10.406 8 10.7604 8.35817 10.7604 8.8V20.9C10.7604 20.9796 10.7917 21.0559 10.8474 21.1121C10.903 21.1684 10.9786 21.2 11.0573 21.2H16.5C16.9372 21.2 17.2917 21.5582 17.2917 22C17.2917 22.4418 16.9372 22.8 16.5 22.8H11.0573C10.5586 22.8 10.0804 22.5998 9.72778 22.2435C9.37518 21.8872 9.17708 21.4039 9.17708 20.9V8.8C9.17708 8.35817 9.53152 8 9.96875 8Z" fill="white"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.5885 11.8C17.5098 11.8 17.4343 11.8316 17.3786 11.8879C17.3229 11.9441 17.2917 12.0204 17.2917 12.1V14.3C17.2917 14.3796 17.3229 14.4559 17.3786 14.5121C17.4343 14.5684 17.5098 14.6 17.5885 14.6H24.1198C24.1985 14.6 24.274 14.5684 24.3297 14.5121C24.3854 14.4559 24.4167 14.3796 24.4167 14.3V12.1C24.4167 12.0204 24.3854 11.9441 24.3297 11.8879C24.274 11.8316 24.1985 11.8 24.1198 11.8H17.5885ZM16.259 10.7565C16.6116 10.4002 17.0899 10.2 17.5885 10.2H24.1198C24.6185 10.2 25.0967 10.4002 25.4493 10.7565C25.8019 11.1128 26 11.5961 26 12.1V14.3C26 14.8039 25.8019 15.2872 25.4493 15.6435C25.0967 15.9998 24.6185 16.2 24.1198 16.2H17.5885C17.0899 16.2 16.6116 15.9998 16.259 15.6435C15.9064 15.2872 15.7083 14.8039 15.7083 14.3V12.1C15.7083 11.5961 15.9064 11.1128 16.259 10.7565Z" fill="white"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.5885 20.6C17.5098 20.6 17.4343 20.6316 17.3786 20.6879C17.3229 20.7441 17.2917 20.8204 17.2917 20.9V23.1C17.2917 23.1796 17.3229 23.2559 17.3786 23.3121C17.4343 23.3684 17.5098 23.4 17.5885 23.4H24.1198C24.1985 23.4 24.274 23.3684 24.3297 23.3121C24.3854 23.2559 24.4167 23.1796 24.4167 23.1V20.9C24.4167 20.8204 24.3854 20.7441 24.3297 20.6879C24.274 20.6316 24.1985 20.6 24.1198 20.6H17.5885ZM16.259 19.5565C16.6116 19.2002 17.0899 19 17.5885 19H24.1198C24.6185 19 25.0967 19.2002 25.4493 19.5565C25.8019 19.9128 26 20.3961 26 20.9V23.1C26 23.6039 25.8019 24.0872 25.4493 24.4435C25.0967 24.7998 24.6185 25 24.1198 25H17.5885C17.0899 25 16.6116 24.7998 16.259 24.4435C15.9064 24.0872 15.7083 23.6039 15.7083 23.1V20.9C15.7083 20.3961 15.9064 19.9128 16.259 19.5565Z" fill="white"></path>
                                    </svg>
                                </Link>
                                <div className="ms-3">
                                    <h6>Hotel Air</h6>
                                    <p className="mb-0">802 Corporate Road. <br/>New York, NY 10801 </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 text-sm-end pt-sm-0 pt-3">
                            <h4>Invoice #1069</h4>
                            <p className="mb-0">Salary Month: Aug, 2023</p>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-start my-4">
                    <div className="me-3">
                        <img src={avatar1} className="rounded-circle lg avatar" alt="user"/>
                    </div>
                    <div className="info">
                        <h6 className="fw-semibold">Francisco Vasquez</h6>
                        <small>Receptionist<br/>Employee ID: LA-0210</small>
                    </div>
                </div>
                <div className="row g-lg-4 g-2">
                    <div className="col-lg-6">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr className="small text-uppercase">
                                        <th>#</th>
                                        <th>Earnings</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Basic Salary</td>
                                        <td>$1,500</td>
                                        </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>House Rent Allowance (H.R.A.)</td>
                                        <td>$50</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>Bonus</td>
                                        <td>$150</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>Conveyance</td>
                                        <td>$80</td>
                                    </tr>
                                    <tr>
                                        <td>4</td>
                                        <td>Other Allowance</td>
                                        <td>$80</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td><strong>Total Earnings</strong></td>
                                        <td><strong>$1,860</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr className="small text-uppercase">
                                        <th>#</th>
                                        <th>Deductions</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Tax Deducted at Source (T.D.S.)</td>
                                        <td>$10</td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>ESI</td>
                                        <td>$0</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>Provident Fund</td>
                                        <td>$150</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>C/Bank Loan</td>
                                        <td>$120</td>
                                    </tr>
                                    <tr>
                                        <td>4</td>
                                        <td>Other Deductions</td>
                                        <td>$8</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td><strong>Total Deductions</strong></td>
                                        <td><strong>$288</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="bg-light p-3 rounded my-4">
                    <div className="row g-lg-3 g-2">
                        <div className="col-lg-6">
                            <h5 className="fw-semibold">Note:-</h5>
                            <small className="text-muted">Etsy doostang zoodles disqus groupon greplin oooj voxy zoodles, weebly ning heekya handango imeem plugg dopplr jibjab, movity jajah plickers sifteo edmodo ifttt zimbra.</small>
                        </div>
                        <div className="col-lg-6 text-lg-end pt-3 pt-lg-0">
                            <p className="mb-0"><b>Total Earnings:</b> $1,860</p>
                            <p className="mb-0"><b>Total Deductions:</b> $288</p>
                            <h5 className="mb-0 mt-2 fw-bold text-primary">Net Salary $1572.00</h5>
                        </div>
                    </div>
                </div>
                <div className="text-end">
                    <button className="btn btn-secondary me-1"><i className="icon-printer me-1"></i> Print</button>
                    <button className="btn btn-outline-primary">Submit</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PaySlip