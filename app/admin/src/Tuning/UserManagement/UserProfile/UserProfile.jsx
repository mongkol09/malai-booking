import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import userService from '../../../services/userService';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(userId);
      const formattedUser = userService.formatUserData(response.data);
      setUser(formattedUser);
      setFormData(formattedUser);
      setError(null);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.role,
        status: formData.status
      };

      await userService.updateUser(userId, updateData);
      await loadUserProfile();
      setEditing(false);
      alert('บันทึกข้อมูลสำเร็จ');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setEditing(false);
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await userService.updateUserStatus(userId, newStatus);
      await loadUserProfile();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm('คุณต้องการรีเซ็ตรหัสผ่านของผู้ใช้นี้หรือไม่?')) {
      try {
        await userService.resetUserPassword(userId);
        alert('รีเซ็ตรหัสผ่านสำเร็จ รหัสผ่านใหม่จะถูกส่งไปยังอีเมลของผู้ใช้');
      } catch (err) {
        console.error('Error resetting password:', err);
        alert('ไม่สามารถรีเซ็ตรหัสผ่านได้');
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    const badgeMap = {
      'admin': 'bg-danger',
      'super_admin': 'bg-dark',
      'manager': 'bg-warning',
      'staff': 'bg-info',
      'user': 'bg-secondary'
    };
    return badgeMap[role] || 'bg-secondary';
  };

  const getStatusBadgeClass = (status) => {
    const badgeMap = {
      'active': 'bg-success',
      'inactive': 'bg-secondary',
      'pending': 'bg-warning',
      'suspended': 'bg-danger'
    };
    return badgeMap[status] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/user-list" className="btn btn-primary">
          กลับไปยังรายการผู้ใช้
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="alert alert-warning" role="alert">
          ไม่พบข้อมูลผู้ใช้
        </div>
        <Link to="/user-list" className="btn btn-primary">
          กลับไปยังรายการผู้ใช้
        </Link>
      </div>
    );
  }

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      <div className="row g-3">
        {/* Header */}
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/user-list">ผู้ใช้งาน</Link>
                  </li>
                  <li className="breadcrumb-item active">โปรไฟล์ผู้ใช้</li>
                </ol>
              </nav>
              <h3 className="fw-bold mb-0">โปรไฟล์ผู้ใช้</h3>
            </div>
            <div className="d-flex gap-2">
              {!editing ? (
                <>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setEditing(true)}
                  >
                    แก้ไขข้อมูล
                  </button>
                  <button 
                    className={`btn ${user.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={handleStatusToggle}
                  >
                    {user.status === 'active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  </button>
                  <button 
                    className="btn btn-outline-info"
                    onClick={handleResetPassword}
                  >
                    รีเซ็ตรหัสผ่าน
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={handleSave}
                  >
                    บันทึก
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    ยกเลิก
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-4">
                {/* Profile Image and Basic Info */}
                <div className="col-lg-4">
                  <div className="text-center">
                    <div className="avatar xxl rounded-circle img-thumbnail shadow mx-auto d-flex align-items-center justify-content-center bg-light mb-3">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="avatar xxl rounded-circle"/>
                      ) : (
                        <i className="fa fa-user fa-4x text-muted"></i>
                      )}
                    </div>
                    <h4 className="mb-1">{user.fullName}</h4>
                    <p className="text-muted mb-2">{user.email}</p>
                    <div className="mb-3">
                      <span className={`badge ${getRoleBadgeClass(user.role)} me-2`}>
                        {user.displayRole}
                      </span>
                      <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                        {user.displayStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="col-lg-8">
                  <div className="row g-3">
                    {/* Personal Information */}
                    <div className="col-12">
                      <h5 className="fw-bold border-bottom pb-2 mb-3">ข้อมูลส่วนตัว</h5>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">ชื่อ</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={formData.firstName || ''}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">{user.firstName || '-'}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">นามสกุล</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={formData.lastName || ''}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">{user.lastName || '-'}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">อีเมล</label>
                      {editing ? (
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">{user.email || '-'}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">เบอร์โทรศัพท์</label>
                      {editing ? (
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">{user.phone || '-'}</div>
                      )}
                    </div>

                    {/* Work Information */}
                    <div className="col-12 mt-4">
                      <h5 className="fw-bold border-bottom pb-2 mb-3">ข้อมูลการทำงาน</h5>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">ตำแหน่ง</label>
                      {editing ? (
                        <select
                          className="form-select"
                          name="role"
                          value={formData.role || ''}
                          onChange={handleInputChange}
                        >
                          <option value="staff">พนักงาน</option>
                          <option value="manager">ผู้จัดการ</option>
                          <option value="admin">ผู้ดูแลระบบ</option>
                        </select>
                      ) : (
                        <div className="form-control-plaintext">{user.displayRole || '-'}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">แผนก</label>
                      {editing ? (
                        <select
                          className="form-select"
                          name="department"
                          value={formData.department || ''}
                          onChange={handleInputChange}
                        >
                          <option value="">เลือกแผนก</option>
                          <option value="Front Office">แผนกต้อนรับ</option>
                          <option value="Housekeeping">แผนกแม่บ้าน</option>
                          <option value="Food & Beverage">แผนกอาหารและเครื่องดื่ม</option>
                          <option value="Maintenance">แผนกซ่อมบำรุง</option>
                          <option value="Security">แผนกรักษาความปลอดภัย</option>
                          <option value="Accounting">แผนกบัญชี</option>
                          <option value="Marketing">แผนกการตลาด</option>
                          <option value="IT">แผนกเทคโนโลยีสารสนเทศ</option>
                          <option value="HR">แผนกทรัพยากรบุคคล</option>
                        </select>
                      ) : (
                        <div className="form-control-plaintext">{user.department || '-'}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">สถานะ</label>
                      {editing ? (
                        <select
                          className="form-select"
                          name="status"
                          value={formData.status || ''}
                          onChange={handleInputChange}
                        >
                          <option value="active">ใช้งานอยู่</option>
                          <option value="inactive">ปิดการใช้งาน</option>
                          <option value="pending">รอยืนยัน</option>
                          <option value="suspended">ถูกระงับ</option>
                        </select>
                      ) : (
                        <div className="form-control-plaintext">{user.displayStatus || '-'}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">รหัสผู้ใช้</label>
                      <div className="form-control-plaintext">{user.id || '-'}</div>
                    </div>

                    {/* System Information */}
                    <div className="col-12 mt-4">
                      <h5 className="fw-bold border-bottom pb-2 mb-3">ข้อมูลระบบ</h5>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">วันที่เข้าร่วม</label>
                      <div className="form-control-plaintext">{user.joinedDate || '-'}</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted">เข้าสู่ระบบล่าสุด</label>
                      <div className="form-control-plaintext">{user.lastLogin || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
