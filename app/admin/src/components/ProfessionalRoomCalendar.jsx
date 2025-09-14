import React, { useState, useEffect } from 'react';
import './ProfessionalRoomCalendar.css';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const ProfessionalRoomCalendar = () => {
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Advanced Search States
  const [searchFilters, setSearchFilters] = useState({
    dateFrom: '',
    dateTo: '',
    roomType: 'all',
    minAvailable: '',
    maxOccupancy: '',
    quickDateRange: 'week' // week, month, quarter
  });
  
  const [quickSearch, setQuickSearch] = useState('');
  const [currentView, setCurrentView] = useState('grid'); // grid, timeline, compact
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);
    return { start: today, end: endDate };
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_admin_token');
  };

  // Show toast message
  const showToast = (message, type = 'info') => {
    if (window.Swal) {
      window.Swal.fire({
        title: type === 'error' ? 'เกิดข้อผิดพลาด' : 'แจ้งเตือน',
        html: message.replace(/\n/g, '<br>'),
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

  // Fetch availability data with advanced filtering
  const fetchAvailabilityData = async (filters = null) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const activeFilters = filters || searchFilters;
      
      // Ensure dateFrom and dateTo are Date objects
      let dateFrom = activeFilters.dateFrom || dateRange.start;
      let dateTo = activeFilters.dateTo || dateRange.end;
      
      // Convert string dates to Date objects if needed
      if (typeof dateFrom === 'string') {
        dateFrom = new Date(dateFrom);
      }
      if (typeof dateTo === 'string') {
        dateTo = new Date(dateTo);
      }
      
      // Fallback to current date if invalid
      if (!dateFrom || isNaN(dateFrom.getTime())) {
        dateFrom = new Date();
      }
      if (!dateTo || isNaN(dateTo.getTime())) {
        dateTo = new Date();
      }
      
      safeLog('📅 Fetching data for:', dateFrom.toISOString().split('T')[0], 'to', dateTo.toISOString().split('T')[0]);
      
      const params = new URLSearchParams({
        year: dateFrom.getFullYear().toString(),
        month: (dateFrom.getMonth() + 1).toString()
      });

      if (activeFilters.roomType && activeFilters.roomType !== 'all') {
        params.append('roomTypeId', activeFilters.roomType);
      }

      const apiUrl = `${API_BASE}/admin/availability/monthly?${params}`;
      safeLog('🌐 API Request:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK,
          'Content-Type': 'application/json'
        }
      });

      safeLog('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('Failed to fetch availability data');
      }

      const data = await response.json();
      safeLog('📊 API Response:', data);
      
      if (data.success) {
        // Handle different API response structures
        let dailyData = data.data.dailyAvailability || data.data.days || [];
        
        safeLog('📅 Daily data:', dailyData.length, 'days');
        
        // Apply advanced filters
        dailyData = applyAdvancedFilters(dailyData, activeFilters);
        
        setAvailabilityData(dailyData);
        generateCalendarView(dailyData, dateFrom);
      } else {
        console.error('❌ API returned error:', data.message);
        showToast(`API Error: ${data.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching availability:', error);
      showToast('ไม่สามารถโหลดข้อมูลได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply advanced filters
  const applyAdvancedFilters = (data, filters) => {
    let filtered = [...data];

    // Date range filter
    if (filters.dateFrom && filters.dateTo) {
      const startDate = new Date(filters.dateFrom).toISOString().split('T')[0];
      const endDate = new Date(filters.dateTo).toISOString().split('T')[0];
      filtered = filtered.filter(day => day.date >= startDate && day.date <= endDate);
    }

    // Minimum available rooms filter
    if (filters.minAvailable) {
      const minRooms = parseInt(filters.minAvailable);
      filtered = filtered.filter(day => {
        const totalAvailable = day.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
        return totalAvailable >= minRooms;
      });
    }

    // Maximum occupancy filter
    if (filters.maxOccupancy) {
      const maxOcc = parseInt(filters.maxOccupancy);
      filtered = filtered.filter(day => {
        const totalRooms = day.roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0);
        const availableRooms = day.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
        const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100) : 0;
        return occupancyRate <= maxOcc;
      });
    }

    return filtered;
  };

  // Generate calendar view based on current view mode
  const generateCalendarView = (availabilityData, startDate) => {
    safeLog('🗓️ Generating calendar view:', currentView, 'with', availabilityData.length, 'days');
    
    const days = [];
    const baseDate = new Date(startDate);
    
    if (currentView === 'grid') {
      // Traditional calendar grid (7x6)
      const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const startCalendar = new Date(firstDay);
      startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());

      for (let i = 0; i < 42; i++) {
        const date = new Date(startCalendar);
        date.setDate(startCalendar.getDate() + i);
        
        const dateString = date.toISOString().split('T')[0];
        const dayData = availabilityData.find(d => d.date === dateString);
        
        days.push({
          date: new Date(date),
          dateString,
          dayData,
          isCurrentMonth: date.getMonth() === baseDate.getMonth(),
          isToday: date.toDateString() === new Date().toDateString(),
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        });
      }
    } else if (currentView === 'timeline') {
      // Timeline view (linear days)
      const daysToShow = Math.min(availabilityData.length, 30);
      
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i);
        
        const dateString = date.toISOString().split('T')[0];
        const dayData = availabilityData.find(d => d.date === dateString);
        
        days.push({
          date: new Date(date),
          dateString,
          dayData,
          isCurrentMonth: true,
          isToday: date.toDateString() === new Date().toDateString(),
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        });
      }
    }

    safeLog('📅 Generated', days.length, 'calendar days');
    setCalendarDays(days);
  };

  // Quick date range selection
  const handleQuickDateRange = (range) => {
    const today = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = end = new Date(today);
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'next7':
        start = new Date(today);
        end = new Date(today);
        end.setDate(today.getDate() + 6);
        break;
      case 'next30':
        start = new Date(today);
        end = new Date(today);
        end.setDate(today.getDate() + 29);
        break;
      default:
        return;
    }

    setDateRange({ start, end });
    setSearchFilters(prev => ({
      ...prev,
      dateFrom: start.toISOString().split('T')[0],
      dateTo: end.toISOString().split('T')[0],
      quickDateRange: range
    }));
    
    setCurrentDate(start);
    fetchAvailabilityData({
      ...searchFilters,
      dateFrom: start.toISOString().split('T')[0],
      dateTo: end.toISOString().split('T')[0]
    });
  };

  // Quick search functionality
  const handleQuickSearch = (query) => {
    if (!query) {
      fetchAvailabilityData();
      return;
    }

    // Parse different search patterns
    const patterns = {
      date: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      month: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|มค|กพ|มีค|เมย|พค|มิย|กค|สค|กย|ตค|พย|ธค)/i,
      today: /(today|วันนี้|ตอนนี้)/i,
      tomorrow: /(tomorrow|พรุ่งนี้)/i,
      weekend: /(weekend|สุดสัปดาห์)/i
    };

    let searchDate = null;
    const today = new Date();

    if (patterns.today.test(query)) {
      searchDate = today;
    } else if (patterns.tomorrow.test(query)) {
      searchDate = new Date(today);
      searchDate.setDate(today.getDate() + 1);
    } else if (patterns.weekend.test(query)) {
      searchDate = new Date(today);
      const daysToSaturday = 6 - today.getDay();
      searchDate.setDate(today.getDate() + daysToSaturday);
    } else if (patterns.date.test(query)) {
      const match = query.match(patterns.date);
      if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = match[3].length === 2 ? 2000 + parseInt(match[3]) : parseInt(match[3]);
        searchDate = new Date(year, month, day);
      }
    }

    if (searchDate) {
      setCurrentDate(searchDate);
      handleQuickDateRange('month');
      
      // Highlight found date
      setTimeout(() => {
        const element = document.querySelector(`[data-date="${searchDate.toISOString().split('T')[0]}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('search-highlight');
          setTimeout(() => element.classList.remove('search-highlight'), 2000);
        }
      }, 500);
    } else {
      showToast('ไม่พบรูปแบบวันที่ที่ค้นหา กรุณาลองใหม่', 'error');
    }
  };

  // Get room status
  const getRoomStatus = (day, roomTypeId = null) => {
    if (!day.dayData || !day.dayData.roomTypes) {
      return { available: 0, total: 0, status: 'no-data', occupancy: 0 };
    }

    let totalRooms = 0, availableRooms = 0;

    try {
      if (roomTypeId && roomTypeId !== 'all') {
        const roomType = day.dayData.roomTypes.find(rt => rt.id === roomTypeId);
        if (roomType) {
          totalRooms = roomType.totalRooms || 0;
          availableRooms = roomType.availableRooms || 0;
        } else {
          return { available: 0, total: 0, status: 'no-data', occupancy: 0 };
        }
      } else {
        // Sum all room types
        if (Array.isArray(day.dayData.roomTypes)) {
          totalRooms = day.dayData.roomTypes.reduce((sum, rt) => sum + (rt.totalRooms || 0), 0);
          availableRooms = day.dayData.roomTypes.reduce((sum, rt) => sum + (rt.availableRooms || 0), 0);
        }
      }

      const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100) : 0;
      
      let status = 'available';
      if (occupancyRate >= 100) status = 'full';
      else if (occupancyRate >= 90) status = 'critical';
      else if (occupancyRate >= 70) status = 'high';
      else if (occupancyRate >= 40) status = 'medium';

      return {
        available: availableRooms,
        total: totalRooms,
        occupancy: occupancyRate,
        status
      };
    } catch (error) {
      console.error('Error in getRoomStatus:', error, day);
      return { available: 0, total: 0, status: 'no-data', occupancy: 0 };
    }
  };

  // Handle day click
  const handleDayClick = (day) => {
    safeLog('📅 Day clicked:', day);
    
    if (!day.isCurrentMonth) {
      showToast('เลือกวันที่ในเดือนปัจจุบันเท่านั้น', 'info');
      return;
    }
    
    if (!day.dayData) {
      showToast(`📅 ${day.date.toLocaleDateString('th-TH')}\n\nไม่มีข้อมูลห้องพักสำหรับวันนี้`, 'info');
      return;
    }

    const status = getRoomStatus(day, searchFilters.roomType);
    
    try {
      let roomTypeDetails = 'ไม่มีข้อมูลห้องพัก';
      
      if (day.dayData.roomTypes && Array.isArray(day.dayData.roomTypes)) {
        roomTypeDetails = day.dayData.roomTypes.map(rt => 
          `${rt.name || 'Unknown'}: ${rt.availableRooms || 0}/${rt.totalRooms || 0} ห้องว่าง`
        ).join('\n');
      }

      showToast(
        `📅 ${day.date.toLocaleDateString('th-TH')}\n\n${roomTypeDetails}\n\n📊 อัตราเข้าพัก: ${Math.round(status.occupancy)}%`,
        'info'
      );
    } catch (error) {
      console.error('Error in handleDayClick:', error);
      showToast(
        `📅 ${day.date.toLocaleDateString('th-TH')}\n\nเกิดข้อผิดพลาดในการแสดงข้อมูล`,
        'error'
      );
    }
  };

  // Navigation
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    
    if (currentView === 'grid') {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else if (currentView === 'timeline') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (direction === 'next') {
        newDate.setDate(newDate.getDate() + 7);
      }
    }
    
    if (direction === 'today') {
      newDate = new Date();
    }

    setCurrentDate(newDate);
    setDateRange(prev => ({ start: newDate, end: prev.end }));
    fetchAvailabilityData();
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      safeLog('🚀 Loading initial data...');
      await fetchRoomTypes();
      
      // Set initial date range
      const today = new Date();
      setCurrentDate(today);
      
      // Initialize search filters with today's month
      setSearchFilters(prev => ({
        ...prev,
        dateFrom: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        dateTo: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
        quickDateRange: 'month'
      }));
      
      // Fetch data for current month
      try {
        await fetchAvailabilityData({
          dateFrom: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
          dateTo: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
          roomType: 'all',
          minAvailable: '',
          maxOccupancy: '',
          quickDateRange: 'month'
        });
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (availabilityData.length > 0) {
      generateCalendarView(availabilityData, currentDate);
    }
  }, [currentView, availabilityData]);

  return (
    <div className="professional-room-calendar">
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Left Sidebar - Search & Filters */}
          <div className="col-lg-3 col-xl-2 bg-white border-end p-0">
            <div className="sidebar-content h-100 d-flex flex-column">
              {/* Header */}
              <div className="sidebar-header p-3 border-bottom bg-gradient-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-search me-2"></i>
                  ค้นหาและกรอง
                </h6>
              </div>

              {/* Quick Search */}
              <div className="p-3 border-bottom">
                <label className="form-label small fw-bold">ค้นหาเร็ว</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น วันนี้, 15/12/2025"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch(quickSearch)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleQuickSearch(quickSearch)}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    ลองพิมพ์: วันนี้, พรุ่งนี้, สุดสัปดาห์, 25/12/2025
                  </small>
                </div>
              </div>

              {/* Quick Date Ranges */}
              <div className="p-3 border-bottom">
                <label className="form-label small fw-bold">ช่วงเวลา</label>
                <div className="d-grid gap-1">
                  {[
                    { key: 'today', label: 'วันนี้', icon: 'fas fa-calendar-day' },
                    { key: 'week', label: 'สัปดาห์นี้', icon: 'fas fa-calendar-week' },
                    { key: 'month', label: 'เดือนนี้', icon: 'fas fa-calendar-alt' },
                    { key: 'next7', label: '7 วันข้างหน้า', icon: 'fas fa-arrow-right' },
                    { key: 'next30', label: '30 วันข้างหน้า', icon: 'fas fa-arrow-right' },
                  ].map(range => (
                    <button
                      key={range.key}
                      className={`btn btn-sm text-start ${searchFilters.quickDateRange === range.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handleQuickDateRange(range.key)}
                    >
                      <i className={`${range.icon} me-2`}></i>
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="p-3 border-bottom">
                <label className="form-label small fw-bold">ช่วงวันที่</label>
                <div className="mb-2">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={searchFilters.dateFrom}
                    onChange={(e) => setSearchFilters(prev => ({...prev, dateFrom: e.target.value}))}
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={searchFilters.dateTo}
                    onChange={(e) => setSearchFilters(prev => ({...prev, dateTo: e.target.value}))}
                  />
                </div>
                <button
                  className="btn btn-primary btn-sm w-100"
                  onClick={() => fetchAvailabilityData()}
                >
                  <i className="fas fa-filter me-1"></i>
                  กรองตามวันที่
                </button>
              </div>

              {/* Room Type Filter */}
              <div className="p-3 border-bottom">
                <label className="form-label small fw-bold">ประเภทห้อง</label>
                <select 
                  className="form-select form-select-sm"
                  value={searchFilters.roomType}
                  onChange={(e) => setSearchFilters(prev => ({...prev, roomType: e.target.value}))}
                >
                  <option value="all">ทุกประเภทห้อง</option>
                  {roomTypes.map(roomType => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced Filters */}
              <div className="p-3 border-bottom">
                <label className="form-label small fw-bold">ตัวกรองขั้นสูง</label>
                
                <div className="mb-2">
                  <label className="form-label small">ห้องว่างขั้นต่ำ</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="เช่น 5"
                    value={searchFilters.minAvailable}
                    onChange={(e) => setSearchFilters(prev => ({...prev, minAvailable: e.target.value}))}
                  />
                </div>
                
                <div className="mb-2">
                  <label className="form-label small">อัตราเข้าพักสูงสุด (%)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="เช่น 80"
                    max="100"
                    value={searchFilters.maxOccupancy}
                    onChange={(e) => setSearchFilters(prev => ({...prev, maxOccupancy: e.target.value}))}
                  />
                </div>
                
                <button
                  className="btn btn-success btn-sm w-100"
                  onClick={() => fetchAvailabilityData()}
                >
                  <i className="fas fa-search-plus me-1"></i>
                  ค้นหาขั้นสูง
                </button>
              </div>

              {/* Clear Filters */}
              <div className="p-3 mt-auto">
                <button
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={() => {
                    setSearchFilters({
                      dateFrom: '',
                      dateTo: '',
                      roomType: 'all',
                      minAvailable: '',
                      maxOccupancy: '',
                      quickDateRange: 'month'
                    });
                    setQuickSearch('');
                    handleQuickDateRange('month');
                  }}
                >
                  <i className="fas fa-eraser me-1"></i>
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-lg-9 col-xl-10 p-0 d-flex flex-column h-100">
            {/* Top Toolbar */}
            <div className="top-toolbar bg-white border-bottom p-4 shadow-sm">
              <div className="row align-items-center">
                <div className="col-lg-7">
                  <div className="d-flex align-items-center gap-3">
                    {/* Enhanced Month Display */}
                    <div className="month-display-card bg-gradient-primary text-white px-4 py-3 rounded-lg shadow-sm">
                      <div className="d-flex align-items-center gap-3">
                        <div className="month-icon">
                          <i className="fas fa-calendar-alt fa-2x"></i>
                        </div>
                        <div className="month-info">
                          <div className="month-year text-uppercase fw-bold fs-5">
                            {currentDate.toLocaleDateString('th-TH', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="month-subtitle opacity-75 small">
                            ปฏิทินห้องพัก • {availabilityData.length} วัน
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* View Mode Toggle */}
                    <div className="btn-group shadow-sm" role="group">
                      <button 
                        className={`btn btn-sm ${currentView === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCurrentView('grid')}
                      >
                        <i className="fas fa-th me-1"></i>
                        Grid
                      </button>
                      <button 
                        className={`btn btn-sm ${currentView === 'timeline' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCurrentView('timeline')}
                      >
                        <i className="fas fa-list me-1"></i>
                        Timeline
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-5">
                  <div className="d-flex justify-content-between align-items-center gap-3">
                    {/* Navigation */}
                    <div className="btn-group shadow-sm">
                      <button 
                        className="btn btn-outline-primary btn-sm" 
                        onClick={() => navigateCalendar('prev')}
                        title="เดือนก่อนหน้า"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => navigateCalendar('today')}
                        title="กลับไปวันนี้"
                      >
                        <i className="fas fa-home me-1"></i>
                        วันนี้
                      </button>
                      <button 
                        className="btn btn-outline-primary btn-sm" 
                        onClick={() => navigateCalendar('next')}
                        title="เดือนถัดไป"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                    
                    {/* Quick Stats - Compact Version */}
                    <div className="d-flex gap-2">
                      <div className="quick-stats-compact bg-success text-white px-2 py-1 rounded shadow-sm">
                        <small>{roomTypes.reduce((sum, rt) => sum + (rt.totalRooms || 0), 0)} ห้อง</small>
                      </div>
                      
                      <div className="quick-stats-compact bg-info text-white px-2 py-1 rounded shadow-sm">
                        <small>{roomTypes.length} ประเภท</small>
                      </div>
                      
                      <div className="quick-stats-compact bg-warning text-dark px-2 py-1 rounded shadow-sm">
                        <small>{availabilityData.length} วัน</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="calendar-content flex-grow-1 p-3 bg-light">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="text-muted">กำลังโหลดข้อมูลห้องพัก...</div>
                    <div className="small text-muted mt-2">
                      เดือน: {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ) : calendarDays.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">ไม่พบข้อมูลห้องพัก</h5>
                    <p className="text-muted">
                      ไม่มีข้อมูลสำหรับเดือน {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => fetchAvailabilityData()}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      ลองโหลดอีกครั้ง
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`calendar-container ${currentView}`}>
                  {currentView === 'grid' ? (
                    // Traditional Calendar Grid
                    <div className="calendar-grid">
                      {/* Day Headers */}
                      <div className="calendar-header">
                        {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(day => (
                          <div key={day} className="day-header">{day}</div>
                        ))}
                      </div>
                      
                      {/* Calendar Days */}
                      <div className="calendar-body">
                                              {calendarDays.map((day, index) => {
                        const status = getRoomStatus(day, searchFilters.roomType);
                        return (
                          <div
                            key={index}
                            className={`
                              calendar-day 
                              status-${status.status}
                              ${!day.isCurrentMonth ? 'other-month' : ''}
                              ${day.isToday ? 'today' : ''}
                              ${day.isWeekend ? 'weekend' : ''}
                            `}
                            data-date={day.dateString}
                            onClick={() => handleDayClick(day)}
                            title={`${day.dateString}: ${status.available}/${status.total} ห้องว่าง (${Math.round(status.occupancy)}% ใช้งาน)`}
                          >
                            <div className="day-number">{day.date.getDate()}</div>
                            {day.isCurrentMonth && (
                              <div className="room-info">
                                <div className="room-count">
                                  {status.available}/{status.total}
                                </div>
                                <div className="occupancy-bar">
                                  <div 
                                    className="occupancy-fill"
                                    style={{width: `${status.occupancy}%`}}
                                  ></div>
                                </div>
                                {status.status === 'no-data' && (
                                  <small className="text-muted">ไม่มีข้อมูล</small>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  ) : (
                    // Timeline View
                    <div className="timeline-view">
                      <div className="timeline-header">
                        <div className="timeline-row header-row">
                          <div className="date-column">วันที่</div>
                          {searchFilters.roomType === 'all' ? (
                            roomTypes.map(rt => (
                              <div key={rt.id} className="room-type-column">
                                {rt.name}
                              </div>
                            ))
                          ) : (
                            <div className="room-type-column">
                              {roomTypes.find(rt => rt.id === searchFilters.roomType)?.name || 'ทุกประเภท'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="timeline-body">
                        {calendarDays.map((day, index) => (
                          <div key={index} className={`timeline-row ${day.isToday ? 'today' : ''}`}>
                            <div className="date-column">
                              <div className="date-info">
                                <div className="day-name">
                                  {day.date.toLocaleDateString('th-TH', { weekday: 'short' })}
                                </div>
                                <div className="day-number">
                                  {day.date.getDate()}
                                </div>
                                <div className="month-name">
                                  {day.date.toLocaleDateString('th-TH', { month: 'short' })}
                                </div>
                              </div>
                            </div>
                            
                            {searchFilters.roomType === 'all' ? (
                              roomTypes.map(rt => {
                                const status = getRoomStatus(day, rt.id);
                                return (
                                  <div key={rt.id} className={`room-type-column status-${status.status}`}>
                                    <div className="room-status">
                                      <span className="room-count">{status.available}/{status.total}</span>
                                      <div className="occupancy-indicator">
                                        <div 
                                          className="occupancy-fill"
                                          style={{width: `${status.occupancy}%`}}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className={`room-type-column status-${getRoomStatus(day, searchFilters.roomType).status}`}>
                                <div className="room-status">
                                  <span className="room-count">
                                    {getRoomStatus(day, searchFilters.roomType).available}/
                                    {getRoomStatus(day, searchFilters.roomType).total}
                                  </span>
                                  <div className="occupancy-indicator">
                                    <div 
                                      className="occupancy-fill"
                                      style={{width: `${getRoomStatus(day, searchFilters.roomType).occupancy}%`}}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRoomCalendar;
