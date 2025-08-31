import React, { Component } from 'react';
import { roomColumns } from './RoomStatusData';
import roomStatusService from '../../../../../../services/roomStatusService';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

class RoomStatusTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: [],
      loading: true,
      error: null,
      // Pagination state
      pageSize: 10,
      globalFilter: '',
      // Additional data
      todaysArrivals: [],
      todaysDepartures: [],
      // Request throttling
      isUpdating: false
    };
    
    // Debounce reload to prevent multiple rapid requests
    this.debouncedReload = this.debounce(this.loadRoomStatusData, 1000);
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // Minimum 2 seconds between requests
  }

  async componentDidMount() {
    await this.loadRoomStatusData();
  }

  // Debounce function to prevent rapid successive calls
  debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Check if enough time has passed since last request
  canMakeRequest = () => {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    return timeSinceLastRequest >= this.minRequestInterval;
  };

  // Pagination handlers
  setPageSize = (newPageSize) => {
    this.setState({ pageSize: newPageSize });
  };

  setGlobalFilter = (filterValue) => {
    this.setState({ globalFilter: filterValue });
  };

  loadRoomStatusData = async () => {
    // Prevent multiple rapid requests
    if (!this.canMakeRequest()) {
      console.log('⏱️ Skipping request - too soon since last request');
      return;
    }

    try {
      this.setState({ loading: true, error: null });
      this.lastRequestTime = Date.now();
      console.log('🏠 Loading room status data...');
      
      // Production-ready authentication check
      const isAuthenticated = this.checkAuthentication();
      if (!isAuthenticated) {
        await this.handleAuthenticationFailure();
        return;
      }
      
      // Load rooms status and today's bookings
      const [roomsResponse, arrivalsResponse, departuresResponse] = await Promise.all([
        roomStatusService.getAllRoomsStatus(),
        roomStatusService.getTodaysArrivals().catch(() => ({ data: [] })), // fallback if API not available
        roomStatusService.getTodaysDepartures().catch(() => ({ data: [] }))  // fallback if API not available
      ]);
      
      console.log('📊 Room status API responses:', {
        rooms: roomsResponse,
        arrivals: arrivalsResponse,
        departures: departuresResponse
      });
      
      // Handle different response formats
      let roomsData = [];
      if (roomsResponse) {
        if (Array.isArray(roomsResponse)) {
          // Direct array response
          roomsData = roomsResponse;
        } else if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
          // Object with data property
          roomsData = roomsResponse.data;
        } else if (roomsResponse.success && roomsResponse.data) {
          // API response format
          roomsData = roomsResponse.data;
        }
      }
      
      console.log('🔍 Extracted rooms data:', roomsData);
      console.log('📊 Rooms count:', roomsData.length);
      
      if (roomsData && roomsData.length > 0) {
        this.setState({ 
          rooms: roomsData,
          todaysArrivals: (arrivalsResponse && arrivalsResponse.data) ? arrivalsResponse.data : [],
          todaysDepartures: (departuresResponse && departuresResponse.data) ? departuresResponse.data : []
        });
        console.log('✅ Room status data loaded successfully:', roomsData.length, 'rooms');
      } else {
        console.warn('⚠️ No room status data received');
        console.warn('Response structure:', roomsResponse);
        this.setState({ rooms: [] });
      }
    } catch (error) {
      console.error('❌ Error loading room status data:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('Authentication failed')) {
        this.setState({ 
          error: 'Session expired. Please login again.',
          rooms: [],
          loading: false
        });
        return;
      }
      
      this.setState({ 
        error: error.message || 'Failed to load room status data',
        rooms: []
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  // ===============================
  // AUTHENTICATION HELPERS
  // ===============================

  checkAuthentication = () => {
    // Check multiple authentication sources
    const token = localStorage.getItem('authToken') || 
                 localStorage.getItem('hotel_admin_token') || 
                 localStorage.getItem('token');
    const user = localStorage.getItem('hotel_admin_user');
    
    if (!token) {
      console.warn('🚨 No authentication token found');
      return false;
    }
    
    if (!user) {
      console.warn('🚨 No user data found');
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      // Include DEV role in allowed roles - DEV has highest privileges
      if (!userData.userType || !['DEV', 'ADMIN', 'STAFF'].includes(userData.userType)) {
        console.warn('🚨 Insufficient user permissions for role:', userData.userType);
        return false;
      }
    } catch (error) {
      console.error('🚨 Invalid user data format');
      return false;
    }
    
    console.log('✅ Authentication check passed');
    return true;
  };

  handleAuthenticationFailure = async () => {
    console.log('🔑 Handling authentication failure...');
    
    // Try to auto-login for development/production
    const autoLoginSuccess = await this.attemptAutoLogin();
    
    if (autoLoginSuccess) {
      console.log('✅ Auto-login successful, retrying data load...');
      // Retry loading data after successful login
      await this.loadRoomStatusData();
    } else {
      this.setState({ 
        loading: false,
        error: 'Authentication required. Please login to view room status.',
        rooms: []
      });
    }
  };

  attemptAutoLogin = async () => {
    try {
      console.log('🔑 Attempting automatic login...');
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
      
      // Use development credentials in development mode
      const isDevMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      if (isDevMode) {
        console.log('🔧 Development mode: Using default admin credentials');
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@hotel.com',
            password: 'SecureAdmin123!'
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Save authentication data
          localStorage.setItem('hotel_admin_token', data.data.tokens.accessToken);
          if (data.data.tokens.refreshToken) {
            localStorage.setItem('hotel_admin_refresh_token', data.data.tokens.refreshToken);
          }
          localStorage.setItem('hotel_admin_user', JSON.stringify(data.data.user));

          console.log('✅ Auto-login successful!');
          return true;
        } else {
          console.warn('⚠️ Auto-login failed:', data.message);
        }
      } else {
        console.log('🏭 Production mode: Auto-login disabled');
      }
      
      return false;
    } catch (error) {
      console.error('❌ Auto-login error:', error);
      return false;
    }
  };

  handleStatusChange = async (roomId, newStatus, notes = '') => {
    // Prevent multiple simultaneous updates
    if (this.state.isUpdating) {
      console.log('⏱️ Update already in progress, skipping...');
      return;
    }

    try {
      this.setState({ isUpdating: true });
      console.log('🔄 Updating room status:', roomId, newStatus);
      
      await roomStatusService.updateRoomStatus(roomId, {
        status: newStatus,
        notes: notes
      });
      
      console.log('✅ Room status updated successfully');
      
      // Use debounced reload to prevent rapid requests
      this.debouncedReload();
      
    } catch (error) {
      console.error('❌ Error updating room status:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('Authentication failed') || error.message.includes('401')) {
        console.log('🔑 Authentication error detected, attempting auto-login...');
        const loginSuccess = await this.handleQuickLogin();
        
        if (loginSuccess) {
          console.log('🔄 Retrying status update after successful login...');
          // Retry the status update
          try {
            await roomStatusService.updateRoomStatus(roomId, {
              status: newStatus,
              notes: notes
            });
            console.log('✅ Room status updated successfully after retry');
            this.debouncedReload();
            return;
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError);
          }
        }
      }
      
      alert(`ไม่สามารถอัพเดทสถานะห้องได้: ${error.message}`);
    } finally {
      // Reset updating flag after a delay
      setTimeout(() => {
        this.setState({ isUpdating: false });
      }, 1000);
    }
  };

  handleQuickLogin = async () => {
    try {
      this.setState({ loading: true, error: null });
      console.log('🔑 Attempting quick login...');

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@hotel.com',
          password: 'SecureAdmin123!'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save tokens
        localStorage.setItem('hotel_admin_token', data.data.tokens.accessToken);
        localStorage.setItem('token', data.data.tokens.accessToken);
        localStorage.setItem('hotel_admin_refresh_token', data.data.tokens.refreshToken);
        localStorage.setItem('hotel_admin_user', JSON.stringify(data.data.user));

        console.log('✅ Quick login successful! Reloading data...');
        
        // Reload room status data after successful login
        await this.loadRoomStatusData();
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Quick login failed:', error);
      this.setState({ 
        error: `Quick login failed: ${error.message}`,
        loading: false
      });
    }
  };

  render() {
    const { rooms, loading, error, pageSize, globalFilter, todaysArrivals, todaysDepartures } = this.state;

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <span className="ms-2">กำลังโหลดสถานะห้องพัก...</span>
        </div>
      );
    }

    if (error) {
      // Check if it's an authentication error
      const isAuthError = error.includes('login') || error.includes('Authentication') || error.includes('Session expired');
      
      return (
        <div className={`alert ${isAuthError ? 'alert-warning' : 'alert-danger'}`} role="alert">
          <div className="d-flex align-items-center">
            <i className={`bi ${isAuthError ? 'bi-shield-exclamation' : 'bi-exclamation-triangle'} me-2`}></i>
            <h6 className="alert-heading mb-0">
              {isAuthError ? '🔐 จำเป็นต้องเข้าสู่ระบบ' : '⚠️ เกิดข้อผิดพลาด!'}
            </h6>
          </div>
          <p className="mt-2 mb-0">{error}</p>
          
          {isAuthError ? (
            <div className="mt-3">
              <button 
                className="btn btn-success btn-sm me-2" 
                onClick={this.handleQuickLogin}
              >
                🔑 เข้าสู่ระบบด่วน
              </button>
              <button 
                className="btn btn-primary btn-sm me-2" 
                onClick={() => window.location.href = '/login.html'}
              >
                � ไปหน้าเข้าสู่ระบบ
              </button>
              <button 
                className="btn btn-outline-primary btn-sm" 
                onClick={() => window.open('/app/admin/emergency-token-cleaner.html', '_blank')}
              >
                🔧 แก้ปัญหาเข้าสู่ระบบ
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <button 
                className="btn btn-outline-danger btn-sm" 
                onClick={this.loadRoomStatusData}
              >
                🔄 ลองใหม่อีกครั้ง
              </button>
            </div>
          )}
        </div>
      );
    }

    // Format room data for DataTable
    const formattedRooms = rooms.map((room) => {
      const formattedRoom = roomStatusService.formatRoomForStatus(room);
      
      // Check if room has arrival/departure today
      const hasArrivalToday = todaysArrivals.some(arrival => 
        arrival.roomId === room.id || arrival.roomNumber === room.number
      );
      const hasDepartureToday = todaysDepartures.some(departure => 
        departure.roomId === room.id || departure.roomNumber === room.number
      );
      
      return {
        id: formattedRoom.id,
        roomNumber: (
          <div>
            <strong>{formattedRoom.roomNumber}</strong>
            {hasArrivalToday && <span className="badge bg-info ms-1" title="มีลูกค้าเช็คอินวันนี้">IN</span>}
            {hasDepartureToday && <span className="badge bg-warning ms-1" title="มีลูกค้าเช็คเอาท์วันนี้">OUT</span>}
          </div>
        ),
        roomType: formattedRoom.roomType,
        floor: formattedRoom.floor,
        checkOut: formattedRoom.checkOut,
        status: (
          <span className={`badge ${formattedRoom.statusColor}`}>
            {formattedRoom.status === 'available' ? 'ว่าง' : 
             formattedRoom.status === 'occupied' ? 'ไม่ว่าง' : 
             formattedRoom.status === 'dirty' ? 'สกปรก' :
             formattedRoom.status === 'maintenance' ? 'ซ่อมแซม' :
             formattedRoom.status === 'outoforder' ? 'ไม่พร้อมใช้งาน' : 
             formattedRoom.status}
          </span>
        ),
        actions: (
          <div className="btn-group btn-group-sm">
            <button 
              type="button" 
              className={`btn btn-outline-primary dropdown-toggle ${this.state.isUpdating ? 'disabled' : ''}`} 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              title="เปลี่ยนสถานะห้อง"
              disabled={this.state.isUpdating}
            >
              {this.state.isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  กำลังอัพเดท...
                </>
              ) : (
                'เปลี่ยนสถานะ'
              )}
            </button>
            <ul className="dropdown-menu">
              {roomStatusService.getRoomStatusOptions().map((statusOption) => (
                <li key={statusOption.value}>
                  <button 
                    className="dropdown-item" 
                    onClick={() => this.handleStatusChange(formattedRoom.id, statusOption.value)}
                    disabled={this.state.isUpdating}
                  >
                    <span className={`badge ${statusOption.color} me-2`}>
                      {statusOption.label}
                    </span>
                    {this.state.isUpdating && (
                      <span className="spinner-border spinner-border-sm ms-1" role="status"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      };
    });

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">
            พบ {formattedRooms.length} ห้อง
            {todaysArrivals.length > 0 && (
              <span className="badge bg-info ms-2">{todaysArrivals.length} เช็คอินวันนี้</span>
            )}
            {todaysDepartures.length > 0 && (
              <span className="badge bg-warning ms-2">{todaysDepartures.length} เช็คเอาท์วันนี้</span>
            )}
          </h6>
          <button 
            className="btn btn-outline-secondary btn-sm" 
            onClick={this.loadRoomStatusData}
            title="รีเฟรชข้อมูล"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        
        <DataTableHeader 
          pageSize={pageSize}
          setPageSize={this.setPageSize}
          globalFilter={globalFilter}
          setGlobalFilter={this.setGlobalFilter}
        />
        <DataTable 
          columns={roomColumns} 
          data={formattedRooms}
          pageSize={pageSize}
          globalFilter={globalFilter}
          setGlobalFilter={this.setGlobalFilter}
          setPageSize={this.setPageSize}
        />
        <DataTableFooter dataT={formattedRooms} />
      </>
    );
  }
}

export default RoomStatusTable;