import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../../../../../../Tuning/UserManagement/UserList/service/userService';

const EmployeeProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (userId) {
        try {
          setLoading(true);
          setError(null);
          console.log('🔍 Loading user data for userId:', userId);
          const response = await userService.getUserById(userId);
          console.log('📥 API Response:', response);
          console.log('👤 User data:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          setError(error.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        } finally {
          setLoading(false);
        }
      } else {
        console.log('⚠️ No userId provided');
        setError('ไม่พบ User ID');
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  // Helper function to get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-danger';
      case 'manager': return 'bg-warning';
      case 'staff': return 'bg-info';
      case 'customer': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // Helper function to format role display
  const formatRole = (role) => {
    if (!role) return 'User';
    switch (role.toLowerCase()) {
      case 'admin': return 'Manager';
      case 'manager': return 'Manager'; 
      case 'staff': return 'Housekeeping Staff';
      case 'customer': return 'Receptionist';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  // Helper function to get profile image
  const getProfileImage = (user) => {
    // Use a default avatar image or generate based on initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user?.firstName || 'User'} ${user?.lastName || ''}`
    )}&background=random&color=fff&size=150&rounded=true`;
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
                <p className="mt-3 text-muted">กำลังโหลดข้อมูลโปรไฟล์...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-danger">
              <div className="card-body text-center py-5">
                <div className="text-danger mb-3">
                  <i className="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <h5 className="text-danger">เกิดข้อผิดพลาด</h5>
                <p className="text-muted">{error}</p>
                <Link to="/user-list" className="btn btn-outline-primary">
                  <i className="fas fa-arrow-left me-2"></i>
                  กลับสู่รายการผู้ใช้
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body text-center py-5">
                <div className="text-muted mb-3">
                  <i className="fas fa-user-times fa-3x"></i>
                </div>
                <h5 className="text-muted">ไม่พบข้อมูลผู้ใช้</h5>
                <Link to="/user-list" className="btn btn-outline-primary">
                  <i className="fas fa-arrow-left me-2"></i>
                  กลับสู่รายการผู้ใช้
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Breadcrumb Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-white rounded shadow-sm px-3 py-2">
              <li className="breadcrumb-item">
                <Link to="/user-list" className="text-decoration-none">
                  <i className="fas fa-users me-1"></i>
                  รายการผู้ใช้
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                โปรไฟล์ {user.firstName || 'ผู้ใช้'} {user.lastName || ''}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Profile Cards Grid - Match the image layout */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="row g-4">
            {/* Create multiple profile cards in grid layout like the image */}
            {/* Card 1 - Rachel Parsons style */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    {/* Profile Image */}
                    <div className="me-3">
                      <img 
                        src={getProfileImage(user)}
                        alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-bold text-dark">
                        {user.firstName || 'ไม่ระบุชื่อ'} {user.lastName || ''}
                      </h5>
                      <p className="text-muted mb-2 small">
                        {formatRole(user.role)}
                      </p>
                      <p className="text-muted mb-3 small" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices. 
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                      </p>
                      
                      {/* View Profile Button */}
                      <button className="btn btn-dark btn-sm px-3 py-1" style={{ fontSize: '0.8rem' }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - John Hardacre style */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    {/* Profile Image */}
                    <div className="me-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=John+Hardacre&background=2c3e50&color=fff&size=150&rounded=true`}
                        alt="John Hardacre"
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-bold text-dark">John Hardacre</h5>
                      <p className="text-muted mb-2 small">Housekeeping Staff</p>
                      <p className="text-muted mb-3 small" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices. 
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                      </p>
                      
                      {/* View Profile Button */}
                      <button className="btn btn-dark btn-sm px-3 py-1" style={{ fontSize: '0.8rem' }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Jan Ince style */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    {/* Profile Image */}
                    <div className="me-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=Jan+Ince&background=8e44ad&color=fff&size=150&rounded=true`}
                        alt="Jan Ince"
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-bold text-dark">Jan Ince</h5>
                      <p className="text-muted mb-2 small">Receptionist</p>
                      <p className="text-muted mb-3 small" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices. 
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                      </p>
                      
                      {/* View Profile Button */}
                      <button className="btn btn-dark btn-sm px-3 py-1" style={{ fontSize: '0.8rem' }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 - Steven Butler style */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    {/* Profile Image */}
                    <div className="me-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=Steven+Butler&background=3498db&color=fff&size=150&rounded=true`}
                        alt="Steven Butler"
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-bold text-dark">Steven Butler</h5>
                      <p className="text-muted mb-2 small">Receptionist</p>
                      <p className="text-muted mb-3 small" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices. 
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                      </p>
                      
                      {/* View Profile Button */}
                      <button className="btn btn-dark btn-sm px-3 py-1" style={{ fontSize: '0.8rem' }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5 - Robert Hammer style */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    {/* Profile Image */}
                    <div className="me-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=Robert+Hammer&background=e74c3c&color=fff&size=150&rounded=true`}
                        alt="Robert Hammer"
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-bold text-dark">Robert Hammer</h5>
                      <p className="text-muted mb-2 small">Master Safe</p>
                      <p className="text-muted mb-3 small" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices. 
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                      </p>
                      
                      {/* View Profile Button */}
                      <button className="btn btn-dark btn-sm px-3 py-1" style={{ fontSize: '0.8rem' }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6 - Paul Slater style */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    {/* Profile Image */}
                    <div className="me-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=Paul+Slater&background=27ae60&color=fff&size=150&rounded=true`}
                        alt="Paul Slater"
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-bold text-dark">Paul Slater</h5>
                      <p className="text-muted mb-2 small">Receptionist</p>
                      <p className="text-muted mb-3 small" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices. 
                        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                      </p>
                      
                      {/* View Profile Button */}
                      <button className="btn btn-dark btn-sm px-3 py-1" style={{ fontSize: '0.8rem' }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="row mt-4">
            <div className="col-12 text-center">
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/user-list" className="btn btn-outline-secondary">
                  <i className="fas fa-arrow-left me-2"></i>
                  กลับสู่รายการผู้ใช้
                </Link>
                <button className="btn btn-outline-primary" disabled>
                  <i className="fas fa-plus me-2"></i>
                  เพิ่มพนักงานใหม่
                </button>
                <button className="btn btn-outline-info" disabled>
                  <i className="fas fa-search me-2"></i>
                  ค้นหาพนักงาน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
