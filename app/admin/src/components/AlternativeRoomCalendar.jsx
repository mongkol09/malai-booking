import React, { useState, useEffect, useRef } from 'react';
import './AlternativeRoomCalendar.css';
import LongStayConflictChecker from './LongStayConflictChecker';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Default profile image
const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC4xMzQwMSAxNCA1IDE3LjEzNCA1IDIxSDEySDJDMTIgMTcuMTM0IDE1Ljg2NiAxNCAxOSAxNEgxMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4=';

const AlternativeRoomCalendar = () => {
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [quickSearchDate, setQuickSearchDate] = useState('');
  const [longStayCheck, setLongStayCheck] = useState({
    checkIn: '',
    checkOut: '',
    roomType: 'all'
  });
  const [availabilityData, setAvailabilityData] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [todayStats, setTodayStats] = useState({ 
    totalBookings: 0, 
    availableRooms: 0, 
    inHouseGuests: 0 
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_admin_token');
  };

  // Show toast message
  const showToast = (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    if (window.Swal) {
      window.Swal.fire({
        title: type === 'error' ? 'เกิดข้อผิดพลาด' : 'แจ้งเตือน',
        text: message,
        icon: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
        timer: 3000,
        showConfirmButton: false
      });
    } else {
      alert(message);
    }
  };

  // Fetch room types
  const fetchRoomTypes = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/availability/room-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': 'hotel-booking-api-key-2024',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room types');
      }

      const data = await response.json();
      if (data.success) {
        setRoomTypes(data.data);
        console.log('🏨 Room types loaded:', data.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching room types:', error);
      showToast('ไม่สามารถโหลดข้อมูลประเภทห้องได้', 'error');
    }
  };

  // Fetch monthly availability data
  const fetchMonthlyAvailability = async (year, month, roomTypeId = null) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString()
      });

      if (roomTypeId && roomTypeId !== 'all') {
        params.append('roomTypeId', roomTypeId);
      }

      const response = await fetch(`${API_BASE}/admin/availability/monthly?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': 'hotel-booking-api-key-2024',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch availability data');
      }

      const data = await response.json();
      if (data.success) {
        const dailyData = data.data.dailyAvailability || [];
        setAvailabilityData(dailyData);
        generateCalendarDays(year, month, dailyData);
        console.log('📅 Monthly availability loaded:', dailyData.length, 'days');
      } else {
        console.error('❌ API returned unsuccessful response:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching monthly availability:', error);
      showToast('ไม่สามารถโหลดข้อมูลห้องว่างได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const generateCalendarDays = (year, month, availabilityData) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dayData = availabilityData.find(d => d.date === current.toISOString().split('T')[0]);
        const totalRooms = dayData ? dayData.roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0) : 0;
        const availableRooms = dayData ? dayData.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0) : 0;
        const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100) : 0;

        days.push({
          date: new Date(current),
          dateString: current.toISOString().split('T')[0],
          isCurrentMonth: current.getMonth() === month - 1,
          isToday: current.toDateString() === new Date().toDateString(),
          totalRooms,
          availableRooms,
          occupancyRate,
          dayData
        });

        current.setDate(current.getDate() + 1);
      }
    }

    setCalendarDays(days);
  };

  // Get color class based on occupancy
  const getOccupancyClass = (occupancyRate) => {
    if (occupancyRate === 0) return 'available';
    if (occupancyRate <= 40) return 'low';
    if (occupancyRate <= 70) return 'medium';
    if (occupancyRate <= 90) return 'high';
    return 'full';
  };

  // Handle calendar navigation
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (direction === 'today') {
      newDate = new Date();
    }
    setCurrentDate(newDate);
    fetchMonthlyAvailability(newDate.getFullYear(), newDate.getMonth() + 1, selectedRoomType);
  };

  // Handle room type change
  const handleRoomTypeChange = (roomTypeId) => {
    setSelectedRoomType(roomTypeId);
    fetchMonthlyAvailability(currentDate.getFullYear(), currentDate.getMonth() + 1, roomTypeId);
  };

  // Quick search for specific date
  const handleQuickSearch = async () => {
    if (!quickSearchDate) {
      showToast('กรุณาเลือกวันที่ที่ต้องการเช็ค', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      let isoDate = new Date(quickSearchDate + 'T00:00:00.000Z').toISOString();
      
      const params = new URLSearchParams({ date: isoDate });
      if (selectedRoomType && selectedRoomType !== 'all') {
        params.append('roomTypeId', selectedRoomType);
      }

      const response = await fetch(`${API_BASE}/admin/availability/date-detail?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': 'hotel-booking-api-key-2024',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch date details');
      }

      const data = await response.json();
      if (data.success) {
        if (data.data.roomTypes) {
          const roomTypeInfo = data.data.roomTypes.map(rt => 
            `${rt.name}: ${rt.availableRooms}/${rt.totalRooms} ห้องว่าง`
          ).join('\n');
          showToast(`📅 วันที่ ${quickSearchDate}\n\n${roomTypeInfo}`, 'info');
        } else {
          const roomType = roomTypes.find(rt => rt.id === selectedRoomType);
          const roomTypeName = roomType ? roomType.name : 'Unknown';
          showToast(`📅 วันที่ ${quickSearchDate}\n\n${roomTypeName}: ${data.data.availableRooms || 0}/${data.data.totalRooms || 0} ห้องว่าง`, 'info');
        }
      }
    } catch (error) {
      console.error('❌ Error in quick search:', error);
      showToast('ไม่สามารถค้นหาข้อมูลได้', 'error');
    }
  };

  // Long stay availability check
  const handleLongStayCheck = async () => {
    if (!longStayCheck.checkIn || !longStayCheck.checkOut) {
      showToast('กรุณาเลือกวันที่เช็คอิน และเช็คเอาท์', 'error');
      return;
    }

    const checkInDate = new Date(longStayCheck.checkIn);
    const checkOutDate = new Date(longStayCheck.checkOut);
    const daysDiff = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) {
      showToast('วันที่เช็คเอาท์ต้องหลังจากวันที่เช็คอิน', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        checkinDate: new Date(longStayCheck.checkIn + 'T00:00:00.000Z').toISOString(),
        checkoutDate: new Date(longStayCheck.checkOut + 'T00:00:00.000Z').toISOString(),
        numberOfGuests: 2
      });

      if (longStayCheck.roomType && longStayCheck.roomType !== 'all') {
        params.append('roomTypeId', longStayCheck.roomType);
      }

      const response = await fetch(`${API_BASE}/admin/availability/quick-search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': 'hotel-booking-api-key-2024',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check long stay availability');
      }

      const data = await response.json();
      if (data.success) {
        const availableRoomTypes = data.data.availableRoomTypes || [];
        if (availableRoomTypes.length > 0) {
          const roomInfo = availableRoomTypes.map(rt => 
            `✅ ${rt.name}: ${rt.availableRooms} ห้องว่าง (฿${rt.totalPrice.toLocaleString()})`
          ).join('\n');
          
          showToast(
            `🏨 Long Stay Check (${daysDiff} คืน)\n` +
            `📅 ${longStayCheck.checkIn} ถึง ${longStayCheck.checkOut}\n\n` +
            `${roomInfo}`, 
            'success'
          );
        } else {
          showToast(
            `❌ Long Stay Check (${daysDiff} คืน)\n` +
            `📅 ${longStayCheck.checkIn} ถึง ${longStayCheck.checkOut}\n\n` +
            `ไม่มีห้องว่างสำหรับช่วงเวลานี้`, 
            'error'
          );
        }
      }
    } catch (error) {
      console.error('❌ Error in long stay check:', error);
      showToast('ไม่สามารถตรวจสอบการพักยาวได้', 'error');
    }
  };

  // Handle day click
  const handleDayClick = (day) => {
    if (!day.isCurrentMonth || !day.dayData) return;

    const roomTypeDetails = day.dayData.roomTypes.map(rt => 
      `• ${rt.name}: ${rt.availableRooms}/${rt.totalRooms} ห้องว่าง`
    ).join('\n');

    const statusText = day.occupancyRate === 0 ? '🟢 ว่างทั้งหมด' :
                     day.occupancyRate === 100 ? '🔴 เต็มหมด' :
                     `📊 ใช้งาน ${Math.round(day.occupancyRate)}%`;

    showToast(
      `📅 ${day.dateString}\n\n${roomTypeDetails}\n\n${statusText}`,
      'info'
    );
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchRoomTypes();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      await fetchMonthlyAvailability(year, month, selectedRoomType);
    };

    loadInitialData();
  }, []);

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      <div className="body-layout d-xl-flex align-items-stretch">
        {/* Sidebar */}
        <div className="body-sidebar card p-xl-4 p-3 border">
          <div className="mb-xl-4 mb-0 d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Room Availability</h6>
            <button className="d-inline-flex d-xl-none navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#body_layout_offcanvas">
              <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" height="26" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M4 6l16 0"></path>
                <path d="M4 12l16 0"></path>
                <path d="M4 18l16 0"></path>
              </svg>
            </button>
          </div>
          
          <nav className="navbar navbar-expand-xl py-0">
            <div className="offcanvas offcanvas-end p-xl-0 p-4" tabIndex="-1" id="body_layout_offcanvas">
              {/* Admin Profile */}
              <div className="d-flex align-items-center mb-3">
                <img className="avatar lg rounded-circle border border-3" src={defaultProfileImage} alt="avatar" style={{ width: '60px', height: '60px' }}/>
                <div className="ms-3">
                  <h4 className="mb-0 text-gradient title-font">Admin!</h4>
                  <span className="text-muted small">admin@hotel.com</span>
                </div>
              </div>
              
              {/* Today's Stats */}
              <ul className="list-unstyled d-flex align-items-start justify-content-between rounded border p-2">
                <li className="px-2 py-1">
                  <p className="text-muted mb-0">Available</p>
                  <h5 className="mb-0 text-success">{todayStats.availableRooms}</h5>
                </li>
                <li className="px-2 py-1">
                  <p className="text-muted mb-0">Bookings</p>
                  <h5 className="mb-0 text-primary">{todayStats.totalBookings}</h5>
                </li>
                <li className="px-2 py-1">
                  <p className="text-muted mb-0">In-House</p>
                  <h5 className="mb-0 text-warning">{todayStats.inHouseGuests}</h5>
                </li>
              </ul>
              
              {/* Quick Search */}
              <div className="mt-4">
                <h6 className="text-muted mb-3">Quick Room Check</h6>
                
                <div className="mb-3">
                  <label className="form-label small">ประเภทห้อง</label>
                  <select 
                    className="form-select form-select-sm"
                    value={selectedRoomType}
                    onChange={(e) => handleRoomTypeChange(e.target.value)}
                  >
                    <option value="all">ทุกประเภทห้อง</option>
                    {roomTypes.map(roomType => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name} (฿{roomType.baseRate})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label small">วันที่ต้องการเช็ค</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={quickSearchDate}
                    onChange={(e) => setQuickSearchDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <button
                  className="btn btn-primary btn-sm w-100 mb-4"
                  onClick={handleQuickSearch}
                  disabled={!quickSearchDate}
                >
                  <i className="fa fa-search me-1"></i>
                  เช็คห้องว่าง
                </button>

                {/* Long Stay Check */}
                <h6 className="text-muted mb-3">Long Stay Check</h6>
                
                <div className="mb-2">
                  <label className="form-label small">Check-in</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={longStayCheck.checkIn}
                    onChange={(e) => setLongStayCheck({...longStayCheck, checkIn: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="mb-2">
                  <label className="form-label small">Check-out</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={longStayCheck.checkOut}
                    onChange={(e) => setLongStayCheck({...longStayCheck, checkOut: e.target.value})}
                    min={longStayCheck.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label small">ประเภทห้อง</label>
                  <select 
                    className="form-select form-select-sm"
                    value={longStayCheck.roomType}
                    onChange={(e) => setLongStayCheck({...longStayCheck, roomType: e.target.value})}
                  >
                    <option value="all">ทุกประเภทห้อง</option>
                    {roomTypes.map(roomType => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  className="btn btn-success btn-sm w-100 mb-4"
                  onClick={handleLongStayCheck}
                  disabled={!longStayCheck.checkIn || !longStayCheck.checkOut}
                >
                  <i className="fa fa-calendar-check me-1"></i>
                  เช็คการพักยาว (Basic)
                </button>

                {/* Calendar Navigation */}
                <div className="d-flex gap-1 mb-3">
                  <button className="btn btn-outline-secondary btn-sm flex-fill" onClick={() => navigateMonth('prev')}>
                    <i className="fa fa-chevron-left"></i>
                  </button>
                  <button className="btn btn-outline-secondary btn-sm flex-fill" onClick={() => navigateMonth('today')}>
                    Today
                  </button>
                  <button className="btn btn-outline-secondary btn-sm flex-fill" onClick={() => navigateMonth('next')}>
                    <i className="fa fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="body-content bg-card border ms-lg-4 p-lg-4 p-1 rounded">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <h5 className="mb-0">
                <i className="fa fa-calendar me-2"></i>
                Room Availability Calendar
              </h5>
              {selectedRoomType !== 'all' && (
                <span className="badge bg-primary-soft text-primary ms-2">
                  <i className="fa fa-filter me-1"></i>
                  Filtered
                </span>
              )}
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">
                {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
              </span>
              
              <div className="d-flex gap-2 ms-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success rounded me-1" style={{width: '8px', height: '8px'}}></div>
                  <span className="small text-muted">Available</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-warning rounded me-1" style={{width: '8px', height: '8px'}}></div>
                  <span className="small text-muted">Partial</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-danger rounded me-1" style={{width: '8px', height: '8px'}}></div>
                  <span className="small text-muted">Full</span>
                </div>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2 text-muted">Loading room availability...</div>
            </div>
          )}
          
          {/* Custom Calendar */}
          {!loading && (
            <div className="custom-calendar">
              {/* Calendar Header */}
              <div className="calendar-header">
                {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
              </div>
              
              {/* Calendar Body */}
              <div className="calendar-body">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${getOccupancyClass(day.occupancyRate)}`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="day-number">{day.date.getDate()}</div>
                    {day.isCurrentMonth && day.totalRooms > 0 && (
                      <div className="room-info">
                        <small>{day.availableRooms}/{day.totalRooms}</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Advanced Long Stay Conflict Checker */}
          <div className="mt-4">
            <LongStayConflictChecker roomTypes={roomTypes} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlternativeRoomCalendar;
