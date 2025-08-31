import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Alert, Modal, Table } from 'react-bootstrap';
import bookingService from '../../../../../services/bookingService';

const PaymentStatusCard = ({ bookingId, paymentId, compact = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [auditTrail, setAuditTrail] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  useEffect(() => {
    if (paymentId) {
      loadPaymentData();
    }
  }, [paymentId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (paymentId) {
        console.log('💳 Loading payment data for:', paymentId);
        const payment = await bookingService.getPaymentDetails(paymentId);
        setPaymentData(payment.payment || payment);
      }
    } catch (err) {
      console.error('❌ Error loading payment data:', err);
      setError(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading audit trail for payment:', paymentId);
      
      const audit = await bookingService.getPaymentAuditTrail(paymentId);
      setAuditTrail(audit);
      setShowAuditModal(true);
    } catch (err) {
      console.error('❌ Error loading audit trail:', err);
      alert(`ไม่สามารถโหลดประวัติได้: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'PROCESSING': return 'primary';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'danger';
      case 'CANCELLED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'ชำระสำเร็จ';
      case 'PROCESSING': return 'กำลังดำเนินการ';
      case 'PENDING': return 'รอการชำระ';
      case 'FAILED': return 'ชำระไม่สำเร็จ';
      case 'CANCELLED': return 'ยกเลิก';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const formatCurrency = (amount) => {
    return `฿${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  if (loading) {
    return (
      <Card className={compact ? "mb-2" : "mb-3"}>
        <Card.Body className="text-center py-3">
          <Spinner size="sm" animation="border" variant="primary" />
          <small className="text-muted ms-2">กำลังโหลดข้อมูลการชำระเงิน...</small>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className={compact ? "mb-2" : "mb-3"}>
        <small>{error}</small>
      </Alert>
    );
  }

  if (!paymentData) {
    return (
      <Alert variant="info" className={compact ? "mb-2" : "mb-3"}>
        <small>ไม่มีข้อมูลการชำระเงิน</small>
      </Alert>
    );
  }

  if (compact) {
    return (
      <div className="payment-status-compact">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <Badge bg={getStatusBadgeVariant(paymentData.status)}>
              {getStatusText(paymentData.status)}
            </Badge>
            <span className="ms-2 text-muted small">
              {formatCurrency(paymentData.amount)}
            </span>
          </div>
          {paymentId && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={loadAuditTrail}
              disabled={loading}
            >
              <i className="bi bi-info-circle"></i>
            </Button>
          )}
        </div>
        
        {/* Audit Trail Modal */}
        <Modal show={showAuditModal} onHide={() => setShowAuditModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>ประวัติการชำระเงิน</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {auditTrail ? (
              <div>
                <h6>ข้อมูลการชำระเงิน</h6>
                <Table size="sm" className="mb-3">
                  <tbody>
                    <tr>
                      <td><strong>รหัสการชำระ:</strong></td>
                      <td>{auditTrail.payment?.id}</td>
                    </tr>
                    <tr>
                      <td><strong>จำนวนเงิน:</strong></td>
                      <td>{formatCurrency(auditTrail.payment?.amount)}</td>
                    </tr>
                    <tr>
                      <td><strong>สถานะ:</strong></td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(auditTrail.payment?.status)}>
                          {getStatusText(auditTrail.payment?.status)}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Omise Charge ID:</strong></td>
                      <td><code>{auditTrail.payment?.omiseChargeId || 'N/A'}</code></td>
                    </tr>
                  </tbody>
                </Table>

                {auditTrail.auditTrail?.webhookEvents && auditTrail.auditTrail.webhookEvents.length > 0 && (
                  <div>
                    <h6>Webhook Events</h6>
                    <Table size="sm" className="mb-3">
                      <thead>
                        <tr>
                          <th>Event Type</th>
                          <th>Status</th>
                          <th>Received</th>
                          <th>Processing Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditTrail.auditTrail.webhookEvents.map((event, index) => (
                          <tr key={index}>
                            <td><code>{event.eventType}</code></td>
                            <td>
                              <Badge bg={event.status === 'processed' ? 'success' : 'warning'}>
                                {event.status}
                              </Badge>
                            </td>
                            <td>{formatDateTime(event.receivedAt)}</td>
                            <td>{event.processingTimeMs ? `${event.processingTimeMs}ms` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                {auditTrail.auditTrail?.emailLogs && auditTrail.auditTrail.emailLogs.length > 0 && (
                  <div>
                    <h6>Email Logs</h6>
                    <Table size="sm">
                      <thead>
                        <tr>
                          <th>Email Type</th>
                          <th>Status</th>
                          <th>Sent At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditTrail.auditTrail.emailLogs.map((log, index) => (
                          <tr key={index}>
                            <td>{log.emailType}</td>
                            <td>
                              <Badge bg={log.status === 'sent' ? 'success' : 'danger'}>
                                {log.status}
                              </Badge>
                            </td>
                            <td>{formatDateTime(log.sentAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <Spinner animation="border" />
                <p className="mt-2">กำลังโหลดประวัติ...</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAuditModal(false)}>
              ปิด
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  // Full card display
  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <span>
          <i className="bi bi-credit-card me-2"></i>
          ข้อมูลการชำระเงิน
        </span>
        <Badge bg={getStatusBadgeVariant(paymentData.status)}>
          {getStatusText(paymentData.status)}
        </Badge>
      </Card.Header>
      <Card.Body>
        <div className="row">
          <div className="col-md-6">
            <p><strong>จำนวนเงิน:</strong> {formatCurrency(paymentData.amount)}</p>
            <p><strong>สกุลเงิน:</strong> {paymentData.currency || 'THB'}</p>
            <p><strong>วิธีการชำระ:</strong> {paymentData.paymentMethodType || 'ไม่ระบุ'}</p>
          </div>
          <div className="col-md-6">
            <p><strong>วันที่สร้าง:</strong> {formatDateTime(paymentData.createdAt)}</p>
            {paymentData.processedAt && (
              <p><strong>วันที่ดำเนินการ:</strong> {formatDateTime(paymentData.processedAt)}</p>
            )}
            {paymentData.omiseChargeId && (
              <p><strong>Omise Charge ID:</strong><br/>
              <code>{paymentData.omiseChargeId}</code></p>
            )}
          </div>
        </div>

        {paymentId && (
          <div className="text-end mt-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={loadAuditTrail}
              disabled={loading}
            >
              <i className="bi bi-search me-1"></i>
              ดูประวัติการชำระเงิน
            </Button>
          </div>
        )}
      </Card.Body>

      {/* Audit Trail Modal (same as compact version) */}
      <Modal show={showAuditModal} onHide={() => setShowAuditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>ประวัติการชำระเงิน</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {auditTrail ? (
            <div>
              <h6>ข้อมูลการชำระเงิน</h6>
              <Table size="sm" className="mb-3">
                <tbody>
                  <tr>
                    <td><strong>รหัสการชำระ:</strong></td>
                    <td>{auditTrail.payment?.id}</td>
                  </tr>
                  <tr>
                    <td><strong>จำนวนเงิน:</strong></td>
                    <td>{formatCurrency(auditTrail.payment?.amount)}</td>
                  </tr>
                  <tr>
                    <td><strong>สถานะ:</strong></td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(auditTrail.payment?.status)}>
                        {getStatusText(auditTrail.payment?.status)}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Omise Charge ID:</strong></td>
                    <td><code>{auditTrail.payment?.omiseChargeId || 'N/A'}</code></td>
                  </tr>
                </tbody>
              </Table>

              {/* Webhook Events and Email Logs - same structure as compact */}
            </div>
          ) : (
            <div className="text-center py-3">
              <Spinner animation="border" />
              <p className="mt-2">กำลังโหลดประวัติ...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAuditModal(false)}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default PaymentStatusCard;
