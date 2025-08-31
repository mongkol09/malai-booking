import React, { useState } from 'react'
import authService from '../../../../../../../services/authService'

const Security = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    const { currentPassword, newPassword, confirmPassword } = formData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return false;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' });
      return false;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน' });
      return false;
    }

    // Check password requirements
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    
    if (!hasSpecialChar || !hasNumber) {
      setMessage({ type: 'error', text: 'รหัสผ่านต้องมีตัวอักษรพิเศษและตัวเลขอย่างน้อย 1 ตัว' });
      return false;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านเดิม' });
      return false;
    }

    return true;
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'เปลี่ยนรหัสผ่านสำเร็จ' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="tab-pane fade" id="setting-security" role="tabpanel">
        <ul className="row g-3 list-unstyled li_animate mb-0">
            <li className="col-12 mb-4">
                <h5 className="card-title fw-normal">Change your password</h5>
                <p className="text-muted">We will email you a confirmation when changing your password, so please expect that email after submitting.</p>
                <button className="btn btn-warning">Forgot your password?</button>
            </li>
            <li className="col-12">
                {/* Display message */}
                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                    </div>
                )}
                
                <form className="row g-3 justify-content-between" onSubmit={handleUpdatePassword}>
                    <div className="col-lg-4 col-md-12">
                        <div className="mb-3">
                            <label className="form-label">Current password</label>
                            <input 
                                type="password" 
                                className="form-control"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">New password</label>
                            <input 
                                type="password" 
                                className="form-control"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Confirm password</label>
                            <input 
                                type="password" 
                                className="form-control"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-link"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="col-lg-7 col-md-12">
                        <div className="bg-light border dashed p-3">
                            <h6 className="mb-2">Password Requirements</h6>
                            <p className="text-muted mb-2">To create a new password, you have to meet all of the following requirements:</p>
                            {/* <!--[ List group ]--> */}
                            <ul className="small text-muted lh-lg mb-0">
                                <li>Minimum 8 character</li>
                                <li>At least one special character</li>
                                <li>At least one number</li>
                                <li>Can’t be the same as a previous password</li>
                            </ul>
                        </div>
                    </div>
                </form>
            </li>
            <li className="col-12 mb-4">
                <hr/>
                <h5>Device History</h5>
                <p className="text-muted">If you see a device here that you believe wasn’t you, please contact our account fraud department immediately.</p>
                <button className="btn btn-dark">Log out all devices</button>
            </li>
            <li className="col-12">
                <div className="list-group list-group-custom list-group-flush mb-0">
                    <div className="list-group-item">
                        <div className="row align-items-center">
                            <div className="col-auto">
                                <div className="avatar lg text-center"><i className="fa fa-mobile fa-3x"></i></div>
                            </div>
                            <div className="col ml-n2">
                                <h6 className="mb-1">iPhone 11</h6>
                                <small className="text-muted">Brownsville, VT · <span>Jun 11 at 10:05am</span></small>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-sm btn-white">Sign out</button>                            
                            </div>
                        </div>
                    </div>
                    <div className="list-group-item">
                        <div className="row align-items-center">
                            <div className="col-auto">
                                <div className="avatar lg text-center"><i className="fa fa-desktop fa-2x"></i></div>
                            </div>
                            <div className="col ml-n2">
                                <h6 className="mb-1">iMac OSX · <span className="font-weight-normal">Safari 10.2</span></h6>
                                <small className="text-muted">Ct, Corona, CA · <span>September 14 at 2:30pm</span></small>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-sm btn-white">Sign out</button>
                            </div>
                        </div>
                    </div>
                    <div className="list-group-item">
                        <div className="row align-items-center">
                            <div className="col-auto">
                                <div className="avatar lg text-center"><i className="fa fa-laptop fa-3x"></i></div>
                            </div>
                            <div className="col ml-n2">
                                <h6 className="mb-1">HP Laptop Win10</h6>
                                <small className="text-muted">Ct, Corona, CA · <span>September 16 at 11:16am</span></small>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-sm btn-white">Sign out</button>                            
                            </div>
                        </div>
                    </div>
                    <div className="list-group-item">
                        <div className="row align-items-center">
                            <div className="col-auto">
                                <div className="avatar lg text-center"><i className="fa fa-desktop fa-2x"></i></div>
                            </div>
                            <div className="col ml-n2">
                                <h6 className="mb-1">iMac OSX · <span className="font-weight-normal">Edge browser</span></h6>
                                <small className="text-muted">Huntington Station, NY · <span>October 26 at 5:16pm</span></small>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-sm btn-white">Sign out</button>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </ul> 
    </div>
  )
}

export default Security