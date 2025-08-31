import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Badge, Card, Row, Col } from 'react-bootstrap';
import bookingService from '../../../../../services/bookingService';
import PaymentStatusCard from './PaymentStatusCard';

const BookingDetailModal = ({ show, onHide, bookingId, bookingReferenceId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

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
        
        // โหลดข้อมูล payment ถ้ามี
        if (bookingData.payments && bookingData.payments.length > 0) {
          // ใช้ payment API ที่มีอยู่แล้ว
          // TODO: เรียก GET /api/payments/:id เมื่อต้องการรายละเอียดเพิ่มเติม
          setPaymentDetails(bookingData.payments);
        }
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
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="bi bi-receipt me-2"></i>
          รายละเอียดการจอง
          {booking?.bookingReferenceId && (
            <small className="text-muted ms-2">#{booking.bookingReferenceId}</small>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error ? (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        ) : booking ? (
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
              <Card.Body>
                <div className="timeline">
                  <div className="timeline-item">
                    <strong>สร้างการจอง:</strong> {formatDateTime(booking.createdAt)}
                  </div>
                  {booking.checkedInAt && (
                    <div className="timeline-item">
                      <strong>เช็คอิน:</strong> {formatDateTime(booking.checkedInAt)}
                    </div>
                  )}
                  {booking.checkedOutAt && (
                    <div className="timeline-item">
                      <strong>เช็คเอาท์:</strong> {formatDateTime(booking.checkedOutAt)}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            ไม่มีข้อมูลการจอง
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          ปิด
        </Button>
        {booking && (
          <>
            <Button 
              variant="outline-primary" 
              onClick={() => {
                // TODO: เมื่อมี booking edit API แล้ว
                console.log('Edit booking:', booking.id);
                alert('ฟีเจอร์แก้ไขจะพร้อมใช้งานเร็วๆ นี้');
              }}
            >
              <i className="bi bi-pencil me-1"></i>
              แก้ไข
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={() => {
                // TODO: เมื่อมี booking cancellation API แล้ว
                console.log('Cancel booking:', booking.id);
                alert('ฟีเจอร์ยกเลิกจะพร้อมใช้งานเร็วๆ นี้');
              }}
            >
              <i className="bi bi-x-circle me-1"></i>
              ยกเลิก
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BookingDetailModal;
