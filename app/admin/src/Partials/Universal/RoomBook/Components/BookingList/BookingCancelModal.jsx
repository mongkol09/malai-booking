import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Card, Badge } from 'react-bootstrap';

const BookingCancelModal = ({ show, onHide, booking, onCancel }) => {
  const [formData, setFormData] = useState({
    reason: '',
    refundAmount: 0,
    refundMethod: 'original_payment',
    notifyGuest: true,
    internalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (booking && show) {
      // Calculate default refund amount (example: full refund if more than 24h before checkin)
      const checkinDate = new Date(booking.dates?.checkin);
      const now = new Date();
      const hoursUntilCheckin = (checkinDate - now) / (1000 * 60 * 60);
      
      let defaultRefundAmount = 0;
      if (hoursUntilCheckin > 24) {
        defaultRefundAmount = booking.pricing?.paidAmount || 0;
      } else if (hoursUntilCheckin > 2) {
        defaultRefundAmount = (booking.pricing?.paidAmount || 0) * 0.5; // 50% refund
      }
      
      setFormData(prev => ({
        ...prev,
        refundAmount: defaultRefundAmount
      }));
    }
  }, [booking, show]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'กรุณาระบุเหตุผลในการยกเลิก';
    }
    
    if (formData.refundAmount < 0) {
      newErrors.refundAmount = 'จำนวนเงินคืนไม่สามารถติดลบได้';
    }
    
    const maxRefund = booking?.pricing?.paidAmount || 0;
    if (formData.refundAmount > maxRefund) {
      newErrors.refundAmount = `จำนวนเงินคืนไม่สามารถเกิน ${maxRefund.toLocaleString()} บาท`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = async () => {
    if (!validateForm()) {
      return;
    }

    const confirmMessage = `คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?\n\nเหตุผล: ${formData.reason}\nจำนวนเงินคืน: ${formData.refundAmount.toLocaleString()} บาท\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      
      // TODO: เรียก API เมื่อ POST /admin/bookings/:id/cancel พร้อมใช้งาน
      console.log('❌ Canceling booking...', {
        bookingId: booking.id,
        cancellationData: formData
      });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('⚠️ API ยังไม่พร้อม - การยกเลิกการจองจะพร้อมใช้งานเร็วๆ นี้');
      
      if (onCancel) {
        onCancel(formData);
      }
      onHide();
      
    } catch (error) {
      console.error('❌ Error canceling booking:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `฿${parseFloat(amount || 0).toLocaleString()}`;
  };

  const getRefundPercentage = () => {
    const paidAmount = booking?.pricing?.paidAmount || 0;
    if (paidAmount === 0) return 0;
    return ((formData.refundAmount / paidAmount) * 100).toFixed(1);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <i className="bi bi-x-circle me-2"></i>
          ยกเลิกการจอง
          {booking?.bookingReferenceId && (
            <small className="d-block mt-1">#{booking.bookingReferenceId}</small>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>หมายเหตุ:</strong> ฟีเจอร์นี้อยู่ในระหว่างการพัฒนา API backend จะพร้อมใช้งานเร็วๆ นี้
        </Alert>

        {booking && (
          <>
            {/* Booking Summary */}
            <Card className="mb-4">
              <Card.Header>
                <i className="bi bi-receipt me-2"></i>
                สรุปการจอง
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>แขก:</strong> {booking.guest?.name}</p>
                    <p><strong>ห้อง:</strong> {booking.room?.type} (#{booking.room?.number})</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>วันเข้าพัก:</strong> {new Date(booking.dates?.checkin).toLocaleDateString('th-TH')}</p>
                    <p><strong>วันออก:</strong> {new Date(booking.dates?.checkout).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>สถานะ:</strong> 
                      <Badge bg="info" className="ms-2">{booking.status}</Badge>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>ยอดชำระแล้ว:</strong> 
                      <span className="text-success fw-bold ms-2">
                        {formatCurrency(booking.pricing?.paidAmount)}
                      </span>
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Cancellation Form */}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>เหตุผลในการยกเลิก *</Form.Label>
                <Form.Select
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  isInvalid={!!errors.reason}
                >
                  <option value="">เลือกเหตุผล</option>
                  <option value="customer_request">แขกขอยกเลิก</option>
                  <option value="payment_failed">การชำระเงินไม่สำเร็จ</option>
                  <option value="room_unavailable">ห้องไม่พร้อมให้บริการ</option>
                  <option value="force_majeure">เหตุสุดวิสัย</option>
                  <option value="duplicate_booking">การจองซ้ำ</option>
                  <option value="admin_decision">ตัดสินใจโดยผู้ดูแลระบบ</option>
                  <option value="other">อื่นๆ</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.reason}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Refund Section */}
              <Card className="mb-3">
                <Card.Header>
                  <i className="bi bi-cash me-2"></i>
                  การคืนเงิน
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>จำนวนเงินคืน (บาท)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max={booking.pricing?.paidAmount || 0}
                      step="0.01"
                      value={formData.refundAmount}
                      onChange={(e) => handleInputChange('refundAmount', parseFloat(e.target.value) || 0)}
                      isInvalid={!!errors.refundAmount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.refundAmount}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      จำนวนเงินคืน: {formatCurrency(formData.refundAmount)} 
                      ({getRefundPercentage()}% ของยอดที่ชำระ)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>วิธีการคืนเงิน</Form.Label>
                    <Form.Select
                      value={formData.refundMethod}
                      onChange={(e) => handleInputChange('refundMethod', e.target.value)}
                    >
                      <option value="original_payment">คืนเงินไปยังการชำระเงินเดิม</option>
                      <option value="bank_transfer">โอนเงินเข้าบัญชี</option>
                      <option value="cash">เงินสด</option>
                      <option value="credit">เครดิตในระบบ</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Check
                    type="checkbox"
                    id="notifyGuest"
                    label="ส่งอีเมลแจ้งการยกเลิกให้แขก"
                    checked={formData.notifyGuest}
                    onChange={(e) => handleInputChange('notifyGuest', e.target.checked)}
                  />
                </Card.Body>
              </Card>

              <Form.Group className="mb-3">
                <Form.Label>หมายเหตุภายใน</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.internalNotes}
                  onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติมสำหรับทีมงาน (ไม่แสดงให้แขกเห็น)"
                />
              </Form.Group>
            </Form>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          ยกเลิก
        </Button>
        <Button variant="danger" onClick={handleCancel} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              กำลังยกเลิกการจอง...
            </>
          ) : (
            <>
              <i className="bi bi-x-circle me-1"></i>
              ยืนยันการยกเลิก
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingCancelModal;
