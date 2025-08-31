import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Card } from 'react-bootstrap';

const BookingEditModal = ({ show, onHide, booking, onSave }) => {
  const [formData, setFormData] = useState({
    guestInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: ''
    },
    dates: {
      checkinDate: '',
      checkoutDate: ''
    },
    roomType: '',
    numberOfGuests: 1,
    specialRequests: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (booking) {
      // Populate form with booking data
      setFormData({
        guestInfo: {
          firstName: booking.guest?.firstName || '',
          lastName: booking.guest?.lastName || '',
          email: booking.guest?.email || '',
          phone: booking.guest?.phone || '',
          country: booking.guest?.country || ''
        },
        dates: {
          checkinDate: booking.dates?.checkin ? new Date(booking.dates.checkin).toISOString().split('T')[0] : '',
          checkoutDate: booking.dates?.checkout ? new Date(booking.dates.checkout).toISOString().split('T')[0] : ''
        },
        roomType: booking.room?.type || '',
        numberOfGuests: (booking.guests?.adults || 0) + (booking.guests?.children || 0),
        specialRequests: booking.specialRequests || ''
      });
    }
  }, [booking]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.guestInfo.firstName.trim()) {
      newErrors['guestInfo.firstName'] = 'กรุณากรอกชื่อ';
    }
    
    if (!formData.guestInfo.lastName.trim()) {
      newErrors['guestInfo.lastName'] = 'กรุณากรอกนามสกุล';
    }
    
    if (!formData.guestInfo.email.trim()) {
      newErrors['guestInfo.email'] = 'กรุณากรอกอีเมล';
    }
    
    if (!formData.dates.checkinDate) {
      newErrors['dates.checkinDate'] = 'กรุณาเลือกวันเช็คอิน';
    }
    
    if (!formData.dates.checkoutDate) {
      newErrors['dates.checkoutDate'] = 'กรุณาเลือกวันเช็คเอาท์';
    }
    
    if (formData.dates.checkinDate && formData.dates.checkoutDate) {
      if (new Date(formData.dates.checkinDate) >= new Date(formData.dates.checkoutDate)) {
        newErrors['dates.checkoutDate'] = 'วันเช็คเอาท์ต้องหลังจากวันเช็คอิน';
      }
    }
    
    if (formData.numberOfGuests < 1) {
      newErrors['numberOfGuests'] = 'จำนวนแขกต้องอย่างน้อย 1 คน';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // TODO: เรียก API เมื่อ PUT /admin/bookings/:id พร้อมใช้งาน
      console.log('🔄 Saving booking changes...', formData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('⚠️ API ยังไม่พร้อม - การแก้ไขจะพร้อมใช้งานเร็วๆ นี้');
      
      if (onSave) {
        onSave(formData);
      }
      onHide();
      
    } catch (error) {
      console.error('❌ Error saving booking:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-pencil me-2"></i>
          แก้ไขการจอง
          {booking?.bookingReferenceId && (
            <small className="text-muted ms-2">#{booking.bookingReferenceId}</small>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>หมายเหตุ:</strong> ฟีเจอร์นี้อยู่ในระหว่างการพัฒนา API backend จะพร้อมใช้งานเร็วๆ นี้
        </Alert>

        <Form>
          {/* Guest Information */}
          <Card className="mb-4">
            <Card.Header>
              <i className="bi bi-person me-2"></i>
              ข้อมูลแขก
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ชื่อ *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.guestInfo.firstName}
                      onChange={(e) => handleInputChange('guestInfo', 'firstName', e.target.value)}
                      isInvalid={!!errors['guestInfo.firstName']}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors['guestInfo.firstName']}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>นามสกุล *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.guestInfo.lastName}
                      onChange={(e) => handleInputChange('guestInfo', 'lastName', e.target.value)}
                      isInvalid={!!errors['guestInfo.lastName']}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors['guestInfo.lastName']}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>อีเมล *</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.guestInfo.email}
                      onChange={(e) => handleInputChange('guestInfo', 'email', e.target.value)}
                      isInvalid={!!errors['guestInfo.email']}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors['guestInfo.email']}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>เบอร์โทร</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.guestInfo.phone}
                      onChange={(e) => handleInputChange('guestInfo', 'phone', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>ประเทศ</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.guestInfo.country}
                  onChange={(e) => handleInputChange('guestInfo', 'country', e.target.value)}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Booking Details */}
          <Card className="mb-4">
            <Card.Header>
              <i className="bi bi-calendar me-2"></i>
              รายละเอียดการจอง
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>วันเช็คอิน *</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.dates.checkinDate}
                      onChange={(e) => handleInputChange('dates', 'checkinDate', e.target.value)}
                      isInvalid={!!errors['dates.checkinDate']}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors['dates.checkinDate']}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>วันเช็คเอาท์ *</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.dates.checkoutDate}
                      onChange={(e) => handleInputChange('dates', 'checkoutDate', e.target.value)}
                      isInvalid={!!errors['dates.checkoutDate']}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors['dates.checkoutDate']}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ประเภทห้อง</Form.Label>
                    <Form.Select
                      value={formData.roomType}
                      onChange={(e) => handleInputChange(null, 'roomType', e.target.value)}
                    >
                      <option value="">เลือกประเภทห้อง</option>
                      <option value="standard">Standard Room</option>
                      <option value="deluxe">Deluxe Room</option>
                      <option value="suite">Suite</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>จำนวนแขก *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="10"
                      value={formData.numberOfGuests}
                      onChange={(e) => handleInputChange(null, 'numberOfGuests', parseInt(e.target.value))}
                      isInvalid={!!errors['numberOfGuests']}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors['numberOfGuests']}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>ความต้องการพิเศษ</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange(null, 'specialRequests', e.target.value)}
                  placeholder="ระบุความต้องการพิเศษ (ถ้ามี)"
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          ยกเลิก
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <i className="bi bi-save me-1"></i>
              บันทึก
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingEditModal;
