// Authentication Context สำหรับจัดการ state การ login
// ใช้ร่วมกับ authService อย่างปลอดภัย

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

// สร้าง Context
const AuthContext = createContext();

// Custom hook สำหรับใช้ AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ตรวจสอบ authentication status เมื่อเริ่มต้น (Session-based)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        
        // ตรวจสอบ user data ใน localStorage ก่อน (เพื่อให้ UI โหลดเร็ว)
        const userData = authService.getUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }

        // ตรวจสอบ session status ใน background (หยุด loop โดยลบ recursive call)
        // Disable background check to prevent infinite loop
        // setTimeout(async () => {
        //   try {
        //     const sessionStatus = await authService.checkSessionStatus();
        //     if (sessionStatus.success) {
        //       // Session ยัง valid
        //       setUser(sessionStatus.user);
        //       setIsAuthenticated(true);
        //     } else {
        //       // Session หมดอายุ พยายาม refresh
        //       try {
        //         await authService.refreshSession();
        //         // ถ้า refresh สำเร็จ ให้ตรวจสอบ session อีกครั้ง
        //         const newSessionStatus = await authService.checkSessionStatus();
        //         if (newSessionStatus.success) {
        //           setUser(newSessionStatus.user);
        //           setIsAuthenticated(true);
        //         } else {
        //           throw new Error('Session refresh failed');
        //         }
        //       } catch (refreshError) {
        //         console.error('Session refresh failed:', refreshError);
        //         // ถ้า refresh ไม่ได้ ให้ logout
        //         authService.clearAuthData();
        //         setUser(null);
        //         setIsAuthenticated(false);
        //       }
        //     }
        //   } catch (error) {
        //     console.error('Background session check failed:', error);
        //     // ไม่ต้องทำอะไร เพราะ user data อาจจะยัง valid อยู่
        //   }
        // }, 1000); // ตรวจสอบใน background หลัง 1 วินาที

      } catch (error) {
        console.error('Auth check failed:', error);
        authService.clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // ============================================
  // AUTHENTICATION ACTIONS
  // ============================================

  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, message: result.message };
      }

      throw new Error(result.message);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Redirect ไปหน้า signin หลัง logout
      navigate('/signin', { replace: true });
      
      return { success: true, message: 'ออกจากระบบสำเร็จ' };
    } catch (error) {
      console.error('Logout failed:', error);
      // แม้ logout จาก server ล้มเหลว ก็ยัง logout จาก client ได้
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect ไปหน้า signin แม้จะมี error
      navigate('/signin', { replace: true });
      
      return { success: true, message: 'ออกจากระบบสำเร็จ' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.forgotPassword(email);
      return result;
    } catch (error) {
      console.error('Forgot password failed:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (token, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.resetPassword(token, newPassword);
      return result;
    } catch (error) {
      console.error('Password reset failed:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (token) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.verifyEmail(token);
      return result;
    } catch (error) {
      console.error('Email verification failed:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const clearError = () => setError(null);

  const hasRole = (role) => authService.hasRole(role);
  const isAdmin = () => authService.isAdmin();
  const isStaff = () => authService.isStaff();
  const hasAdminAccess = () => authService.hasAdminAccess();

  // Context value
  const contextValue = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    verifyEmail: handleVerifyEmail,

    // Utilities
    clearError,
    hasRole,
    isAdmin,
    isStaff,
    hasAdminAccess,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
