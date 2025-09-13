import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner, Card, Row, Col, Form, Badge } from 'react-bootstrap';
import bookingService from '../../../../../services/bookingService';

// Helper functions for checking booking status
const canCheckIn = (booking) => {
  return booking?.status === 'confirmed' || booking?.status === 'pending';
};

const canCheckOut = (booking) => {
  return booking?.status === 'checked-in' || booking?.status === 'in-house';
};

const BookingDetailModal = ({ show, onHide, bookingId, bookingReferenceId }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [guestData, setGuestData] = useState({
    title: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: 'Thai',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'ไทย',
    passportNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    specialRequests: '',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    bookingType: '',
    bookingNumber: ''
  });

  // Load booking details when modal opens
  useEffect(() => {
    if (show && (bookingId || bookingReferenceId)) {
      loadBookingDetails();
    }
  }, [show, bookingId, bookingReferenceId]);

  // Debug guest data changes
  useEffect(() => {
    console.log('🔄 Guest data state changed:', guestData);
  }, [guestData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setBooking(null);
      setError(null);
      setSuccess(false);
      setIsEditMode(false); // Reset to view mode when modal closes
      // Reset guest data to default
      setGuestData({
        title: 'Mr.',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: 'Thai',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'ไทย',
        passportNumber: '',
        emergencyContact: '',
        emergencyPhone: '',
        specialRequests: '',
        dietaryRestrictions: '',
        accessibilityNeeds: '',
        bookingType: '',
        bookingNumber: ''
      });
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to reset name fields to clean values
  const resetNameFields = () => {
    if (booking?.customerName) {
      const nameparts = booking.customerName.trim().split(' ');
      const cleanFirstName = nameparts[0] || '';
      const cleanLastName = nameparts.slice(1).join(' ') || '';
      
      setGuestData(prev => ({
        ...prev,
        firstName: cleanFirstName,
        lastName: cleanLastName
      }));
      
      console.log('🧹 Name fields reset to:', { firstName: cleanFirstName, lastName: cleanLastName });
    }
  };

  const handleClose = () => {
    if (isEditMode) {
      const confirmClose = window.confirm('คุณต้องการปิดหน้าต่างโดยไม่บันทึกการเปลี่ยนแปลงหรือไม่?');
      if (!confirmClose) return;
    }
    onHide();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 Saving guest data:', guestData);
      console.log('🔍 Current booking state:', booking);
      console.log('🔍 Props - bookingId:', bookingId, 'bookingReferenceId:', bookingReferenceId);
      
      // Validate required fields
      if (!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.phone) {
        setError('กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, นามสกุล, อีเมล, เบอร์โทร)');
        return;
      }
      
      // Clean up guest data before saving to prevent data corruption
      const cleanGuestData = {
        ...guestData,
        firstName: guestData.firstName.trim(),
        lastName: guestData.lastName.trim(),
        email: guestData.email.trim(),
        phone: guestData.phone.trim()
      };
      
      console.log('🧹 Cleaned guest data:', cleanGuestData);
      console.log('🔍 Detailed cleaned data:', {
        address: cleanGuestData.address,
        city: cleanGuestData.city,
        state: cleanGuestData.state,
        postalCode: cleanGuestData.postalCode,
        country: cleanGuestData.country,
        passportNumber: cleanGuestData.passportNumber,
        emergencyContact: cleanGuestData.emergencyContact,
        emergencyPhone: cleanGuestData.emergencyPhone,
        dateOfBirth: cleanGuestData.dateOfBirth,
        nationality: cleanGuestData.nationality,
        gender: cleanGuestData.gender
      });
      
      // Call API to update guest data
      const currentBookingId = booking?.id || bookingId;
      console.log('🔄 Using booking ID for save:', currentBookingId);
      const response = await bookingService.updateGuestData(currentBookingId, cleanGuestData);
      
      console.log('✅ API response:', response);
      
      // Check if response is successful (200 status means success)
      if (response) {
        setSuccess(true);
        setIsEditMode(false);
        
        // Keep the current guest data state since it has the updated information
        console.log('� Keeping current guest data state (no reload needed)');
        console.log('✅ Current guest data:', cleanGuestData);
        
        // Show success message and hide after delay
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
        
        // Save guest data to localStorage for future modal opens
        const guestCacheKey = `guest_data_${currentBookingId}`;
        localStorage.setItem(guestCacheKey, JSON.stringify(cleanGuestData));
        console.log('💾 Saved guest data to localStorage:', guestCacheKey, cleanGuestData);
        
        console.log('✅ Guest data updated successfully:', response);
      } else {
        throw new Error('Failed to update guest data - no response');
      }
      
    } catch (error) {
      console.error('❌ Save error:', error);
      
      // Handle different types of errors
      let errorMessage = 'ไม่สามารถบันทึกข้อมูลได้';
      
      if (error.response) {
        // HTTP error response
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = 'ไม่พบข้อมูลการจอง';
        } else if (status === 400) {
          errorMessage = data?.error?.message || 'ข้อมูลที่ส่งไม่ถูกต้อง';
        } else if (status === 500) {
          errorMessage = data?.error?.message || 'เกิดข้อผิดพลาดในระบบ';
        } else {
          errorMessage = data?.error?.message || data?.message || errorMessage;
        }
      } else if (error.message) {
        // JavaScript error
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill guest data from booking
  const prefillGuestData = (bookingData) => {
    console.log('🔍 Prefilling guest data from:', bookingData);
    
    // Try to load from localStorage first for complete data
    const guestCacheKey = `guest_data_${bookingData.id || bookingId}`;
    const cachedGuestData = localStorage.getItem(guestCacheKey);
    
    if (cachedGuestData) {
      try {
        const parsedGuestData = JSON.parse(cachedGuestData);
        console.log('💾 Found cached guest data in localStorage:', parsedGuestData);
        setGuestData(parsedGuestData);
        console.log('✅ Used cached guest data from localStorage');
        return;
      } catch (error) {
        console.warn('⚠️ Failed to parse cached guest data:', error);
      }
    }
    
    console.log('📥 No cached data found, using API data');
    
    const guest = bookingData.guest || {};
    const customerName = bookingData.customerName || guest.name || '';
    
    console.log('👤 Guest object:', guest);
    console.log('👤 Customer name:', customerName);
    console.log('📧 Customer email:', bookingData.customerEmail);
    console.log('📱 Customer phone:', bookingData.customerPhone);
    console.log('🔍 Raw guest data fields:', {
      address: guest.address,
      city: guest.city, 
      state: guest.state,
      province: guest.province,
      postalCode: guest.postalCode,
      zipCode: guest.zipCode,
      country: guest.country,
      passportNumber: guest.passportNumber,
      idNumber: guest.idNumber,
      emergencyContact: guest.emergencyContact,
      emergencyPhone: guest.emergencyPhone,
      dateOfBirth: guest.dateOfBirth,
      birthDate: guest.birthDate,
      nationality: guest.nationality,
      gender: guest.gender
    });
    
    // Better name parsing - prioritize clean customer name over potentially corrupted guest data
    let firstName = '';
    let lastName = '';
    
    // If guest data has proper first/last names that don't look corrupted, use them
    if (guest.firstName && guest.lastName && 
        !guest.firstName.includes(guest.lastName) && 
        !guest.lastName.includes(guest.firstName)) {
      firstName = guest.firstName;
      lastName = guest.lastName;
      console.log('✅ Using clean guest firstName/lastName');
    } else if (customerName) {
      // Otherwise parse from customerName
      const nameparts = customerName.trim().split(' ');
      firstName = nameparts[0] || '';
      lastName = nameparts.slice(1).join(' ') || '';
      console.log('✅ Parsing from customerName:', { firstName, lastName });
    }
    
    const guestInfo = {
      title: guest.title || 'Mr.',
      firstName: firstName,
      lastName: lastName,
      email: guest.email || bookingData.customerEmail || '',
      phone: guest.phone || guest.phoneNumber || bookingData.customerPhone || '',
      nationality: guest.nationality || 'Thai',
      dateOfBirth: guest.dateOfBirth || guest.birthDate || '',
      gender: guest.gender || '',
      address: guest.address || '',
      city: guest.city || '',
      state: guest.state || guest.province || '',
      postalCode: guest.postalCode || guest.zipCode || '',
      country: guest.country || 'ไทย',
      passportNumber: guest.passportNumber || guest.idNumber || '',
      emergencyContact: guest.emergencyContact || '',
      emergencyPhone: guest.emergencyPhone || '',
      specialRequests: bookingData.specialRequests || bookingData.notes || '',
      dietaryRestrictions: guest.dietaryRestrictions || '',
      accessibilityNeeds: guest.accessibilityNeeds || '',
      bookingType: bookingData.bookingType || bookingData.type || '',
      bookingNumber: bookingData.bookingNumber || bookingData.bookingReferenceId || ''
    };
    
    console.log('📝 Setting guest data:', guestInfo);
    console.log('🔄 Previous guest data was:', guestData);
    setGuestData(guestInfo);
    console.log('✅ Guest data state should be updated on next render');
  };

  // Load booking details
  const loadBookingDetails = async () => {
    if (!bookingId && !bookingReferenceId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading booking details for:', { bookingId, bookingReferenceId });
      
      // Use admin/all endpoint to get booking data since individual booking endpoint might not be available
      const bookingsData = await bookingService.getAllBookings();
      
      console.log('📊 Raw bookings API response:', bookingsData);
      console.log('📊 Response structure:', {
        success: bookingsData?.success,
        data: bookingsData?.data,
        bookings: bookingsData?.bookings,
        dataKeys: bookingsData?.data ? Object.keys(bookingsData.data) : 'no data'
      });
      
      if (bookingsData) {
        // Try different data structures that the API might return
        let allBookings = [];
        
        // First check if bookings are directly at root level (most common case)
        if (bookingsData.bookings && Array.isArray(bookingsData.bookings)) {
          allBookings = bookingsData.bookings;
          console.log('📋 Using bookingsData.bookings (root level):', allBookings.length, 'bookings');
        } else if (bookingsData.data?.bookings) {
          allBookings = bookingsData.data.bookings;
          console.log('📋 Using bookingsData.data.bookings:', allBookings.length, 'bookings');
        } else if (bookingsData.data && Array.isArray(bookingsData.data)) {
          allBookings = bookingsData.data;
          console.log('📋 Using bookingsData.data (array):', allBookings.length, 'bookings');
        } else if (bookingsData.success && bookingsData.data?.bookings) {
          allBookings = bookingsData.data.bookings;
          console.log('📋 Using bookingsData.data.bookings (with success):', allBookings.length, 'bookings');
        } else {
          console.warn('⚠️ Unknown bookings data structure:', bookingsData);
        }
        
        console.log('🔍 Searching for booking with ID:', { bookingId, bookingReferenceId });
        console.log('🔍 Available bookings sample:', allBookings.slice(0, 2).map(b => ({
          id: b.id,
          bookingReferenceId: b.bookingReferenceId || b.booking_reference_id || b.bookingReference,
          guest: b.guestFirstName || b.guest_first_name || b.firstName,
          keys: Object.keys(b).slice(0, 10)
        })));
        
        // Find the specific booking by ID or reference ID with detailed logging
        const foundBooking = allBookings.find(booking => {
          const matchById = booking.id === bookingId || booking.booking_id === bookingId;
          const matchByRef = booking.bookingReferenceId === bookingReferenceId || 
                           booking.booking_reference_id === bookingReferenceId ||
                           booking.bookingReference === bookingReferenceId ||
                           booking.id === bookingReferenceId;
          
          console.log('🔍 Checking booking:', {
            id: booking.id,
            booking_id: booking.booking_id,
            bookingReferenceId: booking.bookingReferenceId,
            booking_reference_id: booking.booking_reference_id,
            bookingReference: booking.bookingReference,
            matchById,
            matchByRef,
            targetBookingId: bookingId,
            targetBookingReferenceId: bookingReferenceId
          });
          
          return matchById || matchByRef;
        });

        if (foundBooking) {
          console.log('🔍 Found booking raw data:', foundBooking);
          console.log('🏨 Room data:', {
            roomId: foundBooking.roomId,
            roomNumber: foundBooking.roomNumber,
            room_number: foundBooking.room_number,
            roomType: foundBooking.roomType,
            room_type: foundBooking.room_type
          });
          
          // Transform the booking data to match our component structure
          const transformedBooking = {
            id: foundBooking.id,
            bookingReferenceId: foundBooking.bookingReferenceId,
            status: foundBooking.status,
            
            // Guest information - more comprehensive extraction
            guest: {
              firstName: foundBooking.guest?.firstName || foundBooking.customerName?.split(' ')[0] || '',
              lastName: foundBooking.guest?.lastName || foundBooking.customerName?.split(' ').slice(1).join(' ') || '',
              name: foundBooking.customerName || foundBooking.guest?.name || '',
              email: foundBooking.customerEmail || foundBooking.guest?.email || '',
              phone: foundBooking.customerPhone || foundBooking.guest?.phone || foundBooking.guest?.phoneNumber || '',
              phoneNumber: foundBooking.customerPhone || foundBooking.guest?.phone || foundBooking.guest?.phoneNumber || '',
              country: foundBooking.guest?.country || 'ไทย',
              nationality: foundBooking.guest?.nationality || 'Thai',
              // Additional guest fields
              title: foundBooking.guest?.title || 'Mr.',
              dateOfBirth: foundBooking.guest?.dateOfBirth || foundBooking.guest?.birthDate || '',
              gender: foundBooking.guest?.gender || '',
              address: foundBooking.guest?.address || '',
              city: foundBooking.guest?.city || '',
              state: foundBooking.guest?.state || foundBooking.guest?.province || '',
              postalCode: foundBooking.guest?.postalCode || foundBooking.guest?.zipCode || '',
              passportNumber: foundBooking.guest?.passportNumber || foundBooking.guest?.idNumber || '',
              emergencyContact: foundBooking.guest?.emergencyContact || '',
              emergencyPhone: foundBooking.guest?.emergencyPhone || '',
              dietaryRestrictions: foundBooking.guest?.dietaryRestrictions || '',
              accessibilityNeeds: foundBooking.guest?.accessibilityNeeds || ''
            },
            
            // Direct customer fields for fallback
            customerName: foundBooking.customerName,
            customerEmail: foundBooking.customerEmail,
            customerPhone: foundBooking.customerPhone,
            
            // Room information
            room: {
              number: foundBooking.roomId || foundBooking.roomNumber || foundBooking.room_number,
              type: foundBooking.roomType
            },
            roomNumber: foundBooking.roomId || foundBooking.roomNumber || foundBooking.room_number,
            roomType: foundBooking.roomType,
            
            // Dates
            checkinDate: foundBooking.checkInDate,
            checkoutDate: foundBooking.checkOutDate,
            checkInDate: foundBooking.checkInDate,
            checkOutDate: foundBooking.checkOutDate,
            
            // Payment information
            totalAmount: foundBooking.totalAmount,
            finalAmount: foundBooking.totalAmount,
            paidAmount: foundBooking.paidAmount || 0,
            dueAmount: (foundBooking.totalAmount || 0) - (foundBooking.paidAmount || 0),
            
            // Additional info
            source: foundBooking.source,
            createdAt: foundBooking.createdAt,
            updatedAt: foundBooking.updatedAt,
            specialRequests: foundBooking.specialRequests || foundBooking.notes || '',
            bookingType: foundBooking.bookingType || foundBooking.type || '',
            bookingNumber: foundBooking.bookingNumber || foundBooking.bookingReferenceId || '',
            
            // Check availability for actions
            canCheckIn: canCheckIn(foundBooking),
            canCheckOut: canCheckOut(foundBooking)
          };
          
          console.log('✅ Transformed booking data:', transformedBooking);
          setBooking(transformedBooking);
          
          // Prefill guest data from booking data
          prefillGuestData(transformedBooking);
          
          console.log('✅ Booking loaded and transformed with prefilled data');
        } else {
          setError('ไม่พบข้อมูลการจอง');
        }
      } else {
        setError('ไม่สามารถโหลดข้อมูลการจองได้');
      }
    } catch (error) {
      console.error('❌ Load booking error:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handlePrint = () => {
    // Add print date to footer
    const printFooter = document.getElementById('print-date-footer');
    if (printFooter) {
      const currentDate = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      printFooter.textContent = `Printed on: ${currentDate} | Document generated by Malai Wellness Khoayai`;
    }
    
    // Trigger print immediately
    window.print();
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      console.log('🏨 Check-in for booking:', booking.id);
      // TODO: Implement check-in API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('เช็คอินสำเร็จ!');
    } catch (error) {
      console.error('❌ Check-in error:', error);
      setError('ไม่สามารถเช็คอินได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      console.log('🏨 Check-out for booking:', booking.id);
      // TODO: Implement check-out API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('เช็คเอาท์สำเร็จ!');
    } catch (error) {
      console.error('❌ Check-out error:', error);
      setError('ไม่สามารถเช็คเอาท์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      console.log('📧 Sending email for booking:', booking.id);
      // TODO: Implement email API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('ส่งอีเมลสำเร็จ!');
    } catch (error) {
      console.error('❌ Email error:', error);
      setError('ไม่สามารถส่งอีเมลได้');
    } finally {
      setLoading(false);
    }
  };

  // Render payment status
  const renderPaymentStatus = () => {
    if (!booking) return null;

    const totalAmount = parseFloat(booking.totalAmount || 0);
    const paidAmount = parseFloat(booking.paidAmount || 0);
    const dueAmount = totalAmount - paidAmount;

    return (
      <Card className="mb-4 payment-status">
        <Card.Header>
          <h6 className="mb-0">
            <i className="bi bi-credit-card me-2"></i>
            สถานะการชำระเงิน
          </h6>
        </Card.Header>
        <Card.Body>
          <Row className="text-center">
            <Col md={4}>
              <div className="border-end">
                <h5 className="text-primary mb-1">฿{totalAmount.toLocaleString()}</h5>
                <small className="text-muted">ยอดรวม</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="border-end">
                <h5 className="text-success mb-1">฿{paidAmount.toLocaleString()}</h5>
                <small className="text-muted">ชำระแล้ว</small>
              </div>
            </Col>
            <Col md={4}>
              <h5 className={`mb-1 ${dueAmount > 0 ? 'text-danger' : 'text-success'}`}>
                ฿{dueAmount.toLocaleString()}
              </h5>
              <small className="text-muted">คงเหลือ</small>
            </Col>
          </Row>
          <hr />
          <div className="text-center">
            <Badge bg={dueAmount > 0 ? 'warning' : 'success'} className="fs-6 px-3 py-2">
              {dueAmount > 0 ? 'ยังไม่ชำระครบ' : 'ชำระครบแล้ว'}
            </Badge>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading && !booking) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">กำลังโหลดข้อมูลการจอง...</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl" 
      backdrop="static"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-receipt me-2"></i>
          รายละเอียดการจอง - {booking?.bookingReferenceId || bookingId}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Print Header - only visible during print */}
        <div className="print-header d-none">
          <h1 className="text-center mb-4">HOTEL BOOKING CONFIRMATION</h1>
          <hr className="border-2 border-dark" />
        </div>

        {loading && (
          <div className="text-center p-3">
            <Spinner animation="border" role="status" className="me-2" />
            กำลังโหลดข้อมูล...
          </div>
        )}

        {error && (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <i className="bi bi-check-circle me-2"></i>
            บันทึกข้อมูลสำเร็จ!
          </Alert>
        )}

        {booking && (
          <>
            {/* Payment Status Section */}
            {renderPaymentStatus()}

            {/* Booking Information Summary */}
            <Card className="mb-4 booking-summary">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  ข้อมูลการจอง
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="mb-3">
                      <label className="form-label text-muted">หมายเลขการจอง</label>
                      <div className="fw-bold">{booking.bookingReferenceId}</div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="mb-3">
                      <label className="form-label text-muted">สถานะ</label>
                      <div>
                        <Badge bg="primary" className="fs-6 px-3 py-2">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="mb-3">
                      <label className="form-label text-muted">ห้อง</label>
                      <div>
                        {booking.roomNumber ? (
                          <Badge bg="info" className="fs-6 px-3 py-2">
                            <i className="bi bi-door-open me-1"></i>
                            {booking.roomNumber}
                          </Badge>
                        ) : (
                          <span className="text-muted">ยังไม่มีห้อง</span>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="mb-3">
                      <label className="form-label text-muted">ประเภทห้อง</label>
                      <div className="fw-bold">{booking.roomType || 'ไม่ระบุ'}</div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <div className="mb-3">
                      <label className="form-label text-muted">วันที่เช็คอิน</label>
                      <div className="fw-bold">
                        {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <label className="form-label text-muted">วันที่เช็คเอาท์</label>
                      <div className="fw-bold">
                        {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <label className="form-label text-muted">แหล่งที่มา</label>
                      <div className="fw-bold">{booking.source || 'ไม่ระบุ'}</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Guest Data Form */}
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-person me-2"></i>
                  ข้อมูลลูกค้า
                </h6>
                <div>
                  {!isEditMode ? (
                    <Button variant="outline-primary" size="sm" onClick={() => setIsEditMode(true)}>
                      <i className="bi bi-pencil me-1"></i>
                      แก้ไข
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => setIsEditMode(false)}>
                        ยกเลิก
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSave} disabled={loading}>
                        <i className="bi bi-save me-1"></i>
                        บันทึก
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="card-body">
                <Form>
                  {/* Basic Information */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-person me-2"></i>
                        ข้อมูลพื้นฐาน
                      </h6>
                    </div>
                    <div className="card-body">
                      <Row>
                        <Col md={2}>
                          <Form.Group className="mb-3">
                            <Form.Label>คำนำหน้า</Form.Label>
                            <Form.Select
                              name="title"
                              value={guestData.title}
                              onChange={handleInputChange}
                              disabled={!isEditMode}
                            >
                              <option value="Mr.">นาย</option>
                              <option value="Mrs.">นาง</option>
                              <option value="Ms.">นางสาว</option>
                              <option value="Dr.">ดร.</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={5}>
                          <Form.Group className="mb-3">
                            <Form.Label>ชื่อ <span className="text-danger">*</span></Form.Label>
                            <div className="d-flex">
                              <Form.Control
                                type="text"
                                name="firstName"
                                value={guestData.firstName}
                                onChange={handleInputChange}
                                placeholder="ชื่อ"
                                disabled={!isEditMode}
                                required
                                className="me-2"
                              />
                              {isEditMode && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={resetNameFields}
                                  title="รีเซ็ตชื่อ-นามสกุล"
                                  className="flex-shrink-0"
                                >
                                  <i className="bi bi-arrow-clockwise"></i>
                                </Button>
                              )}
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={5}>
                          <Form.Group className="mb-3">
                            <Form.Label>นามสกุล <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={guestData.lastName}
                              onChange={handleInputChange}
                              placeholder="นามสกุล"
                              disabled={!isEditMode}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>อีเมล <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={guestData.email}
                              onChange={handleInputChange}
                              placeholder="email@example.com"
                              disabled={!isEditMode}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>เบอร์โทรศัพท์ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={guestData.phone}
                              onChange={handleInputChange}
                              placeholder="หมายเลขโทรศัพท์"
                              disabled={!isEditMode}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>สัญชาติ</Form.Label>
                            <Form.Select
                              name="nationality"
                              value={guestData.nationality}
                              onChange={handleInputChange}
                              disabled={!isEditMode}
                            >
                              <option value="Thai">ไทย</option>
                              <option value="American">อเมริกัน</option>
                              <option value="British">อังกฤษ</option>
                              <option value="Chinese">จีน</option>
                              <option value="Japanese">ญี่ปุ่น</option>
                              <option value="Other">อื่นๆ</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>วันเกิด</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateOfBirth"
                              value={guestData.dateOfBirth}
                              onChange={handleInputChange}
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>เพศ</Form.Label>
                            <Form.Select
                              name="gender"
                              value={guestData.gender}
                              onChange={handleInputChange}
                              disabled={!isEditMode}
                            >
                              <option value="">เลือกเพศ</option>
                              <option value="Male">ชาย</option>
                              <option value="Female">หญิง</option>
                              <option value="Other">อื่นๆ</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </div>
                  
                  {/* Address Information */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-geo-alt me-2"></i>
                        ที่อยู่
                      </h6>
                    </div>
                    <div className="card-body">
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>ที่อยู่</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="address"
                              value={guestData.address}
                              onChange={handleInputChange}
                              placeholder="ที่อยู่เป็นภาษาอังกฤษ"
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>เมือง</Form.Label>
                            <Form.Control
                              type="text"
                              name="city"
                              value={guestData.city}
                              onChange={handleInputChange}
                              placeholder="เมือง"
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>รัฐ/จังหวัด</Form.Label>
                            <Form.Control
                              type="text"
                              name="state"
                              value={guestData.state}
                              onChange={handleInputChange}
                              placeholder="รัฐ/จังหวัด"
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>รหัสไปรษณีย์</Form.Label>
                            <Form.Control
                              type="text"
                              name="postalCode"
                              value={guestData.postalCode}
                              onChange={handleInputChange}
                              placeholder="รหัสไปรษณีย์"
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>ประเทศ</Form.Label>
                            <Form.Control
                              type="text"
                              name="country"
                              value={guestData.country}
                              onChange={handleInputChange}
                              placeholder="ประเทศ"
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </div>
                  
                  {/* Document Information */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-card-text me-2"></i>
                        เอกสารประจำตัว
                      </h6>
                    </div>
                    <div className="card-body">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>หมายเลขหนังสือเดินทาง</Form.Label>
                            <Form.Control
                              type="text"
                              name="passportNumber"
                              value={guestData.passportNumber}
                              onChange={handleInputChange}
                              placeholder="หมายเลขหนังสือเดินทาง"
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </div>
                  
                  {/* Emergency Contact */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-telephone me-2"></i>
                        ติดต่อฉุกเฉิน
                      </h6>
                    </div>
                    <div className="card-body">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>ชื่อผู้ติดต่อฉุกเฉิน</Form.Label>
                            <Form.Control
                              type="text"
                              name="emergencyContact"
                              value={guestData.emergencyContact}
                              onChange={handleInputChange}
                              placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>เบอร์โทรฉุกเฉิน</Form.Label>
                            <Form.Control
                              type="tel"
                              name="emergencyPhone"
                              value={guestData.emergencyPhone}
                              onChange={handleInputChange}
                              placeholder="เบอร์โทรฉุกเฉิน"
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </div>
                  
                  {/* Booking Information */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-calendar-check me-2"></i>
                        รายละเอียดการจอง
                      </h6>
                    </div>
                    <div className="card-body">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>ประเภทบุคคลการจอง</Form.Label>
                            <Form.Select
                              name="bookingType"
                              value={guestData.bookingType}
                              onChange={handleInputChange}
                              disabled={!isEditMode}
                            >
                              <option value="">ระบุประเภทบุคคลการจอง</option>
                              <option value="individual">บุคคลทั่วไป</option>
                              <option value="corporate">องค์กร/บริษัท</option>
                              <option value="agent">ตัวแทนท่องเที่ยว</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>เลขที่บุคคลการจอง</Form.Label>
                            <Form.Control
                              type="text"
                              name="bookingNumber"
                              value={guestData.bookingNumber}
                              onChange={handleInputChange}
                              placeholder="ระบุเลขที่บุคคลการจอง"
                              disabled={true}
                              className="bg-light"
                              style={{ cursor: 'not-allowed' }}
                              title="เลขที่การจองไม่สามารถแก้ไขได้"
                            />
                            <Form.Text className="text-muted">
                              <small>🔒 เลขที่การจองเป็นข้อมูลที่ไม่สามารถแก้ไขได้</small>
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>ความต้องการพิเศษ (ถ้ามี)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="specialRequests"
                              value={guestData.specialRequests}
                              onChange={handleInputChange}
                              placeholder="ระบุความต้องการพิเศษ..."
                              disabled={!isEditMode}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </>
        )}

        {/* Print Footer - only visible during print */}
        <div className="print-footer d-none">
          <hr className="border-1 border-secondary" />
          <p className="text-center text-muted mb-0" id="print-date-footer">
            Document generated by Hotel Management System
          </p>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="justify-content-between">
        <div className="d-flex justify-content-between w-100">
          <div className="action-buttons">
            {booking && (
              <>
                {booking.canCheckIn && (
                  <Button variant="success" className="me-2" onClick={handleCheckIn} disabled={loading}>
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    เช็คอิน
                  </Button>
                )}
                {booking.canCheckOut && (
                  <Button variant="warning" className="me-2" onClick={handleCheckOut} disabled={loading}>
                    <i className="bi bi-box-arrow-right me-1"></i>
                    เช็คเอาท์
                  </Button>
                )}
                <Button variant="outline-info" className="me-2" onClick={handleSendEmail} disabled={loading}>
                  <i className="bi bi-envelope me-1"></i>
                  ส่งอีเมล
                </Button>
              </>
            )}
          </div>
          
          <div className="print-button">
            <Button variant="info" className="me-2" onClick={handlePrint} disabled={loading}>
              <i className="bi bi-printer me-1"></i>
              พิมพ์
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              ปิด
            </Button>
          </div>
        </div>
      </Modal.Footer>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Page setup */
          @page {
            size: A4;
            margin: 15mm;
          }
          
          /* Reset page margins and hide everything first */
          * {
            visibility: hidden;
          }
          
          /* Show only the modal and its contents */
          .modal,
          .modal *,
          .modal-dialog,
          .modal-dialog *,
          .modal-content,
          .modal-content *,
          .modal-body,
          .modal-body * {
            visibility: visible !important;
          }
          
          /* Hide browser chrome */
          .modal-backdrop {
            display: none !important;
          }
          
          /* Hide interactive elements */
          .modal-header,
          .modal-footer,
          .btn,
          .action-buttons,
          .print-button,
          button,
          .alert,
          .spinner-border {
            visibility: hidden !important;
            display: none !important;
          }
          
          /* Show print-specific elements */
          .print-header,
          .print-footer {
            visibility: visible !important;
            display: block !important;
          }
          
          /* Compact layout for print */
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
          }
          
          .modal {
            position: static !important;
            display: block !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .modal-dialog {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .modal-content {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          
          .modal-body {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Compact header */
          .print-header {
            margin-bottom: 15px !important;
          }
          
          .print-header h1 {
            font-size: 18px !important;
            font-weight: bold !important;
            color: #000 !important;
            margin-bottom: 10px !important;
            text-align: center !important;
          }
          
          .print-header hr {
            margin: 8px 0 !important;
            border-color: #333 !important;
          }
          
          /* Compact cards */
          .card {
            border: 1px solid #ddd !important;
            break-inside: avoid;
            margin-bottom: 8px !important;
            background: white !important;
            page-break-inside: avoid;
          }
          
          .card-header {
            background-color: #f8f9fa !important;
            -webkit-print-color-adjust: exact;
            font-weight: bold !important;
            border-bottom: 1px solid #ddd !important;
            padding: 6px 10px !important;
            font-size: 13px !important;
          }
          
          .card-body {
            padding: 8px 10px !important;
          }
          
          /* Compact rows and columns */
          .row {
            margin: 0 !important;
            page-break-inside: avoid;
          }
          
          .col,
          .col-md-6,
          .col-md-4,
          .col-md-3 {
            padding: 2px 5px !important;
          }
          
          .mb-3 {
            margin-bottom: 8px !important;
          }
          
          .mb-4 {
            margin-bottom: 10px !important;
          }
          
          /* Typography */
          .form-label {
            font-weight: bold !important;
            color: #000 !important;
            font-size: 10px !important;
            margin-bottom: 2px !important;
            text-transform: uppercase;
          }
          
          .fw-bold {
            font-weight: bold !important;
            color: #000 !important;
            font-size: 12px !important;
          }
          
          .badge {
            background-color: #333 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            font-size: 10px !important;
            padding: 2px 6px !important;
          }
          
          /* Form elements */
          .form-control {
            border: 1px solid #ccc !important;
            padding: 2px 4px !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact;
          }
          
          /* Make sure form values are visible in print */
          input[type="text"],
          input[type="email"],
          input[type="tel"],
          input[type="date"],
          select,
          textarea {
            color: #000 !important;
            background: white !important;
            border: 1px solid #999 !important;
            -webkit-print-color-adjust: exact;
          }
          
          /* Payment status styling */
          .alert-success {
            background-color: #d4edda !important;
            border-color: #c3e6cb !important;
            color: #155724 !important;
            -webkit-print-color-adjust: exact;
            padding: 5px 8px !important;
            font-size: 11px !important;
          }
          
          .alert-warning {
            background-color: #fff3cd !important;
            border-color: #ffeaa7 !important;
            color: #856404 !important;
            -webkit-print-color-adjust: exact;
            padding: 5px 8px !important;
            font-size: 11px !important;
          }
          
          /* Compact footer */
          .print-footer {
            margin-top: 15px !important;
            font-size: 9px !important;
            color: #666 !important;
            page-break-inside: avoid;
          }
          
          .print-footer hr {
            margin: 5px 0 !important;
          }
          
          /* Hide empty or unnecessary sections */
          .d-none {
            display: block !important;
          }
          
          /* Ensure no page breaks in critical sections */
          .payment-status,
          .booking-summary {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </Modal>
  );
};

export default BookingDetailModal;
