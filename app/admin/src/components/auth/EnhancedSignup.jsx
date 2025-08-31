import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const EnhancedSignup = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: 'Thailand',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

    if (!formData.firstName.trim()) {
      errors.firstName = 'กรุณากรอกชื่อจริง';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'กรุณากรอกนามสกุล';
    }

    if (!formData.email) {
      errors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
    }

    if (!formData.password) {
      errors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 8) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลข';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'กรุณายอมรับเงื่อนไขการใช้งาน';
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
      const { confirmPassword, acceptTerms, ...userData } = formData;
      const result = await register(userData);
      
      if (result.success) {
        setRegistrationSuccess(true);
        // สามารถ redirect ไป signin หรือแสดงข้อความสำเร็จ
      } else {
        setFormErrors({ submit: result.message });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setFormErrors({ submit: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
  };

  // แสดงหน้าสำเร็จ
  if (registrationSuccess) {
    return (
      <div className="px-xl-5 px-4 auth-body">
        <div className="text-center">
          <div className="mb-4">
            <i className="fa fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="text-success mb-3">สมัครสมาชิกสำเร็จ!</h3>
          <p className="text-muted mb-4">
            เราได้ส่งลิงก์ยืนยันไปยังอีเมล <strong>{formData.email}</strong><br />
            กรุณาตรวจสอบอีเมลและคลิกลิงก์เพื่อยืนยันบัญชีของคุณ
          </p>
          <div className="d-grid gap-2">
            <Link to="/signin" className="btn btn-primary btn-lg">
              เข้าสู่ระบบ
            </Link>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setRegistrationSuccess(false)}
            >
              สมัครสมาชิกอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-xl-5 px-4 auth-body">
      <form onSubmit={handleSubmit}>
        <ul className="row g-3 list-unstyled li_animate">
          
          {/* Name Fields */}
          <li className="col-md-6">
            <label className="form-label">
              ชื่อจริง <span className="text-danger">*</span>
            </label>
            <input 
              type="text" 
              name="firstName"
              className={`form-control form-control-lg ${formErrors.firstName ? 'is-invalid' : ''}`}
              placeholder="ชื่อจริง"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {formErrors.firstName && (
              <div className="invalid-feedback">{formErrors.firstName}</div>
            )}
          </li>

          <li className="col-md-6">
            <label className="form-label">
              นามสกุล <span className="text-danger">*</span>
            </label>
            <input 
              type="text" 
              name="lastName"
              className={`form-control form-control-lg ${formErrors.lastName ? 'is-invalid' : ''}`}
              placeholder="นามสกุล"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {formErrors.lastName && (
              <div className="invalid-feedback">{formErrors.lastName}</div>
            )}
          </li>

          {/* Email Field */}
          <li className="col-12">
            <label className="form-label">
              อีเมล <span className="text-danger">*</span>
            </label>
            <input 
              type="email" 
              name="email"
              className={`form-control form-control-lg ${formErrors.email ? 'is-invalid' : ''}`}
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {formErrors.email && (
              <div className="invalid-feedback">{formErrors.email}</div>
            )}
          </li>

          {/* Phone and Country */}
          <li className="col-md-6">
            <label className="form-label">
              เบอร์โทรศัพท์ <span className="text-danger">*</span>
            </label>
            <input 
              type="tel" 
              name="phoneNumber"
              className={`form-control form-control-lg ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
              placeholder="081-234-5678"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {formErrors.phoneNumber && (
              <div className="invalid-feedback">{formErrors.phoneNumber}</div>
            )}
          </li>

          <li className="col-md-6">
            <label className="form-label">ประเทศ</label>
            <select 
              name="country"
              className="form-select form-select-lg"
              value={formData.country}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="Thailand">ไทย</option>
              <option value="Singapore">สิงคโปร์</option>
              <option value="Malaysia">มาเลเซีย</option>
              <option value="Other">อื่นๆ</option>
            </select>
          </li>

          {/* Password Fields */}
          <li className="col-12">
            <label className="form-label">
              รหัสผ่าน <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-control form-control-lg ${formErrors.password ? 'is-invalid' : ''}`}
                placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
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
                <div className="invalid-feedback">{formErrors.password}</div>
              )}
            </div>
            <small className="text-muted">
              รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลข
            </small>
          </li>

          <li className="col-12">
            <label className="form-label">
              ยืนยันรหัสผ่าน <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`form-control form-control-lg ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="ยืนยันรหัสผ่าน"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                style={{ zIndex: 5 }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
              {formErrors.confirmPassword && (
                <div className="invalid-feedback">{formErrors.confirmPassword}</div>
              )}
            </div>
          </li>

          {/* Terms Agreement */}
          <li className="col-12">
            <div className="form-check fs-5">
              <input 
                className={`form-check-input ${formErrors.acceptTerms ? 'is-invalid' : ''}`}
                type="checkbox" 
                name="acceptTerms"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label className="form-check-label fs-6" htmlFor="acceptTerms">
                ฉันยอมรับ <Link to="/terms" target="_blank">เงื่อนไขการใช้งาน</Link> และ <Link to="/privacy" target="_blank">นโยบายความเป็นส่วนตัว</Link>
              </label>
              {formErrors.acceptTerms && (
                <div className="invalid-feedback d-block">{formErrors.acceptTerms}</div>
              )}
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
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </li>

          {/* Sign In Link */}
          <li className="col-12 text-center">
            <span className="text-muted d-flex d-sm-inline-flex">
              มีบัญชีแล้ว? 
              <Link className="ms-2" to="/signin" title="เข้าสู่ระบบ">
                เข้าสู่ระบบที่นี่
              </Link>
            </span>
          </li>

        </ul>
      </form>
    </div>
  );
};

export default EnhancedSignup;
