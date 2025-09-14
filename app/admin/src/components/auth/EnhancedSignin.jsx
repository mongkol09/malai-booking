import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


const EnhancedSignin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: 'admin@malai.com', // ค่าเริ่มต้นสำหรับ demo
    password: 'Admin123!',       // ค่าเริ่มต้นสำหรับ demo - password ที่ถูกต้อง
    rememberMe: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect ถ้า login แล้ว
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/index');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors เมื่อ component mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error เมื่อผู้ใช้เริ่มพิมพ์
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.password) {
      errors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    return errors;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    clearError();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Login สำเร็จ - จะ redirect ใน useEffect
        safeLog('Login successful:', result.message);
      } else {
        setFormErrors({ submit: result.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormErrors({ submit: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
  };

  return (
    <div className="px-xl-5 px-4 auth-body">
      <form onSubmit={handleSubmit}>
        <ul className="row g-3 list-unstyled li_animate">
          
          {/* Email Field */}
          <li className="col-12">
            <label className="form-label">
              อีเมล <span className="text-danger">*</span>
            </label>
            <input 
              type="email" 
              name="email"
              className={`form-control form-control-lg ${formErrors.email ? 'is-invalid' : ''}`}
              placeholder="admin@malai.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="username"
            />
            {formErrors.email && (
              <div className="invalid-feedback">
                {formErrors.email}
              </div>
            )}
          </li>

          {/* Password Field */}
          <li className="col-12">
            <div className="form-label">
              <span className="d-flex justify-content-between align-items-center">
                รหัสผ่าน <span className="text-danger">*</span>
                <Link className="text-primary" to="/password-reset">
                  ลืมรหัสผ่าน?
                </Link>
              </span>
            </div>
            <div className="position-relative">
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-control form-control-lg ${formErrors.password ? 'is-invalid' : ''}`}
                placeholder="รหัสผ่าน"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                style={{ zIndex: 5 }}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
              {formErrors.password && (
                <div className="invalid-feedback">
                  {formErrors.password}
                </div>
              )}
            </div>
          </li>

          {/* Remember Me */}
          <li className="col-12">
            <div className="form-check fs-5">
              <input 
                className="form-check-input" 
                type="checkbox" 
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label className="form-check-label fs-6" htmlFor="rememberMe">
                จดจำอุปกรณ์นี้
              </label>
            </div>
          </li>

          {/* Error Messages */}
          {(error || formErrors.submit) && (
            <li className="col-12">
              <div className="alert alert-danger" role="alert">
                <i className="fa fa-exclamation-triangle me-2"></i>
                {error || formErrors.submit}
              </div>
            </li>
          )}

          {/* Submit Button */}
          <li className="col-12 my-lg-4">
            <button 
              type="submit"
              className="btn btn-lg w-100 btn-primary text-uppercase mb-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
            
            {/* Google Sign In - เก็บไว้สำหรับอนาคต */}
            <button 
              type="button"
              className="btn btn-lg btn-secondary w-100"
              disabled={true} // ปิดไว้ก่อน
            >
              <i className="fa fa-google me-2"></i>
              <span>เข้าสู่ระบบด้วย Google (เร็วๆ นี้)</span>
            </button>
          </li>

          {/* Sign Up Link - Disabled for security */}
          <li className="col-12 text-center">
            <span className="text-muted d-flex d-sm-inline-flex">
              {/* Admin signup disabled for security */}
              ระบบสำหรับผู้ดูแลเท่านั้น
            </span>
          </li>

          

        </ul>
      </form>
    </div>
  );
};

export default EnhancedSignin;
