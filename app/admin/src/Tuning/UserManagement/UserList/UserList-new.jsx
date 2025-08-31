import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../../services/userService';
import { useAuth } from '../../../contexts/AuthContext';

const UserList = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Dynamic imports for components
  const [AddUser, setAddUser] = useState(null);
  const [EditUser, setEditUser] = useState(null);
  const [AuthDebugInfo, setAuthDebugInfo] = useState(null);
  
  useEffect(() => {
    // Load components dynamically
    Promise.all([
      import('./Components/AddUser'),
      import('./Components/EditUser'), 
      import('./Components/AuthDebugInfo')
    ]).then(([addUserModule, editUserModule, authDebugModule]) => {
      setAddUser(() => addUserModule.default);
      setEditUser(() => editUserModule.default);
      setAuthDebugInfo(() => authDebugModule.default);
    }).catch(error => {
      console.error('Error loading components:', error);
    });
  }, []);
  
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: 'all'
  });

  // Check authentication before loading users
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      setError('กรุณาเข้าสู่ระบบ');
      setLoading(false);
      return;
    }
    
    loadUsers();
  }, [isAuthenticated, authLoading]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getAllUsers(filters);
      if (response && response.data && response.data.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  const handleUserUpdated = () => {
    loadUsers();
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      loadUsers();
      alert('ลบผู้ใช้สำเร็จ');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message || 'ไม่สามารถลบผู้ใช้ได้');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังตรวจสอบสิทธิ์...</span>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="alert alert-warning text-center">
        <h5>⚠️ ไม่มีสิทธิ์เข้าถึง</h5>
        <p>กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</p>
        <Link to="/signin" className="btn btn-primary">เข้าสู่ระบบ</Link>
      </div>
    );
  }

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      {/* Debug Info (Development Only) */}
      {AuthDebugInfo && <AuthDebugInfo />}
      
      <div className="row g-3">
        <div className="col-12">
          <div className="px-0 d-flex align-items-center justify-content-between flex-wrap">
            <h3 className="fw-bold flex-fill mb-0">การจัดการผู้ใช้</h3>
            <button 
              className="btn btn-primary me-2"
              data-bs-toggle="modal" 
              data-bs-target="#createuser"
              disabled={!AddUser}
            >
              <i className="fas fa-plus me-2"></i>
              เพิ่มผู้ใช้งาน
            </button>
            <Link to="/user-management/add" className="btn btn-outline-primary">
              <i className="fas fa-plus me-2"></i>
              เพิ่มผู้ใช้ (หน้าใหม่)
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSearchSubmit} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">ค้นหา</label>
                  <input
                    type="text"
                    className="form-control"
                    name="search"
                    placeholder="ชื่อ, นามสกุล, หรืออีเมล"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">ตำแหน่ง</label>
                  <select
                    className="form-select"
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                  >
                    <option value="">ทั้งหมด</option>
                    <option value="ADMIN">ผู้ดูแลระบบ</option>
                    <option value="STAFF">พนักงาน</option>
                    <option value="CUSTOMER">ลูกค้า</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">สถานะ</label>
                  <select
                    className="form-select"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="active">ใช้งานอยู่</option>
                    <option value="inactive">ปิดการใช้งาน</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <button type="submit" className="btn btn-primary w-100">
                    <i className="fas fa-search me-2"></i>
                    ค้นหา
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">รายการผู้ใช้งาน</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                  <p className="mt-2">กำลังโหลดข้อมูลผู้ใช้...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">ไม่พบข้อมูลผู้ใช้</h5>
                  <p className="text-muted">ยังไม่มีผู้ใช้ในระบบ หรือลองปรับเงื่อนไขการค้นหา</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ชื่อ-นามสกุล</th>
                        <th>อีเมล</th>
                        <th>ตำแหน่ง</th>
                        <th>สถานะ</th>
                        <th>วันที่สร้าง</th>
                        <th>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-2">
                                <span className="text-white fw-bold">
                                  {user.firstName?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="fw-bold">{user.fullName || `${user.firstName} ${user.lastName}`}</div>
                                {user.phoneNumber && (
                                  <small className="text-muted">{user.phoneNumber}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${
                              user.role === 'ADMIN' ? 'bg-danger' :
                              user.role === 'STAFF' ? 'bg-primary' :
                              'bg-secondary'
                            }`}>
                              {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' :
                               user.role === 'STAFF' ? 'พนักงาน' :
                               'ลูกค้า'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              user.status === 'active' ? 'bg-success' : 'bg-secondary'
                            }`}>
                              {user.status === 'active' ? 'ใช้งานอยู่' : 'ปิดการใช้งาน'}
                            </span>
                          </td>
                          <td>
                            {new Date(user.createdAt).toLocaleDateString('th-TH')}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <Link
                                to={`/user-profile/${user.id}`}
                                className="btn btn-sm btn-outline-info"
                                title="ดูข้อมูล"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleEditUser(user)}
                                title="แก้ไข"
                                disabled={!EditUser}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteUser(user.id)}
                                title="ลบ"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
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
