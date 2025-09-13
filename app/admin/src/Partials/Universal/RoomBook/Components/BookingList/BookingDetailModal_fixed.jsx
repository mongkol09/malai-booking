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

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setBooking(null);
      setError(null);
      setSuccess(false);
      setIsEditMode(false);
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestData(prev => ({
      ...prev,
      [name]: value
    }));
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
      
      // TODO: Implement save functionality
      console.log('💾 Saving guest data:', guestData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setIsEditMode(false);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Save error:', error);
      setError('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill guest data from booking
  const prefillGuestData = (bookingData) => {
    const guest = bookingData.guest || {};
    
    setGuestData({
      title: guest.title || 'Mr.',
      firstName: guest.firstName || guest.name?.split(' ')[0] || '',
      lastName: guest.lastName || guest.name?.split(' ').slice(1).join(' ') || '',
      email: guest.email || bookingData.customerEmail || '',
      phone: guest.phone || bookingData.customerPhone || '',
      nationality: guest.nationality || 'Thai',
      dateOfBirth: guest.dateOfBirth || '',
      gender: guest.gender || '',
      address: guest.address || '',
      city: guest.city || '',
      state: guest.state || '',
      postalCode: guest.postalCode || '',
      country: guest.country || 'ไทย',
      passportNumber: guest.passportNumber || '',
      emergencyContact: guest.emergencyContact || '',
      emergencyPhone: guest.emergencyPhone || '',
      specialRequests: bookingData.specialRequests || '',
      dietaryRestrictions: guest.dietaryRestrictions || '',
      accessibilityNeeds: guest.accessibilityNeeds || '',
      bookingType: bookingData.bookingType || '',
      bookingNumber: bookingData.bookingNumber || ''
    });
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
      
      if (bookingsData && bookingsData.success) {
        const allBookings = bookingsData.data?.bookings || bookingsData.data || [];
        
        // Find the specific booking by ID or reference ID
        const foundBooking = allBookings.find(booking => 
          booking.id === bookingId || 
          booking.bookingReferenceId === bookingReferenceId ||
          booking.id === bookingReferenceId
        );

        if (foundBooking) {
          // Transform the booking data to match our component structure
          const transformedBooking = {
            id: foundBooking.id,
            bookingReferenceId: foundBooking.bookingReferenceId,
            status: foundBooking.status,
            
            // Guest information  
            guest: {
              firstName: foundBooking.customerName?.split(' ')[0] || '',
              lastName: foundBooking.customerName?.split(' ').slice(1).join(' ') || '',
              name: foundBooking.customerName,
              email: foundBooking.customerEmail,
              phone: foundBooking.customerPhone,
              country: 'ไทย'
            },
            
            // Room information
            room: {
              number: foundBooking.roomNumber,
              type: foundBooking.roomType
            },
            roomNumber: foundBooking.roomNumber,
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
            specialRequests: foundBooking.specialRequests || '',
            
            // Check availability for actions
            canCheckIn: canCheckIn(foundBooking),
            canCheckOut: canCheckOut(foundBooking)
          };
          
          setBooking(transformedBooking);
          prefillGuestData(transformedBooking);
          console.log('✅ Booking loaded and transformed:', transformedBooking);
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
      <Card className="mb-4">
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
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={guestData.firstName}
                              onChange={handleInputChange}
                              placeholder="ชื่อ"
                              disabled={!isEditMode}
                              required
                            />
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
                              disabled={!isEditMode}
                            />
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
      </Modal.Body>
      
      <Modal.Footer className="justify-content-between">
        <div className="d-flex justify-content-between w-100">
          <div>
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
          
          <div>
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
          .modal-header,
          .modal-footer,
          .btn {
            display: none !important;
          }
          
          .modal {
            position: static !important;
            display: block !important;
            background: white !important;
          }
          
          .modal-dialog {
            max-width: none !important;
            margin: 0 !important;
          }
          
          .modal-body {
            padding: 0 !important;
          }
          
          .card {
            border: 1px solid #ddd !important;
            break-inside: avoid;
          }
          
          .card-header {
            background-color: #f8f9fa !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </Modal>
  );
};

export default BookingDetailModal;
