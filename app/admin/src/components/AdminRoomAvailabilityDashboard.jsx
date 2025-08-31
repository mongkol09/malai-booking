import React, { useState, useEffect } from 'react';
import SimpleCalendarComponent from './SimpleCalendarComponent';
import RoomTypeSelector from './RoomTypeSelector';
import './AdminRoomAvailabilityDashboard.css';

// Simple message function
const showMessage = (message, type = 'info') => {
  console.log(`${type.toUpperCase()}: ${message}`);
  alert(`${message}`);
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const AdminRoomAvailabilityDashboard = () => {
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInData, setWalkInData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    roomTypeId: '',
    checkinDate: '',
    checkoutDate: '',
    numberOfGuests: 2,
    specialRequests: ''
  });
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_admin_token');
  };

  // Create walk-in booking
  const handleWalkInBooking = async () => {
    if (!walkInData.customerName || !walkInData.customerPhone || !walkInData.roomTypeId || 
        !walkInData.checkinDate || !walkInData.checkoutDate) {
      showMessage('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'warning');
      return;
    }

    setCreatingBooking(true);
    try {
      const token = getAuthToken();
      const bookingData = {
        ...walkInData,
        checkinDate: new Date(walkInData.checkinDate).toISOString(),
        checkoutDate: new Date(walkInData.checkoutDate).toISOString(),
        bookingSource: 'WALK_IN_ADMIN',
        paymentStatus: 'PENDING'
      };

      const response = await fetch(`${API_BASE}/admin/availability/walk-in-booking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': 'hotel-booking-api-key-2024',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error('Failed to create walk-in booking');
      }

      const data = await response.json();
      if (data.success) {
        showMessage(`✅ สร้างการจอง Walk-in สำเร็จ! รหัสจอง: ${data.data.bookingReference}`, 'success');
        
        // Reset form
        setWalkInData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          roomTypeId: '',
          checkinDate: '',
          checkoutDate: '',
          numberOfGuests: 2,
          specialRequests: ''
        });
        setShowWalkInForm(false);
        
        // Refresh calendar data (force re-render)
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error creating walk-in booking:', error);
      showMessage('ไม่สามารถสร้างการจอง Walk-in ได้', 'error');
    } finally {
      setCreatingBooking(false);
    }
  };

  // Handle walk-in form data changes
  const handleWalkInDataChange = (field, value) => {
    setWalkInData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle room type selection
  const handleRoomTypeChange = (roomTypeId) => {
    setSelectedRoomType(roomTypeId);
    
    // Auto-fill room type for walk-in form if open
    if (showWalkInForm && roomTypeId !== 'all') {
      setWalkInData(prev => ({
        ...prev,
        roomTypeId: roomTypeId
      }));
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        // ใช้ room-types endpoint แทน monthly
        const response = await fetch(`${API_BASE}/admin/availability/room-types`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-API-Key': 'hotel-booking-api-key-2024'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // คำนวณ stats จาก room types data
            const totalRooms = data.data.reduce((sum, rt) => sum + rt.totalRooms, 0);
            const availableRooms = data.data.reduce((sum, rt) => sum + rt.availableRooms, 0);
            const occupiedRooms = totalRooms - availableRooms;
            const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

            setDashboardStats({
              totalRooms,
              availableRooms,
              occupiedRooms,
              occupancyRate
            });
          }
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
    
    // Auto-refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-room-availability-dashboard">
      {/* Page Header - Redesigned */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <i className="fa fa-home me-1"></i>
                    <span className="text-decoration-none">Dashboard</span>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="fa fa-calendar me-1"></i>ระบบจัดการ
                  </li>
                  <li className="breadcrumb-item active">ปฏิทินจัดการห้องพัก</li>
                </ol>
              </nav>
              <div className="d-flex align-items-center">
                <div className="avatar-lg bg-primary-soft rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <i className="fa fa-calendar-check fa-2x text-primary"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-1">ระบบจัดการความพร้อมของห้องพัก</h3>
                  <p className="text-muted mb-0">ตรวจสอบสถานะห้อง รับโทรศัพท์ลูกค้า และสร้างการจอง Walk-in</p>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button 
                className={`btn ${showQuickSearch ? 'btn-info' : 'btn-outline-info'} btn-sm`}
                onClick={() => setShowQuickSearch(!showQuickSearch)}
              >
                <i className="fa fa-search me-2"></i>
                ค้นหาด่วน
              </button>
              <button 
                className={`btn ${showWalkInForm ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                onClick={() => setShowWalkInForm(!showWalkInForm)}
              >
                <i className="fa fa-plus me-2"></i>
                จอง Walk-in
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => window.location.reload()}
              >
                <i className="fa fa-refresh me-2"></i>
                รีเฟรช
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats - Redesigned */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar-lg bg-primary-soft rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <i className="fa fa-home fa-2x text-primary"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{dashboardStats.totalRooms}</h3>
                  <small className="text-muted">ห้องทั้งหมด</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar-lg bg-success-soft rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <i className="fa fa-key fa-2x text-success"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold text-success">{dashboardStats.availableRooms}</h3>
                  <small className="text-muted">ห้องว่าง</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar-lg bg-warning-soft rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <i className="fa fa-bed fa-2x text-warning"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold text-warning">{dashboardStats.occupiedRooms}</h3>
                  <small className="text-muted">ห้องที่มีแขก</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className={`avatar-lg rounded-circle me-3 d-flex align-items-center justify-content-center ${
                  dashboardStats.occupancyRate > 80 ? 'bg-danger-soft' : 
                  dashboardStats.occupancyRate > 60 ? 'bg-warning-soft' : 'bg-info-soft'
                }`}>
                  <i className={`fa fa-chart-pie fa-2x ${
                    dashboardStats.occupancyRate > 80 ? 'text-danger' : 
                    dashboardStats.occupancyRate > 60 ? 'text-warning' : 'text-info'
                  }`}></i>
                </div>
                <div>
                  <h3 className={`mb-0 fw-bold ${
                    dashboardStats.occupancyRate > 80 ? 'text-danger' : 
                    dashboardStats.occupancyRate > 60 ? 'text-warning' : 'text-info'
                  }`}>{dashboardStats.occupancyRate}%</h3>
                  <small className="text-muted">Occupancy Rate</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in Booking Form - Redesigned */}
      {showWalkInForm && (
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-success text-white py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="avatar bg-white bg-opacity-20 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                      <i className="fa fa-user-plus text-white"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">สร้างการจอง Walk-in</h6>
                      <small className="opacity-75">กรอกข้อมูลลูกค้าและการจอง</small>
                    </div>
                  </div>
                  <button 
                    className="btn btn-link text-white p-0"
                    onClick={() => setShowWalkInForm(false)}
                  >
                    <i className="fa fa-times fa-lg"></i>
                  </button>
                </div>
              </div>
              <div className="card-body p-4">
                <form>
                  <div className="row g-3">
                    <div className="col-lg-4 col-md-6">
                      <label className="form-label fw-medium">ชื่อลูกค้า <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fa fa-user"></i></span>
                        <input
                          type="text"
                          className="form-control"
                          value={walkInData.customerName}
                          onChange={(e) => handleWalkInDataChange('customerName', e.target.value)}
                          placeholder="ชื่อ-นามสกุล"
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6">
                      <label className="form-label fw-medium">เบอร์โทรศัพท์ <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fa fa-phone"></i></span>
                        <input
                          type="tel"
                          className="form-control"
                          value={walkInData.customerPhone}
                          onChange={(e) => handleWalkInDataChange('customerPhone', e.target.value)}
                          placeholder="08X-XXX-XXXX"
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6">
                      <label className="form-label fw-medium">อีเมล</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fa fa-envelope"></i></span>
                        <input
                          type="email"
                          className="form-control"
                          value={walkInData.customerEmail}
                          onChange={(e) => handleWalkInDataChange('customerEmail', e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <label className="form-label fw-medium">วันที่เช็คอิน <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fa fa-calendar"></i></span>
                        <input
                          type="date"
                          className="form-control"
                          value={walkInData.checkinDate}
                          onChange={(e) => handleWalkInDataChange('checkinDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <label className="form-label fw-medium">วันที่เช็คเอาท์ <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fa fa-calendar-check"></i></span>
                        <input
                          type="date"
                          className="form-control"
                          value={walkInData.checkoutDate}
                          onChange={(e) => handleWalkInDataChange('checkoutDate', e.target.value)}
                          min={walkInData.checkinDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <label className="form-label fw-medium">จำนวนผู้เข้าพัก</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fa fa-users"></i></span>
                        <select
                          className="form-select"
                          value={walkInData.numberOfGuests}
                          onChange={(e) => handleWalkInDataChange('numberOfGuests', parseInt(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num} คน</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <label className="form-label fw-medium">ประเภทห้อง <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fa fa-bed"></i></span>
                        <select
                          className="form-select"
                          value={walkInData.roomTypeId}
                          onChange={(e) => handleWalkInDataChange('roomTypeId', e.target.value)}
                        >
                          <option value="">เลือกประเภทห้อง</option>
                          {/* Room types will be populated by RoomTypeSelector */}
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">ความต้องการพิเศษ</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={walkInData.specialRequests}
                        onChange={(e) => handleWalkInDataChange('specialRequests', e.target.value)}
                        placeholder="เตียงเสริม, ห้องติดกัน, ขออยู่ชั้นล่าง, ฯลฯ"
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                        <small className="text-muted">
                          <i className="fa fa-info-circle me-1"></i>
                          การจอง Walk-in จะได้รับการยืนยันทันที
                        </small>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowWalkInForm(false)}
                          >
                            <i className="fa fa-times me-1"></i>
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleWalkInBooking}
                            disabled={creatingBooking}
                          >
                            {creatingBooking ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                กำลังสร้างการจอง...
                              </>
                            ) : (
                              <>
                                <i className="fa fa-check me-2"></i>
                                สร้างการจอง Walk-in
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout - Redesigned */}
      <div className="row g-4">
        {/* Room Type Selector Sidebar */}
        <div className="col-xl-3 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light border-0 py-3">
              <div className="d-flex align-items-center">
                <div className="avatar bg-primary-soft rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
                  <i className="fa fa-filter text-primary"></i>
                </div>
                <h6 className="mb-0 fw-bold">จัดการประเภทห้อง</h6>
              </div>
            </div>
            <div className="card-body p-3">
              <RoomTypeSelector
                selectedRoomType={selectedRoomType}
                onRoomTypeChange={handleRoomTypeChange}
                showQuickSearch={showQuickSearch}
                onQuickSearchToggle={setShowQuickSearch}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-header bg-light border-0 py-3">
              <div className="d-flex align-items-center">
                <div className="avatar bg-info-soft rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
                  <i className="fa fa-bolt text-info"></i>
                </div>
                <h6 className="mb-0 fw-bold">Quick Actions</h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="d-grid gap-2">{/* Rest of quick actions will continue */}
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowQuickSearch(!showQuickSearch)}
                >
                  <i className="fa fa-search me-1"></i>
                  {showQuickSearch ? 'ซ่อน' : 'แสดง'} ค้นหาด่วน
                </button>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => setShowWalkInForm(!showWalkInForm)}
                >
                  <i className="fa fa-user-plus me-1"></i>
                  จอง Walk-in
                </button>
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => window.location.reload()}
                >
                  <i className="fa fa-refresh me-1"></i>
                  รีเฟรชข้อมูล
                </button>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => setSelectedRoomType('all')}
                >
                  <i className="fa fa-eye me-1"></i>
                  แสดงทุกห้อง
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Main Content - Redesigned */}
        <div className="col-xl-9 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light border-0 py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="avatar bg-primary-soft rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
                    <i className="fa fa-calendar text-primary"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">ปฏิทินห้องว่าง</h6>
                    <small className="text-muted">ตรวจสอบความพร้อมของห้องพัก</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {selectedRoomType !== 'all' && (
                    <span className="badge bg-primary-soft text-primary">
                      <i className="fa fa-filter me-1"></i>
                      กรองแล้ว
                    </span>
                  )}
                  <div className="d-flex gap-1">
                    <div className="d-flex align-items-center me-3">
                      <div className="bg-success rounded me-1" style={{width: '12px', height: '12px'}}></div>
                      <small className="text-muted">ว่าง</small>
                    </div>
                    <div className="d-flex align-items-center me-3">
                      <div className="bg-warning rounded me-1" style={{width: '12px', height: '12px'}}></div>
                      <small className="text-muted">จอง</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="bg-danger rounded me-1" style={{width: '12px', height: '12px'}}></div>
                      <small className="text-muted">เต็ม</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="calendar-container">
                <div className="calendar-wrapper">
                  {/* Pass selected room type to calendar */}
                  <SimpleCalendarComponent selectedRoomType={selectedRoomType} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Call Helper - Redesigned */}
      <div className="row g-3 mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-gradient" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="card-body p-4 text-white">
              <div className="d-flex align-items-center mb-3">
                <div className="avatar-lg bg-white bg-opacity-20 rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <i className="fa fa-phone fa-2x text-white"></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">คู่มือสำหรับรับโทรศัพท์ลูกค้า</h5>
                  <p className="mb-0 opacity-75">แนวทางปฏิบัติสำหรับเจ้าหน้าที่ Front Desk</p>
                </div>
              </div>
              
              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="card bg-white bg-opacity-10 border-0 h-100">
                    <div className="card-body p-3">
                      <h6 className="text-white mb-3">
                        <i className="fa fa-list-ol me-2"></i>
                        ขั้นตอนรับโทร
                      </h6>
                      <ol className="small mb-0 text-white-50">
                        <li className="mb-2">ทักทายและสอบถามวันที่ต้องการ</li>
                        <li className="mb-2">ใช้ "ค้นหาด่วน" เพื่อเช็คห้องว่าง</li>
                        <li className="mb-2">แนะนำห้องที่มีให้และบอกราคา</li>
                        <li className="mb-0">หากลูกค้าตกลง ใช้ "จอง Walk-in"</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4">
                  <div className="card bg-white bg-opacity-10 border-0 h-100">
                    <div className="card-body p-3">
                      <h6 className="text-white mb-3">
                        <i className="fa fa-check-circle me-2"></i>
                        ข้อมูลที่ต้องถาม
                      </h6>
                      <ul className="small mb-0 text-white-50">
                        <li className="mb-2">วันที่เช็คอิน-เช็คเอาท์</li>
                        <li className="mb-2">จำนวนผู้เข้าพัก</li>
                        <li className="mb-2">ประเภทห้องที่ต้องการ</li>
                        <li className="mb-0">ชื่อและเบอร์โทรศัพท์</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4">
                  <div className="card bg-white bg-opacity-10 border-0 h-100">
                    <div className="card-body p-3">
                      <h6 className="text-white mb-3">
                        <i className="fa fa-lightbulb me-2"></i>
                        Tips & Tricks
                      </h6>
                      <ul className="small mb-0 text-white-50">
                        <li className="mb-2">ใช้ปฏิทินดูสถานะห้องตามสี</li>
                        <li className="mb-2">คลิกวันที่เพื่อดูรายละเอียด</li>
                        <li className="mb-2">ใช้ filter ประเภทห้องตามความต้องการ</li>
                        <li className="mb-0">รีเฟรชข้อมูลเป็นระยะ</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminRoomAvailabilityDashboard;
