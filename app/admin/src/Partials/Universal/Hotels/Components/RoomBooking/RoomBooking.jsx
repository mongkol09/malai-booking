import React, { useState, useEffect } from 'react'
import bookingService from '../../../../../services/bookingService'
import roomService from '../../../../../services/roomService'

const RoomBooking = () => {
  // 🚀 State Management - เพิ่มขึ้นมาใหม่โดยไม่กระทบ Template
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
    guestFatherName: '',
    guestGender: '',
    guestOccupation: '',
    guestDateOfBirth: '',
    guestAnniversary: '',
    guestNationality: 'Thai',
    guestCountryCode: '+66',
    guestPhone: '',
    guestEmail: '',
    guestVip: false,
    
    // Contact Details
    guestAddress: '',
    guestCity: '',
    guestCountry: 'Thailand',
    guestZipCode: '',
    guestIdType: '',
    guestIdNumber: '',
    
    // Company Details
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyGST: '',
    
    // Payment & Pricing Details - Enhanced for Dynamic Calculation
    totalAmount: 0,
    baseAmount: 0,          // Room price × nights
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    
    // 💰 Dynamic Payment Configuration
    discountType: 'amount',  // 'amount' or 'percentage'
    discountAmount: '0',
    discountPercentage: '0',
    serviceChargeRate: '10',   // Default 10%
    taxRate: '7',              // Default 7% VAT
    commissionPercentage: '0',
    commissionAmount: '0',
    additionalCharges: '0',
    
    // 📋 Payment Breakdown (Calculated)
    subtotalAfterDiscount: 0,
    serviceChargeAmount: 0,
    taxAmount: 0,
    finalAmount: 0,
    
    // Legacy fields for compatibility
    baseRate: '',
    finalRate: '',
    appliedRule: null
  });

  // 📊 Payment Calculation State
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    baseAmount: 0,
    discountAmount: 0,
    subtotal: 0,
    serviceChargeAmount: 0,
    taxAmount: 0,
    commissionAmount: 0,
    additionalCharges: 0,
    finalAmount: 0
  });

  // 📊 Data States
  const [roomTypes, setRoomTypes] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState({
    roomTypes: false,
    rooms: false,
    saving: false,
    calculating: false
  });
  const [errors, setErrors] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  // 🔄 Load Data on Component Mount
  useEffect(() => {
    loadRoomTypes();
    generateBookingReference();
  }, []);

  // 🔄 Load Available Rooms when room type or dates change
  useEffect(() => {
    if (formData.roomTypeId && formData.checkInDate && formData.checkOutDate) {
      loadAvailableRooms();
    }
  }, [formData.roomTypeId, formData.checkInDate, formData.checkOutDate]);

  // 💰 Calculate Total when room or dates change
  useEffect(() => {
    if (selectedRoomType && formData.checkInDate && formData.checkOutDate) {
      calculateBookingTotal();
    }
  }, [selectedRoomType, formData.checkInDate, formData.checkOutDate, formData.adults, formData.children]);

  // � Calculate Payment Breakdown with Dynamic Values
  const calculatePaymentBreakdown = () => {
    try {
      // Base calculation
      const baseAmount = Number(formData.totalAmount) || 0;
      
      // Calculate discount
      let discountAmount = 0;
      if (formData.discountType === 'percentage') {
        discountAmount = baseAmount * (Number(formData.discountPercentage) / 100);
      } else {
        discountAmount = Number(formData.discountAmount) || 0;
      }
      
      // Subtotal after discount
      const subtotal = Math.max(0, baseAmount - discountAmount);
      
      // Calculate service charge
      const serviceChargeAmount = subtotal * (Number(formData.serviceChargeRate) / 100);
      
      // Calculate tax (VAT) - now applied to subtotal + service charge
      const taxableAmount = subtotal + serviceChargeAmount;
      const taxAmount = taxableAmount * (Number(formData.taxRate) / 100);
      
      // Calculate commission
      let commissionAmount = 0;
      if (Number(formData.commissionPercentage || 0) > 0) {
        commissionAmount = subtotal * (Number(formData.commissionPercentage) / 100);
      } else {
        commissionAmount = Number(formData.commissionAmount) || 0;
      }
      
      // Additional charges
      const additionalCharges = Number(formData.additionalCharges) || 0;
      
      // Final amount
      const finalAmount = subtotal + serviceChargeAmount + taxAmount + additionalCharges;
      
      // Update payment breakdown state
      const breakdown = {
        baseAmount: baseAmount,
        discountAmount: discountAmount,
        subtotal: subtotal,
        serviceChargeAmount: serviceChargeAmount,
        taxAmount: taxAmount,
        commissionAmount: commissionAmount,
        additionalCharges: additionalCharges,
        finalAmount: finalAmount
      };
      
      setPaymentBreakdown(breakdown);
      
      // Update form data with calculated values
      setFormData(prev => ({
        ...prev,
        subtotalAfterDiscount: subtotal,
        serviceChargeAmount: serviceChargeAmount,
        taxAmount: taxAmount,
        finalAmount: finalAmount
      }));
      
      return breakdown;
    } catch (error) {
      console.error('❌ Error calculating payment breakdown:', error);
      return paymentBreakdown;
    }
  };

  // 🔄 Recalculate when payment-related fields change
  useEffect(() => {
    if (formData.totalAmount > 0) {
      calculatePaymentBreakdown();
    }
  }, [
    formData.totalAmount,
    formData.discountType,
    formData.discountAmount,
    formData.discountPercentage,
    formData.serviceChargeRate,
    formData.taxRate,
    formData.commissionPercentage,
    formData.commissionAmount,
    formData.additionalCharges
  ]);

  // �📋 API Functions
  const loadRoomTypes = async () => {
    try {
      setLoading(prev => ({ ...prev, roomTypes: true }));
      const response = await bookingService.getRoomTypes();
      
      const roomTypesData = response?.data || response || [];
      console.log('🏠 Room types loaded:', roomTypesData);
      
      if (Array.isArray(roomTypesData)) {
        setRoomTypes(roomTypesData);
      } else {
        console.warn('⚠️ Room types data is not an array');
        setRoomTypes([]);
      }
    } catch (error) {
      console.error('❌ Error loading room types:', error);
      setErrors(prev => [...prev, 'Failed to load room types']);
      setRoomTypes([]);
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
      
      const roomsData = response?.data || response || [];
      console.log('🚪 Available rooms loaded:', roomsData);
      
      setAvailableRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      console.error('❌ Error loading available rooms:', error);
      setAvailableRooms([]);
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  const generateBookingReference = async () => {
    try {
      const response = await bookingService.generateBookingReference();
      const bookingRef = response?.data?.bookingReference || response?.bookingReference;
      
      if (bookingRef) {
        setFormData(prev => ({ ...prev, bookingReference: bookingRef }));
        console.log('📄 Booking reference generated:', bookingRef);
      }
    } catch (error) {
      console.error('❌ Error generating booking reference:', error);
      // Fallback to local generation
      const timestamp = Date.now();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const bookingRef = `BK${year}${month}${day}${random}`;
      setFormData(prev => ({ ...prev, bookingReference: bookingRef }));
    }
  };

  const calculateBookingTotal = async () => {
    if (!selectedRoomType || !formData.checkInDate || !formData.checkOutDate) {
      setFormData(prev => ({ ...prev, totalAmount: 0 }));
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, calculating: true }));
      
      // Try dynamic pricing first
      const dynamicPricing = await bookingService.calculateDynamicPrice(
        selectedRoomType.id,
        formData.checkInDate,
        formData.checkOutDate,
        parseInt(formData.adults) || 1,
        parseInt(formData.children) || 0
      );
      
      if (dynamicPricing && dynamicPricing.success) {
        console.log('💰 Using dynamic pricing:', dynamicPricing.data);
        setFormData(prev => ({ 
          ...prev, 
          totalAmount: dynamicPricing.data.totalAmount, // ✅ Fixed to use totalAmount
          baseRate: dynamicPricing.data.baseRate,
          finalRate: dynamicPricing.data.finalRate,
          appliedRule: dynamicPricing.data.appliedRule,
          occupancyPercent: dynamicPricing.data.occupancyPercent,
          holidayInfo: dynamicPricing.data.holidayInfo
        }));
      } else {
        // Fallback to simple calculation
        console.log('💰 Using fallback pricing calculation');
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const total = nights * parseFloat(selectedRoomType.baseRate || 0);
        
        setFormData(prev => ({ 
          ...prev, 
          totalAmount: total,
          baseRate: selectedRoomType.baseRate,
          finalRate: selectedRoomType.baseRate,
          appliedRule: null
        }));
      }
    } catch (error) {
      console.error('❌ Error calculating price:', error);
      
      // Fallback calculation
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const total = nights * parseFloat(selectedRoomType.baseRate || 0);
      
      setFormData(prev => ({ 
        ...prev, 
        totalAmount: total,
        baseRate: selectedRoomType.baseRate,
        finalRate: selectedRoomType.baseRate,
        appliedRule: null
      }));
    } finally {
      setLoading(prev => ({ ...prev, calculating: false }));
    }
  };

  // 🎯 Event Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoomTypeChange = (e) => {
    const roomTypeId = e.target.value;
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    
    setFormData(prev => ({ 
      ...prev, 
      roomTypeId: roomTypeId,
      roomId: '' // Reset room selection
    }));
    setSelectedRoomType(roomType);
    setAvailableRooms([]); // Clear previous rooms
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors([]);
      
      // ✅ Quick Booking Validation - เฉพาะฟิลด์ที่จำเป็น
      console.log('🔍 Validating form data:', {
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        guestFirstName: formData.guestFirstName,
        guestLastName: formData.guestLastName
      });
      
      const validationErrors = [];
      
      // 🏨 ข้อมูลห้องพัก (จำเป็น)
      if (!formData.checkInDate) {
        validationErrors.push('⚠️ กรุณาเลือกวันที่เข้าพัก');
      }
      
      if (!formData.checkOutDate) {
        validationErrors.push('⚠️ กรุณาเลือกวันที่ออก');
      }
      
      if (!formData.roomTypeId) {
        validationErrors.push('⚠️ กรุณาเลือกประเภทห้องพัก');
      }
      
      if (!formData.roomId) {
        validationErrors.push('⚠️ กรุณาเลือกหมายเลขห้องพัก');
      }
      
      // 👤 ข้อมูลลูกค้าพื้นฐาน (จำเป็น)
      if (!formData.guestFirstName?.trim()) {
        validationErrors.push('⚠️ ชื่อลูกค้าจำเป็นต้องกรอก');
      }
      
      if (!formData.guestLastName?.trim()) {
        validationErrors.push('⚠️ นามสกุลลูกค้าจำเป็นต้องกรอก');
      }
      
      if (!formData.guestPhone?.trim()) {
        validationErrors.push('⚠️ เบอร์โทรศัพท์ลูกค้าจำเป็นต้องกรอก');
      }
      
      if (!formData.guestEmail?.trim()) {
        validationErrors.push('⚠️ อีเมลลูกค้าจำเป็นต้องกรอก');
      } else if (!formData.guestEmail.includes('@')) {
        validationErrors.push('⚠️ รูปแบบอีเมลไม่ถูกต้อง');
      }
      
      // 📅 วันที่ logic validation
      if (formData.checkInDate && formData.checkOutDate) {
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);
        
        if (checkOut <= checkIn) {
          validationErrors.push('⚠️ วันที่ออกต้องมาหลังวันที่เข้าพัก');
        }
      }
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      console.log('💾 Submitting booking with validated data:', formData);
      console.log('👤 Guest data being sent:');
      console.log('  - First Name:', formData.guestFirstName);
      console.log('  - Last Name:', formData.guestLastName);
      console.log('  - Email:', formData.guestEmail);
      console.log('  - Phone:', formData.guestPhone);
      
      const response = await bookingService.createBooking(formData);
      console.log('✅ Booking created successfully:', response);
      
      // Show success message for Quick Booking
      const successMessage = `
🎉 Quick Booking สำเร็จ!

📋 Booking Reference: ${response.data?.bookingReferenceId || 'N/A'}
👤 ลูกค้า: ${formData.guestFirstName} ${formData.guestLastName}
📱 โทร: ${formData.guestPhone}
📧 อีเมล: ${formData.guestEmail}
🏨 ห้อง: ${selectedRoomType?.name || ''} 
📅 เข้าพัก: ${formData.checkInDate}
📅 ออก: ${formData.checkOutDate}
💰 ราคารวม: ฿${(formData.finalAmount || formData.totalAmount)?.toLocaleString() || 'N/A'}

💡 หมายเหตุ: สามารถเพิ่มข้อมูลลูกค้าเพิ่มเติมได้ที่หน้า Booking List`;

      if (window.Swal) {
        window.Swal.fire({
          title: '🎉 Quick Booking สำเร็จ!',
          html: successMessage.replace(/\n/g, '<br>'),
          icon: 'success',
          confirmButtonText: 'ไปที่ Booking List',
          cancelButtonText: 'จองต่อ',
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/room-booking-list';
          } else {
            window.location.reload();
          }
        });
      } else {
        alert(successMessage);
        window.location.reload();
      }
      
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      setErrors([error.message || 'Failed to create booking']);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        {/* 🚨 Error Display */}
        {errors.length > 0 && (
          <div className="alert alert-danger mb-3">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
        <div className="row g-3">
            <div className="col-sm-12">
              <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <h3 className="fw-bold mb-0">Fill Out Booking Details</h3>
              </div>
            </div>
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
                                        <span className="input-group-text" ><i className="bi bi-calendar-plus"></i></span>
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
                                        <span className="input-group-text" ><i className="bi bi-calendar-minus"></i></span>
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
                                    <label className="form-label text-muted">Arival From</label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-stop-circle"></i></span>
                                        <input 
                                          type="text" 
                                          className="form-control" 
                                          placeholder="Arival From"
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
                                        <span className="input-group-text" ><i className="bi bi-house"></i></span>
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
                                        <span className="input-group-text" ><i className="bi bi-bookmark-heart"></i></span>
                                        <input 
                                          type="text" 
                                          className="form-control"  
                                          placeholder="Booking Reference No."
                                          name="bookingReference"
                                          value={formData.bookingReference}
                                          onChange={handleInputChange}
                                          readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-4 col-xl-4">
                                <div className="form-group">
                                    <label className="form-label text-muted">Purpose of Visit</label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-eyeglasses"></i></span>
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
                                        <span className="input-group-text" ><i className="bi bi-bookmark-star"></i></span>
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
                                        <span className="input-group-text" ><i className="bi bi-house"></i></span>
                                        <select 
                                          className="form-select"
                                          name="roomTypeId"
                                          value={formData.roomTypeId}
                                          onChange={handleRoomTypeChange}
                                          required
                                        >
                                            <option value="">Choose Room Type</option>
                                            {loading.roomTypes ? (
                                              <option disabled>Loading room types...</option>
                                            ) : Array.isArray(roomTypes) && roomTypes.length > 0 ? (
                                              roomTypes.map(roomType => (
                                                <option key={roomType.id} value={roomType.id}>
                                                  {roomType.name} - ฿{parseFloat(roomType.baseRate || 0).toLocaleString()}/night ({roomType.rooms?.length || 0} rooms)
                                                </option>
                                              ))
                                            ) : (
                                              <option disabled>No room types available</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Room No<span className="text-danger"> *</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-house"></i></span>
                                        <select 
                                          className="form-select"
                                          name="roomId"
                                          value={formData.roomId}
                                          onChange={handleInputChange}
                                          required
                                          disabled={!formData.roomTypeId || loading.rooms}
                                        >
                                            <option value="">Choose Room No</option>
                                            {loading.rooms ? (
                                              <option disabled>Loading available rooms...</option>
                                            ) : Array.isArray(availableRooms) && availableRooms.length > 0 ? (
                                              availableRooms.map(room => (
                                                <option key={room.id} value={room.id}>
                                                  Room {room.roomNumber} - {room.status}
                                                </option>
                                              ))
                                            ) : formData.roomTypeId ? (
                                              <option disabled>No available rooms found</option>
                                            ) : (
                                              <option disabled>Select room type first</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Adults</label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-people"></i></span>
                                        <input 
                                          type="number" 
                                          className="form-control" 
                                          placeholder="1"
                                          name="adults"
                                          value={formData.adults}
                                          onChange={handleInputChange}
                                          min="1"
                                          max="10"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Children</label>
                                    <div className="input-group">
                                        <span className="input-group-text" ><i className="bi bi-person"></i></span>
                                        <input 
                                          type="number" 
                                          className="form-control" 
                                          placeholder="0"
                                          name="children"
                                          value={formData.children}
                                          onChange={handleInputChange}
                                          min="0"
                                          max="10"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* 💰 Display Dynamic Pricing Details */}
                            {formData.totalAmount > 0 && (
                              <div className="col-md-12">
                                <div className="card border-primary">
                                  <div className="card-header bg-primary text-white">
                                    <h6 className="mb-0">
                                      <i className="bi bi-calculator me-2"></i>
                                      ราคารวม: ฿{formData.totalAmount.toLocaleString()}
                                    </h6>
                                  </div>
                                  <div className="card-body">
                                    {/* Base Rate Information */}
                                    {selectedRoomType && formData.checkInDate && formData.checkOutDate && (
                                      <div className="row g-2 mb-3">
                                        <div className="col-6">
                                          <small className="text-muted">Base Rate:</small>
                                          <div>฿{parseFloat(formData.baseRate || selectedRoomType.baseRate || 0).toLocaleString()}/night</div>
                                        </div>
                                        <div className="col-6">
                                          <small className="text-muted">Nights:</small>
                                          <div>{Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))} nights</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Applied Rule Information */}
                                    {formData.appliedRule && (
                                      <div className="alert alert-warning border-0 py-2 mb-3">
                                        <strong className="text-warning">
                                          <i className="bi bi-exclamation-triangle me-1"></i>
                                          {formData.appliedRule.name}
                                        </strong>
                                        {formData.appliedRule.action && (
                                          <small className="d-block text-muted">
                                            {formData.appliedRule.action.type === 'increase_rate_by_percent' && 
                                              `+${formData.appliedRule.action.value}% premium`}
                                            {formData.appliedRule.action.type === 'decrease_rate_by_percent' && 
                                              `-${formData.appliedRule.action.value}% discount`}
                                          </small>
                                        )}
                                      </div>
                                    )}

                                    {/* Final Rate vs Base Rate */}
                                    {formData.finalRate && formData.baseRate && formData.finalRate !== formData.baseRate && (
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div className="text-decoration-line-through text-muted">
                                          Base: ฿{parseFloat(formData.baseRate).toLocaleString()}
                                        </div>
                                        <div className="fw-bold text-primary">
                                          Final: ฿{parseFloat(formData.finalRate).toLocaleString()}
                                        </div>
                                      </div>
                                    )}

                                    {/* Occupancy Information */}
                                    {formData.occupancyPercent && (
                                      <div className="mt-2">
                                        <small className="text-muted">
                                          Occupancy: {formData.occupancyPercent.toFixed(1)}%
                                        </small>
                                      </div>
                                    )}

                                    {/* Holiday Information */}
                                    {formData.holidayInfo && formData.holidayInfo.isHoliday && (
                                      <div className="mt-2">
                                        <span className="badge bg-danger">
                                          <i className="bi bi-calendar-event me-1"></i>
                                          Holiday Period
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Customer Details</h6>
                        <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            ฟิลด์ที่มี <span className="text-danger">*</span> จำเป็นต้องกรอกสำหรับ Quick Booking • ข้อมูลอื่นๆ สามารถเพิ่มทีหลังได้
                        </small>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6 d-flex">
                                <div className="card flex-fill w-100 border">
                                    <div className="card-header py-3">
                                        <h6 className="card-title">Guest Details</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Country Code</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                                                        <input 
                                                          type="text" 
                                                          className="form-control" 
                                                          placeholder="Country Code"
                                                          name="guestCountryCode"
                                                          value={formData.guestCountryCode}
                                                          onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Mobile No. <span className="text-danger">*</span></label>
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
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Title</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-emoji-smile"></i></span>
                                                        <select 
                                                          className="form-select"
                                                          name="guestTitle"
                                                          value={formData.guestTitle}
                                                          onChange={handleInputChange}
                                                        >
                                                            <option value="Mr">Mr</option>
                                                            <option value="Ms">Ms</option>
                                                            <option value="Mrs">Mrs.</option>
                                                            <option value="Dr">Dr</option>
                                                            <option value="Engineer">Engineer</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">First Name <span className="text-danger">*</span></label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-person-circle"></i></span>
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
                                                        <span className="input-group-text"><i className="bi bi-person-circle"></i></span>
                                                        <input 
                                                          type="text" 
                                                          className="form-control" 
                                                          placeholder="Last Name"
                                                          name="guestLastName"
                                                          value={formData.guestLastName}
                                                          onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Father Name</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-person-circle"></i></span>
                                                        <input type="text" className="form-control" id="fathername" placeholder="Father Name"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 align-self-center">
                                                <label className="form-label text-muted w-100">Gender</label>
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" defaultValue="option1"/>
                                                    <label className="form-check-label" htmlFor="inlineRadio1">Male</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" defaultValue="option2"/>
                                                    <label className="form-check-label" htmlFor="inlineRadio2">Female</label>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Occupation</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-briefcase"></i></span>
                                                        <input type="text" className="form-control" placeholder="Occupation"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Date of Birth</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                                                        <input type="date" className="form-control"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Anniversary</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                                                        <input type="date" className="form-control"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Nationality</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                                                        <input type="text" name="datefilter2" className="form-control" id="nationality" placeholder="Nationality" defaultValue=""/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 align-self-center mb-3">
                                                <label className="form-label text-muted">Guest</label>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" defaultValue="" id="defaultCheck1"/>
                                                    <label className="form-check-label" htmlFor="defaultCheck1">
                                                    VIP?
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 d-flex">
                                <div className="card flex-fill w-100 border">
                                    <div className="card-header py-3">
                                        <h6 className="card-title">Contact Details</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Contact Type</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-journal"></i></span>
                                                        <select className="form-select" defaultValue="">
                                                            <option value="">Choose Contact Type</option>
                                                            <option value="Home">Home</option>
                                                            <option value="Personal">Personal</option>
                                                            <option value="Official">Official</option>
                                                            <option value="Business">Business</option>
                                                        </select>
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
                                                          placeholder="example@email.com"
                                                          name="guestEmail"
                                                          value={formData.guestEmail}
                                                          onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Country</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-map"></i></span>
                                                        <input type="text" className="form-control" placeholder="Country"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">State</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-layers"></i></span>
                                                        <input type="text" className="form-control" placeholder="State"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">City</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-mailbox"></i></span>
                                                        <input type="text" className="form-control" placeholder="City"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Zipcode</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-file-zip"></i></span>
                                                        <input type="number" className="form-control" placeholder="Zipcode"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Address</label>
                                                    <textarea className="form-control" placeholder="Address"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 d-flex">
                                <div className="card flex-fill w-100 border">
                                    <div className="card-header py-3">
                                        <h6 className="card-title">Identity Details</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Identity Type</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-images"></i></span>
                                                        <input type="text" className="form-control" placeholder="Identity Type"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">ID # <span className="text-danger">*</span></label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-images"></i></span>
                                                        <input type="text" className="form-control" placeholder="ID"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <label>Identity Upload</label>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Front Side Document</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-images"></i></span>
                                                        <input type="file" className="form-control"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Back Side Document</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-images"></i></span>
                                                        <input type="file" className="form-control"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Comments</label>
                                                    <textarea className="form-control" placeholder="Remarks"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 d-flex">
                                <div className="card flex-fill w-100 border">
                                    <div className="card-header py-3">
                                        <h6 className="card-title">Guest Image</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="form-label text-muted">Customer Image</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text"><i className="bi bi-images"></i></span>
                                                        <input type="file" className="form-control"/>
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
            </div>
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Payment Details</h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Discount Reason</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-tag"></i></span>
                                        <input type="text" className="form-control" placeholder="Discount Type"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Discount (Max-100%)</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-tag"></i></span>
                                        <input type="text" className="form-control" placeholder="Discount"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Commission (%)</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-percent"></i></span>
                                        <input type="text" className="form-control" placeholder="Commission"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Commission Amount</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-currency-dollar"></i></span>
                                        <input type="text" className="form-control" placeholder="40"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Payment Details Form - NEW SECTION */}
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">💰 Payment Details</h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            {/* Discount Section */}
                            <div className="col-12">
                                <h6 className="text-muted mb-3">💸 Discount Configuration</h6>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted">Discount Type</label>
                                <select 
                                  className="form-select" 
                                  name="discountType"
                                  value={formData.discountType}
                                  onChange={handleInputChange}
                                >
                                    <option value="amount">Amount (฿)</option>
                                    <option value="percentage">Percentage (%)</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                {formData.discountType === 'amount' ? (
                                    <div>
                                        <label className="form-label text-muted">Discount Amount</label>
                                        <div className="input-group">
                                            <span className="input-group-text">฿</span>
                                            <input 
                                              type="number" 
                                              className="form-control" 
                                              name="discountAmount"
                                              value={formData.discountAmount}
                                              onChange={handleInputChange}
                                              placeholder="0"
                                              min="0"
                                              max={formData.totalAmount}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="form-label text-muted">Discount Percentage</label>
                                        <div className="input-group">
                                            <input 
                                              type="number" 
                                              className="form-control" 
                                              name="discountPercentage"
                                              value={formData.discountPercentage}
                                              onChange={handleInputChange}
                                              placeholder="0"
                                              min="0"
                                              max="100"
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Service & Tax Section */}
                            <div className="col-12">
                                <hr className="my-3"/>
                                <h6 className="text-muted mb-3">📋 Tax & Service Charges</h6>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted">Service Charge Rate</label>
                                <div className="input-group">
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      name="serviceChargeRate"
                                      value={formData.serviceChargeRate}
                                      onChange={handleInputChange}
                                      placeholder="10"
                                      min="0"
                                      max="50"
                                      step="0.5"
                                    />
                                    <span className="input-group-text">%</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted">Tax Rate (VAT)</label>
                                <div className="input-group">
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      name="taxRate"
                                      value={formData.taxRate}
                                      onChange={handleInputChange}
                                      placeholder="7"
                                      min="0"
                                      max="20"
                                      step="0.1"
                                    />
                                    <span className="input-group-text">%</span>
                                </div>
                            </div>

                            {/* Commission Section */}
                            <div className="col-12">
                                <hr className="my-3"/>
                                <h6 className="text-muted mb-3">💼 Commission</h6>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted">Commission (%)</label>
                                <div className="input-group">
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      name="commissionPercentage"
                                      value={formData.commissionPercentage}
                                      onChange={handleInputChange}
                                      placeholder="0"
                                      min="0"
                                      max="30"
                                      step="0.5"
                                    />
                                    <span className="input-group-text">%</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted">Commission Amount</label>
                                <div className="input-group">
                                    <span className="input-group-text">฿</span>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      name="commissionAmount"
                                      value={formData.commissionAmount}
                                      onChange={handleInputChange}
                                      placeholder="0"
                                      min="0"
                                    />
                                </div>
                            </div>

                            {/* Additional Charges */}
                            <div className="col-12">
                                <hr className="my-3"/>
                                <h6 className="text-muted mb-3">➕ Additional Charges</h6>
                            </div>
                            <div className="col-md-12">
                                <label className="form-label text-muted">Extra Charges</label>
                                <div className="input-group">
                                    <span className="input-group-text">฿</span>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      name="additionalCharges"
                                      value={formData.additionalCharges}
                                      onChange={handleInputChange}
                                      placeholder="0"
                                      min="0"
                                    />
                                    <span className="input-group-text">
                                        <i className="fa fa-info-circle" title="Additional charges like parking, wifi, etc."></i>
                                    </span>
                                </div>
                                <small className="text-muted">Parking, WiFi, Extra services, etc.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Original Advance Details */}
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Advance Details</h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Payment Mode</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                                        <select 
                                          className="form-select" 
                                          name="paymentMethod"
                                          value={formData.paymentMethod}
                                          onChange={handleInputChange}
                                        >
                                            <option value="Card Payment">Card Payment</option>
                                            <option value="Paypal">Paypal</option>
                                            <option value="Cash Payment">Cash Payment</option>
                                            <option value="Bank Payment">Bank Payment</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Total Amount</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-currency-dollar"></i></span>
                                        <input 
                                          type="text" 
                                          className="form-control" 
                                          value={`฿${paymentBreakdown.finalAmount.toLocaleString()}`}
                                          readOnly
                                          style={{backgroundColor: '#f8f9fa'}}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Advance Remarks</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-card-text"></i></span>
                                        <input type="text" className="form-control" placeholder="Remarks"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label text-muted">Advance Amount</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-currency-dollar"></i></span>
                                        <input type="text" className="form-control" placeholder="Advance Amount"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">📊 Billing Details</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-sm table-bordered mb-0">
                                <tbody>
                                <tr>
                                    <th scope="row" className="text-muted">Base Room Charge</th>
                                    <td className="text-end"><strong>฿{paymentBreakdown.baseAmount.toLocaleString()}</strong></td>
                                </tr>
                                {paymentBreakdown.discountAmount > 0 && (
                                <tr className="table-warning">
                                    <th scope="row" className="text-muted">
                                        💸 Discount 
                                        <small className="d-block">
                                            {formData.discountType === 'percentage' ? 
                                              `(${formData.discountPercentage}%)` : 
                                              '(Fixed Amount)'
                                            }
                                        </small>
                                    </th>
                                    <td className="text-end text-danger">-฿{paymentBreakdown.discountAmount.toLocaleString()}</td>
                                </tr>
                                )}
                                <tr>
                                    <th scope="row" className="text-muted">Subtotal</th>
                                    <td className="text-end">฿{paymentBreakdown.subtotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th scope="row" className="text-muted">
                                        Service Charge 
                                        <small className="d-block">({formData.serviceChargeRate}%)</small>
                                    </th>
                                    <td className="text-end">+฿{paymentBreakdown.serviceChargeAmount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th scope="row" className="text-muted">
                                        Tax (VAT)
                                        <small className="d-block">({formData.taxRate}%)</small>
                                    </th>
                                    <td className="text-end">+฿{paymentBreakdown.taxAmount.toLocaleString()}</td>
                                </tr>
                                {paymentBreakdown.commissionAmount > 0 && (
                                <tr className="table-info">
                                    <th scope="row" className="text-muted">
                                        💼 Commission
                                        <small className="d-block">
                                            {Number(formData.commissionPercentage) > 0 ? 
                                              `(${formData.commissionPercentage}%)` : 
                                              '(Fixed Amount)'
                                            }
                                        </small>
                                    </th>
                                    <td className="text-end text-info">+฿{paymentBreakdown.commissionAmount.toLocaleString()}</td>
                                </tr>
                                )}
                                {paymentBreakdown.additionalCharges > 0 && (
                                <tr className="table-secondary">
                                    <th scope="row" className="text-muted">➕ Additional Charges</th>
                                    <td className="text-end">+฿{paymentBreakdown.additionalCharges.toLocaleString()}</td>
                                </tr>
                                )}
                                <tr className="table-success">
                                    <th scope="row" className="fw-bold">
                                        💰 FINAL TOTAL
                                    </th>
                                    <td className="text-end">
                                        <span className="badge bg-success fs-6">
                                            ฿{paymentBreakdown.finalAmount.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-3 pt-3 border-top">
                            <div className="row g-2">
                                <div className="col-6">
                                    <button 
                                      type="button" 
                                      className="btn btn-outline-warning btn-sm w-100"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          discountType: 'percentage',
                                          discountPercentage: '10',
                                          discountAmount: '0'
                                        }));
                                      }}
                                    >
                                        💸 10% Discount
                                    </button>
                                </div>
                                <div className="col-6">
                                    <button 
                                      type="button" 
                                      className="btn btn-outline-info btn-sm w-100"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          serviceChargeRate: '5'
                                        }));
                                      }}
                                    >
                                        🔄 5% Service
                                    </button>
                                </div>
                                <div className="col-6">
                                    <button 
                                      type="button" 
                                      className="btn btn-outline-secondary btn-sm w-100"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          discountType: 'amount',
                                          discountAmount: '0',
                                          discountPercentage: '0',
                                          serviceChargeRate: '10',
                                          taxRate: '7',
                                          commissionPercentage: '0',
                                          commissionAmount: '0',
                                          additionalCharges: '0'
                                        }));
                                      }}
                                    >
                                        🔄 Reset All
                                    </button>
                                </div>
                                <div className="col-6">
                                    <button 
                                      type="button" 
                                      className="btn btn-outline-success btn-sm w-100"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          discountType: 'amount',
                                          discountAmount: '100'
                                        }));
                                      }}
                                    >
                                        💰 ฿100 Off
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-sm-12 text-end">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading.saving}
                >
                  {loading.saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Booking'
                  )}
                </button>
            </div>
        </div>
        </form>
    </div>
  )
}

export default RoomBooking