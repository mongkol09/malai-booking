import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import './PinVerification.css';

const PinVerification = ({ 
  show, 
  onHide, 
  onSuccess, 
  action = 'ยืนยันรายการ',
  title = 'ยืนยันตัวตน',
  description = 'กรุณากรอกรหัส PIN เพื่อยืนยันการทำรายการ',
  bookingData = null 
}) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [countdown, setCountdown] = useState(0);
  
  const pinRefs = useRef([]);

  // Progressive lockout times (in minutes)
  const LOCKOUT_TIMES = [1, 3, 5, 10, 15, 30, 60, 120, 480, 1440]; // up to 24 hours

  // Initialize refs
  useEffect(() => {
    pinRefs.current = pinRefs.current.slice(0, 6);
  }, []);

  // Focus first input when modal opens
  useEffect(() => {
    if (show && pinRefs.current[0]) {
      setTimeout(() => pinRefs.current[0].focus(), 100);
    }
  }, [show]);

  // Handle lockout countdown
  useEffect(() => {
    let interval;
    if (lockoutTime && countdown > 0) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const remaining = Math.ceil((lockoutTime - now) / 1000);
        
        if (remaining <= 0) {
          setLockoutTime(null);
          setCountdown(0);
          setError('');
          setTimeout(() => pinRefs.current[0]?.focus(), 100);
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [lockoutTime, countdown]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (show) {
      setPin(['', '', '', '', '', '']);
      setError('');
      setLoading(false);
      // Check if still in lockout from localStorage
      checkLockoutStatus();
    }
  }, [show]);

  const checkLockoutStatus = () => {
    const lockoutData = localStorage.getItem('pinLockout');
    if (lockoutData) {
      const { until, attempts } = JSON.parse(lockoutData);
      const now = new Date().getTime();
      
      if (now < until) {
        setLockoutTime(until);
        setCountdown(Math.ceil((until - now) / 1000));
        setFailedAttempts(attempts);
        setError(`❌ ระบบถูกล็อค เนื่องจากกรอก PIN ผิด ${attempts} ครั้ง`);
        return true;
      } else {
        localStorage.removeItem('pinLockout');
        setFailedAttempts(0);
      }
    }
    return false;
  };

  const handlePinChange = (index, value) => {
    if (lockoutTime) return;
    
    setError('');
    
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto focus next input
    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }

    // Auto submit when all fields filled
    if (newPin.every(digit => digit !== '')) {
      setTimeout(() => handleSubmit(newPin), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (lockoutTime) return;
    
    if (e.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        pinRefs.current[index - 1]?.focus();
      } else {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      pinRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      pinRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      const pinString = pin.join('');
      if (pinString.length === 6) {
        handleSubmit(pin);
      }
    }
  };

  const handleSubmit = async (currentPin) => {
    if (lockoutTime) return;
    
    const pinString = currentPin.join('');
    
    if (pinString.length !== 6) {
      setError('กรุณากรอก PIN ให้ครบ 6 หลัก');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          pin: pinString,
          action: action,
          bookingData: bookingData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Log successful action
        await logActivity('PIN_VERIFICATION_SUCCESS', {
          action,
          bookingId: bookingData?.id,
          timestamp: new Date().toISOString()
        });
        
        // Reset failed attempts
        setFailedAttempts(0);
        localStorage.removeItem('pinLockout');
        
        // Close modal and trigger success callback
        onSuccess(result);
        handleClose();
        
      } else {
        // Handle failed attempt
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        // Log failed attempt
        await logActivity('PIN_VERIFICATION_FAILED', {
          action,
          attemptNumber: newAttempts,
          timestamp: new Date().toISOString()
        });

        if (newAttempts >= 3) {
          // Apply progressive lockout
          const lockoutMinutes = LOCKOUT_TIMES[Math.min(newAttempts - 3, LOCKOUT_TIMES.length - 1)];
          const lockoutUntil = new Date().getTime() + (lockoutMinutes * 60 * 1000);
          
          setLockoutTime(lockoutUntil);
          setCountdown(lockoutMinutes * 60);
          
          // Store lockout in localStorage
          localStorage.setItem('pinLockout', JSON.stringify({
            until: lockoutUntil,
            attempts: newAttempts
          }));
          
          setError(`❌ PIN ผิด ${newAttempts} ครั้ง ระบบถูกล็อค ${lockoutMinutes} นาที`);
          
          // Log lockout
          await logActivity('PIN_LOCKOUT', {
            attempts: newAttempts,
            lockoutMinutes,
            timestamp: new Date().toISOString()
          });
          
        } else {
          setError(`❌ PIN ไม่ถูกต้อง (เหลืออีก ${3 - newAttempts} ครั้ง)`);
        }
        
        // Clear PIN
        setPin(['', '', '', '', '', '']);
        setTimeout(() => pinRefs.current[0]?.focus(), 100);
      }
      
    } catch (error) {
      console.error('PIN verification error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType, data) => {
    try {
      await fetch('/api/v1/activity-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          type: activityType,
          data: data,
          userAgent: navigator.userAgent,
          ipAddress: 'client-side' // Will be replaced by server
        })
      });
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  };

  const handleClose = () => {
    setPin(['', '', '', '', '', '']);
    setError('');
    setLoading(false);
    onHide();
  };

  const clearPin = () => {
    setPin(['', '', '', '', '', '']);
    setError('');
    setTimeout(() => pinRefs.current[0]?.focus(), 100);
  };

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds} วินาที`;
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      className="pin-verification-modal"
    >
      <Modal.Header className="bg-primary text-white border-0">
        <Modal.Title>
          <i className="bi bi-shield-check me-2"></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            {lockoutTime && countdown > 0 && (
              <div className="mt-2">
                <strong>เวลาที่เหลือ: {formatCountdown(countdown)}</strong>
              </div>
            )}
          </Alert>
        )}

        <div className="text-center mb-4">
          <h6 className="mb-3">
            <i className="bi bi-key me-2"></i>
            {action}
          </h6>
          <p className="text-muted">
            {description}
          </p>
          
          {bookingData && (
            <div className="booking-info bg-light p-3 rounded mb-3">
              <small className="text-muted">
                <strong>Booking:</strong> {bookingData.bookingReference}<br/>
                <strong>Guest:</strong> {bookingData.guestName}<br/>
                <strong>Room:</strong> {bookingData.roomNumber}
              </small>
            </div>
          )}
        </div>

        <div className="pin-inputs-container">
          <ul className="row g-3 list-unstyled pin-inputs mb-0">
            {pin.map((digit, index) => (
              <li key={index} className="col-2">
                <input
                  ref={el => pinRefs.current[index] = el}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`form-control form-control-lg text-center pin-input ${error ? 'error' : ''}`}
                  placeholder="●"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoComplete="off"
                  disabled={loading || lockoutTime}
                />
              </li>
            ))}
          </ul>
        </div>

        {!lockoutTime && (
          <div className="text-center mt-4">
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={clearPin}
              disabled={loading}
            >
              <i className="bi bi-x-circle me-2"></i>
              ล้างข้อมูล
            </Button>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="border-0">
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          ยกเลิก
        </Button>
        {loading && (
          <Button variant="primary" disabled>
            <Spinner size="sm" className="me-2" />
            กำลังตรวจสอบ...
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PinVerification;
