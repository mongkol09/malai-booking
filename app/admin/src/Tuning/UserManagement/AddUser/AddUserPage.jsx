import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../../services/userService';

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    phoneNumber: '',
    country: 'Thailand'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!formData.lastName.trim()) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!formData.email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    if (!formData.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType: formData.role, // ส่งเป็น userType ตาม Backend API
        phoneNumber: formData.phoneNumber,
        country: formData.country
      };
      
      await userService.createUser(userData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CUSTOMER',
        phoneNumber: '',
        country: 'Thailand'
      });
      
      // Show success message and redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/user-list';
      }, 2000);
      
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ submit: error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Breadcrumb */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/user-list">ผู้ใช้งาน</Link>
                </li>
                <li className="breadcrumb-item active">เพิ่มผู้ใช้ใหม่</li>
              </ol>
            </div>
            <h4 className="page-title">เพิ่มผู้ใช้ใหม่</h4>
          </div>
        </div>
      </div>

      {/* Add User Form */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">📝 ข้อมูลผู้ใช้ใหม่</h5>
            </div>
            <div className="card-body">
              {/* Navigation Back */}
              <div className="mb-3">
                <Link to="/user-list" className="btn btn-outline-secondary">
                  <span className="me-2">⬅️</span>
                  กลับไปรายการผู้ใช้
                </Link>
              </div>

              {/* Success Message */}
              {success && (
                <div className="alert alert-success">
                  <span className="me-2">✅</span>
                  สร้างผู้ใช้สำเร็จ! กำลังเปลี่ยนไปหน้ารายการผู้ใช้...
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="alert alert-danger">
                  <span className="me-2">❌</span>
                  {errors.submit}
                </div>
              )}

              {/* Add User Form */}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">ชื่อ <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="กรอกชื่อ"
                      />
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">นามสกุล <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="กรอกนามสกุล"
                      />
                      {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">อีเมล <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="กรอกอีเมล"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">เบอร์โทรศัพท์</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="กรอกเบอร์โทรศัพท์"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">รหัสผ่าน <span className="text-danger">*</span></label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="กรอกรหัสผ่าน"
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">ยืนยันรหัสผ่าน <span className="text-danger">*</span></label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="ยืนยันรหัสผ่าน"
                      />
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">ตำแหน่ง</label>
                      <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="CUSTOMER">ลูกค้า</option>
                        <option value="STAFF">พนักงาน</option>
                        <option value="SALES_REPRESENTATIVE">ฝ่ายขาย</option>
                        <option value="CUSTOMER_SERVICE">ฝ่ายลูกค้าสัมพันธ์</option>
                        <option value="BOOKING">จองห้องพัก</option>
                        <option value="MARKETING_MANAGER">ฝ่ายการตลาด</option>
                        <option value="ACCOUNTANT">ฝ่ายบัญชี</option>
                        <option value="HUMAN_RESOURCES">ฝ่ายทรัพยากรบุคคล</option>
                        <option value="MODERATOR">ผู้ดูแล</option>
                        <option value="MANAGER">ผู้จัดการ</option>
                        <option value="ADMINISTRATOR">ผู้ดูแลระบบหลัก</option>
                        <option value="ADMIN">ผู้ดูแลระบบ</option>
                        <option value="DEV">ผู้ดูแลระบบระดับสูง (Developer)</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">ประเทศ</label>
                      <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="กรอกประเทศ"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="d-flex justify-content-between">
                  <Link to="/user-list" className="btn btn-secondary">
                    <span className="me-2">❌</span>
                    ยกเลิก
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        กำลังสร้าง...
                      </>
                    ) : (
                      <>
                        <span className="me-2">💾</span>
                        สร้างผู้ใช้
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
