import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'tui-calendar';
import 'tui-calendar/dist/tui-calendar.css';
import { toast } from 'react-toastify';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const RoomAvailabilityCalendar = () => {
  const calendarRef = useRef(null);
  const calendarInstance = useRef(null);
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState([]);

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
        safeLog('🏨 Room types loaded:', data.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching room types:', error);
      toast.error('ไม่สามารถโหลดข้อมูลประเภทห้องได้');
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
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK,
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
        safeLog('📅 Monthly availability loaded:', data.data.days?.length || 0, 'days');
      }
    } catch (error) {
      console.error('❌ Error fetching monthly availability:', error);
      toast.error('ไม่สามารถโหลดข้อมูลห้องว่างได้');
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
          safeLog('📊 Day details:', schedule.raw);
          
          // Show detailed info
          const details = schedule.raw.roomTypes.map(rt => 
            `${rt.name}: ${rt.availableRooms}/${rt.totalRooms} ห้องว่าง`
          ).join('\\n');
          
          toast.info(`📅 ${schedule.raw.date}\\n${details}\\n🏨 Occupancy: ${schedule.raw.occupancyRate}%`, {
            autoClose: 5000
          });
        }
      });

      safeLog('📅 Calendar initialized');
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
            <div className="calendar-navigation">
              <button 
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => handleCalendarNavigation('prev')}
                disabled={loading}
              >
                <i className="fa fa-chevron-left"></i> ก่อนหน้า
              </button>
              <button 
                className="btn btn-primary btn-sm me-2"
                onClick={() => handleCalendarNavigation('today')}
                disabled={loading}
              >
                วันนี้
              </button>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleCalendarNavigation('next')}
                disabled={loading}
              >
                ถัดไป <i className="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="room-type-selector">
              <label className="form-label mb-1">
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

      {/* Calendar Legend */}
      <div className="calendar-legend mb-3">
        <div className="row">
          <div className="col-12">
            <small className="text-muted d-flex align-items-center flex-wrap">
              <span className="me-3">
                <i className="fa fa-square text-success me-1"></i>
                ห้องว่างมาก (0-40%)
              </span>
              <span className="me-3">
                <i className="fa fa-square text-warning me-1"></i>
                ห้องว่างปานกลาง (40-60%)
              </span>
              <span className="me-3">
                <i className="fa fa-square text-orange me-1"></i>
                ห้องว่างน้อย (60-80%)
              </span>
              <span className="me-3">
                <i className="fa fa-square text-danger me-1"></i>
                ห้องเต็มเกือบหมด (80-100%)
              </span>
            </small>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-2 text-muted">กำลังโหลดข้อมูลห้องว่าง...</p>
        </div>
      )}

      {/* Calendar Component */}
      <div 
        ref={calendarRef} 
        className="room-availability-calendar-container"
        style={{ 
          height: '600px',
          opacity: loading ? 0.5 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Quick Stats */}
      {!loading && availabilityData.length > 0 && (
        <div className="calendar-stats mt-4">
          <div className="row">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="fa fa-calendar-check text-primary fa-2x mb-2"></i>
                  <h5 className="card-title">{availabilityData.length}</h5>
                  <p className="card-text text-muted">วันที่แสดงข้อมูล</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="fa fa-bed text-success fa-2x mb-2"></i>
                  <h5 className="card-title">{roomTypes.length}</h5>
                  <p className="card-text text-muted">ประเภทห้องทั้งหมด</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="fa fa-home text-info fa-2x mb-2"></i>
                  <h5 className="card-title">
                    {roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0)}
                  </h5>
                  <p className="card-text text-muted">ห้องทั้งหมด</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <i className="fa fa-key text-warning fa-2x mb-2"></i>
                  <h5 className="card-title">
                    {roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0)}
                  </h5>
                  <p className="card-text text-muted">ห้องว่างในขณะนี้</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .room-availability-calendar .tui-full-calendar-weekday-grid-date.today {
          background-color: #007bff;
          color: white;
          border-radius: 50%;
          font-weight: bold;
        }
        
        .calendar-header {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .room-availability-calendar-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
        }
        
        .text-orange {
          color: #ff9800 !important;
        }
        
        .calendar-stats .card {
          border: 1px solid #e9ecef;
          transition: transform 0.2s ease;
        }
        
        .calendar-stats .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default RoomAvailabilityCalendar;
