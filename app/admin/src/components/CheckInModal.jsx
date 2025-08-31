import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bookingService from '../services/bookingService';

const CheckInModal = ({ isOpen, onClose, roomData, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [availableGuests, setAvailableGuests] = useState([]);
  const [paymentData, setPaymentData] = useState({
    method: 'cash',
    amount: 0,
    received: 0,
    change: 0
  });
  const [printOptions, setPrintOptions] = useState({
    keyCard: true,
    receipt: true,
    welcomeLetter: true,
    checkoutInstructions: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && roomData) {
      fetchAvailableGuests();
    }
  }, [isOpen, roomData]);

  const fetchAvailableGuests = async () => {
    try {
      setLoading(true);
      
      // ใช้ bookingService.getTodaysArrivals() แทน
      const response = await bookingService.getTodaysArrivals();
      
      if (response && response.success) {
        // Filter guests for the same room type or available for the specific room
        const compatibleGuests = response.data.arrivals.filter(booking => 
          (booking.roomType?.name === roomData.roomType || 
           booking.room?.roomNumber === roomData.roomNumber) &&
          booking.status === 'Confirmed'
        );
        setAvailableGuests(compatibleGuests);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSelect = (guest) => {
    setSelectedGuest(guest);
    setPaymentData(prev => ({
      ...prev,
      amount: guest.outstandingAmount || 0
    }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'received') {
        updated.change = Math.max(0, value - prev.amount);
      }
      return updated;
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteCheckin = async () => {
    try {
      setLoading(true);
      
      const checkinData = {
        notes: `Checked in via modal to room ${roomData.roomNumber}`,
        specialRequests: selectedGuest.specialRequests || '',
        paymentProcessed: paymentData.received >= paymentData.amount,
        paymentDetails: {
          method: paymentData.method,
          amountDue: paymentData.amount,
          amountReceived: paymentData.received,
          change: paymentData.change,
          timestamp: new Date().toISOString()
        },
        staffId: 'admin',
        checkInDetails: {
          room: roomData,
          guest: selectedGuest,
          printOptions: printOptions,
          completedAt: new Date().toISOString()
        }
      };

      // ใช้ bookingService.processCheckIn แทนการเรียก API โดยตรง
      const result = await bookingService.processCheckIn(selectedGuest.id, checkinData);
      
      if (result && result.success) {
        // บันทึกข้อมูล check-in สำหรับการใช้งานใน check-out
        const checkinRecord = {
          bookingId: selectedGuest.id,
          roomId: roomData.id,
          guestId: selectedGuest.guest?.id,
          checkinTime: new Date().toISOString(),
          checkinData: checkinData
        };
        
        // เก็บในระบบเพื่อส่งต่อไปยัง check-out
        localStorage.setItem(`checkin_${selectedGuest.id}`, JSON.stringify(checkinRecord));
        
        onSuccess && onSuccess(result);
        onClose();
        setCurrentStep(1);
        setSelectedGuest(null);
      } else {
        throw new Error(result.error?.message || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Check-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-person-check fs-4 text-primary me-3"></i>
        <h5 className="mb-0">Select Guest for {roomData?.roomNo}</h5>
      </div>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading guests...</span>
          </div>
        </div>
      ) : (
        <div className="guest-list">
          {availableGuests.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-info-circle fs-1 text-muted"></i>
              <h6 className="text-muted mt-3">No pending check-ins found</h6>
              <p className="text-muted">for {roomData?.roomType} rooms</p>
            </div>
          ) : (
            availableGuests.map(guest => (
              <div 
                key={guest.id} 
                className={`guest-option border rounded p-3 mb-3 cursor-pointer ${
                  selectedGuest?.id === guest.id ? 'border-primary bg-light' : 'border-secondary'
                }`}
                onClick={() => handleGuestSelect(guest)}
              >
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="guestSelection"
                    value={guest.id}
                    checked={selectedGuest?.id === guest.id}
                    onChange={() => handleGuestSelect(guest)}
                  />
                  <label className="form-check-label w-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{guest.guest.firstName} {guest.guest.lastName}</h6>
                        <small className="text-muted">{guest.roomType?.name}</small>
                        <br />
                        <small className="text-info">Check-in: Today, Ref: {guest.bookingReferenceId}</small>
                      </div>
                      <div className="text-end">
                        {guest.outstandingAmount > 0 ? (
                          <span className="badge bg-warning">฿{guest.outstandingAmount.toLocaleString()} due</span>
                        ) : (
                          <span className="badge bg-success">Paid in Full</span>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ))
          )}
          
          <div className="border-top pt-3 mt-3">
            <button className="btn btn-outline-primary w-100">
              <i className="bi bi-plus-circle me-2"></i>
              Add Walk-in Guest
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-credit-card fs-4 text-primary me-3"></i>
        <h5 className="mb-0">Complete Check-in: {selectedGuest?.guest.firstName} {selectedGuest?.guest.lastName}</h5>
      </div>
      
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Guest Information</h6>
            </div>
            <div className="card-body">
              <p><strong>Name:</strong> {selectedGuest?.guest.firstName} {selectedGuest?.guest.lastName}</p>
              <p><strong>Email:</strong> {selectedGuest?.guest.email}</p>
              <p><strong>Phone:</strong> {selectedGuest?.guest.phoneNumber}</p>
              <p><strong>Room:</strong> {roomData?.roomNo} ({roomData?.roomType})</p>
              <p><strong>Booking Ref:</strong> {selectedGuest?.bookingReferenceId}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Payment Details</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Outstanding Balance</label>
                <div className="fs-4 text-danger">฿{paymentData.amount.toLocaleString()}</div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Payment Method</label>
                <select 
                  className="form-select"
                  value={paymentData.method || 'cash'}
                  onChange={(e) => handlePaymentChange('method', e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="qr">QR Code Payment</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Amount Received</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={paymentData.received || 0}
                  onChange={(e) => handlePaymentChange('received', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Change</label>
                <div className="form-control-plaintext">฿{paymentData.change.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="text-center mb-4">
        <i className="bi bi-check-circle-fill fs-1 text-success"></i>
        <h4 className="text-success mt-3">Check-in Successful!</h4>
      </div>
      
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">Check-in Summary</h6>
            </div>
            <div className="card-body">
              <p><strong>Guest:</strong> {selectedGuest?.guest.firstName} {selectedGuest?.guest.lastName}</p>
              <p><strong>Room:</strong> {roomData?.roomNo} ({roomData?.roomType})</p>
              <p><strong>Check-in:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>Payment:</strong> ฿{paymentData.received.toLocaleString()} ({paymentData.method})</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">Print Options</h6>
            </div>
            <div className="card-body">
              {Object.entries(printOptions).map(([key, value]) => (
                <div key={key} className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id={`print-${key}`}
                    checked={value || false}
                    onChange={(e) => setPrintOptions(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                  />
                  <label className="form-check-label">
                    {key === 'keyCard' && '🗝️ Key Card'}
                    {key === 'receipt' && '🧾 Receipt'}
                    {key === 'welcomeLetter' && '💌 Welcome Letter'}
                    {key === 'checkoutInstructions' && '📋 Checkout Instructions'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <motion.div 
          className="modal-dialog modal-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                Check-in Process - Step {currentStep} of 3
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
              ></button>
            </div>
            
            <div className="modal-body">
              {/* Progress Bar */}
              <div className="progress mb-4" style={{height: '8px'}}>
                <div 
                  className="progress-bar bg-primary" 
                  style={{width: `${(currentStep / 3) * 100}%`}}
                ></div>
              </div>
              
              {/* Step Content */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>
            
            <div className="modal-footer">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handlePreviousStep}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back
                </button>
              )}
              
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleNextStep}
                  disabled={currentStep === 1 && !selectedGuest}
                >
                  Continue
                  <i className="bi bi-arrow-right ms-1"></i>
                </button>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handleCompleteCheckin}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-printer me-1"></i>
                        Print All
                      </>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckInModal;
