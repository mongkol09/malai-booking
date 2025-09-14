/**
 * PIN Authentication Service
 * จัดการระบบ PIN Authentication ทั้งหมด
 */

import authTokenService from './authTokenService';

// Safe logging utility - only logs in development
const safeLog = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};


const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';

class PinAuthService {
  constructor() {
    this.lockoutKey = 'pinLockout';
    this.attemptKey = 'pinAttempts';
  }

  /**
   * ตรวจสอบสถานะ PIN ของ user ปัจจุบัน
   */
  async checkPinStatus() {
    try {
      safeLog('🔍 Checking PIN status...');
      
      const response = await authTokenService.authenticatedRequest(`${API_BASE}/auth/pin-status`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      safeLog('📋 PIN Status:', result.data);
      
      return {
        success: true,
        ...result.data
      };

    } catch (error) {
      console.error('❌ PIN status check failed:', error);
      return {
        success: false,
        error: error.message,
        requiresSetup: true // Safe fallback
      };
    }
  }

  /**
   * ตั้ง PIN ใหม่สำหรับ user
   */
  async setupPin(pin, userId) {
    try {
      safeLog('🔐 Setting up PIN for user:', userId);
      
      // Validate PIN on client side first
      const validation = this.validatePin(pin);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const response = await authTokenService.authenticatedRequest(`${API_BASE}/auth/setup-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pin: pin,
          userId: userId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        safeLog('✅ PIN setup successful');
        // Clear any previous lockout data
        this.clearLockoutData();
        
        return {
          success: true,
          data: result.data,
          message: 'PIN ตั้งค่าเรียบร้อยแล้ว'
        };
      } else {
        console.error('❌ PIN setup failed:', result.message);
        return {
          success: false,
          error: result.message || 'เกิดข้อผิดพลาดในการตั้ง PIN'
        };
      }

    } catch (error) {
      console.error('❌ PIN setup error:', error);
      return {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      };
    }
  }

  /**
   * ยืนยัน PIN สำหรับการทำรายการ
   */
  async verifyPin(pin, action, bookingData = null) {
    try {
      safeLog('🔐 Verifying PIN for action:', action);
      
      // Check client-side lockout first
      const lockoutStatus = this.checkClientLockout();
      if (lockoutStatus.isLocked) {
        return {
          success: false,
          error: `ระบบถูกล็อค เหลืออีก ${lockoutStatus.remainingTime} วินาที`,
          lockoutRemaining: lockoutStatus.remainingTime
        };
      }

      const response = await authTokenService.authenticatedRequest(`${API_BASE}/auth/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pin: pin,
          action: action,
          bookingData: bookingData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        safeLog('✅ PIN verification successful');
        // Clear failed attempts on success
        this.clearFailedAttempts();
        
        return {
          success: true,
          data: result.data,
          message: 'PIN ยืนยันสำเร็จ'
        };
      } else {
        console.error('❌ PIN verification failed:', result.message);
        
        // Handle failed attempts and lockout
        this.handleFailedAttempt(result.failedAttempts, result.lockoutUntil);
        
        return {
          success: false,
          error: result.message || 'PIN ไม่ถูกต้อง',
          failedAttempts: result.failedAttempts,
          lockoutUntil: result.lockoutUntil
        };
      }

    } catch (error) {
      console.error('❌ PIN verification error:', error);
      return {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      };
    }
  }

  /**
   * เปลี่ยน PIN
   */
  async changePin(currentPin, newPin) {
    try {
      safeLog('🔄 Changing PIN...');
      
      // Validate new PIN
      const validation = this.validatePin(newPin);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const response = await authTokenService.authenticatedRequest(`${API_BASE}/auth/change-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPin: currentPin,
          newPin: newPin
        })
      });

      const result = await response.json();
      
      if (result.success) {
        safeLog('✅ PIN changed successfully');
        this.clearLockoutData();
        
        return {
          success: true,
          data: result.data,
          message: 'เปลี่ยน PIN เรียบร้อยแล้ว'
        };
      } else {
        return {
          success: false,
          error: result.message || 'เกิดข้อผิดพลาดในการเปลี่ยน PIN'
        };
      }

    } catch (error) {
      console.error('❌ PIN change error:', error);
      return {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      };
    }
  }

  /**
   * ตรวจสอบความถูกต้องของ PIN
   */
  validatePin(pin) {
    // Check PIN length
    if (!pin || pin.length !== 6) {
      return {
        valid: false,
        error: 'PIN ต้องมี 6 หลักเท่านั้น'
      };
    }

    // Check if PIN contains only numbers
    if (!/^\d{6}$/.test(pin)) {
      return {
        valid: false,
        error: 'PIN ต้องเป็นตัวเลขเท่านั้น'
      };
    }

    // Check for sequential numbers
    if (this.isSequentialPin(pin)) {
      return {
        valid: false,
        error: 'PIN ไม่ควรเป็นเลขเรียงกัน (เช่น 123456, 654321)'
      };
    }

    // Check for repeating numbers
    if (this.isRepeatingPin(pin)) {
      return {
        valid: false,
        error: 'PIN ไม่ควรเป็นเลขซ้ำกันทั้งหมด (เช่น 111111, 222222)'
      };
    }

    return {
      valid: true,
      error: null
    };
  }

  /**
   * ตรวจสอบว่า PIN เป็นเลขเรียงกันหรือไม่
   */
  isSequentialPin(pin) {
    const ascending = pin === '123456' || pin === '234567' || 
                     pin === '345678' || pin === '456789';
    const descending = pin === '654321' || pin === '765432' || 
                      pin === '876543' || pin === '987654';
    return ascending || descending;
  }

  /**
   * ตรวจสอบว่า PIN เป็นเลขซ้ำกันหรือไม่
   */
  isRepeatingPin(pin) {
    return /^(.)\1{5}$/.test(pin);
  }

  /**
   * จัดการ failed attempts และ lockout ฝั่ง client
   */
  handleFailedAttempt(failedAttempts, lockoutUntil) {
    if (lockoutUntil) {
      const lockoutData = {
        until: new Date(lockoutUntil).getTime(),
        attempts: failedAttempts,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(this.lockoutKey, JSON.stringify(lockoutData));
    }
    
    // Store failed attempts count
    localStorage.setItem(this.attemptKey, failedAttempts.toString());
  }

  /**
   * ตรวจสอบสถานะ lockout ฝั่ง client
   */
  checkClientLockout() {
    const lockoutData = localStorage.getItem(this.lockoutKey);
    
    if (lockoutData) {
      const { until, attempts } = JSON.parse(lockoutData);
      const now = new Date().getTime();
      
      if (now < until) {
        const remainingTime = Math.ceil((until - now) / 1000);
        return {
          isLocked: true,
          remainingTime: remainingTime,
          attempts: attempts
        };
      } else {
        // Lockout expired, clear data
        this.clearLockoutData();
      }
    }
    
    return {
      isLocked: false,
      remainingTime: 0,
      attempts: 0
    };
  }

  /**
   * ล้างข้อมูล lockout
   */
  clearLockoutData() {
    localStorage.removeItem(this.lockoutKey);
    localStorage.removeItem(this.attemptKey);
  }

  /**
   * ล้างข้อมูล failed attempts
   */
  clearFailedAttempts() {
    localStorage.removeItem(this.attemptKey);
  }

  /**
   * ดึงจำนวน failed attempts ปัจจุบัน
   */
  getFailedAttempts() {
    const attempts = localStorage.getItem(this.attemptKey);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  /**
   * คำนวณเวลา lockout ตาม progressive lockout
   */
  calculateLockoutTime(failedAttempts) {
    // Progressive lockout times in minutes: 1, 3, 5, 10, 15, 30, 60, 120, 480, 1440
    const lockoutTimes = [1, 3, 5, 10, 15, 30, 60, 120, 480, 1440];
    const index = Math.min(failedAttempts - 3, lockoutTimes.length - 1);
    return lockoutTimes[Math.max(0, index)];
  }

  /**
   * ฟอร์แมต countdown timer
   */
  formatCountdown(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${remainingSeconds} วินาที`;
    }
  }

  /**
   * ตรวจสอบว่า user ต้องตั้ง PIN หรือไม่
   */
  async requiresPinSetup() {
    const status = await this.checkPinStatus();
    return status.requiresSetup || false;
  }

  /**
   * ตรวจสอบว่า PIN หมดอายุหรือไม่
   */
  async isPinExpired() {
    const status = await this.checkPinStatus();
    return status.isExpired || false;
  }
}

// Export singleton instance
const pinAuthService = new PinAuthService();
export default pinAuthService;
