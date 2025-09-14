import React, { useState, useEffect } from 'react';
import { Alert, Button, Spinner, Badge } from 'react-bootstrap';
import ProfessionalCheckinDashboard from './ProfessionalCheckinDashboard';
import SecureLogin from './SecureLogin';
import authTokenService from '../services/authTokenService';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


const SecureProfessionalCheckinDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // ตรวจสอบว่ามี valid token อยู่หรือไม่
      if (authTokenService.hasValidToken()) {
        const userData = authTokenService.getUser();
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          safeLog('✅ User authenticated:', userData.email);
        } else {
          setAuthError('Invalid user data');
        }
      } else {
        safeLog('🔒 No valid authentication found');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setAuthError('Authentication check failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    safeLog('🎉 Login success callback received:', userData);
    safeLog('🔍 User role:', userData?.role);
    safeLog('🔍 User userType:', userData?.userType);
    
    setUser(userData);
    setIsAuthenticated(true);
    setAuthError('');
    
    // Force re-check permissions
    setTimeout(() => {
      safeLog('🔄 Re-checking permissions...');
      if (checkPermissions()) {
        safeLog('✅ Permissions granted after login');
      } else {
        safeLog('❌ Permissions denied after login');
      }
    }, 100);
    
    safeLog('✅ Login successful, user authenticated');
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authTokenService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      setAuthError('');
      
      safeLog('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setAuthError('Logout failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = () => {
    safeLog('🔍 Checking permissions for user:', user);
    
    if (!user) {
      safeLog('❌ No user data available');
      return false;
    }
    
    safeLog('🔍 User role:', user.role);
    safeLog('🔍 User userType:', user.userType);
    
    // ตรวจสอบสิทธิ์การเข้าถึง Professional Dashboard
    const hasPermission = authTokenService.hasPermission('checkin_dashboard');
    const hasAdminPanel = authTokenService.hasPermission('admin_panel');
    const isAdmin = user.role === 'admin';
    const isManager = user.role === 'manager';
    const isDev = user.role === 'DEV';
    const isDevLower = user.role === 'dev';
    
    safeLog('🔍 Permission checks:');
    safeLog('  - hasPermission(checkin_dashboard):', hasPermission);
    safeLog('  - hasPermission(admin_panel):', hasAdminPanel);
    safeLog('  - isAdmin:', isAdmin);
    safeLog('  - isManager:', isManager);
    safeLog('  - isDev:', isDev);
    safeLog('  - isDevLower:', isDevLower);
    
    const hasAccess = hasPermission || hasAdminPanel || isAdmin || isManager || isDev || isDevLower;
    
    safeLog('🔍 Final access decision:', hasAccess);
    
    return hasAccess;
  };

  // แสดง loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <div className="mt-3">
            <h5>Checking Authentication...</h5>
            <p className="text-muted">Please wait while we verify your access</p>
          </div>
        </div>
      </div>
    );
  }

  // แสดง error state
  if (authError && !isAuthenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center" style={{ maxWidth: '400px' }}>
          <Alert variant="danger">
            <Alert.Heading>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Authentication Error
            </Alert.Heading>
            <p>{authError}</p>
            <hr />
            <Button 
              variant="outline-danger" 
              onClick={() => {
                setAuthError('');
                checkAuthStatus();
              }}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  // แสดง login form ถ้ายังไม่ authenticated
  if (!isAuthenticated) {
    return <SecureLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // ตรวจสอบสิทธิ์การเข้าถึง
  if (!checkPermissions()) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center" style={{ maxWidth: '400px' }}>
          <Alert variant="warning">
            <Alert.Heading>
              <i className="bi bi-shield-exclamation me-2"></i>
              Access Denied
            </Alert.Heading>
            <p>
              You don't have permission to access the Professional Check-in Dashboard.
            </p>
            <p className="mb-0">
              <strong>Your Role:</strong> {user?.role || 'Unknown'}<br />
              <strong>Required:</strong> DEV, Admin, or Manager
            </p>
            <hr />
            <Button variant="outline-warning" onClick={handleLogout}>
              <i className="bi bi-box-arrow-left me-2"></i>
              Logout
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  // แสดง dashboard พร้อม user info และ logout
  return (
    <div>
      {/* Header bar with user info and logout */}
      <div className="bg-primary text-white p-2">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <i className="bi bi-shield-check me-2"></i>
            <span className="fw-bold">Professional Dashboard</span>
            <Badge bg="success" className="ms-2">Authenticated</Badge>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-person-circle me-2"></i>
              <span>
                {user?.firstName} {user?.lastName}
                <small className="ms-2 opacity-75">({user?.role})</small>
              </span>
            </div>
            
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={handleLogout}
              disabled={loading}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main dashboard */}
      <ProfessionalCheckinDashboard />
    </div>
  );
};

export default SecureProfessionalCheckinDashboard;
