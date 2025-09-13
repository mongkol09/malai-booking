import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner, Card, Row, Col, Form, Badge } from 'react-bootstrap';
import bookingService from '../../../../../services/bookingService';

const BookingDetailModal = ({ show, onHide, bookingId }) => {
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
    country: '',
    zipCode: '',
    idType: 'National ID',
    idNumber: '',
    passportNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    specialRequests: '',
    dietaryRestrictions: '',
    accessibilityNeeds: ''
  });

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '฿0.00';
    return `฿${parseFloat(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'checked-in': return 'info';
      case 'checked-out': return 'secondary';
      default: return 'primary';
    }
  };

  // Prefill guest data from booking
  const prefillGuestData = (bookingData) => {
    if (!bookingData) return;

    const guest = bookingData.guest || {};
    setGuestData({
      title: guest.title || 'Mr.',
      firstName: guest.firstName || guest.name?.split(' ')[0] || '',
      lastName: guest.lastName || guest.name?.split(' ').slice(1).join(' ') || '',
      email: guest.email || '',
      phone: guest.phone || '',
      nationality: guest.nationality || 'Thai',
      dateOfBirth: guest.dateOfBirth || '',
      gender: guest.gender || '',
      address: guest.address || '',
      city: guest.city || '',
      state: guest.state || '',
      country: guest.country || '',
      zipCode: guest.zipCode || '',
      idType: guest.idType || 'National ID',
      idNumber: guest.idNumber || '',
      passportNumber: guest.passportNumber || '',
      emergencyContact: guest.emergencyContact || '',
      emergencyPhone: guest.emergencyPhone || '',
      specialRequests: bookingData.specialRequests || '',
      dietaryRestrictions: guest.dietaryRestrictions || '',
      accessibilityNeeds: guest.accessibilityNeeds || ''
    });
  };

  // Load booking details
  const loadBookingDetails = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading booking details for ID:', bookingId);
      
      const response = await bookingService.getBookingById(bookingId);
      
      if (response.success && response.booking) {
        setBooking(response.booking);
        prefillGuestData(response.booking);
        console.log('✅ Booking loaded:', response.booking);
      } else {
        setError('ไม่พบข้อมูลการจอง');
      }
    } catch (err) {
      console.error('❌ Error loading booking:', err);
      setError(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load booking when modal opens
  useEffect(() => {
    if (show && bookingId) {
      loadBookingDetails();
    }
  }, [show, bookingId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 Saving guest data:', guestData);
      
      // TODO: Call API to update guest data
      const response = await bookingService.updateGuestData(booking.id, guestData);
      
      if (response.success) {
        setSuccess(true);
        setIsEditMode(false);
        
        // Reload booking data
        await loadBookingDetails();
        
        // Show success message
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('❌ Error saving guest data:', err);
      setError(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsEditMode(false);
    setError(null);
    setSuccess(false);
    onHide();
  };

  const renderPaymentStatus = () => {
    if (!booking) return null;
    
    return (
      <Card className="mb-3">
        <Card.Header className="bg-info text-white">
          <h6 className="mb-0">
            <i className="bi bi-credit-card me-2"></i>
            สถานะการชำระเงิน
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <strong>ราคารวม:</strong><br />
              {formatCurrency(booking.totalAmount || booking.finalAmount)}
            </Col>
            <Col md={4}>
              <strong>ยอดชำระแล้ว:</strong><br />
              {formatCurrency(booking.paidAmount || 0)}
            </Col>
            <Col md={4}>
              <strong>คงเหลือ:</strong><br />
              <span className={parseFloat(booking.dueAmount || 0) > 0 ? 'text-danger' : 'text-success'}>
                {formatCurrency(booking.dueAmount || 0)}
              </span>
            </Col>
          </Row>
          <hr />
          <div className="text-center">
            <Badge bg={parseFloat(booking.dueAmount || 0) > 0 ? 'warning' : 'success'} className="fs-6 px-3 py-2">
              {parseFloat(booking.dueAmount || 0) > 0 ? 'ยังไม่ชำระครบ' : 'ชำระครบแล้ว'}
            </Badge>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
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
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
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
              </Card.Header>
              
              <Card.Body>
                {/* Basic Information */}
                <h6 className="border-bottom pb-2 mb-3">
                  <i className="bi bi-person-fill me-2"></i>
                  ข้อมูลพื้นฐาน
                </h6>
                
                <Row className="mb-3">
                  <Col md={2}>
                    <Form.Group>
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
                    <Form.Group>
                      <Form.Label>ชื่อ *</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={guestData.firstName}
                        onChange={handleInputChange}
                        placeholder="ชื่อ"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>นามสกุล *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={guestData.lastName}
                        onChange={handleInputChange}
                        placeholder="นามสกุล"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>อีเมล *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={guestData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>เบอร์โทรศัพท์ *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={guestData.phone}
                        onChange={handleInputChange}
                        placeholder="หมายเลขโทรศัพท์"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
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

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
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
                    <Form.Group>
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

                {/* Address Information */}
                <h6 className="border-bottom pb-2 mb-3 mt-4">
                  <i className="bi bi-geo-alt me-2"></i>
                  ที่อยู่
                </h6>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>ที่อยู่</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={guestData.address}
                        onChange={handleInputChange}
                        placeholder="ที่อยู่รายละเอียด"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
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
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>จังหวัด</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={guestData.state}
                        onChange={handleInputChange}
                        placeholder="จังหวัด"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
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
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>รหัสไปรษณีย์</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={guestData.zipCode}
                        onChange={handleInputChange}
                        placeholder="รหัสไปรษณีย์"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* ID Documents */}
                <h6 className="border-bottom pb-2 mb-3 mt-4">
                  <i className="bi bi-card-text me-2"></i>
                  เอกสารประจำตัว
                </h6>
                
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>ประเภทบัตร</Form.Label>
                      <Form.Select
                        name="idType"
                        value={guestData.idType}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                      >
                        <option value="National ID">บัตรประชาชน</option>
                        <option value="Passport">พาสปอร์ต</option>
                        <option value="Driver License">ใบขับขี่</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>เลขบัตรประจำตัว</Form.Label>
                      <Form.Control
                        type="text"
                        name="idNumber"
                        value={guestData.idNumber}
                        onChange={handleInputChange}
                        placeholder="เลขบัตรประจำตัว"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>เลขพาสปอร์ต</Form.Label>
                      <Form.Control
                        type="text"
                        name="passportNumber"
                        value={guestData.passportNumber}
                        onChange={handleInputChange}
                        placeholder="เลขพาสปอร์ต"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Emergency Contact */}
                <h6 className="border-bottom pb-2 mb-3 mt-4">
                  <i className="bi bi-telephone me-2"></i>
                  ติดต่อฉุกเฉิน
                </h6>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
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
                    <Form.Group>
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

                {/* Special Requests */}
                <h6 className="border-bottom pb-2 mb-3 mt-4">
                  <i className="bi bi-star me-2"></i>
                  ความต้องการพิเศษ
                </h6>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>ข้อความพิเศษ</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="specialRequests"
                        value={guestData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="ความต้องการพิเศษ เช่น ห้องสูบบุหรี่, ช่วงเวลา Check-in พิเศษ, อาหารพิเศษ"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>ข้อจำกัดทางอาหาร</Form.Label>
                      <Form.Control
                        type="text"
                        name="dietaryRestrictions"
                        value={guestData.dietaryRestrictions}
                        onChange={handleInputChange}
                        placeholder="เช่น มังสวิรัติ, ไม่กินหมู, ไม่กินกลูเต็น"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>ความต้องการพิเศษ (ด้านการเข้าถึง)</Form.Label>
                      <Form.Control
                        type="text"
                        name="accessibilityNeeds"
                        value={guestData.accessibilityNeeds}
                        onChange={handleInputChange}
                        placeholder="เช่น รถเข็น, ห้องเข้าถึงง่าย, อุปกรณ์ช่วยได้ยิน"
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          ปิด
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingDetailModal;
