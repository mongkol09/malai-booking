import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protected Route Component สำหรับป้องกัน routes ที่ต้อง login
const ProtectedRoute = ({ children, requireAdmin = false, requireStaff = false }) => {
  const { isAuthenticated, isLoading, hasAdminAccess, isAdmin } = useAuth();
  const location = useLocation();

  // แสดง Loading ขณะตรวจสอบ auth status
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // ถ้ายังไม่ login ให้ redirect ไป signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // ตรวจสอบสิทธิ์ Admin
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card mt-5">
              <div className="card-body text-center">
                <i className="fa fa-ban text-danger mb-3" style={{ fontSize: '3rem' }}></i>
                <h4 className="text-danger">ไม่มีสิทธิ์เข้าถึง</h4>
                <p className="text-muted">คุณไม่มีสิทธิ์ Admin ในการเข้าถึงหน้านี้</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.history.back()}
                >
                  กลับหน้าก่อนหน้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ตรวจสอบสิทธิ์ Staff (Admin หรือ Staff)
  if (requireStaff && !hasAdminAccess()) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card mt-5">
              <div className="card-body text-center">
                <i className="fa fa-ban text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                <h4 className="text-warning">ไม่มีสิทธิ์เข้าถึง</h4>
                <p className="text-muted">คุณไม่มีสิทธิ์พนักงานในการเข้าถึงหน้านี้</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.history.back()}
                >
                  กลับหน้าก่อนหน้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ถ้าผ่านการตรวจสอบทั้งหมด ให้แสดง children
  return children;
};

// Public Route Component สำหรับ pages ที่ไม่ต้อง login (เช่น signin, signup)
export const PublicRoute = ({ children, redirectIfAuthenticated = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // แสดง Loading ขณะตรวจสอบ auth status
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // ถ้า login แล้วและต้องการ redirect
  if (isAuthenticated && redirectIfAuthenticated) {
    // ถ้ามี state.from (มาจาก ProtectedRoute) ให้ไปที่นั่น ไม่งั้นไป dashboard
    const from = location.state?.from?.pathname || '/index';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default ProtectedRoute;
