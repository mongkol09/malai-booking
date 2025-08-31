import React, { Component } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import bookingService from '../../../../../services/bookingService';

// Wrapper component สำหรับ authentication
const RoomCheckoutWithAuth = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="text-center p-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please login to access check-out management
        </div>
      </div>
    );
  }

  return <RoomCheckoutMain />;
};

class RoomCheckoutMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Booking data
      allBookings: [],
      inHouseBookings: [],
      selectedBookingId: '',
      selectedBooking: null,
      
      // Loading states
      loadingBookings: true,
      loadingCheckout: false,
      
      // Checkout form data
      additionalCharges: 0,
      comments: '',
      discountType: '',
      discountAmount: 0,
      discountRemarks: '',
      collectedAmount: 0,
      
      // Error handling
      error: null,
      
      // UI states
      showBillPreview: false
    };
  }

  async componentDidMount() {
    await this.loadInHouseBookings();
  }

  // ===============================
  // DATA LOADING
  // ===============================

  loadInHouseBookings = async () => {
    try {
      this.setState({ loadingBookings: true, error: null });
      console.log('🏨 Loading in-house bookings...');
      
      const response = await bookingService.getAllBookings();
      
      if (response && response.bookings) {
        // Filter only in-house bookings
        const inHouseBookings = response.bookings.filter(booking => {
          const status = booking.status?.toLowerCase();
          return status === 'inhouse' || status === 'in-house';
        });

        this.setState({
          allBookings: response.bookings,
          inHouseBookings: inHouseBookings,
          loadingBookings: false
        });

        console.log('✅ Loaded', inHouseBookings.length, 'in-house bookings');
      } else {
        this.setState({
          allBookings: [],
          inHouseBookings: [],
          loadingBookings: false
        });
        console.warn('⚠️ No booking data received');
      }
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      this.setState({
        error: 'Failed to load bookings: ' + error.message,
        loadingBookings: false
      });
    }
  };

  // ===============================
  // EVENT HANDLERS
  // ===============================

  handleBookingSelect = (e) => {
    const bookingId = e.target.value;
    this.setState({ selectedBookingId: bookingId });
    
    if (bookingId) {
      const selectedBooking = this.state.inHouseBookings.find(b => b.id === bookingId);
      this.setState({ selectedBooking });
      console.log('📋 Selected booking:', selectedBooking);
    } else {
      this.setState({ selectedBooking: null });
    }
  };

  handleFormChange = (field, value) => {
    this.setState({ [field]: value }, () => {
      // Auto-calculate totals when amounts change
      if (['additionalCharges', 'discountAmount', 'collectedAmount'].includes(field)) {
        this.calculateTotals();
      }
    });
  };

  calculateTotals = () => {
    const { selectedBooking, additionalCharges, discountAmount } = this.state;
    
    if (!selectedBooking) return;

    // Calculate based on booking price
    const baseAmount = parseFloat(selectedBooking.totalAmount || selectedBooking.price || 0);
    const netAmount = baseAmount + parseFloat(additionalCharges || 0) - parseFloat(discountAmount || 0);
    
    this.setState({
      netPayableAmount: netAmount,
      remainingAmount: netAmount
    });
  };

  handleCheckout = async () => {
    if (!this.state.selectedBooking) {
      alert('Please select a booking to check out');
      return;
    }

    if (!window.confirm('Are you sure you want to check out this guest?')) {
      return;
    }

    this.setState({ loadingCheckout: true });
    
    try {
      const checkoutData = {
        additionalCharges: parseFloat(this.state.additionalCharges || 0),
        comments: this.state.comments,
        discountType: this.state.discountType,
        discountAmount: parseFloat(this.state.discountAmount || 0),
        discountRemarks: this.state.discountRemarks,
        collectedAmount: parseFloat(this.state.collectedAmount || 0),
        checkoutTime: new Date().toISOString()
      };

      console.log('🚪 Processing checkout...', checkoutData);

      await bookingService.processCheckOut(this.state.selectedBookingId, checkoutData);
      
      // Success!
      alert('Check-out completed successfully!');
      
      // Reset form and reload data
      this.setState({
        selectedBookingId: '',
        selectedBooking: null,
        additionalCharges: 0,
        comments: '',
        discountType: '',
        discountAmount: 0,
        discountRemarks: '',
        collectedAmount: 0,
        loadingCheckout: false
      });
      
      // Reload bookings
      await this.loadInHouseBookings();
      
    } catch (error) {
      console.error('❌ Checkout failed:', error);
      alert(`Checkout failed: ${error.message}`);
      this.setState({ loadingCheckout: false });
    }
  };

  // ===============================
  // HELPER METHODS
  // ===============================

  formatCurrency = (amount) => {
    return `฿${parseFloat(amount || 0).toLocaleString()}`;
  };

  formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('th-TH');
    } catch (error) {
      return dateString;
    }
  };

  // ===============================
  // RENDER
  // ===============================

  render() {
    const {
      inHouseBookings,
      selectedBooking,
      selectedBookingId,
      loadingBookings,
      loadingCheckout,
      error,
      additionalCharges,
      comments,
      discountType,
      discountAmount,
      discountRemarks,
      collectedAmount,
      netPayableAmount,
      remainingAmount
    } = this.state;

    if (loadingBookings) {
      return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading bookings...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
          <div className="alert alert-danger" role="alert">
            <h6 className="alert-heading">❌ Error</h6>
            <p>{error}</p>
            <button className="btn btn-outline-primary btn-sm" onClick={this.loadInHouseBookings}>
              🔄 Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
          {/* Header */}
          <div className="col-sm-12">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              <h3 className="fw-bold mb-0">
                <i className="bi bi-box-arrow-right me-2"></i>
                Check Out
              </h3>
              <div className="col-auto d-flex w-sm-100">
                <select 
                  className="form-select" 
                  value={selectedBookingId}
                  onChange={this.handleBookingSelect}
                  disabled={loadingCheckout}
                >
                  <option value="">Choose Booking to Check Out</option>
                  {inHouseBookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.customerName || booking.guestName || 'Guest'} - Room {booking.roomNumber || booking.roomType} 
                      (Ref: {booking.bookingReferenceId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {inHouseBookings.length === 0 && (
              <div className="alert alert-info mt-3" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                No guests currently checked in. All rooms are available.
              </div>
            )}
          </div>

          {selectedBooking && (
            <>
              {/* Customer Details */}
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title">
                      <i className="bi bi-person me-2"></i>
                      Customer Details
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th scope="row">Name</th>
                            <td>{selectedBooking.customerName || selectedBooking.guestName || 'N/A'}</td>
                          </tr>
                          <tr>
                            <th scope="row">Room No</th>
                            <td>{selectedBooking.roomNumber || selectedBooking.roomType}</td>
                          </tr>
                          <tr>
                            <th scope="row">Booking No</th>
                            <td>{selectedBooking.bookingReferenceId}</td>
                          </tr>
                          <tr>
                            <th scope="row">Email ID</th>
                            <td>{selectedBooking.customerEmail || selectedBooking.email || 'N/A'}</td>
                          </tr>
                          <tr>
                            <th scope="row">Mobile No</th>
                            <td>{selectedBooking.customerPhone || selectedBooking.phone || 'N/A'}</td>
                          </tr>
                          <tr>
                            <th scope="row">Check-in Date</th>
                            <td>{this.formatDate(selectedBooking.checkInDate || selectedBooking.checkIn)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Check-out Date</th>
                            <td>{this.formatDate(selectedBooking.checkOutDate || selectedBooking.checkOut)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Details */}
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title">
                      <i className="bi bi-receipt me-2"></i>
                      Billing Details
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th scope="row">Room Type</th>
                            <td>{selectedBooking.roomType}</td>
                          </tr>
                          <tr>
                            <th scope="row">Total Nights</th>
                            <td>{selectedBooking.nights || 'N/A'}</td>
                          </tr>
                          <tr>
                            <th scope="row">Room Rate</th>
                            <td>{this.formatCurrency(selectedBooking.roomRate || selectedBooking.price)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Total Amount</th>
                            <td>{this.formatCurrency(selectedBooking.totalAmount || selectedBooking.price)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Paid Amount</th>
                            <td>{this.formatCurrency(selectedBooking.paidAmount || 0)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Due Amount</th>
                            <td>{this.formatCurrency(selectedBooking.dueAmount || selectedBooking.totalAmount || selectedBooking.price)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Charges */}
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title">
                      <i className="bi bi-plus-circle me-2"></i>
                      Additional Charges
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th scope="row">Additional Charges</th>
                            <td>
                              <input 
                                type="number" 
                                className="form-control" 
                                placeholder="Extra Charge"
                                value={additionalCharges}
                                onChange={(e) => this.handleFormChange('additionalCharges', e.target.value)}
                                disabled={loadingCheckout}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Comments</th>
                            <td>
                              <textarea 
                                className="form-control"
                                value={comments}
                                onChange={(e) => this.handleFormChange('comments', e.target.value)}
                                disabled={loadingCheckout}
                                placeholder="Additional charges details..."
                              ></textarea>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Discount */}
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title">
                      <i className="bi bi-percent me-2"></i>
                      Special Discount
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th scope="row">Discount Type</th>
                            <td>
                              <select 
                                className="form-select"
                                value={discountType}
                                onChange={(e) => this.handleFormChange('discountType', e.target.value)}
                                disabled={loadingCheckout}
                              >
                                <option value="">Choose Discount</option>
                                <option value="friends">Friends</option>
                                <option value="regular">Regular Customer</option>
                                <option value="vip">VIP Guest</option>
                                <option value="business">Business Seminar</option>
                                <option value="wedding">Wedding</option>
                                <option value="other">Other</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Discount Amt</th>
                            <td>
                              <input 
                                type="number" 
                                className="form-control" 
                                placeholder="Discount Amount"
                                value={discountAmount}
                                onChange={(e) => this.handleFormChange('discountAmount', e.target.value)}
                                disabled={loadingCheckout}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Remarks</th>
                            <td>
                              <textarea 
                                className="form-control"
                                value={discountRemarks}
                                onChange={(e) => this.handleFormChange('discountRemarks', e.target.value)}
                                disabled={loadingCheckout}
                                placeholder="Discount reason..."
                              ></textarea>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <hr/>
                      <h6 className="card-title mb-3">Balance Details</h6>
                      <table className="table table-sm table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th scope="row">Net Payable Amount</th>
                            <td>{this.formatCurrency(netPayableAmount || selectedBooking.totalAmount || selectedBooking.price)}</td>
                          </tr>
                          <tr>
                            <th scope="row">Collected Amount</th>
                            <td>
                              <input 
                                type="number" 
                                className="form-control" 
                                placeholder="Amount Collected"
                                value={collectedAmount}
                                onChange={(e) => this.handleFormChange('collectedAmount', e.target.value)}
                                disabled={loadingCheckout}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Change Amount</th>
                            <td>
                              {this.formatCurrency(Math.max(0, collectedAmount - (netPayableAmount || selectedBooking.totalAmount || selectedBooking.price)))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="col-sm-12 text-end">
                <button 
                  type="button" 
                  className="btn btn-success btn-lg"
                  onClick={this.handleCheckout}
                  disabled={loadingCheckout}
                >
                  {loadingCheckout ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Complete Checkout
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default RoomCheckoutWithAuth;
