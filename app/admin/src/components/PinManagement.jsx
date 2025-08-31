import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Table, Badge, Alert, Modal, Spinner } from 'react-bootstrap';
import './PinManagement.css';
import pinAuthService from '../services/pinAuthService';
import authTokenService from '../services/authTokenService';

/**
 * PIN Management Dashboard
 * สำหรับ Admin จัดการ PIN ของ users ทั้งหมด
 */
const PinManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'reset', 'disable', 'enable'
  const [confirmText, setConfirmText] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const response = await authTokenService.authenticatedRequest('/api/v1/admin/users-pin-status', {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล users');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (user) => {
    setSelectedUser(user);
    setModalType('reset');
    setConfirmText('');
    setShowModal(true);
  };

  const handleDisablePin = async (user) => {
    setSelectedUser(user);
    setModalType('disable');
    setConfirmText('');
    setShowModal(true);
  };

  const handleEnablePin = async (user) => {
    setSelectedUser(user);
    setModalType('enable');
    setConfirmText('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    // Require confirmation text for destructive actions
    if (modalType === 'reset' || modalType === 'disable') {
      const expectedText = modalType === 'reset' ? 'RESET' : 'DISABLE';
      if (confirmText !== expectedText) {
        setError(`กรุณาพิมพ์ "${expectedText}" เพื่อยืนยัน`);
        return;
      }
    }

    try {
      setLoading(true);
      setError('');

      let endpoint = '';
      let method = 'POST';
      let body = {};

      switch (modalType) {
        case 'reset':
          endpoint = `/api/v1/admin/users/${selectedUser.id}/pin/reset`;
          break;
        case 'disable':
          endpoint = `/api/v1/admin/users/${selectedUser.id}/pin/disable`;
          break;
        case 'enable':
          endpoint = `/api/v1/admin/users/${selectedUser.id}/pin/enable`;
          break;
        default:
          throw new Error('Invalid action type');
      }

      const response = await authTokenService.authenticatedRequest(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`${modalType === 'reset' ? 'รีเซ็ต' : modalType === 'disable' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} PIN สำเร็จ`);
        setShowModal(false);
        await loadUsers(); // Refresh data
      } else {
        throw new Error(result.message || 'Operation failed');
      }

    } catch (error) {
      console.error('PIN management error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setLoading(false);
    }
  };

  const viewActivityLogs = async (user) => {
    try {
      setLoading(true);
      setSelectedUser(user);
      
      const response = await authTokenService.authenticatedRequest(`/api/v1/admin/users/${user.id}/pin/activity-logs`, {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        setActivityLogs(result.data || []);
        setShowLogs(true);
      } else {
        throw new Error('Failed to load activity logs');
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setError('เกิดข้อผิดพลาดในการโหลด activity logs');
    } finally {
      setLoading(false);
    }
  };

  const generatePinReport = async () => {
    try {
      setLoading(true);
      
      const response = await authTokenService.authenticatedRequest('/api/v1/admin/pin-security-report', {
        method: 'GET'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pin_security_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setSuccess('รายงานความปลอดภัย PIN ถูกดาวน์โหลดแล้ว');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('เกิดข้อผิดพลาดในการสร้างรายงาน');
    } finally {
      setLoading(false);
    }
  };

  const getPinStatusBadge = (user) => {
    if (!user.pinStatus) {
      return <Badge bg="secondary">ไม่มี PIN</Badge>;
    }

    if (!user.pinStatus.isActive) {
      return <Badge bg="danger">ปิดใช้งาน</Badge>;
    }

    if (user.pinStatus.isExpired) {
      return <Badge bg="warning">หมดอายุ</Badge>;
    }

    if (user.pinStatus.lockedUntil && new Date(user.pinStatus.lockedUntil) > new Date()) {
      return <Badge bg="danger">ถูกล็อค</Badge>;
    }

    return <Badge bg="success">ใช้งานได้</Badge>;
  };

  const formatLastUsed = (dateString) => {
    if (!dateString) return 'ไม่เคยใช้';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'วันนี้';
    } else if (diffDays === 1) {
      return 'เมื่อวาน';
    } else if (diffDays < 7) {
      return `${diffDays} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH');
    }
  };

  return (
    <div className="pin-management-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="bi bi-shield-lock me-2"></i>
          จัดการ PIN Authentication
        </h4>
        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={loadUsers}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            รีเฟรช
          </Button>
          <Button
            variant="primary"
            onClick={generatePinReport}
            disabled={loading}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            สร้างรายงาน
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-people me-2"></i>
                รายการ Users และสถานะ PIN
              </h6>
            </Card.Header>
            <Card.Body>
              {loading && (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">กำลังโหลดข้อมูล...</p>
                </div>
              )}

              {!loading && (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>ชื่อ</th>
                      <th>อีเมล</th>
                      <th>ตำแหน่ง</th>
                      <th>สถานะ PIN</th>
                      <th>ใช้ครั้งล่าสุด</th>
                      <th>ความผิดพลาด</th>
                      <th>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.firstName} {user.lastName}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg="info">{user.userType}</Badge>
                        </td>
                        <td>{getPinStatusBadge(user)}</td>
                        <td>{formatLastUsed(user.pinStatus?.lastUsedAt)}</td>
                        <td>
                          {user.pinStatus?.failedAttempts > 0 && (
                            <Badge bg="warning">
                              {user.pinStatus.failedAttempts} ครั้ง
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="btn-group-sm">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1 mb-1"
                              onClick={() => viewActivityLogs(user)}
                              title="ดู Activity Logs"
                            >
                              <i className="bi bi-clock-history"></i>
                            </Button>
                            
                            {user.pinStatus?.isActive ? (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-1 mb-1"
                                onClick={() => handleDisablePin(user)}
                                title="ปิดใช้งาน PIN"
                              >
                                <i className="bi bi-lock"></i>
                              </Button>
                            ) : (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-1 mb-1"
                                onClick={() => handleEnablePin(user)}
                                title="เปิดใช้งาน PIN"
                              >
                                <i className="bi bi-unlock"></i>
                              </Button>
                            )}
                            
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="me-1 mb-1"
                              onClick={() => handleResetPin(user)}
                              title="รีเซ็ต PIN"
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {!loading && users.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox" style={{fontSize: '3rem'}}></i>
                  <p className="mt-2">ไม่พบข้อมูล users</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            ยืนยันการ{modalType === 'reset' ? 'รีเซ็ต' : modalType === 'disable' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} PIN
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                คุณต้องการ{modalType === 'reset' ? 'รีเซ็ต' : modalType === 'disable' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} PIN สำหรับ:
              </p>
              <div className="bg-light p-3 rounded mb-3">
                <strong>{selectedUser.firstName} {selectedUser.lastName}</strong><br/>
                <small className="text-muted">{selectedUser.email}</small>
              </div>
              
              {(modalType === 'reset' || modalType === 'disable') && (
                <>
                  <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    การดำเนินการนี้ไม่สามารถยกเลิกได้
                  </Alert>
                  <Form.Group>
                    <Form.Label>
                      พิมพ์ <strong>{modalType === 'reset' ? 'RESET' : 'DISABLE'}</strong> เพื่อยืนยัน:
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={modalType === 'reset' ? 'RESET' : 'DISABLE'}
                    />
                  </Form.Group>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ยกเลิก
          </Button>
          <Button
            variant={modalType === 'enable' ? 'success' : 'danger'}
            onClick={confirmAction}
            disabled={loading || ((modalType === 'reset' || modalType === 'disable') && confirmText !== (modalType === 'reset' ? 'RESET' : 'DISABLE'))}
          >
            {loading && <Spinner size="sm" className="me-2" />}
            ยืนยัน
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Activity Logs Modal */}
      <Modal show={showLogs} onHide={() => setShowLogs(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-clock-history me-2"></i>
            Activity Logs - {selectedUser?.firstName} {selectedUser?.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped hover size="sm">
            <thead>
              <tr>
                <th>เวลา</th>
                <th>กิจกรรม</th>
                <th>IP Address</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <small>{new Date(log.createdAt).toLocaleString('th-TH')}</small>
                  </td>
                  <td>
                    <Badge bg={log.activityType.includes('SUCCESS') ? 'success' : 'warning'}>
                      {log.activityType}
                    </Badge>
                  </td>
                  <td>
                    <small>{log.ipAddress || 'N/A'}</small>
                  </td>
                  <td>
                    <small>{log.data ? JSON.parse(log.data).action || 'N/A' : 'N/A'}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {activityLogs.length === 0 && (
            <div className="text-center py-3 text-muted">
              <i className="bi bi-inbox"></i>
              <p className="mt-2">ไม่พบ activity logs</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogs(false)}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PinManagement;
