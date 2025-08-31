import React from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

const AuthDebugInfo = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const token = localStorage.getItem('hotel_admin_token');
  
  return (
    <div className="alert alert-info mt-3" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
      <h6>🔍 Auth Debug Info (Development Only)</h6>
      <div><strong>isAuthenticated:</strong> {isAuthenticated ? '✅ true' : '❌ false'}</div>
      <div><strong>isLoading:</strong> {isLoading ? '⏳ true' : '✅ false'}</div>
      <div><strong>user:</strong> {user ? `✅ ${user.email} (${user.userType})` : '❌ null'}</div>
      <div><strong>token:</strong> {token ? `✅ ${token.substring(0, 30)}...` : '❌ null'}</div>
      <div><strong>localStorage:</strong> {localStorage.getItem('hotel_admin_user') ? '✅ has user data' : '❌ no user data'}</div>
    </div>
  );
};

export default AuthDebugInfo;
