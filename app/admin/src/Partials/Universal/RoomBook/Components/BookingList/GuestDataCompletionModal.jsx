import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import bookingService from '../../../../../services/bookingService';

const GuestDataCompletionModal = ({ show, onHide, booking, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Load existing booking data when modal opens
  useEffect(() => {
    if (show && booking) {
      console.log('📋 Loading booking data for guest completion:', booking);
      
      // Pre-fill with existing data
      setGuestData(prev => ({
        ...prev,
        firstName: booking.customerName?.split(' ')[0] || '',
        lastName: booking.customerName?.split(' ').slice(1).join(' ') || '',
        email: booking.customerEmail || '',
        phone: booking.customerPhone || '',
        specialRequests: booking.specialRequests || ''
      }));
      
      setError(null);
      setSuccess(false);
    }
  }, [show, booking]);

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
      
      console.log('💾 Saving guest data for booking:', booking);
      console.log('💾 Guest data to save:', guestData);
      console.log('💾 Booking ID:', booking.id);
      console.log('💾 Booking object keys:', Object.keys(booking));
      
      // Validate form first
      if (!validateForm()) {
        setError('กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, นามสกุล, อีเมล, เบอร์โทร)');
        return;
      }
      
      // Call API to update guest data
      const response = await bookingService.updateGuestData(booking.id, guestData);
      
      console.log('✅ API response:', response);
      
      if (response.success) {
        setSuccess(true);
        
        // Notify parent component
        if (onSave) {
          onSave(response.data);
        }
        
        // Show success message and close modal after delay
        setTimeout(() => {
          setSuccess(false);
          onHide();
        }, 1500);
      } else {
        console.warn('⚠️ API returned non-success response:', response);
        throw new Error(response.message || response.error?.message || 'Failed to update guest data');
      }
      
    } catch (error) {
      console.error('❌ Error saving guest data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to save guest data';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Basic validation - at least name and contact info
    return guestData.firstName.trim() && 
           guestData.lastName.trim() && 
           guestData.email.trim() && 
           guestData.phone.trim();
  };

  if (!booking) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-person-plus me-2"></i>
          เพิ่มข้อมูลลูกค้า - {booking.bookingReferenceId}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3">
            <i className="bi bi-check-circle me-2"></i>
            บันทึกข้อมูลลูกค้าสำเร็จ!
          </Alert>
        )}
        
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
                      placeholder="ที่อยู่ปัจจุบัน"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>เมือง</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={guestData.city}
                      onChange={handleInputChange}
                      placeholder="เมือง"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>จังหวัด</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={guestData.state}
                      onChange={handleInputChange}
                      placeholder="จังหวัด"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>ประเทศ</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={guestData.country}
                      onChange={handleInputChange}
                      placeholder="ประเทศ"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>รหัสไปรษณีย์</Form.Label>
                    <Form.Control
                      type="text"
                      name="zipCode"
                      value={guestData.zipCode}
                      onChange={handleInputChange}
                      placeholder="รหัสไปรษณีย์"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>
          
          {/* ID Documents */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-card-text me-2"></i>
                เอกสารประจำตัว
              </h6>
            </div>
            <div className="card-body">
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>ประเภทเอกสาร</Form.Label>
                    <Form.Select
                      name="idType"
                      value={guestData.idType}
                      onChange={handleInputChange}
                    >
                      <option value="National ID">บัตรประชาชน</option>
                      <option value="Passport">พาสปอร์ต</option>
                      <option value="Driver License">ใบขับขี่</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>เลขที่เอกสาร</Form.Label>
                    <Form.Control
                      type="text"
                      name="idNumber"
                      value={guestData.idNumber}
                      onChange={handleInputChange}
                      placeholder="เลขที่เอกสารประจำตัว"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>หมายเลขพาสปอร์ต (ถ้ามี)</Form.Label>
                    <Form.Control
                      type="text"
                      name="passportNumber"
                      value={guestData.passportNumber}
                      onChange={handleInputChange}
                      placeholder="หมายเลขพาสปอร์ต"
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
                      placeholder="เบอร์โทรศัพท์ฉุกเฉิน"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>
          
          {/* Special Requests */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-star me-2"></i>
                ความต้องการพิเศษ
              </h6>
            </div>
            <div className="card-body">
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>ข้อความพิเศษ</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="specialRequests"
                      value={guestData.specialRequests}
                      onChange={handleInputChange}
                      placeholder="ความต้องการพิเศษ เช่น ห้องไม่สูบบุหรี่, เตียงเสริม, อื่นๆ"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ข้อจำกัดด้านอาหาร</Form.Label>
                    <Form.Control
                      type="text"
                      name="dietaryRestrictions"
                      value={guestData.dietaryRestrictions}
                      onChange={handleInputChange}
                      placeholder="เช่น มังสวิรัติ, แพ้อาหารทะเล"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ความต้องการพิเศษ</Form.Label>
                    <Form.Control
                      type="text"
                      name="accessibilityNeeds"
                      value={guestData.accessibilityNeeds}
                      onChange={handleInputChange}
                      placeholder="เช่น ผู้พิการ, ต้องการผู้ช่วย"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>
          
          {/* Marketing Consent */}
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-envelope-heart me-2"></i>
                การสื่อสารการตลาด
              </h6>
            </div>
            <div className="card-body">
              <Form.Check
                type="checkbox"
                name="marketingConsent"
                checked={guestData.marketingConsent}
                onChange={handleInputChange}
                label="ยินยอมให้ส่งข้อมูลโปรโมชั่นและข่าวสารของโรงแรม"
                className="mb-2"
              />
              <Form.Check
                type="checkbox"
                name="newsletterSubscription"
                checked={guestData.newsletterSubscription}
                onChange={handleInputChange}
                label="สมัครรับจดหมายข่าวและข้อเสนอพิเศษ"
              />
            </div>
          </div>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          ยกเลิก
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={loading || !validateForm()}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              บันทึกข้อมูล
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GuestDataCompletionModal;
