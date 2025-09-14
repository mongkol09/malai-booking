import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bookingService from '../services/bookingService';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


const WalkInBookingModal = ({ isOpen, onClose, roomData, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Guest Information
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idCard: '',
    nationality: 'Thai',
    address: ''
  });
  
  // Booking Details
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
    numAdults: 1,
    numChildren: 0,
    specialRequests: ''
  });
  
  // Payment Information
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    depositAmount: 0,
    totalAmount: 0,
    paidAmount: 0,
    remarks: ''
  });

  useEffect(() => {
    if (isOpen && roomData) {
      // Reset form
      resetForm();
      // Calculate pricing if available
      calculatePricing();
    }
  }, [isOpen, roomData]);

  const resetForm = () => {
    setCurrentStep(1);
    setGuestInfo({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      idCard: '',
      nationality: 'Thai',
      address: ''
    });
    setBookingDetails({
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      numAdults: 1,
      numChildren: 0,
      specialRequests: ''
    });
    setPaymentInfo({
      method: 'cash',
      depositAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      remarks: ''
    });
  };

  const calculatePricing = () => {
    if (!roomData || !roomData.pricing) return;
    
    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const basePrice = roomData.pricing.basePrice || 1500; // default price
    const subtotal = basePrice * nights;
    const vat = subtotal * 0.07; // 7% VAT
    const total = subtotal + vat;
    const deposit = total * 0.3; // 30% deposit
    
    setPaymentInfo(prev => ({
      ...prev,
      totalAmount: total,
      depositAmount: deposit,
      paidAmount: deposit // default to deposit amount
    }));
  };

  const handleGuestInfoChange = (field, value) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBookingDetailsChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Recalculate pricing when dates change
    if (field === 'checkInDate' || field === 'checkOutDate') {
      setTimeout(calculatePricing, 100);
    }
  };

  const handlePaymentInfoChange = (field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    return guestInfo.firstName && guestInfo.lastName && guestInfo.phoneNumber;
  };

  const validateStep2 = () => {
    return bookingDetails.checkInDate && bookingDetails.checkOutDate && 
           new Date(bookingDetails.checkOutDate) > new Date(bookingDetails.checkInDate);
  };

  const validateStep3 = () => {
    return paymentInfo.method && paymentInfo.paidAmount >= 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateWalkInBooking = async () => {
    try {
      setLoading(true);
      
      const walkInBookingData = {
        // Guest information (matching frontend form)
        guestFirstName: guestInfo.firstName,
        guestLastName: guestInfo.lastName,
        guestEmail: guestInfo.email || `${guestInfo.phoneNumber}@walkin.local`,
        guestPhone: guestInfo.phoneNumber,
        guestNationality: guestInfo.nationality || 'Thai',
        
        // Room information (pass room type, not room ID)
        roomType: roomData.roomType, // This should be the room type object
        roomTypeName: roomData.roomType?.name || 'Grand Serenity',
        
        // Booking details
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        numAdults: bookingDetails.numAdults,
        numChildren: bookingDetails.numChildren,
        
        // Payment details
        totalAmount: parseFloat(paymentInfo.totalAmount) || 0,
        paymentMethod: paymentInfo.method || 'Cash',
        
        // Additional info
        remarks: bookingDetails.specialRequests || paymentInfo.remarks || 'Walk-in booking created via admin panel'
      };
      
      safeLog('🚶 Walk-in booking data prepared:', walkInBookingData);
      
      // Create booking via bookingService
      const result = await bookingService.createWalkInBooking(walkInBookingData);
      
      if (result && (result.success || result.data)) {
        onSuccess && onSuccess({
          bookingId: result.data?.id || result.id,
          bookingReferenceId: result.data?.bookingReferenceId || result.bookingReferenceId,
          room: roomData,
          guest: guestInfo,
          booking: result.data || result
        });
        resetForm();
      } else {
        throw new Error(result.message || result.error || 'Failed to create walk-in booking');
      }
      
    } catch (error) {
      console.error('Walk-in booking creation error:', error);
      alert('Failed to create walk-in booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title">
                <i className="bi bi-person-plus me-2"></i>
                Walk-in Booking - {roomData?.roomNo} ({roomData?.roomType})
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {/* Progress Steps */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    {[1, 2, 3].map(step => (
                      <div key={step} className="d-flex flex-column align-items-center">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                          currentStep >= step ? 'bg-info text-white' : 'bg-light text-muted'
                        }`} style={{ width: '40px', height: '40px' }}>
                          {step}
                        </div>
                        <small className={currentStep >= step ? 'text-info fw-bold' : 'text-muted'}>
                          {step === 1 ? 'Guest Info' : step === 2 ? 'Booking Details' : 'Payment'}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 1: Guest Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h6 className="mb-3">
                    <i className="bi bi-person me-2"></i>
                    Guest Information
                  </h6>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={guestInfo.firstName}
                        onChange={(e) => handleGuestInfoChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={guestInfo.lastName}
                        onChange={(e) => handleGuestInfoChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={guestInfo.phoneNumber}
                        onChange={(e) => handleGuestInfoChange('phoneNumber', e.target.value)}
                        placeholder="081-234-5678"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={guestInfo.email}
                        onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                        placeholder="guest@email.com"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">ID Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={guestInfo.idCard}
                        onChange={(e) => handleGuestInfoChange('idCard', e.target.value)}
                        placeholder="1234567890123"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nationality</label>
                      <select
                        className="form-select"
                        value={guestInfo.nationality}
                        onChange={(e) => handleGuestInfoChange('nationality', e.target.value)}
                      >
                        <option value="Thai">Thai</option>
                        <option value="Foreign">Foreign</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={guestInfo.address}
                        onChange={(e) => handleGuestInfoChange('address', e.target.value)}
                        placeholder="Guest address"
                      ></textarea>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Booking Details */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h6 className="mb-3">
                    <i className="bi bi-calendar me-2"></i>
                    Booking Details
                  </h6>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Check-in Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={bookingDetails.checkInDate}
                        onChange={(e) => handleBookingDetailsChange('checkInDate', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Check-out Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={bookingDetails.checkOutDate}
                        onChange={(e) => handleBookingDetailsChange('checkOutDate', e.target.value)}
                        min={bookingDetails.checkInDate}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Adults</label>
                      <select
                        className="form-select"
                        value={bookingDetails.numAdults}
                        onChange={(e) => handleBookingDetailsChange('numAdults', parseInt(e.target.value))}
                      >
                        {[1,2,3,4,5].map(num => (
                          <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Children</label>
                      <select
                        className="form-select"
                        value={bookingDetails.numChildren}
                        onChange={(e) => handleBookingDetailsChange('numChildren', parseInt(e.target.value))}
                      >
                        {[0,1,2,3].map(num => (
                          <option key={num} value={num}>{num} Child{num > 1 ? 'ren' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Special Requests</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={bookingDetails.specialRequests}
                        onChange={(e) => handleBookingDetailsChange('specialRequests', e.target.value)}
                        placeholder="Any special requests or notes..."
                      ></textarea>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h6 className="mb-3">
                    <i className="bi bi-credit-card me-2"></i>
                    Payment Information
                  </h6>
                  
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6>Pricing Summary</h6>
                          <div className="d-flex justify-content-between">
                            <span>Total Amount:</span>
                            <span className="fw-bold">฿{paymentInfo.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Suggested Deposit (30%):</span>
                            <span>฿{paymentInfo.depositAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Payment Method</label>
                      <select
                        className="form-select"
                        value={paymentInfo.method}
                        onChange={(e) => handlePaymentInfoChange('method', e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="qr_code">QR Code</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Amount Paid</label>
                      <input
                        type="number"
                        className="form-control"
                        value={paymentInfo.paidAmount}
                        onChange={(e) => handlePaymentInfoChange('paidAmount', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Payment Remarks</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={paymentInfo.remarks}
                        onChange={(e) => handlePaymentInfoChange('remarks', e.target.value)}
                        placeholder="Payment notes or remarks..."
                      ></textarea>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="modal-footer">
              <div className="d-flex justify-content-between w-100">
                <div>
                  {currentStep > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={handlePreviousStep}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Previous
                    </button>
                  )}
                </div>
                
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  
                  {currentStep < 3 ? (
                    <button 
                      type="button" 
                      className="btn btn-info"
                      onClick={handleNextStep}
                      disabled={
                        (currentStep === 1 && !validateStep1()) ||
                        (currentStep === 2 && !validateStep2())
                      }
                    >
                      Next
                      <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={handleCreateWalkInBooking}
                      disabled={loading || !validateStep3()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          Create Booking
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default WalkInBookingModal;
