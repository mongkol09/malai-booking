// Quick Login Component สำหรับ Emergency
import React, { useState } from 'react';

const QuickLogin = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@hotel.com',
          password: 'SecureAdmin123!'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save tokens
        localStorage.setItem('hotel_admin_token', data.data.tokens.accessToken);
        localStorage.setItem('token', data.data.tokens.accessToken);
        localStorage.setItem('hotel_admin_refresh_token', data.data.tokens.refreshToken);
        localStorage.setItem('hotel_admin_user', JSON.stringify(data.data.user));

        console.log('✅ Quick login successful!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Quick login failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-inline-flex align-items-center">
      <button
        className="btn btn-success btn-sm me-2"
        onClick={handleQuickLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="spinner-border spinner-border-sm me-1" role="status"></div>
            กำลังเข้าสู่ระบบ...
          </>
        ) : (
          <>
            <i className="bi bi-key me-1"></i>
            เข้าสู่ระบบด่วน
          </>
        )}
      </button>
      
      {error && (
        <small className="text-danger">
          <i className="bi bi-exclamation-circle me-1"></i>
          {error}
        </small>
      )}
    </div>
  );
};

export default QuickLogin;
