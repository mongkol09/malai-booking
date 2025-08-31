import React, { useState, useRef, useEffect } from 'react';
import { Card, Alert, Button, Spinner } from 'react-bootstrap';
import './PinSetup.css';

const PinSetup = ({ onPinSetupComplete, userInfo }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: setup, 2: confirm
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Refs for input fields
  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  // Initialize refs
  useEffect(() => {
    pinRefs.current = pinRefs.current.slice(0, 6);
    confirmPinRefs.current = confirmPinRefs.current.slice(0, 6);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    if (step === 1 && pinRefs.current[0]) {
      pinRefs.current[0].focus();
    } else if (step === 2 && confirmPinRefs.current[0]) {
      confirmPinRefs.current[0].focus();
    }
  }, [step]);

  const handlePinChange = (index, value, isConfirm = false) => {
    setError('');
    
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }

    const currentPin = isConfirm ? [...confirmPin] : [...pin];
    const refs = isConfirm ? confirmPinRefs : pinRefs;
    
    currentPin[index] = value;
    
    if (isConfirm) {
      setConfirmPin(currentPin);
    } else {
      setPin(currentPin);
    }

    // Auto focus next input
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }

    // Auto submit when all fields filled
    if (currentPin.every(digit => digit !== '')) {
      if (isConfirm) {
        handleConfirmPin(currentPin);
      } else {
        setTimeout(() => handleSetupComplete(currentPin), 100);
      }
    }
  };

  const handleKeyDown = (index, e, isConfirm = false) => {
    const refs = isConfirm ? confirmPinRefs : pinRefs;
    
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? [...confirmPin] : [...pin];
      
      if (currentPin[index] === '' && index > 0) {
        // Move to previous input if current is empty
        refs.current[index - 1]?.focus();
      } else {
        // Clear current input
        currentPin[index] = '';
        if (isConfirm) {
          setConfirmPin(currentPin);
        } else {
          setPin(currentPin);
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleSetupComplete = (currentPin) => {
    const pinString = currentPin.join('');
    
    // Validate PIN
    if (pinString.length !== 6) {
      setError('กรุณากรอก PIN ให้ครบ 6 หลัก');
      return;
    }

    // Check for sequential numbers (123456, 654321)
    if (isSequential(pinString)) {
      setError('❌ PIN ไม่ควรเป็นเลขเรียงกัน (เช่น 123456, 654321)');
      clearPin();
      return;
    }

    // Check for repeating numbers (111111, 222222)
    if (isRepeating(pinString)) {
      setError('❌ PIN ไม่ควรเป็นเลขซ้ำกันทั้งหมด (เช่น 111111, 222222)');
      clearPin();
      return;
    }

    // Move to confirmation step
    setStep(2);
  };

  const handleConfirmPin = async (currentConfirmPin) => {
    const pinString = pin.join('');
    const confirmPinString = currentConfirmPin.join('');
    
    if (pinString !== confirmPinString) {
      setError('❌ PIN ไม่ตรงกัน กรุณาลองใหม่อีกครั้ง');
      setStep(1);
      setPin(['', '', '', '', '', '']);
      setConfirmPin(['', '', '', '', '', '']);
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
      return;
    }

    // Setup PIN
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/setup-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          pin: pinString,
          userId: userInfo.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onPinSetupComplete(pinString);
        }, 2000);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการตั้ง PIN');
        setStep(1);
        setPin(['', '', '', '', '', '']);
        setConfirmPin(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('PIN setup error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
      setStep(1);
      setPin(['', '', '', '', '', '']);
      setConfirmPin(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const clearPin = () => {
    setPin(['', '', '', '', '', '']);
    setTimeout(() => pinRefs.current[0]?.focus(), 100);
  };

  const clearConfirmPin = () => {
    setConfirmPin(['', '', '', '', '', '']);
    setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
  };

  const handleReset = () => {
    setStep(1);
    setPin(['', '', '', '', '', '']);
    setConfirmPin(['', '', '', '', '', '']);
    setError('');
    setTimeout(() => pinRefs.current[0]?.focus(), 100);
  };

  // Utility functions
  const isSequential = (pinString) => {
    const ascending = pinString === '123456' || pinString === '234567' || 
                     pinString === '345678' || pinString === '456789';
    const descending = pinString === '654321' || pinString === '765432' || 
                      pinString === '876543' || pinString === '987654';
    return ascending || descending;
  };

  const isRepeating = (pinString) => {
    return /^(.)\1{5}$/.test(pinString);
  };

  if (showSuccess) {
    return (
      <div className="pin-setup-container">
        <Card className="pin-setup-card">
          <Card.Body className="text-center py-5">
            <div className="success-icon mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{fontSize: '4rem'}}></i>
            </div>
            <h4 className="text-success mb-3">✅ ตั้ง PIN สำเร็จ!</h4>
            <p className="text-muted">
              PIN ของคุณได้รับการตั้งค่าเรียบร้อยแล้ว<br/>
              กำลังเข้าสู่ระบบ...
            </p>
            <Spinner animation="border" size="sm" className="mt-3" />
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="pin-setup-container">
      <Card className="pin-setup-card">
        <Card.Header className="bg-primary text-white text-center">
          <h5 className="mb-0">
            <i className="bi bi-shield-lock me-2"></i>
            ตั้งรหัส PIN สำหรับ {userInfo?.name || 'ผู้ใช้'}
          </h5>
        </Card.Header>
        
        <Card.Body className="px-4 py-5">
          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <div className="text-center mb-4">
            <h6 className="mb-3">
              {step === 1 ? (
                <>
                  <i className="bi bi-key me-2"></i>
                  สร้างรหัส PIN 6 หลัก
                </>
              ) : (
                <>
                  <i className="bi bi-check2-square me-2"></i>
                  ยืนยันรหัส PIN อีกครั้ง
                </>
              )}
            </h6>
            <p className="text-muted small">
              {step === 1 ? (
                'กรุณาตั้งรหัส PIN 6 หลัก ที่จะใช้สำหรับยืนยันตัวตนในระบบ'
              ) : (
                'กรุณากรอกรหัส PIN เดิมอีกครั้งเพื่อยืนยัน'
              )}
            </p>
          </div>

          <form>
            <ul className="row g-3 list-unstyled pin-inputs">
              {(step === 1 ? pin : confirmPin).map((digit, index) => (
                <li key={index} className="col-2">
                  <input
                    ref={el => {
                      if (step === 1) {
                        pinRefs.current[index] = el;
                      } else {
                        confirmPinRefs.current[index] = el;
                      }
                    }}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="form-control form-control-lg text-center pin-input"
                    placeholder="●"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value, step === 2)}
                    onKeyDown={(e) => handleKeyDown(index, e, step === 2)}
                    autoComplete="off"
                    disabled={loading}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-4">
              {step === 2 && (
                <Button 
                  variant="outline-secondary" 
                  className="w-100 mb-3"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  กลับไปตั้ง PIN ใหม่
                </Button>
              )}
              
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={step === 1 ? clearPin : clearConfirmPin}
                disabled={loading}
                className="w-100"
              >
                <i className="bi bi-x-circle me-2"></i>
                ล้างข้อมูล
              </Button>
            </div>
          </form>

          <div className="mt-4 pt-3 border-top">
            <small className="text-muted">
              <i className="bi bi-info-circle me-2"></i>
              <strong>ข้อกำหนด PIN:</strong><br/>
              • ต้องเป็นตัวเลข 6 หลัก<br/>
              • ไม่ควรเป็นเลขเรียงกัน (123456)<br/>
              • ไม่ควรเป็นเลขซ้ำกันทั้งหมด (111111)
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PinSetup;
