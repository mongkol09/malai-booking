import React from 'react'

const PaymentSettings = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row mb-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Payment Settings</h3>
                </div>
            </div>
        </div>
        <div className="card-body mb-3">
            <div className="card border-0">
                <div className="card-header">
                    <h6 className="card-title mb-0">Stripe Settings</h6>
                </div>
                <div className="card-body pt-0">
                    <form>
                        <div className="mb-3 row mt-3">
                            <label className="col-md-3 form-check-label" htmlFor="Stripe">Stripe Payments</label>
                            <div className="col-md-9">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="Stripe"/>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Payment Mode</label>
                            <div className="col-md-9">
                                <select className="form-select" aria-label="Default select example">
                                    <option value=" ">Beta</option>
                                    <option value="">Live</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Currency Code</label>
                            <div className="col-md-9">
                                <select className="form-select" aria-label="Default select example">
                                    <option value=" ">INR</option>
                                    <option value="">USD</option>
                                    <option value="">EUR</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Payment Endpoint URL</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Publishable Key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Secret Key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Webhook Secret Key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="reset" className="btn btn-warning me-1">Reset</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div className="card-body mb-3">
            <div className="card border-0">
                <div className="card-header">
                    <h6 className="card-title mb-0">Paypal Settings</h6>
                    
                </div>
                <div className="card-body pt-0">
                    <form>
                        <div className="mb-3 row mt-3">
                            <label className="col-md-3 form-check-label" htmlFor="Paypal">Paypal Payments</label>
                            <div className="col-md-9">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="Paypal"/>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Paypal Business Email</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Payment Mode</label>
                            <div className="col-md-9">
                                <select className="form-select" aria-label="Default select example">
                                    <option value=" ">Beta</option>
                                    <option value="">Live</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Currency Code</label>
                            <div className="col-md-9">
                                <select className="form-select" aria-label="Default select example">
                                    <option value=" ">INR</option>
                                    <option value="">USD</option>
                                    <option value="">EUR</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Notification URL</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="reset" className="btn btn-warning me-1">Reset</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div className="card-body mb-3">
            <div className="card border-0">
                <div className="card-header">
                    <h6 className="card-title mb-0">Razorpay Settings</h6>
                    
                </div>
                <div className="card-body pt-0">
                    <form>
                        <div className="mb-3 row mt-3">
                            <label className="col-md-3 form-check-label" htmlFor="Razorpay">Razorpay Payments</label>
                            <div className="col-md-9">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="Razorpay"/>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Razorpay key ID</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Secret Key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="reset" className="btn btn-warning me-1">Reset</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div className="card-body mb-3">
            <div className="card border-0">
                <div className="card-header">
                    <h6 className="card-title mb-0">Paystack Settings</h6>
                    
                </div>
                <div className="card-body pt-0">
                    <form>
                        <div className="mb-3 row mt-3">
                            <label className="col-md-3 form-check-label" htmlFor="Paystack">Paystack Payments</label>
                            <div className="col-md-9">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="Paystack"/>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Paystack key ID</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Secret Key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="reset" className="btn btn-warning me-1">Reset</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div className="card-body mb-3">
            <div className="card border-0">
                <div className="card-header">
                    <h6 className="card-title mb-0">Paytm Settings</h6>
                    
                </div>
                <div className="card-body pt-0">
                    <form>
                        <div className="mb-3 row mt-3">
                            <label className="col-md-3 form-check-label" htmlFor="Paytm">Paytm Payments</label>
                            <div className="col-md-9">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="Paytm"/>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Payment Mode</label>
                            <div className="col-md-9">
                                <select className="form-select" aria-label="Default select example">
                                    <option value=" ">Beta</option>
                                    <option value="">Live</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Paytm Merchant Key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Paytm Merchant ID</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Industry Type ID</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Paytm Website</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="reset" className="btn btn-warning me-1">Reset</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div className="card-body mb-3">
            <div className="card border-0">
                <div className="card-header">
                    <h6 className="card-title mb-0">Flutterwave Settings</h6>
                    
                </div>
                <div className="card-body pt-0">
                    <form>
                        <div className="mb-3 row mt-3">
                            <label className="col-md-3 form-check-label" htmlFor="Flutterwave">Flutterwave Payments</label>
                            <div className="col-md-9">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="Flutterwave"/>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Public Key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Secret Key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Encryption key</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Currency Code</label>
                            <div className="col-md-9">
                                <select className="form-select" aria-label="Default select example">
                                    <option value=" ">INR</option>
                                    <option value="">USD</option>
                                    <option value="">EUR</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="reset" className="btn btn-warning me-1">Reset</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div className="card-body mb-3">
            <div className="card border-0">
                <div className="card-header">
                    <h6 className="card-title mb-0">Bank Transfer Settings</h6>
                    
                </div>
                <div className="card-body pt-0">
                    <form>
                        <div className="mb-3 row mt-3">
                            <label className="col-md-3 form-check-label" htmlFor="BankTransfer">Bank Transfer Payments</label>
                            <div className="col-md-9">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="BankTransfer"/>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Account Name</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Account Number</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Bank Name</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <label className="col-md-3 col-form-label">Bank Code</label>
                            <div className="col-md-9">
                                <input type="text" className="form-control"/>
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="reset" className="btn btn-warning me-1">Reset</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div className="card-body">
            <div className="card border-0">
                <div className="card-header">
                    <h6 className="card-title mb-0">Cash On Delivery</h6>
                    
                </div>
                <div className="card-body pt-0">
                    <form>
                        <div className="mb-3 row mt-3">
                            <label className="col-md-3 form-check-label" htmlFor="CashOnDelivery">Cash On Delivery</label>
                            <div className="col-md-9">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="CashOnDelivery"/>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 text-end">
                            <button type="reset" className="btn btn-warning me-1">Reset</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PaymentSettings