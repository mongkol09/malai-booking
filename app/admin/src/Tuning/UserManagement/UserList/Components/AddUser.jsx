import React, { useState } from 'react';
import userService from '../../../../services/userService';

const AddUser = ({ onUserCreated, isStandalonePage = false }) => {
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
    let newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'ชื่อเป็นข้อมูลที่จำเป็น';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'นามสกุลเป็นข้อมูลที่จำเป็น';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'อีเมลเป็นข้อมูลที่จำเป็น';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.password) {
      newErrors.password = 'รหัสผ่านเป็นข้อมูลที่จำเป็น';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // เตรียมข้อมูลสำหรับส่งไป API
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber.trim(),
        country: formData.country.trim()
      };

      await userService.createUser(userData);
      
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
      setErrors({});
      
      // Close modal (only for modal mode)
      if (!isStandalonePage) {
        const modal = document.getElementById('createuser');
        const modalInstance = window.bootstrap?.Modal?.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
      
      // Callback to parent
      if (onUserCreated) {
        onUserCreated();
      }
      
      alert('เพิ่มผู้ใช้สำเร็จ');
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ submit: error.message || 'ไม่สามารถเพิ่มผู้ใช้ได้' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'STAFF',
      phoneNumber: '',
      country: 'Thailand'
    });
    setErrors({});
  };

  // Render form content
  const FormContent = () => (
    <form className="row g-3" onSubmit={handleSubmit}>
      {/* Error Message */}
      {errors.submit && (
        <div className="col-12">
          <div className="alert alert-danger" role="alert">
            {errors.submit}
          </div>
        </div>
      )}

      {/* ชื่อ */}
      <div className="col-lg-6 col-12">
        <label className="form-label text-muted">
          ชื่อ <span className="text-danger">*</span>
        </label>
        <input 
          type="text" 
          className={`form-control form-control-lg ${errors.firstName ? 'is-invalid' : ''}`}
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          placeholder="กรอกชื่อ"
        />
        {errors.firstName && (
          <div className="invalid-feedback">
            {errors.firstName}
          </div>
        )}
      </div>

      {/* นามสกุล */}
      <div className="col-lg-6 col-12">
        <label className="form-label text-muted">
          นามสกุล <span className="text-danger">*</span>
        </label>
        <input 
          type="text" 
          className={`form-control form-control-lg ${errors.lastName ? 'is-invalid' : ''}`}
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          placeholder="กรอกนามสกุล"
        />
        {errors.lastName && (
          <div className="invalid-feedback">
            {errors.lastName}
          </div>
        )}
      </div>

      {/* อีเมล */}
      <div className="col-lg-6 col-12">
        <label className="form-label text-muted">
          อีเมล <span className="text-danger">*</span>
        </label>
        <input 
          type="email" 
          className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="example@hotel.com"
        />
        {errors.email && (
          <div className="invalid-feedback">
            {errors.email}
          </div>
        )}
      </div>

      {/* เบอร์โทรศัพท์ */}
      <div className="col-lg-6 col-12">
        <label className="form-label text-muted">เบอร์โทรศัพท์</label>
        <input 
          type="tel" 
          className="form-control form-control-lg"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="0812345678"
        />
      </div>

      {/* รหัสผ่าน */}
      <div className="col-lg-6 col-12">
        <label className="form-label text-muted">
          รหัสผ่าน <span className="text-danger">*</span>
        </label>
        <input 
          type="password" 
          className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="อย่างน้อย 6 ตัวอักษร"
        />
        {errors.password && (
          <div className="invalid-feedback">
            {errors.password}
          </div>
        )}
      </div>

      {/* ยืนยันรหัสผ่าน */}
      <div className="col-lg-6 col-12">
        <label className="form-label text-muted">
          ยืนยันรหัสผ่าน <span className="text-danger">*</span>
        </label>
        <input 
          type="password" 
          className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="กรอกรหัสผ่านอีกครั้ง"
        />
        {errors.confirmPassword && (
          <div className="invalid-feedback">
            {errors.confirmPassword}
          </div>
        )}
      </div>

      {/* ตำแหน่ง/Role */}
      <div className="col-sm-6">
        <label className="form-label text-muted">
          ตำแหน่ง <span className="text-danger">*</span>
        </label>
        <select 
          className={`form-select form-control-lg ${errors.role ? 'is-invalid' : ''}`}
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
        {errors.role && (
          <div className="invalid-feedback">
            {errors.role}
          </div>
        )}
      </div>

      {/* ประเทศ */}
      <div className="col-sm-6">
        <label className="form-label text-muted">ประเทศ</label>
        <input 
          type="text" 
          className="form-control form-control-lg"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          placeholder="Thailand"
        />
      </div>

      {/* Buttons */}
      <div className="col-12">
        <div className="d-flex gap-3">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                กำลังสร้าง...
              </>
            ) : (
              'สร้างผู้ใช้'
            )}
          </button>
        </div>
      </div>
    </form>
  );

  // Return based on mode
  if (isStandalonePage) {
    return <FormContent />;
  }

  // Modal mode
  return (
    <div className="modal fade" id="createuser" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">เพิ่มผู้ใช้ใหม่</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <FormContent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
