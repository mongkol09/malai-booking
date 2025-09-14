import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'tui-calendar';
import 'tui-calendar/dist/tui-calendar.css';
import './TemplateBasedRoomCalendar.css';
import { Link } from 'react-router-dom';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


// Default profile image (fallback if image not found)
const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC4xMzQwMSAxNCA1IDE3LjEzNCA1IDIxSDEySDJDMTIgMTcuMTM0IDE1Ljg2NiAxNCAxOSAxNEgxMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4=';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const TemplateBasedRoomCalendar = () => {
  const calendarRef = useRef(null);
  const calendarInstance = useRef(null);
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [quickSearchDate, setQuickSearchDate] = useState('');
  const [availabilityData, setAvailabilityData] = useState([]);
  const [dateDetails, setDateDetails] = useState(null);
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
    safeLog(`${type.toUpperCase()}: ${message}`);
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
      showToast('ไม่สามารถโหลดข้อมูลประเภทห้องได้', 'error');
    }
  };

  // Fetch today's stats
  const fetchTodayStats = async () => {
    try {
      // Skip if no room types loaded yet
      if (roomTypes.length === 0) {
        safeLog('Skipping today stats - no room types loaded');
        return;
      }
      
      const today = new Date().toISOString(); // Use full ISO datetime
      const details = await fetchDateDetails(today, selectedRoomType);
      
      if (details) {
        // Handle both single room type and all room types responses
        if (details.roomTypes) {
          // Multiple room types response
          const totalRooms = details.roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0);
          const availableRooms = details.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
          const bookedRooms = totalRooms - availableRooms;
          
          setTodayStats({
            totalBookings: bookedRooms,
            availableRooms: availableRooms,
            inHouseGuests: bookedRooms // Approximation
          });
        } else {
          // Single room type response
          const totalRooms = details.totalRooms || 0;
          const availableRooms = details.availableRooms || 0;
          const bookedRooms = totalRooms - availableRooms;
          
          setTodayStats({
            totalBookings: bookedRooms,
            availableRooms: availableRooms,
            inHouseGuests: bookedRooms // Approximation
          });
        }
      }
    } catch (error) {
      console.error('Error fetching today stats:', error);
      // Set default stats on error
      setTodayStats({
        totalBookings: 0,
        availableRooms: 0,
        inHouseGuests: 0
      });
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
        safeLog('📅 Monthly availability loaded:', dailyData.length, 'days');
        safeLog('📊 Sample data:', dailyData[0]);
        
        // Update calendar with new data
        updateCalendarEvents(dailyData);
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

  // Fetch detailed availability for specific date
  const fetchDateDetails = async (date, roomTypeId = null) => {
    try {
      // Validate inputs
      if (!date) {
        throw new Error('Date is required');
      }

      const token = getAuthToken();
      
      // Ensure date is in ISO datetime format
      let isoDate = date;
      if (!date.includes('T')) {
        // If date is in YYYY-MM-DD format, convert to ISO datetime
        isoDate = new Date(date + 'T00:00:00.000Z').toISOString();
      }
      
      const params = new URLSearchParams({
        date: isoDate
      });

      // Add roomTypeId only if it's not 'all'
      if (roomTypeId && roomTypeId !== 'all') {
        params.append('roomTypeId', roomTypeId);
      }

      safeLog('Fetching date details with params:', params.toString());

      const response = await fetch(`${API_BASE}/admin/availability/date-detail?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch date details: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setDateDetails(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error fetching date details:', error);
      showToast('ไม่สามารถโหลดรายละเอียดวันที่ได้', 'error');
      return null;
    }
  };

  // Convert availability data to calendar events
  const updateCalendarEvents = (days) => {
    if (!calendarInstance.current) {
      safeLog('❌ Cannot update calendar: missing calendar instance');
      return;
    }

    if (!days || days.length === 0) {
      safeLog('❌ Cannot update calendar: no data provided');
      return;
    }

    try {
      // Clear existing events
      calendarInstance.current.clear();
      safeLog('🗑️ Cleared existing calendar events', days.length, 'days to process');

      // Create events for each day
      const events = days.map(day => {
        const totalRooms = day.roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0);
        const availableRooms = day.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
        const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100) : 0;

        // Color based on occupancy rate
        let bgColor = '#e8f5e8'; // Very low occupancy (green)
        let borderColor = '#4caf50';
        let textColor = '#2e7d32';
        
        if (occupancyRate > 90) {
          bgColor = '#ffebee'; // Full occupancy (deep red)
          borderColor = '#d32f2f';
          textColor = '#c62828';
        } else if (occupancyRate > 80) {
          bgColor = '#ffe8e8'; // High occupancy (red)
          borderColor = '#f44336';
          textColor = '#d32f2f';
        } else if (occupancyRate > 60) {
          bgColor = '#fff3e0'; // Medium occupancy (orange)
          borderColor = '#ff9800';
          textColor = '#ef6c00';
        } else if (occupancyRate > 40) {
          bgColor = '#fffde7'; // Low-medium occupancy (yellow)
          borderColor = '#ffeb3b';
          textColor = '#f57f17';
        }

        // Enhanced title with availability info
        const title = totalRooms === 0 
          ? 'ไม่มีห้อง' 
          : `${availableRooms}/${totalRooms} ห้องว่าง`;

        const event = {
          id: `availability-${day.date}`,
          title: title,
          start: new Date(day.date),
          end: new Date(day.date),
          category: 'allday',
          dueDateClass: '',
          color: textColor,
          bgColor: bgColor,
          borderColor: borderColor,
          raw: {
            date: day.date,
            roomTypes: day.roomTypes,
            totalRooms,
            availableRooms,
            occupancyRate: Math.round(occupancyRate),
            isFullyBooked: availableRooms === 0 && totalRooms > 0,
            isFullyAvailable: availableRooms === totalRooms && totalRooms > 0
          }
        };

        return event;
      });

      safeLog(`📅 Creating ${events.length} calendar events`);

      // Add events to calendar
      if (events.length > 0) {
        calendarInstance.current.createSchedules(events);
        safeLog('✅ Calendar events created successfully');
      } else {
        safeLog('⚠️ No events to create');
      }
      
    } catch (error) {
      console.error('❌ Error updating calendar events:', error);
    }
  };

  // Handle room type selection change
  const handleRoomTypeChange = (roomTypeId) => {
    setSelectedRoomType(roomTypeId);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    fetchMonthlyAvailability(year, month, roomTypeId);
    fetchTodayStats(); // Update today stats
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

  // Quick search for specific date
  const handleQuickSearch = async () => {
    if (!quickSearchDate) {
      showToast('กรุณาเลือกวันที่ที่ต้องการเช็ค', 'error');
      return;
    }

    // Allow search for 'all' room types

    const searchDate = new Date(quickSearchDate);
    const details = await fetchDateDetails(quickSearchDate, selectedRoomType);
    
    if (details) {
      setSelectedDate(quickSearchDate);
      
      // Navigate calendar to the search date
      if (calendarInstance.current) {
        calendarInstance.current.setDate(searchDate);
        const year = searchDate.getFullYear();
        const month = searchDate.getMonth() + 1;
        
        if (year !== currentDate.getFullYear() || month !== currentDate.getMonth() + 1) {
          setCurrentDate(searchDate);
          fetchMonthlyAvailability(year, month, selectedRoomType);
        }
      }

      // Show availability details
      if (details.roomTypes && details.roomTypes.length > 0) {
        const roomTypeInfo = details.roomTypes.map(rt => 
          `${rt.name}: ${rt.availableRooms}/${rt.totalRooms} ห้องว่าง ${rt.availableRooms === 0 ? '(เต็ม)' : ''}`
        ).join('\n');

        showToast(`📅 วันที่ ${quickSearchDate}\n\n${roomTypeInfo}`, 'info');
      } else {
        // Handle single room type response
        const roomType = roomTypes.find(rt => rt.id === selectedRoomType);
        const roomTypeName = roomType ? roomType.name : 'Unknown';
        
        showToast(`📅 วันที่ ${quickSearchDate}\n\n${roomTypeName}: ${details.availableRooms || 0}/${details.totalRooms || 0} ห้องว่าง`, 'info');
      }
    } else {
      showToast('ไม่สามารถดึงข้อมูลห้องว่างได้ กรุณาลองใหม่', 'error');
    }
  };

  // Format date for display
  const formatDateThai = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      locale: 'th-TH'
    };
    return new Date(date).toLocaleDateString('th-TH', options);
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
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return `<span class="calendar-date ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}">${date.getDate()}</span>`;
          }
        },
        month: {
          daynames: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
          startDayOfWeek: 0,
          narrowWeekend: false
        }
      });

      // Calendar event handlers
      calendarInstance.current.on('clickSchedule', async function(e) {
        const schedule = e.schedule;
        if (schedule.raw) {
          const date = schedule.raw.date;
          setSelectedDate(date);
          
          // Fetch detailed information for this date
          const details = await fetchDateDetails(date, selectedRoomType);
          
          safeLog('📊 Day details:', schedule.raw);
          
          const roomTypeDetails = schedule.raw.roomTypes.map(rt => 
            `• ${rt.name}: ${rt.availableRooms}/${rt.totalRooms} ห้องว่าง ${rt.availableRooms === 0 ? '(เต็ม)' : ''}`
          ).join('\n');
          
          const statusText = schedule.raw.isFullyBooked ? '🔴 เต็มหมด' : 
                           schedule.raw.isFullyAvailable ? '🟢 ว่างทั้งหมด' : 
                           `📊 ใช้งาน ${schedule.raw.occupancyRate}%`;
          
          showToast(
            `📅 ${formatDateThai(date)}\n\n${roomTypeDetails}\n\n${statusText}`, 
            'info'
          );
        }
      });

      calendarInstance.current.on('beforeUpdateSchedule', function(e) {
        e.preventDefault();
      });

      safeLog('📅 Template Calendar initialized');
    }

    return () => {
      if (calendarInstance.current) {
        calendarInstance.current.destroy();
        calendarInstance.current = null;
      }
    };
  }, []);

  // Load data when room type changes
  useEffect(() => {
    if (calendarInstance.current) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      fetchMonthlyAvailability(year, month, selectedRoomType);
      
      // Fetch today stats for any room type selection
      fetchTodayStats();
    }
  }, [selectedRoomType, roomTypes]); // Add roomTypes dependency

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchRoomTypes();
      
      if (calendarInstance.current) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        await fetchMonthlyAvailability(year, month, selectedRoomType);
        
        // Fetch today stats once room types are loaded
        if (roomTypes.length > 0) {
          await fetchTodayStats();
        }
      }
    };

    loadInitialData();
  }, []);

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      <div className="body-layout d-xl-flex align-items-stretch">
        {/* Sidebar Panel */}
        <div className="body-sidebar card p-xl-4 p-3 border">
          <div className="mb-xl-4 mb-0 d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Room Availability</h6>
            <button className="d-inline-flex d-xl-none navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#body_layout_offcanvas" aria-controls="body_layout_offcanvas" aria-label="Toggle navigation">
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
              {/* Admin Profile Section */}
              <div className="d-flex align-items-center mb-3">
                <img 
                  className="avatar lg rounded-circle border border-3" 
                  src={defaultProfileImage}
                  alt="avatar"
                  style={{ width: '60px', height: '60px' }}
                />
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
              
              {/* Quick Search Panel */}
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex align-items-start px-0 pb-2">
                  <span className="text-muted">Quick Room Check</span>
                </li>
                
                {/* Room Type Selector */}
                <li className="list-group-item d-flex align-items-start px-0 py-3">
                  <div className="avatar rounded-circle no-thumbnail mt-1">
                    <i className="fa fa-bed"></i>
                  </div>
                  <div className="ms-3 w-100">
                    <span className="text-muted small">ประเภทห้อง</span>
                    <select 
                      className="form-select form-select-sm mt-1"
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
                </li>
                
                {/* Date Selector */}
                <li className="list-group-item d-flex align-items-start px-0 py-3">
                  <div className="avatar rounded-circle no-thumbnail mt-1">
                    <i className="fa fa-calendar"></i>
                  </div>
                  <div className="ms-3 w-100">
                    <span className="text-muted small">วันที่ต้องการเช็ค</span>
                    <input
                      type="date"
                      className="form-control form-control-sm mt-1"
                      value={quickSearchDate}
                      onChange={(e) => setQuickSearchDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <button
                      className="btn btn-primary btn-sm w-100 mt-2"
                      onClick={handleQuickSearch}
                      disabled={!quickSearchDate}
                    >
                      <i className="fa fa-search me-1"></i>
                      เช็คห้องว่าง
                    </button>
                  </div>
                </li>
                
                {/* Calendar Navigation */}
                <li className="list-group-item d-flex align-items-start px-0 py-3">
                  <div className="avatar rounded-circle no-thumbnail mt-1">
                    <i className="fa fa-arrows-alt"></i>
                  </div>
                  <div className="ms-3 w-100">
                    <span className="text-muted small">Navigate Calendar</span>
                    <div className="d-flex gap-1 mt-2">
                      <button 
                        className="btn btn-outline-secondary btn-sm flex-fill"
                        onClick={() => handleCalendarNavigation('prev')}
                      >
                        <i className="fa fa-chevron-left"></i>
                      </button>
                      <button 
                        className="btn btn-outline-secondary btn-sm flex-fill"
                        onClick={() => handleCalendarNavigation('today')}
                      >
                        Today
                      </button>
                      <button 
                        className="btn btn-outline-secondary btn-sm flex-fill"
                        onClick={() => handleCalendarNavigation('next')}
                      >
                        <i className="fa fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Main Calendar Content */}
        <div className="body-content bg-card border ms-lg-4 p-lg-4 p-1 rounded">
          <div className="tab-pane fade show active" id="Calendar-month" role="tabpanel" tabIndex="0">
            {/* Calendar Header */}
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
                
                {/* Legend */}
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
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-2 text-muted">Loading room availability...</div>
              </div>
            )}
            
            {/* Calendar Container */}
            <div className="calendar-wrapper bg-white rounded border">
              <div 
                ref={calendarRef} 
                className="template-calendar-container"
                style={{ height: '500px', minHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBasedRoomCalendar;
