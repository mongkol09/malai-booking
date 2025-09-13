import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner, Badge, Card } from 'react-bootstrap';
import bookingService from '../../../../../services/bookingService';
import PaymentStatusCard from './PaymentStatusCard';

const BookingDetailModal = ({ show, onHide, bookingId, bookingReferenceId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [guestData, setGuestData] = useState({
    // Basic Info (from Quick Booking)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Additional Info (to be completed)
    nationality: 'Thai',
    dateOfBirth: '',
    gender: '',
    title: 'Mr.',
    
    // Address Info
    address: '',
    city: '',
    state: '',
    country: 'Thailand',
    zipCode: '',
    
    // ID Document Info
    idType: 'National ID',
    idNumber: '',
    passportNumber: '',
    
    // Contact Info
    emergencyContact: '',
    emergencyPhone: '',
    
    // Preferences
    specialRequests: '',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    
    // Company Info (optional)
    company: '',
    companyAddress: '',
    taxId: '',
    
    // Marketing
    marketingConsent: false,
    newsletterSubscription: false
  });

  useEffect(() => {
    if (show && (bookingId || bookingReferenceId)) {
      loadBookingDetails();
    }
  }, [show, bookingId, bookingReferenceId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      let bookingData;
      // ใช้ API ที่เหมาะสมตาม parameter ที่ได้รับ
      if (bookingReferenceId) {
        console.log('📋 Loading booking by reference ID:', bookingReferenceId);
        bookingData = await bookingService.getBookingByQR(bookingReferenceId);
      } else if (bookingId) {
        console.log('📋 Loading booking by ID:', bookingId);
        bookingData = await bookingService.getBookingById(bookingId);
      } else {
        setError('ไม่พบ booking ID หรือ reference ID');
        return;
      }

      if (bookingData) {
        setBooking(bookingData);
        
        // Pre-fill guest data form
        setGuestData(prev => ({
          ...prev,
          firstName: bookingData.customerName?.split(' ')[0] || bookingData.guest?.firstName || '',
          lastName: bookingData.customerName?.split(' ').slice(1).join(' ') || bookingData.guest?.lastName || '',
          email: bookingData.customerEmail || bookingData.guest?.email || '',
          phone: bookingData.customerPhone || bookingData.guest?.phoneNumber || bookingData.guest?.phone || '',
          nationality: bookingData.guest?.nationality || 'Thai',
          dateOfBirth: bookingData.guest?.dateOfBirth || '',
          gender: bookingData.guest?.gender || '',
          title: bookingData.guest?.title || 'Mr.',
          address: bookingData.guest?.address || '',
          city: bookingData.guest?.city || '',
          state: bookingData.guest?.state || '',
          country: bookingData.guest?.country || 'Thailand',
          zipCode: bookingData.guest?.zipCode || '',
          idType: bookingData.guest?.idType || 'National ID',
          idNumber: bookingData.guest?.idNumber || '',
          passportNumber: bookingData.guest?.passportNumber || '',
          emergencyContact: bookingData.guest?.emergencyContact || '',
          emergencyPhone: bookingData.guest?.emergencyPhone || '',
          specialRequests: bookingData.specialRequests || '',
          dietaryRestrictions: bookingData.guest?.dietaryRestrictions || '',
          accessibilityNeeds: bookingData.guest?.accessibilityNeeds || '',
          company: bookingData.guest?.company || '',
          companyAddress: bookingData.guest?.companyAddress || '',
          taxId: bookingData.guest?.taxId || '',
          marketingConsent: bookingData.guest?.marketingConsent || false,
          newsletterSubscription: bookingData.guest?.newsletterSubscription || false
        }));
      } else {
        setError('ไม่พบข้อมูลการจอง');
      }
    } catch (err) {
      console.error('❌ Error loading booking details:', err);
      setError(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'inhouse': case 'in-house': return 'primary';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return `฿${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGuestData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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
              <strong>ราคาสุทธิ:</strong><br />
              {formatCurrency(booking.paidAmount || 0)}
            </Col>
            <Col md={4}>
              <strong>ข้าระหนี่:</strong><br />
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

  const handleAction = async (action) => {
    try {
      setLoading(true);
      let result;
      
      switch (action) {
        case 'checkin':
          result = await bookingService.processCheckIn(booking.id);
          break;
        case 'checkout':
          result = await bookingService.processCheckOut(booking.id);
          break;
        default:
          console.warn('Unknown action:', action);
          return;
      }

      if (result) {
        // รีโหลดข้อมูลหลังจากดำเนินการ
        await loadBookingDetails();
        alert(`${action === 'checkin' ? 'เช็คอิน' : 'เช็คเอาท์'}สำเร็จ!`);
      }
    } catch (err) {
      console.error(`❌ ${action} failed:`, err);
      alert(`${action === 'checkin' ? 'เช็คอิน' : 'เช็คเอาท์'}ไม่สำเร็จ: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
          <div>
            {/* Booking Status & Actions */}
            <Row className="mb-4">
              <Col md={8}>
                <h5>
                  สถานะการจอง: 
                  <Badge 
                    bg={getStatusBadgeVariant(booking.status)} 
                    className="ms-2"
                  >
                    {booking.status}
                  </Badge>
                </h5>
              </Col>
              <Col md={4} className="text-end">
                {booking.canCheckIn && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleAction('checkin')}
                    disabled={loading}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    เช็คอิน
                  </Button>
                )}
                {booking.canCheckOut && (
                  <Button 
                    variant="warning" 
                    size="sm"
                    onClick={() => handleAction('checkout')}
                    disabled={loading}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    เช็คเอาท์
                  </Button>
                )}
              </Col>
            </Row>

            <Row>
              {/* Guest Information */}
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <i className="bi bi-person me-2"></i>
                    ข้อมูลแขก
                  </Card.Header>
                  <Card.Body>
                    <p><strong>ชื่อ:</strong> {booking.guest?.name || 'ไม่ระบุ'}</p>
                    <p><strong>อีเมล:</strong> {booking.guest?.email || 'ไม่ระบุ'}</p>
                    <p><strong>เบอร์โทร:</strong> {booking.guest?.phone || 'ไม่ระบุ'}</p>
                    <p><strong>ประเทศ:</strong> {booking.guest?.country || 'ไม่ระบุ'}</p>
                    {booking.guests && (
                      <p>
                        <strong>จำนวนแขก:</strong> 
                        {` ${booking.guests.adults || 0} ผู้ใหญ่`}
                        {booking.guests.children > 0 && `, ${booking.guests.children} เด็ก`}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Room Information */}
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <i className="bi bi-house me-2"></i>
                    ข้อมูลห้องพัก
                  </Card.Header>
                  <Card.Body>
                    <p><strong>หมายเลขห้อง:</strong> {booking.room?.number || 'ยังไม่ได้จัดห้อง'}</p>
                    <p><strong>ประเภทห้อง:</strong> {booking.room?.type || 'ไม่ระบุ'}</p>
                    <p><strong>เช็คอิน:</strong> {formatDate(booking.dates?.checkin)}</p>
                    <p><strong>เช็คเอาท์:</strong> {formatDate(booking.dates?.checkout)}</p>
                    {booking.specialRequests && (
                      <p><strong>ความต้องการพิเศษ:</strong> {booking.specialRequests}</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              {/* Pricing Information */}
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <i className="bi bi-calculator me-2"></i>
                    ข้อมูลราคา
                  </Card.Header>
                  <Card.Body>
                    <p><strong>ราคารวม:</strong> {formatCurrency(booking.pricing?.totalAmount)}</p>
                    <p><strong>ราคาสุทธิ:</strong> {formatCurrency(booking.pricing?.finalAmount)}</p>
                    <p><strong>ชำระแล้ว:</strong> {formatCurrency(booking.pricing?.paidAmount)}</p>
                    {booking.pricing?.dueAmount > 0 && (
                      <p className="text-danger">
                        <strong>ค้างชำระ:</strong> {formatCurrency(booking.pricing?.dueAmount)}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Payment Information */}
              <Col md={6}>
                {booking.payments && booking.payments.length > 0 ? (
                  <PaymentStatusCard 
                    paymentId={booking.payments[0].id}
                    bookingId={booking.id}
                    compact={false}
                  />
                ) : (
                  <Card className="mb-3">
                    <Card.Header>
                      <i className="bi bi-credit-card me-2"></i>
                      สถานะการชำระเงิน
                    </Card.Header>
                    <Card.Body>
                      <Alert variant="info" className="mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        ยังไม่มีการชำระเงิน
                      </Alert>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>

            {/* Booking Timeline/History */}
            <Card>
              <Card.Header>
                <i className="bi bi-clock-history me-2"></i>
                ประวัติการจอง
              </Card.Header>
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
