import React, { useState, useEffect } from 'react';
import PinSetup from './PinSetup';
import PinVerification from './PinVerification';
import authTokenService from '../services/authTokenService';

/**
 * PinCheckWrapper - Handles PIN setup and verification logic
 * This component wraps other components and ensures proper PIN authentication
 */
const PinCheckWrapper = ({ children, requirePinForActions = true }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserPinStatus();
  }, []);

  const checkUserPinStatus = async () => {
    try {
      setLoading(true);
      
      // Get current user info
      const user = authTokenService.getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserInfo(user);

      // Check if user needs PIN setup
      const response = await authTokenService.authenticatedRequest('/api/v1/auth/pin-status', {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        setNeedsPinSetup(result.requiresSetup || false);
      } else {
        // If PIN status check fails, assume setup is needed
        setNeedsPinSetup(true);
      }

    } catch (error) {
      console.error('PIN status check error:', error);
      // On error, assume PIN setup is needed for safety
      setNeedsPinSetup(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSetupComplete = (pin) => {
    console.log('✅ PIN setup completed successfully');
    setNeedsPinSetup(false);
    
    // Optionally store PIN locally for session (encrypted)
    // Note: This is just for UX, actual verification always happens server-side
    sessionStorage.setItem('pinSetupComplete', 'true');
  };

  const requestPinVerification = (action, description, bookingData = null) => {
    return new Promise((resolve, reject) => {
      setPendingAction({
        action,
        description,
        bookingData,
        resolve,
        reject
      });
      setShowPinVerification(true);
    });
  };

  const handlePinVerificationSuccess = (result) => {
    console.log('✅ PIN verification successful for action:', pendingAction?.action);
    
    if (pendingAction?.resolve) {
      pendingAction.resolve(result);
    }
    
    // Clear pending action
    setPendingAction(null);
    setShowPinVerification(false);
  };

  const handlePinVerificationCancel = () => {
    console.log('❌ PIN verification cancelled');
    
    if (pendingAction?.reject) {
      pendingAction.reject(new Error('PIN verification cancelled by user'));
    }
    
    // Clear pending action
    setPendingAction(null);
    setShowPinVerification(false);
  };

  // Provide PIN verification function to child components
  const pinVerificationService = {
    requestVerification: requestPinVerification,
    isSetupComplete: !needsPinSetup
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show PIN setup if needed
  if (needsPinSetup && userInfo) {
    return (
      <PinSetup
        onPinSetupComplete={handlePinSetupComplete}
        userInfo={userInfo}
      />
    );
  }

  // Render children with PIN verification context
  return (
    <>
      {React.cloneElement(children, {
        pinVerificationService: requirePinForActions ? pinVerificationService : null
      })}
      
      {/* PIN Verification Modal */}
      <PinVerification
        show={showPinVerification}
        onHide={handlePinVerificationCancel}
        onSuccess={handlePinVerificationSuccess}
        action={pendingAction?.action}
        title="ยืนยันตัวตน"
        description={pendingAction?.description || 'กรุณากรอกรหัส PIN เพื่อยืนยันการทำรายการ'}
        bookingData={pendingAction?.bookingData}
      />
    </>
  );
};

export default PinCheckWrapper;
