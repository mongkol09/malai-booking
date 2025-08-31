import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import userService from '../../../../../../services/userService';

const EmployeeProfile = () => {
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsersData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Loading all users data');
        
        // Load all users to display as employee cards
        const response = await userService.getAllUsers();
        console.log('📥 API Response:', response);
        
        if (response && response.data) {
          setUsers(response.data);
          
          // If userId is provided, set as current user
          if (userId) {
            const currentUserData = response.data.find(user => user.id === userId);
            setCurrentUser(currentUserData);
            console.log('👤 Current user data:', currentUserData);
          }
        }
      } catch (error) {
        console.error('❌ Error loading users data:', error);
        setError(error.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      } finally {
        setLoading(false);
      }
    };

    loadUsersData();
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

  if (!users || users.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body text-center py-5">
                <div className="text-muted mb-3">
                  <i className="fas fa-users fa-3x"></i>
                </div>
                <h5 className="text-muted">ไม่พบข้อมูลพนักงาน</h5>
                <p className="text-muted">ยังไม่มีข้อมูลพนักงานในระบบ</p>
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
                โปรไฟล์พนักงาน {currentUser ? `- ${currentUser.firstName || ''} ${currentUser.lastName || ''}` : ''}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Profile Cards Grid - Show all users as employee cards */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="row g-4">
            {users.map((user, index) => (
              <div key={user.id} className="col-12 col-md-6">
                <div className={`card h-100 shadow-sm border-0 ${currentUser && currentUser.id === user.id ? 'border-primary border-2' : ''}`} 
                     style={{ backgroundColor: '#f8f9fa' }}>
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
                          {currentUser && currentUser.id === user.id && (
                            <span className="badge bg-primary ms-2 small">Current</span>
                          )}
                        </h5>
                        <p className="text-muted mb-2 small">
                          {formatRole(user.role)}
                        </p>
                        <p className="text-muted mb-3 small" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                          Vestibulum ante ipsum primis in faucibus orci luctus et ultrices. 
                          Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                        </p>
                        
                        {/* Contact Info */}
                        <div className="mb-2">
                          {user.email && (
                            <div className="text-muted small mb-1">
                              <i className="fas fa-envelope me-1"></i>
                              {user.email}
                            </div>
                          )}
                          {user.phoneNumber && (
                            <div className="text-muted small mb-1">
                              <i className="fas fa-phone me-1"></i>
                              {user.phoneNumber}
                            </div>
                          )}
                          <div className="text-muted small">
                            <i className="fas fa-calendar me-1"></i>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                          </div>
                        </div>
                        
                        {/* View Profile Button */}
                        <Link
                          to={`/user-list`}
                          className={`btn btn-sm px-3 py-1 ${currentUser && currentUser.id === user.id ? 'btn-primary' : 'btn-dark'}`}
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => {
                            console.log('👤 Going to user list for:', user.firstName, user.lastName);
                          }}
                        >
                          {currentUser && currentUser.id === user.id ? 'Current User' : 'Go to User List'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
