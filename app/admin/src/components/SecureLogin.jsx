import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import authTokenService from '../services/authTokenService';

const SecureLogin = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(process.env.NODE_ENV === 'development');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // ลบ error เมื่อผู้ใช้เริ่มพิมพ์
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('กรุณากรอก username และ password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authTokenService.login(credentials.username, credentials.password);
      
      if (result.success) {
        console.log('✅ Login successful:', result.user.email);
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🚨 Using DEMO login - FOR DEVELOPMENT ONLY');
      const result = await authTokenService.demoLogin();
      
      if (result.success) {
        console.log('✅ Demo login successful');
        onLoginSuccess(result.user);
      } else {
        setError('Demo login failed');
      }
    } catch (error) {
      console.error('❌ Demo login error:', error);
      setError('Demo login error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card style={{ width: '400px', maxWidth: '90vw' }}>
        <Card.Header className="bg-primary text-white text-center">
          <h4 className="mb-0">
            <i className="bi bi-shield-lock me-2"></i>
            Professional Check-in
          </h4>
          <small>Secure Authentication Required</small>
        </Card.Header>
        
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-person me-2"></i>
                Username
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loading}
                autoComplete="username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                <i className="bi bi-lock me-2"></i>
                Password
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 mb-3"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  เข้าสู่ระบบ
                </>
              )}
            </Button>
          </Form>

          {showDemo && (
            <>
              <hr className="my-3" />
              <div className="text-center">
                <small className="text-muted d-block mb-2">
                  Development Mode Only
                </small>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={handleDemoLogin}
                  disabled={loading}
                >
                  <i className="bi bi-tools me-2"></i>
                  Demo Login
                </Button>
              </div>
            </>
          )}
        </Card.Body>

        <Card.Footer className="text-center text-muted small">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <i className="bi bi-shield-check me-1"></i>
              Secure Connection
            </span>
            <span>
              <i className="bi bi-building me-1"></i>
              Malai Resort
            </span>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default SecureLogin;
