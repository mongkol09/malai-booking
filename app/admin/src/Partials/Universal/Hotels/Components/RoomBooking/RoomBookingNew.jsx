import React, { useState, useEffect } from 'react';
import bookingService from '../../../../../services/bookingService';

const RoomBooking = () => {
  // State for form data
  const [formData, setFormData] = useState({
    // Reservation Details
    checkInDate: '',
    checkOutDate: '',
    arrivalFrom: '',
    bookingType: '',
    bookingReference: '',
    purposeOfVisit: '',
    remarks: '',
    
    // Room Details
    roomTypeId: '',
    roomId: '',
    adults: 1,
    children: 0,
    
    // Guest Details
    guestTitle: 'Mr',
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    guestCountryCode: '+66',
    guestAddress: '',
    guestCity: '',
    guestCountry: 'Thailand',
    guestZipCode: '',
    guestIdType: '',
    guestIdNumber: '',
    guestDateOfBirth: '',
    guestNationality: 'Thai',
    
    // Company Details
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyGST: '',
    
    // Payment
    totalAmount: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Pending'
  });

  // State for options
  const [roomTypes, setRoomTypes] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState({
    roomTypes: false,
    rooms: false,
    saving: false
  });
  const [errors, setErrors] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  // Load room types on component mount
  useEffect(() => {
    loadRoomTypes();
    generateBookingReference();
  }, []);

  // Load available rooms when room type or dates change
  useEffect(() => {
    if (formData.roomTypeId && formData.checkInDate && formData.checkOutDate) {
      loadAvailableRooms();
    }
  }, [formData.roomTypeId, formData.checkInDate, formData.checkOutDate]);

  // Calculate total when room or dates change
  useEffect(() => {
    if (selectedRoomType && formData.checkInDate && formData.checkOutDate) {
      const total = bookingService.calculateBookingTotal(
        formData.checkInDate,
        formData.checkOutDate,
        selectedRoomType.baseRate
      );
      setFormData(prev => ({ ...prev, totalAmount: total }));
    }
  }, [selectedRoomType, formData.checkInDate, formData.checkOutDate]);

  const loadRoomTypes = async () => {
    try {
      setLoading(prev => ({ ...prev, roomTypes: true }));
      const response = await bookingService.getRoomTypes();
      setRoomTypes(response.data || response);
    } catch (error) {
      console.error('Error loading room types:', error);
      setErrors(['Failed to load room types']);
    } finally {
      setLoading(prev => ({ ...prev, roomTypes: false }));
    }
  };

  const loadAvailableRooms = async () => {
    try {
      setLoading(prev => ({ ...prev, rooms: true }));
      const response = await bookingService.getAvailableRooms(
        formData.roomTypeId,
        formData.checkInDate,
        formData.checkOutDate
      );
      setAvailableRooms(response.data || response);
    } catch (error) {
      console.error('Error loading available rooms:', error);
      setAvailableRooms([]);
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  const generateBookingReference = async () => {
    try {
      const response = await bookingService.generateBookingReference();
      setFormData(prev => ({
        ...prev,
        bookingReference: response.data.bookingReference
      }));
    } catch (error) {
      console.error('Error generating booking reference:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Special handling for room type selection
    if (name === 'roomTypeId') {
      const roomType = roomTypes.find(rt => rt.id === value);
      setSelectedRoomType(roomType);
      setFormData(prev => ({
        ...prev,
        roomId: '' // Reset room selection when room type changes
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors([]);

      // Validate form data
      const validation = bookingService.validateBookingData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Create booking
      const response = await bookingService.createBooking(formData);
      
      // Show success message
      alert('Booking created successfully!');
      
      // Reset form
      setFormData({
        ...formData,
        guestFirstName: '',
        guestLastName: '',
        guestEmail: '',
        guestPhone: '',
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        totalAmount: 0
      });
      
      // Generate new booking reference
      generateBookingReference();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrors([error.message || 'Failed to create booking']);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      <div className="row g-3">
        <div className="col-sm-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <h3 className="fw-bold mb-0">Fill Out Booking Details</h3>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="col-sm-12">
            <div className="alert alert-danger">
              <ul className="mb-0">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="col-sm-12">
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="card-title">Reservation Details</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6 col-lg-4 col-xl-4">
                    <div className="form-group">
                      <label className="form-label text-muted">Check In <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-calendar-plus"></i></span>
                        <input 
                          type="date" 
                          className="form-control"
                          name="checkInDate"
                          value={formData.checkInDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 col-xl-4">
                    <div className="form-group">
                      <label className="form-label text-muted">Check Out<span className="text-danger"> *</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-calendar-minus"></i></span>
                        <input 
                          type="date" 
                          className="form-control"
                          name="checkOutDate"
                          value={formData.checkOutDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 col-xl-4">
                    <div className="form-group">
                      <label className="form-label text-muted">Arrival From</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-stop-circle"></i></span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Arrival From"
                          name="arrivalFrom"
                          value={formData.arrivalFrom}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 col-xl-4">
                    <div className="form-group">
                      <label className="form-label text-muted">Booking Type</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-house"></i></span>
                        <select 
                          className="form-select"
                          name="bookingType"
                          value={formData.bookingType}
                          onChange={handleInputChange}
                        >
                          <option value="">Choose Booking Type</option>
                          <option value="Advance">Advance</option>
                          <option value="Instant">Instant</option>
                          <option value="Groups">Groups</option>
                          <option value="Allocation">Allocation</option>
                          <option value="Business Seminar">Business Seminar</option>
                          <option value="Wedding">Wedding</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 col-xl-4">
                    <div className="form-group">
                      <label className="form-label text-muted">Booking Reference No</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-bookmark-heart"></i></span>
                        <input 
                          type="text" 
                          className="form-control"  
                          placeholder="Booking Reference No."
                          name="bookingReference"
                          value={formData.bookingReference}
                          onChange={handleInputChange}
                          readOnly
                        />
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary"
                          onClick={generateBookingReference}
                          title="Generate New Reference"
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 col-xl-4">
                    <div className="form-group">
                      <label className="form-label text-muted">Purpose of Visit</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-eyeglasses"></i></span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Purpose of Visit"
                          name="purposeOfVisit"
                          value={formData.purposeOfVisit}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 col-lg-12 col-xl-12">
                    <div className="form-group">
                      <label className="form-label text-muted">Remarks</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-bookmark-star"></i></span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Remarks"
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="card-title">Room Details</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label text-muted">Room Type <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-house"></i></span>
                        <select 
                          className="form-select"
                          name="roomTypeId"
                          value={formData.roomTypeId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Choose Room Type</option>
                          {loading.roomTypes ? (
                            <option>Loading...</option>
                          ) : (
                            roomTypes.map(roomType => (
                              <option key={roomType.id} value={roomType.id}>
                                {roomType.name} - ฿{parseFloat(roomType.baseRate).toLocaleString()}/night
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      {selectedRoomType && (
                        <small className="text-muted">
                          {selectedRoomType.description} | 
                          Capacity: {selectedRoomType.capacityAdults} adults
                          {selectedRoomType.capacityChildren > 0 && `, ${selectedRoomType.capacityChildren} children`} | 
                          {selectedRoomType.sizeSqm} sqm
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label text-muted">Room No<span className="text-danger"> *</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-house"></i></span>
                        <select 
                          className="form-select"
                          name="roomId"
                          value={formData.roomId}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.roomTypeId}
                        >
                          <option value="">Choose Room No</option>
                          {loading.rooms ? (
                            <option>Loading...</option>
                          ) : (
                            availableRooms.map(room => (
                              <option key={room.id} value={room.id}>
                                {room.roomNumber} - {room.status}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label text-muted">Adults</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-people"></i></span>
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="1"
                          name="adults"
                          value={formData.adults}
                          onChange={handleInputChange}
                          min="1"
                          max={selectedRoomType?.capacityAdults || 6}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label text-muted">Children</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="0"
                          name="children"
                          value={formData.children}
                          onChange={handleInputChange}
                          min="0"
                          max={selectedRoomType?.capacityChildren || 0}
                        />
                      </div>
                    </div>
                  </div>
                  {formData.totalAmount > 0 && (
                    <div className="col-md-12">
                      <div className="alert alert-info">
                        <strong>Total Amount: ฿{parseFloat(formData.totalAmount).toLocaleString()}</strong>
                        {selectedRoomType && formData.checkInDate && formData.checkOutDate && (
                          <small className="d-block">
                            {Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))} night(s) 
                            × ฿{parseFloat(selectedRoomType.baseRate).toLocaleString()}/night
                          </small>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Customer Details</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border">
                      <div className="card-header py-3">
                        <h6 className="card-title">Guest Details</h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">Title</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-person"></i></span>
                                <select 
                                  className="form-select"
                                  name="guestTitle"
                                  value={formData.guestTitle}
                                  onChange={handleInputChange}
                                >
                                  <option value="Mr">Mr</option>
                                  <option value="Ms">Ms</option>
                                  <option value="Mrs">Mrs</option>
                                  <option value="Dr">Dr</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">Country Code</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder="+66"
                                  name="guestCountryCode"
                                  value={formData.guestCountryCode}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">First Name <span className="text-danger">*</span></label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-person"></i></span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder="First Name"
                                  name="guestFirstName"
                                  value={formData.guestFirstName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">Last Name <span className="text-danger">*</span></label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-person"></i></span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder="Last Name"
                                  name="guestLastName"
                                  value={formData.guestLastName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">Email <span className="text-danger">*</span></label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                                <input 
                                  type="email" 
                                  className="form-control" 
                                  placeholder="Email"
                                  name="guestEmail"
                                  value={formData.guestEmail}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">Mobile No.</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-phone"></i></span>
                                <input 
                                  type="tel" 
                                  className="form-control" 
                                  placeholder="Mobile No."
                                  name="guestPhone"
                                  value={formData.guestPhone}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="form-group">
                              <label className="form-label text-muted">Address</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-house"></i></span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder="Address"
                                  name="guestAddress"
                                  value={formData.guestAddress}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">City</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-building"></i></span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder="City"
                                  name="guestCity"
                                  value={formData.guestCity}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">Country</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-globe"></i></span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder="Thailand"
                                  name="guestCountry"
                                  value={formData.guestCountry}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border">
                      <div className="card-header py-3">
                        <h6 className="card-title">Company Details (Optional)</h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-12">
                            <div className="form-group">
                              <label className="form-label text-muted">Company Name</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-building"></i></span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder="Company Name"
                                  name="companyName"
                                  value={formData.companyName}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="form-group">
                              <label className="form-label text-muted">Company Address</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder="Company Address"
                                  name="companyAddress"
                                  value={formData.companyAddress}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">Company Phone</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                                <input 
                                  type="tel" 
                                  className="form-control" 
                                  placeholder="Company Phone"
                                  name="companyPhone"
                                  value={formData.companyPhone}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="form-label text-muted">Company Email</label>
                              <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                                <input 
                                  type="email" 
                                  className="form-control" 
                                  placeholder="Company Email"
                                  name="companyEmail"
                                  value={formData.companyEmail}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-12 text-end mt-3">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading.saving}
              >
                {loading.saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Booking...
                  </>
                ) : (
                  'Save Booking Details'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomBooking;
