import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'tui-calendar';
import 'tui-calendar/dist/tui-calendar.css';
// import { toast } from 'react-toastify';

// Fallback toast function if react-toastify is not available
const toast = {
  error: (message) => alert(`❌ ${message}`),
  success: (message) => alert(`✅ ${message}`),
  warning: (message) => alert(`⚠️ ${message}`),
  info: (message) => alert(`ℹ️ ${message}`)
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const CalendarData = () => {
  const calendarRef = useRef(null);
  const calendarInstance = useRef(null);
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState([]);
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_admin_token');
  };

  // Fetch room types for selector
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
      if (toast) {
        toast.error('ไม่สามารถโหลดข้อมูลประเภทห้องได้');
      }
    }
  };

  // Fetch monthly availability data
  const fetchMonthlyAvailability = async (year, month, roomTypeId = null) => {
    try {
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
        setAvailabilityData(data.data.days || []);
        updateCalendarEvents(data.data.days || []);
        console.log('📅 Monthly availability loaded:', data.data.days?.length || 0, 'days');
      }
    } catch (error) {
      console.error('❌ Error fetching monthly availability:', error);
      if (toast) {
        toast.error('ไม่สามารถโหลดข้อมูลห้องว่างได้');
      }
    }
  };

  // Convert availability data to calendar events
  const updateCalendarEvents = (days) => {
    if (!calendarInstance.current || !days) return;

    // Clear existing events
    calendarInstance.current.clear();

    // Create events for each day
    const events = days.map(day => {
      const totalRooms = day.roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0);
      const availableRooms = day.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
      const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100) : 0;

      // Color based on occupancy rate
      let bgColor = '#e8f5e8'; // Very low occupancy (green)
      let borderColor = '#4caf50';
      
      if (occupancyRate > 80) {
        bgColor = '#ffe8e8'; // High occupancy (red)
        borderColor = '#f44336';
      } else if (occupancyRate > 60) {
        bgColor = '#fff3e0'; // Medium occupancy (orange)
        borderColor = '#ff9800';
      } else if (occupancyRate > 40) {
        bgColor = '#fffde7'; // Low-medium occupancy (yellow)
        borderColor = '#ffeb3b';
      }

      return {
        id: `availability-${day.date}`,
        title: `${availableRooms}/${totalRooms} ห้องว่าง`,
        start: new Date(day.date),
        end: new Date(day.date),
        category: 'allday',
        dueDateClass: '',
        color: '#000',
        bgColor: bgColor,
        borderColor: borderColor,
        raw: {
          date: day.date,
          roomTypes: day.roomTypes,
          totalRooms,
          availableRooms,
          occupancyRate: Math.round(occupancyRate)
        }
      };
    });

    // Add events to calendar
    calendarInstance.current.createSchedules(events);
  };

  // Handle room type selection change
  const handleRoomTypeChange = (roomTypeId) => {
    setSelectedRoomType(roomTypeId);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    fetchMonthlyAvailability(year, month, roomTypeId);
  };

  // Handle calendar navigation
  const handleCalendarNavigation = (direction) => {
    if (!calendarInstance.current) return;

    if (direction === 'next') {
      calendarInstance.current.next();
    } else if (direction === 'prev') {
      calendarInstance.current.prev();
    } else if (direction === 'today') {
      calendarInstance.current.today();
    }

    // Update current date and fetch new data
    const newDate = calendarInstance.current.getDate();
    setCurrentDate(new Date(newDate));
    
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    fetchMonthlyAvailability(year, month, selectedRoomType);
  };

  // Initialize calendar
  useEffect(() => {
    if (calendarRef.current && !calendarInstance.current) {
      calendarInstance.current = new Calendar(calendarRef.current, {
        defaultView: 'month',
        useCreationPopup: false,
        useDetailPopup: false,
        taskView: false,
        scheduleView: false,
        template: {
          monthDayname: function(dayname) {
            return '<span class="calendar-week-dayname-name">' + dayname.label + '</span>';
          },
          monthGridHeader: function(model) {
            const date = new Date(model.date);
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            
            return `<span class="tui-full-calendar-weekday-grid-date ${isToday ? 'today' : ''}">${date.getDate()}</span>`;
          }
        },
        month: {
          daynames: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
          startDayOfWeek: 0,
          narrowWeekend: false
        },
        week: {
          daynames: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
          startDayOfWeek: 0,
          narrowWeekend: false
        }
      });

      // Calendar event handlers
      calendarInstance.current.on('clickSchedule', function(e) {
        const schedule = e.schedule;
        if (schedule.raw) {
          console.log('📊 Day details:', schedule.raw);
          
          // Show detailed info in alert (fallback if toast not available)
          const details = schedule.raw.roomTypes.map(rt => 
            `${rt.name}: ${rt.availableRooms}/${rt.totalRooms} ห้องว่าง`
          ).join('\n');
          
          if (toast) {
            toast.info(`📅 ${schedule.raw.date}\n${details}\n🏨 Occupancy: ${schedule.raw.occupancyRate}%`, {
              autoClose: 5000
            });
          } else {
            alert(`📅 ${schedule.raw.date}\n${details}\n🏨 Occupancy: ${schedule.raw.occupancyRate}%`);
          }
        }
      });

      console.log('📅 Calendar initialized');
    }

    return () => {
      if (calendarInstance.current) {
        calendarInstance.current.destroy();
        calendarInstance.current = null;
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchRoomTypes();
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      await fetchMonthlyAvailability(year, month, selectedRoomType);
      
      setLoading(false);
    };

    loadInitialData();
  }, []);

  return (
    <div className="room-availability-calendar">
      {/* Calendar Header Controls */}
      <div className="calendar-header mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="calendar-navigation d-flex align-items-center">
              <button 
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => handleCalendarNavigation('prev')}
                disabled={loading}
              >
                <i className="fa fa-chevron-left"></i>
              </button>
              <button 
                className="btn btn-primary btn-sm me-2"
                onClick={() => handleCalendarNavigation('today')}
                disabled={loading}
              >
                วันนี้
              </button>
              <button 
                className="btn btn-outline-primary btn-sm me-3"
                onClick={() => handleCalendarNavigation('next')}
                disabled={loading}
              >
                <i className="fa fa-chevron-right"></i>
              </button>
              <h6 className="mb-0 text-muted">
                {currentDate.toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </h6>
            </div>
          </div>
          <div className="col-md-6">
            <div className="room-type-selector">
              <label className="form-label mb-1 small">
                <i className="fa fa-filter me-1"></i>
                กรองตามประเภทห้อง:
              </label>
              <select 
                className="form-select form-select-sm"
                value={selectedRoomType}
                onChange={(e) => handleRoomTypeChange(e.target.value)}
                disabled={loading}
              >
                <option value="all">ทุกประเภทห้อง</option>
                {roomTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} ({rt.availableRooms}/{rt.totalRooms} ห้องว่าง)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-2 text-muted small">กำลังโหลดข้อมูลห้องว่าง...</p>
        </div>
      )}

      {/* Calendar Component */}
      <div 
        ref={calendarRef} 
        id="calendar"
        className="room-availability-calendar-container"
        style={{ 
          height: '500px',
          opacity: loading ? 0.5 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Calendar Legend */}
      <div className="calendar-legend mt-3">
        <div className="row">
          <div className="col-12">
            <small className="text-muted d-flex align-items-center flex-wrap">
              <span className="me-3">
                <span style={{display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50', marginRight: '4px'}}></span>
                ห้องว่างมาก (0-40%)
              </span>
              <span className="me-3">
                <span style={{display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fffde7', border: '1px solid #ffeb3b', marginRight: '4px'}}></span>
                ห้องว่างปานกลาง (40-60%)
              </span>
              <span className="me-3">
                <span style={{display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fff3e0', border: '1px solid #ff9800', marginRight: '4px'}}></span>
                ห้องว่างน้อย (60-80%)
              </span>
              <span className="me-3">
                <span style={{display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ffe8e8', border: '1px solid #f44336', marginRight: '4px'}}></span>
                ห้องเต็มเกือบหมด (80-100%)
              </span>
            </small>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {!loading && roomTypes.length > 0 && (
        <div className="calendar-stats mt-3">
          <div className="row">
            <div className="col-6 col-md-3">
              <div className="card text-center border-0 bg-light">
                <div className="card-body py-2">
                  <i className="fa fa-bed text-success mb-1"></i>
                  <h6 className="card-title mb-0">{roomTypes.length}</h6>
                  <small className="text-muted">ประเภทห้อง</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center border-0 bg-light">
                <div className="card-body py-2">
                  <i className="fa fa-home text-info mb-1"></i>
                  <h6 className="card-title mb-0">
                    {roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0)}
                  </h6>
                  <small className="text-muted">ห้องทั้งหมด</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center border-0 bg-light">
                <div className="card-body py-2">
                  <i className="fa fa-key text-warning mb-1"></i>
                  <h6 className="card-title mb-0">
                    {roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0)}
                  </h6>
                  <small className="text-muted">ห้องว่าง</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center border-0 bg-light">
                <div className="card-body py-2">
                  <i className="fa fa-percentage text-primary mb-1"></i>
                  <h6 className="card-title mb-0">
                    {roomTypes.length > 0 ? Math.round(
                      (roomTypes.reduce((sum, rt) => sum + (rt.totalRooms - rt.availableRooms), 0) / 
                       roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0)) * 100
                    ) : 0}%
                  </h6>
                  <small className="text-muted">Occupancy</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarData;