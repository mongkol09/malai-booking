import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'tui-calendar';
import 'tui-calendar/dist/tui-calendar.css';
import './EnhancedRoomAvailabilityCalendar.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const EnhancedRoomAvailabilityCalendar = () => {
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

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_admin_token');
  };

  // Show toast message
  const showToast = (message, type = 'info') => {
    // แสดงข้อความแจ้งเตือน
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
        setAvailabilityData(data.data.dailyAvailability || []);
        updateCalendarEvents(data.data.dailyAvailability || []);
        console.log('📅 Monthly availability loaded:', data.data.dailyAvailability?.length || 0, 'days');
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
      const token = getAuthToken();
      const params = new URLSearchParams({
        date: date
      });

      if (roomTypeId && roomTypeId !== 'all') {
        params.append('roomTypeId', roomTypeId);
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
        setDateDetails(data.data);
        return data.data;
      }
    } catch (error) {
      console.error('❌ Error fetching date details:', error);
      showToast('ไม่สามารถโหลดรายละเอียดวันที่ได้', 'error');
      return null;
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

      return {
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

  // Quick search for specific date
  const handleQuickSearch = async () => {
    if (!quickSearchDate) {
      showToast('กรุณาเลือกวันที่ที่ต้องการเช็ค', 'error');
      return;
    }

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
      const roomTypeInfo = details.roomTypes.map(rt => 
        `${rt.name}: ${rt.availableRooms}/${rt.totalRooms} ห้องว่าง`
      ).join('\n');

      showToast(`📅 วันที่ ${quickSearchDate}\n\n${roomTypeInfo}`, 'info');
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
          
          console.log('📊 Day details:', schedule.raw);
          
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

      console.log('📅 Enhanced Calendar initialized');
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
    }
  }, [selectedRoomType]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchRoomTypes();
      
      if (calendarInstance.current) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        await fetchMonthlyAvailability(year, month, selectedRoomType);
      }
    };

    loadInitialData();
  }, []);

  return (
    <div className="enhanced-room-availability-calendar">
      <div className="row g-4">
        {/* Quick Search Panel */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-gradient-primary text-white">
              <h5 className="card-title mb-0">
                <i className="fa fa-search me-2"></i>
                ค้นหาห้องว่างด่วน - สำหรับลูกค้าโทรมาจอง
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">ประเภทห้อง</label>
                  <select 
                    className="form-select"
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
                <div className="col-md-4">
                  <label className="form-label">วันที่ต้องการเช็ค</label>
                  <input
                    type="date"
                    className="form-control"
                    value={quickSearchDate}
                    onChange={(e) => setQuickSearchDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleQuickSearch}
                    disabled={!quickSearchDate}
                  >
                    <i className="fa fa-search me-1"></i>
                    เช็คห้องว่าง
                  </button>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">
                    <i className="fa fa-info-circle me-1"></i>
                    เลือกวันที่แล้วกด "เช็คห้องว่าง"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="fa fa-calendar me-2"></i>
                    ปฏิทินห้องว่าง
                  </h5>
                  {selectedRoomType !== 'all' && (
                    <span className="badge bg-primary-soft text-primary ms-2">
                      <i className="fa fa-filter me-1"></i>
                      กรองแล้ว
                    </span>
                  )}
                </div>
                
                <div className="d-flex align-items-center gap-3">
                  {/* Calendar Navigation */}
                  <div className="btn-group" role="group">
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleCalendarNavigation('prev')}
                    >
                      <i className="fa fa-chevron-left"></i>
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleCalendarNavigation('today')}
                    >
                      วันนี้
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleCalendarNavigation('next')}
                    >
                      <i className="fa fa-chevron-right"></i>
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="d-flex gap-3 small">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded me-1" style={{width: '12px', height: '12px'}}></div>
                      <span>ว่าง</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="bg-warning rounded me-1" style={{width: '12px', height: '12px'}}></div>
                      <span>จองบางส่วน</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="bg-danger rounded me-1" style={{width: '12px', height: '12px'}}></div>
                      <span>เต็ม/เกือบเต็ม</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-body p-4">
              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                  <div className="mt-2">กำลังโหลดข้อมูลห้องว่าง...</div>
                </div>
              )}
              
              <div 
                ref={calendarRef} 
                className="enhanced-calendar-container"
                style={{ height: '600px', minHeight: '500px' }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {availabilityData.length > 0 && (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h6 className="card-title mb-0">
                  <i className="fa fa-chart-bar me-2"></i>
                  สถิติห้องว่างเดือนนี้
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {(() => {
                    const totalDays = availabilityData.length;
                    const fullyAvailableDays = availabilityData.filter(day => {
                      const totalRooms = day.roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0);
                      const availableRooms = day.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
                      return availableRooms === totalRooms && totalRooms > 0;
                    }).length;
                    
                    const fullyBookedDays = availabilityData.filter(day => {
                      const totalRooms = day.roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0);
                      const availableRooms = day.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
                      return availableRooms === 0 && totalRooms > 0;
                    }).length;

                    const partiallyBookedDays = totalDays - fullyAvailableDays - fullyBookedDays;

                    return (
                      <>
                        <div className="col-md-3">
                          <div className="text-center">
                            <div className="h4 text-success mb-1">{fullyAvailableDays}</div>
                            <div className="small text-muted">วันที่ว่างทั้งหมด</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="text-center">
                            <div className="h4 text-warning mb-1">{partiallyBookedDays}</div>
                            <div className="small text-muted">วันที่จองบางส่วน</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="text-center">
                            <div className="h4 text-danger mb-1">{fullyBookedDays}</div>
                            <div className="small text-muted">วันที่เต็ม</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="text-center">
                            <div className="h4 text-primary mb-1">{totalDays}</div>
                            <div className="small text-muted">วันทั้งหมด</div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRoomAvailabilityCalendar;
