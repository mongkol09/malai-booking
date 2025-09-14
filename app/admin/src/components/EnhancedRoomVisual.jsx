import React, { useState, useEffect } from 'react';
import './EnhancedRoomVisual.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const EnhancedRoomVisual = () => {
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_admin_token');
  };

  // Fetch room types
  const fetchRoomTypes = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/availability/room-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room types');
      }

      const data = await response.json();
      if (data.success) {
        setRoomTypes(data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching room types:', error);
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
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK,
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
      }
    } catch (error) {
      console.error('❌ Error fetching monthly availability:', error);
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

  // Get visual status
  const getVisualStatus = (day) => {
    if (!day.isCurrentMonth || !day.dayData) return 'inactive';
    
    if (day.availableRooms === 0) return 'full';
    if (day.occupancyRate >= 90) return 'critical';
    if (day.occupancyRate >= 70) return 'high';
    if (day.occupancyRate >= 40) return 'medium';
    return 'available';
  };

  // Get room status icon
  const getRoomStatusIcon = (status) => {
    const icons = {
      'full': '🔴',
      'critical': '🟠', 
      'high': '🟡',
      'medium': '🟢',
      'available': '✅',
      'inactive': '⚪'
    };
    return icons[status] || '⚪';
  };

  // Get room status text
  const getRoomStatusText = (status) => {
    const texts = {
      'full': 'เต็มหมด',
      'critical': 'เกือบเต็ม',
      'high': 'ใช้งานมาก',
      'medium': 'ใช้งานปานกลาง',
      'available': 'ว่างมาก',
      'inactive': 'ไม่มีข้อมูล'
    };
    return texts[status] || 'ไม่ทราบ';
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

  // Handle day interaction
  const handleDayHover = (day) => {
    if (day.isCurrentMonth && day.dayData) {
      setHoveredDay(day);
    }
  };

  const handleDayClick = (day) => {
    if (day.isCurrentMonth && day.dayData) {
      setSelectedDay(day);
    }
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

  const displayDay = hoveredDay || selectedDay;

  return (
    <div className="enhanced-room-visual">
      <div className="container-fluid p-4">
        <div className="row">
          {/* Left Panel - Calendar */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-gradient-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Room Availability Calendar
                  </h5>
                  
                  <div className="d-flex align-items-center gap-3">
                    {/* Room Type Filter */}
                    <select 
                      className="form-select form-select-sm bg-light"
                      value={selectedRoomType}
                      onChange={(e) => handleRoomTypeChange(e.target.value)}
                      style={{ width: '200px' }}
                    >
                      <option value="all">ทุกประเภทห้อง</option>
                      {roomTypes.map(roomType => (
                        <option key={roomType.id} value={roomType.id}>
                          {roomType.name}
                        </option>
                      ))}
                    </select>
                    
                    {/* Navigation */}
                    <div className="btn-group">
                      <button className="btn btn-outline-light btn-sm" onClick={() => navigateMonth('prev')}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button className="btn btn-outline-light btn-sm" onClick={() => navigateMonth('today')}>
                        Today
                      </button>
                      <button className="btn btn-outline-light btn-sm" onClick={() => navigateMonth('next')}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="fs-6">
                    {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-2 text-muted">Loading calendar...</div>
                  </div>
                ) : (
                  <div className="enhanced-calendar">
                    {/* Calendar Header */}
                    <div className="calendar-header">
                      {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                      ))}
                    </div>
                    
                    {/* Calendar Body */}
                    <div className="calendar-body">
                      {calendarDays.map((day, index) => {
                        const status = getVisualStatus(day);
                        const isHovered = hoveredDay?.dateString === day.dateString;
                        const isSelected = selectedDay?.dateString === day.dateString;
                        
                        return (
                          <div
                            key={index}
                            className={`
                              enhanced-calendar-day 
                              status-${status}
                              ${!day.isCurrentMonth ? 'other-month' : ''} 
                              ${day.isToday ? 'today' : ''} 
                              ${isHovered ? 'hovered' : ''}
                              ${isSelected ? 'selected' : ''}
                            `}
                            onMouseEnter={() => handleDayHover(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            onClick={() => handleDayClick(day)}
                          >
                            <div className="day-number">{day.date.getDate()}</div>
                            
                            {day.isCurrentMonth && day.totalRooms > 0 && (
                              <>
                                <div className="room-status-icon">
                                  {getRoomStatusIcon(status)}
                                </div>
                                
                                <div className="room-count">
                                  <span className="available">{day.availableRooms}</span>
                                  <span className="separator">/</span>
                                  <span className="total">{day.totalRooms}</span>
                                </div>
                                
                                <div className="occupancy-bar">
                                  <div 
                                    className={`occupancy-fill occupancy-${status}`}
                                    style={{ width: `${day.occupancyRate}%` }}
                                  ></div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="col-lg-4">
            {/* Status Legend */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  สถานะห้องพัก
                </h6>
              </div>
              <div className="card-body">
                <div className="status-legend">
                  {[
                    { status: 'available', label: 'ว่างมาก (0-40%)', icon: '✅' },
                    { status: 'medium', label: 'ใช้งานปานกลาง (40-70%)', icon: '🟢' },
                    { status: 'high', label: 'ใช้งานมาก (70-90%)', icon: '🟡' },
                    { status: 'critical', label: 'เกือบเต็ม (90-99%)', icon: '🟠' },
                    { status: 'full', label: 'เต็มหมด (100%)', icon: '🔴' }
                  ].map(item => (
                    <div key={item.status} className="legend-item">
                      <span className="legend-icon">{item.icon}</span>
                      <span className="legend-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Day Details Panel */}
            {displayDay && (
              <div className="card border-0 shadow-sm">
                <div className={`card-header text-white bg-gradient-${getVisualStatus(displayDay)}`}>
                  <h6 className="mb-0">
                    <i className="fas fa-calendar-day me-2"></i>
                    {displayDay.dateString}
                  </h6>
                  <small>
                    {displayDay.isToday ? 'วันนี้' : ''} 
                    {hoveredDay ? ' (กำลังดู)' : selectedDay ? ' (เลือกแล้ว)' : ''}
                  </small>
                </div>
                
                <div className="card-body">
                  {/* Overall Status */}
                  <div className="text-center mb-3">
                    <div className="status-icon-large">
                      {getRoomStatusIcon(getVisualStatus(displayDay))}
                    </div>
                    <h5 className={`status-text text-${getVisualStatus(displayDay)}`}>
                      {getRoomStatusText(getVisualStatus(displayDay))}
                    </h5>
                    <p className="text-muted mb-0">
                      {displayDay.availableRooms}/{displayDay.totalRooms} ห้องว่าง ({Math.round(displayDay.occupancyRate)}% ใช้งาน)
                    </p>
                  </div>

                  {/* Room Type Breakdown */}
                  {displayDay.dayData && displayDay.dayData.roomTypes && (
                    <div className="room-breakdown">
                      <h6 className="text-muted mb-2">รายละเอียดตามประเภทห้อง:</h6>
                      {displayDay.dayData.roomTypes.map((roomType, index) => {
                        const rtOccupancy = roomType.totalRooms > 0 ? 
                          ((roomType.totalRooms - roomType.availableRooms) / roomType.totalRooms * 100) : 0;
                        
                        return (
                          <div key={index} className="room-type-item mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold">{roomType.name}</span>
                              <span className="text-primary">
                                {roomType.availableRooms}/{roomType.totalRooms}
                              </span>
                            </div>
                            <div className="progress" style={{ height: '6px' }}>
                              <div 
                                className={`progress-bar bg-${rtOccupancy >= 90 ? 'danger' : rtOccupancy >= 70 ? 'warning' : 'success'}`}
                                style={{ width: `${rtOccupancy}%` }}
                              ></div>
                            </div>
                            <small className="text-muted">
                              {Math.round(rtOccupancy)}% ใช้งาน
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-3 pt-2 border-top">
                    <div className="d-grid gap-2">
                      <button className="btn btn-primary btn-sm">
                        <i className="fas fa-plus me-1"></i>
                        จองห้องวันนี้
                      </button>
                      <button className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-chart-line me-1"></i>
                        ดูรายละเอียดเพิ่มเติม
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!displayDay && (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center text-muted">
                  <i className="fas fa-hand-pointer fa-3x mb-3 opacity-50"></i>
                  <p className="mb-0">
                    <strong>วางเมาส์</strong>บนวันที่เพื่อดูข้อมูล<br/>
                    <strong>คลิก</strong>เพื่อเลือกวันที่
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRoomVisual;
