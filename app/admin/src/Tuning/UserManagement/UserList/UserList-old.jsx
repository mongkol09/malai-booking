import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../../services/userService';
// import AddUser from './Components/AddUser';
// import EditUser from './Components/EditUser';
// import AuthDebugInfo from './Components/AuthDebugInfo';
import { useAuth } from '../../../contexts/AuthContext';

const UserList = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Lazy load AddUser to avoid import issues
  const [AddUser, setAddUser] = useState(null);
  const [EditUser, setEditUser] = useState(null);
  const [AuthDebugInfo, setAuthDebugInfo] = useState(null);
  
  useEffect(() => {
    import('./Components/AddUser').then(module => {
      setAddUser(() => module.default);
    });
    import('./Components/EditUser').then(module => {
      setEditUser(() => module.default);
    });
    import('./Components/AuthDebugInfo').then(module => {
      setAuthDebugInfo(() => module.default);
    });
  }, []);
  
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: 'all'
  });

  // Load users data only when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadUsers();
    }
  }, [filters, isAuthenticated, authLoading]);

  const loadUsers = async () => {
    // Double-check authentication before API call
    if (!isAuthenticated) {
      console.warn('User not authenticated, skipping API call');
      return;
    }

    try {
      setLoading(true);
      
      // Debug: ตรวจสอบ token ก่อนเรียก API
      const token = localStorage.getItem('hotel_admin_token');
      console.log('🔍 Debug - Current token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      // ตรวจสอบ token validity
      const isValid = userService.isTokenValid();
      console.log('🔍 Debug - Token validity:', isValid);
      
      if (!isValid) {
        throw new Error('Token validation failed - please login again');
      }
      
      const params = {
        ...filters,
        status: filters.status === 'all' ? undefined : filters.status
      };
      const response = await userService.getAllUsers(params);
      
      console.log('🔍 Debug - API Response:', response);
      
      // Handle different response structures
      let usersData = [];
      if (response.data?.users) {
        // New structure: { data: { users: [...], pagination: {...} } }
        usersData = response.data.users;
      } else if (Array.isArray(response.data)) {
        // Old structure: { data: [...] }
        usersData = response.data;
      } else if (Array.isArray(response)) {
        // Direct array response
        usersData = response;
      }
      
      console.log('🔍 Debug - Users data:', usersData);
      
      // Format user data สำหรับการแสดงผล
      const formattedUsers = usersData?.map(user => userService.formatUserData(user)) || [];
      setUsers(formattedUsers);
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
  };

  const handleUserUpdated = () => {
    loadUsers();
    setSelectedUser(null);
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await userService.updateUserStatus(userId, newStatus);
      loadUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้');
    }
  };

  const handleResetPassword = async (userId) => {
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Checking authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (this should be handled by ProtectedRoute, but as backup)
  if (!isAuthenticated) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="alert alert-warning">
          <h5>การเข้าถึงถูกปฏิเสธ</h5>
          <p>กรุณาเข้าสู่ระบบเพื่อดูข้อมูลผู้ใช้</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      {AuthDebugInfo && <AuthDebugInfo />}
      <div className="row g-3">
        <div className="col-12">
          <div className="px-0 d-flex align-items-center justify-content-between flex-wrap">
            <h3 className="fw-bold flex-fill mb-0">การจัดการผู้ใช้</h3>
            <button 
              type="button" 
              className="btn btn-dark me-1 mt-1 w-sm-100" 
              data-bs-toggle="modal" 
              data-bs-target="#createuser"
            >
              เพิ่มผู้ใช้
            </button>
            <div className="dropdown">
              <button 
                className="btn btn-primary dropdown-toggle mt-1 w-sm-100" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                สถานะ: {filters.status === 'all' ? 'ทั้งหมด' : userService.formatStatus(filters.status)}
              </button>
              <ul className="dropdown-menu dropdown-menu-end p-2 p-xl-3 shadow rounded-4">
                <li>
                  <button 
                    className={`dropdown-item rounded-pill ${filters.status === 'all' ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, status: 'all'})}
                  >
                    ทั้งหมด
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item rounded-pill ${filters.status === 'active' ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, status: 'active'})}
                  >
                    ใช้งานอยู่
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item rounded-pill ${filters.status === 'inactive' ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, status: 'inactive'})}
                  >
                    ปิดการใช้งาน
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item rounded-pill ${filters.status === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, status: 'pending'})}
                  >
                    รอยืนยัน
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="col-12">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาผู้ใช้..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="">ตำแหน่งทั้งหมด</option>
                <option value="admin">ผู้ดูแลระบบ</option>
                <option value="manager">ผู้จัดการ</option>
                <option value="staff">พนักงาน</option>
                <option value="user">ผู้ใช้งาน</option>
              </select>
            </div>
            <div className="col-md-3">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={loadUsers}
              >
                รีเฟรช
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        )}

        {/* Users List */}
        {users.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="fa fa-users fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">ไม่พบข้อมูลผู้ใช้</h5>
              <p className="text-muted">ลองปรับเปลี่ยนตัวกรองหรือเพิ่มผู้ใช้ใหม่</p>
            </div>
          </div>
        ) : (
          users.map((user, index) => (
            <div className="col-lg-6 col-md-12" key={user.id || index}>
              <div className="card p-lg-3">
                <div className="card-body d-flex flex-column flex-sm-row text-center text-sm-start">
                  <div className="profile-av text-center">
                    <div className="avatar xl rounded-circle img-thumbnail shadow d-flex align-items-center justify-content-center bg-light">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="avatar xl rounded-circle"/>
                      ) : (
                        <i className="fa fa-user fa-2x text-muted"></i>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-0 ms-sm-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-1 mt-2">{user.fullName}</h5>
                        <p className="text-muted mb-1 small">{user.email}</p>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${getRoleBadgeClass(user.role)} mb-1`}>
                          {user.displayRole}
                        </span>
                        <br/>
                        <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                          {user.displayStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="small text-muted mb-2">
                      <div>เข้าร่วมเมื่อ: {user.joinedDate}</div>
                      <div>เข้าสู่ระบบล่าสุด: {user.lastLogin}</div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      <Link 
                        className="btn btn-sm btn-outline-primary" 
                        to={`/user-profile/${user.id}`}
                      >
                        ดูโปรไฟล์
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleEditUser(user)}
                        data-bs-toggle="modal"
                        data-bs-target="#edituser"
                      >
                        แก้ไข
                      </button>
                      <button 
                        className={`btn btn-sm ${user.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleStatusToggle(user.id, user.status)}
                      >
                        {user.status === 'active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-info"
                        onClick={() => handleResetPassword(user.id)}
                      >
                        รีเซ็ตรหัสผ่าน
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add User Modal */}
      {AddUser && <AddUser onUserCreated={handleUserCreated} />}

      {/* Edit User Modal */}
      {selectedUser && EditUser && (
        <EditUser 
          user={selectedUser} 
          onUserUpdated={handleUserUpdated}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default UserList;
