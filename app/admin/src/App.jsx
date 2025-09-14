import React, { Suspense } from 'react'
import { useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AdminLayout from './Layout/AdminLayout'
import AuthLayout from './Layout/AuthLayout';
import Documentation from './Tuning/Pages/Documentation/Documentation';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}

// Main App Content Component (inside AuthProvider)
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const themeMode = useSelector((state) => state.themeMode.themeMode);
  const themeColor = useSelector((state) => state.theme.themeColor);
  const borderStroke = useSelector((state) => state.stroke.borderStroke);
  const boxLayout = useSelector((state) => state.boxLayout.boxLayout);
  const monochrome = useSelector((state) => state.monochrome.monochrome);
  const borderRadius = useSelector((state) => state.borderRadius.borderRadius);
  const iconColor = useSelector((state) => state.iconColor.iconColor);
  const gradientColor = useSelector((state) => state.gradientColor.gradientColor);

  const location = useLocation();
  const pathname = location.pathname;

  const authTitleMapping = {
    "/signin": "Signin",
    // "/signup": "Signup", // 🔒 DISABLED: Admin signup disabled for security
    "/password-reset": "PasswordReset",
    "/two-step": "TwoStep",
    "/lockscreen": "Lockscreen",
    "/maintenance": "Maintenance",
    "/404": "NoPage",
  };

  const isAuthRoute = authTitleMapping[pathname];

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not authenticated and not on auth route, redirect to signin
  if (!isAuthenticated && !isAuthRoute && !pathname.startsWith('/docs')) {
    return <Navigate to="/signin" replace />;
  }

  // Render appropriate layout based on route and auth status
  if (isAuthRoute) {
    return <AuthLayout />;
  } else if (pathname.startsWith('/docs')) {
    return <Documentation />;
  } else {
    return (
      <AdminLayout 
        themeMode={themeMode}
        themeColor={themeColor} 
        borderStroke={borderStroke} 
        boxLayout={boxLayout} 
        monochrome={monochrome}
        borderRadius={borderRadius}
        iconColor={iconColor}
        gradientColor={gradientColor}
      />
    );
  }
};

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <AppContent />
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App;