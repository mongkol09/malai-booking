import React, { useState, useEffect } from 'react';
import './RoomAvailabilityTable.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const RoomAvailabilityTable = () => {
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

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
      }
    } catch (error) {
      console.error('❌ Error fetching room types:', error);
    }
  };

  // Fetch availability data
  const fetchAvailabilityData = async (year, month, roomTypeId = null) => {
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
        generateDateRange(dailyData);
      }
    } catch (error) {
      console.error('❌ Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate date range based on view mode
  const generateDateRange = (availabilityData) => {
    if (viewMode === 'week') {
      generateWeekDays(availabilityData);
    } else {
      generateMonthDays(availabilityData);
    }
  };

  // Generate week days
  const generateWeekDays = (availabilityData) => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(currentDate.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayData = availabilityData.find(d => d.date === dateString);
      
      days.push({
        date: new Date(date),
        dateString,
        dayData,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    setWeekDays(days);
  };

  // Generate month days (simplified for table view)
  const generateMonthDays = (availabilityData) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= Math.min(daysInMonth, 14); i++) { // Show max 14 days for table
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = availabilityData.find(d => d.date === dateString);
      
      days.push({
        date: new Date(date),
        dateString,
        dayData,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    setWeekDays(days);
  };

  // Get room status for display
  const getRoomStatus = (day, roomTypeId = null) => {
    if (!day.dayData) return { available: 0, total: 0, status: 'no-data' };

    if (roomTypeId && roomTypeId !== 'all') {
      const roomType = day.dayData.roomTypes.find(rt => rt.id === roomTypeId);
      if (roomType) {
        const occupancyRate = roomType.totalRooms > 0 ? 
          ((roomType.totalRooms - roomType.availableRooms) / roomType.totalRooms * 100) : 0;
        return {
          available: roomType.availableRooms,
          total: roomType.totalRooms,
          occupancy: occupancyRate,
          status: getStatusLevel(occupancyRate)
        };
      }
    } else {
      const totalRooms = day.dayData.roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0);
      const availableRooms = day.dayData.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
      const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100) : 0;
      
      return {
        available: availableRooms,
        total: totalRooms,
        occupancy: occupancyRate,
        status: getStatusLevel(occupancyRate)
      };
    }

    return { available: 0, total: 0, status: 'no-data' };
  };

  // Get status level
  const getStatusLevel = (occupancyRate) => {
    if (occupancyRate >= 100) return 'full';
    if (occupancyRate >= 90) return 'critical';
    if (occupancyRate >= 70) return 'high';
    if (occupancyRate >= 40) return 'medium';
    return 'available';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'full': '🔴',
      'critical': '🟠',
      'high': '🟡',
      'medium': '🟢',
      'available': '✅',
      'no-data': '⚪'
    };
    return icons[status] || '⚪';
  };

  // Get status text
  const getStatusText = (status) => {
    const texts = {
      'full': 'เต็ม',
      'critical': 'เกือบเต็ม',
      'high': 'ใช้งานมาก',
      'medium': 'ปานกลาง',
      'available': 'ว่าง',
      'no-data': '-'
    };
    return texts[status] || '-';
  };

  // Navigate date range
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (direction === 'next') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (direction === 'today') {
        newDate = new Date();
      }
    } else {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (direction === 'today') {
        newDate = new Date();
      }
    }
    
    setCurrentDate(newDate);
    fetchAvailabilityData(newDate.getFullYear(), newDate.getMonth() + 1, selectedRoomType);
  };

  // Handle room type change
  const handleRoomTypeChange = (roomTypeId) => {
    setSelectedRoomType(roomTypeId);
    fetchAvailabilityData(currentDate.getFullYear(), currentDate.getMonth() + 1, roomTypeId);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    fetchAvailabilityData(currentDate.getFullYear(), currentDate.getMonth() + 1, selectedRoomType);
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchRoomTypes();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      await fetchAvailabilityData(year, month, selectedRoomType);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (availabilityData.length > 0) {
      generateDateRange(availabilityData);
    }
  }, [viewMode, availabilityData]);

  return (
    <div className="room-availability-table">
      <div className="container-fluid p-4">
        {/* Header Controls */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-gradient-primary text-white">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h5 className="mb-0">
                  <i className="fas fa-table me-2"></i>
                  Room Availability Table
                </h5>
                <small className="opacity-75">
                  {viewMode === 'week' ? 'สัปดาห์' : 'เดือน'} - 
                  {currentDate.toLocaleDateString('th-TH', { 
                    month: 'long', 
                    year: 'numeric',
                    ...(viewMode === 'week' && { day: 'numeric' })
                  })}
                </small>
              </div>
              
              <div className="col-md-6">
                <div className="d-flex justify-content-end gap-2">
                  {/* View Mode Toggle */}
                  <div className="btn-group" role="group">
                    <button 
                      className={`btn btn-sm ${viewMode === 'week' ? 'btn-light' : 'btn-outline-light'}`}
                      onClick={() => handleViewModeChange('week')}
                    >
                      สัปดาห์
                    </button>
                    <button 
                      className={`btn btn-sm ${viewMode === 'month' ? 'btn-light' : 'btn-outline-light'}`}
                      onClick={() => handleViewModeChange('month')}
                    >
                      เดือน
                    </button>
                  </div>
                  
                  {/* Navigation */}
                  <div className="btn-group" role="group">
                    <button className="btn btn-outline-light btn-sm" onClick={() => navigateDate('prev')}>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="btn btn-outline-light btn-sm" onClick={() => navigateDate('today')}>
                      วันนี้
                    </button>
                    <button className="btn btn-outline-light btn-sm" onClick={() => navigateDate('next')}>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                {/* Room Type Filter */}
                <div className="d-flex align-items-center gap-3">
                  <label className="form-label mb-0 fw-bold">ประเภทห้อง:</label>
                  <select 
                    className="form-select"
                    value={selectedRoomType}
                    onChange={(e) => handleRoomTypeChange(e.target.value)}
                    style={{ width: '250px' }}
                  >
                    <option value="all">ทุกประเภทห้อง</option>
                    {roomTypes.map(roomType => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name} (฿{roomType.baseRate.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-md-6">
                {/* Status Legend */}
                <div className="d-flex justify-content-end gap-3 small">
                  <span><span className="me-1">✅</span>ว่าง</span>
                  <span><span className="me-1">🟢</span>ปานกลาง</span>
                  <span><span className="me-1">🟡</span>ใช้งานมาก</span>
                  <span><span className="me-1">🟠</span>เกือบเต็ม</span>
                  <span><span className="me-1">🔴</span>เต็ม</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-2 text-muted">กำลังโหลดข้อมูล...</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 availability-table">
                  <thead className="table-dark">
                    <tr>
                      <th className="sticky-column">
                        <i className="fas fa-bed me-2"></i>
                        ประเภทห้อง
                      </th>
                      {weekDays.map((day, index) => (
                        <th key={index} className={`text-center ${day.isToday ? 'today-column' : ''}`}>
                          <div className="date-header">
                            <div className="day-name">
                              {day.date.toLocaleDateString('th-TH', { weekday: 'short' })}
                            </div>
                            <div className="day-number">
                              {day.date.getDate()}
                            </div>
                            <div className="month-name small">
                              {day.date.toLocaleDateString('th-TH', { month: 'short' })}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* All Room Types Row (if showing all) */}
                    {selectedRoomType === 'all' && (
                      <tr className="table-primary total-row">
                        <td className="sticky-column fw-bold">
                          <i className="fas fa-chart-bar me-2"></i>
                          รวมทั้งหมด
                        </td>
                        {weekDays.map((day, index) => {
                          const status = getRoomStatus(day);
                          return (
                            <td key={index} className={`text-center status-cell status-${status.status}`}>
                              <div className="status-content">
                                <div className="status-icon">
                                  {getStatusIcon(status.status)}
                                </div>
                                <div className="room-numbers">
                                  <span className="available">{status.available}</span>
                                  <span className="separator">/</span>
                                  <span className="total">{status.total}</span>
                                </div>
                                <div className="status-text">
                                  {getStatusText(status.status)}
                                </div>
                                {status.occupancy !== undefined && (
                                  <div className="occupancy-percent">
                                    {Math.round(status.occupancy)}%
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    )}

                    {/* Individual Room Type Rows */}
                    {roomTypes.map((roomType) => {
                      if (selectedRoomType !== 'all' && selectedRoomType !== roomType.id) {
                        return null;
                      }

                      return (
                        <tr key={roomType.id} className="room-type-row">
                          <td className="sticky-column">
                            <div className="room-type-info">
                              <div className="room-type-name fw-bold">
                                {roomType.name}
                              </div>
                              <div className="room-type-details small text-muted">
                                ฿{roomType.baseRate.toLocaleString()}/คืน • {roomType.maxGuests} ท่าน
                              </div>
                            </div>
                          </td>
                          {weekDays.map((day, index) => {
                            const status = getRoomStatus(day, roomType.id);
                            return (
                              <td key={index} className={`text-center status-cell status-${status.status}`}>
                                <div className="status-content">
                                  <div className="status-icon">
                                    {getStatusIcon(status.status)}
                                  </div>
                                  <div className="room-numbers">
                                    <span className="available">{status.available}</span>
                                    <span className="separator">/</span>
                                    <span className="total">{status.total}</span>
                                  </div>
                                  <div className="status-text">
                                    {getStatusText(status.status)}
                                  </div>
                                  {status.occupancy !== undefined && (
                                    <div className="occupancy-percent">
                                      {Math.round(status.occupancy)}%
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-success text-white">
              <div className="card-body text-center">
                <i className="fas fa-check-circle fa-2x mb-2"></i>
                <h4 className="mb-0">
                  {weekDays.reduce((sum, day) => {
                    const status = getRoomStatus(day);
                    return sum + (status.status === 'available' ? 1 : 0);
                  }, 0)}
                </h4>
                <small>วันที่ห้องว่างมาก</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-warning text-white">
              <div className="card-body text-center">
                <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <h4 className="mb-0">
                  {weekDays.reduce((sum, day) => {
                    const status = getRoomStatus(day);
                    return sum + (['high', 'critical'].includes(status.status) ? 1 : 0);
                  }, 0)}
                </h4>
                <small>วันที่ใช้งานมาก</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-danger text-white">
              <div className="card-body text-center">
                <i className="fas fa-times-circle fa-2x mb-2"></i>
                <h4 className="mb-0">
                  {weekDays.reduce((sum, day) => {
                    const status = getRoomStatus(day);
                    return sum + (status.status === 'full' ? 1 : 0);
                  }, 0)}
                </h4>
                <small>วันที่เต็มหมด</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-info text-white">
              <div className="card-body text-center">
                <i className="fas fa-percentage fa-2x mb-2"></i>
                <h4 className="mb-0">
                  {Math.round(weekDays.reduce((sum, day) => {
                    const status = getRoomStatus(day);
                    return sum + (status.occupancy || 0);
                  }, 0) / weekDays.length)}%
                </h4>
                <small>อัตราเข้าพักเฉลี่ย</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailabilityTable;
