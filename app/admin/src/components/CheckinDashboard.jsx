import React, { useState, useEffect } from 'react';
import CheckInModal from './CheckInModal';
import WalkInBookingModal from './WalkInBookingModal';
import bookingService from '../services/bookingService';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


const CheckinDashboard = () => {
  const [roomsData, setRoomsData] = useState([]);
  const [groupedRooms, setGroupedRooms] = useState({});
  const [selectedHouseKeeper, setSelectedHouseKeeper] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomTypeForWalkIn, setSelectedRoomTypeForWalkIn] = useState(null);

  useEffect(() => {
    fetchCheckinData();
  }, []);

  const fetchCheckinData = async () => {
    try {
      setLoading(true);
      safeLog('🔄 Fetching checkin data...');
      
      // ใช้ bookingService แทนการเรียก API โดยตรง
      const [roomsData, bookingsData] = await Promise.all([
        bookingService.getRoomStatus(),
        bookingService.getTodaysArrivals()
      ]);
      
      safeLog('📊 Room data received:', roomsData);
      safeLog('📊 Bookings data received:', bookingsData);
      
      if (roomsData && roomsData.success) {
        // Transform room data for display
        const rooms = roomsData.data.map(room => ({
          id: room.id,
          roomNo: `Room No. ${room.roomNumber}`,
          roomNumber: room.roomNumber,
          assign: room.canCheckin ? 'Ready' : 
                 room.canAssign ? 'Available' : 
                 room.status === 'Occupied' ? 'Occupied' : 
                 room.status,
          status: room.status,
          roomType: room.roomType.name,
          guest: room.guest ? {
            name: `${room.guest.firstName} ${room.guest.lastName}`,
            email: room.guest.email,
            phone: room.guest.phoneNumber
          } : null,
          bookingRef: room.currentBooking?.bookingReferenceId || null,
          bookingId: room.currentBooking?.id || null, // เพิ่ม bookingId สำหรับการเชื่อมต่อ
          outstandingAmount: room.currentBooking?.outstandingAmount || 0,
          floor: room.floor,
          lastCleaned: room.lastCleaned
        }));
        
        setRoomsData(rooms);
        
        // Group rooms by room type for enhanced UI
        const grouped = groupRoomsByType(rooms);
        setGroupedRooms(grouped);
        
        safeLog('✅ Rooms data set successfully:', rooms.length, 'rooms');
        safeLog('📊 Grouped rooms:', grouped);
      } else {
        console.warn('⚠️ Invalid rooms response, trying bookings fallback...');
        // Fallback to bookings-based approach
        await fetchCheckinBookings();
      }
    } catch (error) {
      console.error('💥 Error fetching room data:', error);
      // Fallback to checkin bookings API
      await fetchCheckinBookings();
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckinBookings = async () => {
    try {
      safeLog('📋 Fetching check-in bookings as fallback...');
      // ใช้ bookingService.getTodaysArrivals() แทน
      const response = await bookingService.getTodaysArrivals();
      
      safeLog('📊 Bookings response:', response);
      
      if (response && response.success && response.data?.arrivals) {
        // Transform bookings data to room-centric view
        const rooms = response.data.arrivals.map(booking => ({
          id: booking.room?.id || booking.id,
          roomNo: `Room No. ${booking.room?.roomNumber || 'N/A'}`,
          roomNumber: booking.room?.roomNumber || 'N/A',
          assign: booking.canCheckin ? 'Ready' : 
                 booking.status === 'Confirmed' ? 'Booked' : 
                 booking.status,
          status: booking.status,
          guest: {
            name: `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.trim(),
            email: booking.guest?.email || '',
            phone: booking.guest?.phoneNumber || ''
          },
          bookingRef: booking.bookingReferenceId,
          bookingId: booking.id, // เพิ่ม bookingId สำหรับการเชื่อมต่อ
          outstandingAmount: booking.outstandingAmount || 0,
          roomType: booking.roomType?.name || booking.room?.roomType?.name || 'Unknown',
          floor: booking.room?.floor || 'Unknown',
          canCheckin: booking.canCheckin,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate
        }));
        
        safeLog('✅ Transformed booking rooms:', rooms);
        setRoomsData(rooms);
        
        // Group rooms by room type for enhanced UI
        const grouped = groupRoomsByType(rooms);
        setGroupedRooms(grouped);
      } else {
        console.warn('⚠️ No valid booking data, using empty array');
        setRoomsData([]);
        setGroupedRooms({});
      }
    } catch (error) {
      console.error('💥 Error fetching checkin bookings:', error);
      // Set empty array on error
      setRoomsData([]);
      setGroupedRooms({});
    }
  };

  // Group rooms by room type for enhanced UI
  const groupRoomsByType = (rooms) => {
    const grouped = {};
    
    rooms.forEach(room => {
      const roomType = room.roomType || 'Unknown';
      if (!grouped[roomType]) {
        grouped[roomType] = {
          name: roomType,
          rooms: [],
          stats: {
            available: 0,
            ready: 0,
            occupied: 0,
            maintenance: 0,
            total: 0
          }
        };
      }
      
      grouped[roomType].rooms.push(room);
      grouped[roomType].stats.total++;
      
      // Count room status
      if (room.assign === 'Available') {
        grouped[roomType].stats.available++;
      } else if (room.assign === 'Ready') {
        grouped[roomType].stats.ready++;
      } else if (room.assign === 'Occupied') {
        grouped[roomType].stats.occupied++;
      } else {
        grouped[roomType].stats.maintenance++;
      }
    });
    
    return grouped;
  };

  // Handle Walk-in booking
  const handleWalkInClick = (roomType) => {
    safeLog('🚶 Walk-in clicked for room type:', roomType);
    setSelectedRoomTypeForWalkIn(roomType);
    setShowWalkInModal(true);
  };

  const handleWalkInSuccess = (result) => {
    safeLog('✅ Walk-in booking successful:', result);
    setShowWalkInModal(false);
    setSelectedRoomTypeForWalkIn(null);
    
    // Refresh data
    fetchCheckinData();
    
    // Show success message
    alert(`✅ Walk-in booking created successfully! Room ${result.roomNumber} assigned.`);
  };

  const handleCheckinSuccess = (result) => {
    safeLog('Check-in successful:', result);
    // Refresh room data
    fetchCheckinData();
    // Show success message
    alert(`Check-in completed successfully for ${result.guest?.name || 'guest'}!`);
  };

  const handleRoomSelect = (roomId) => {
    const room = roomsData.find(r => r.id === roomId);
    if (room && (room.canCheckin || room.canAssign)) {
      setSelectedRoom(room);
      setShowCheckinModal(true);
    } else {
      safeLog('Room not available for check-in:', room);
    }
  };

  const handleApplyCheckin = async () => {
    try {
      safeLog('🔄 Processing check-in for eligible rooms...');
      
      // Find rooms that can be checked in
      const eligibleRooms = displayRooms.filter(room => 
        room.canCheckin || (room.assign === 'Ready' && room.bookingId)
      );
      
      if (eligibleRooms.length === 0) {
        alert('No rooms are eligible for check-in at this time.');
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      // Process each eligible room
      for (const room of eligibleRooms) {
        if (room.bookingId) {
          try {
            safeLog(`✅ Processing check-in for room ${room.roomNo} (booking: ${room.bookingId})`);
            
            await bookingService.processCheckIn(room.bookingId, {
              notes: 'Checked in via dashboard',
              assignedBy: selectedHouseKeeper || 'admin',
              roomId: room.id,
              checkInTime: new Date().toISOString()
            });
            
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`❌ Failed to check-in room ${room.roomNo}:`, error);
          }
        }
      }
      
      // Refresh data
      await fetchCheckinData();
      
      // Show result
      if (successCount > 0) {
        alert(`✅ Check-in completed successfully for ${successCount} room(s)!`);
      }
      if (errorCount > 0) {
        alert(`⚠️ Failed to check-in ${errorCount} room(s). Please try again.`);
      }
      
    } catch (error) {
      console.error('💥 Error performing check-in:', error);
      alert('Error performing check-in. Please check the connection and try again.');
    }
  };

  // Enhanced filter logic
  const filteredRooms = roomsData.filter(room => {
    safeLog('🔍 Filtering room:', room.roomNo, 'assign:', room.assign);
    // Room type filter
    if (selectedRoomType && room.roomType && !room.roomType.toLowerCase().includes(selectedRoomType.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (selectedStatus && room.assign !== selectedStatus) {
      return false;
    }
    
    // Floor filter
    if (selectedFloor && room.floor && !room.floor.toLowerCase().includes(selectedFloor.toLowerCase())) {
      return false;
    }
    
    // Search term filter (room number, guest name, booking ref)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchRoom = room.roomNumber && room.roomNumber.toLowerCase().includes(search);
      const matchGuest = room.guest && room.guest.name && room.guest.name.toLowerCase().includes(search);
      const matchBooking = room.bookingRef && room.bookingRef.toLowerCase().includes(search);
      
      if (!matchRoom && !matchGuest && !matchBooking) {
        return false;
      }
    }
    
    return true;
  });

  safeLog('📋 Total rooms data:', roomsData.length);
  safeLog('🎯 Filtered rooms:', filteredRooms.length);
  safeLog('🔧 Current filters:', { selectedRoomType, selectedStatus, selectedFloor, searchTerm });

  if (loading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="ms-3">
            <h5>Loading Check-in Dashboard...</h5>
            <p className="text-muted">Fetching room status and booking data</p>
          </div>
        </div>
      </div>
    );
  }

  // Always show rooms, regardless of loading state
  const displayRooms = filteredRooms.length > 0 ? filteredRooms : roomsData;

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Check-in Management System</h3>
                    <div className="d-flex gap-2">
                      <div className="badge bg-primary fs-6">
                        {displayRooms.length} Total Rooms
                      </div>
                      <div className="badge bg-success fs-6">
                        {displayRooms.filter(r => r.assign === 'Ready').length} Ready
                      </div>
                      <div className="badge bg-warning fs-6">
                        {displayRooms.filter(r => r.assign === 'Booked').length} Booked
                      </div>
                      <div className="badge bg-info fs-6">
                        {displayRooms.filter(r => r.assign === 'Available').length} Available
                      </div>
                    </div>
                </div>
            </div>
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-header bg-light">
                        <h5 className="card-title mb-0">Filter & Check-in Options</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            {/* Search Bar */}
                            <div className="col-md-6 col-lg-3">
                                <label className="form-label">
                                    <i className="bi bi-search me-2"></i>
                                    Search Rooms
                                </label>
                                <input 
                                  type="text" 
                                  className="form-control"
                                  placeholder="Room number, guest name, booking ref..."
                                  value={searchTerm || ''}
                                  onChange={(e) => setSearchTerm(e.target.value || '')}
                                />
                            </div>
                            
                            {/* Floor Filter */}
                            <div className="col-md-6 col-lg-3">
                                <label className="form-label">
                                    <i className="bi bi-building me-2"></i>
                                    Floor
                                </label>
                                <select 
                                  className="form-select"
                                  value={selectedFloor || ''}
                                  onChange={(e) => setSelectedFloor(e.target.value || '')}
                                >
                                    <option value="">All Floors...</option>
                                    <option value="ground">Ground Floor</option>
                                    <option value="1">1st Floor</option>
                                    <option value="2">2nd Floor</option>
                                    <option value="3">3rd Floor</option>
                                    <option value="b">Building B</option>
                                    <option value="c">Building C</option>
                                    <option value="d">Building D</option>
                                </select>
                            </div>
                            
                            <div className="col-md-6 col-lg-3">
                                <label className="form-label">
                                    <i className="bi bi-person-badge me-2"></i>
                                    Staff Member
                                </label>
                                <select 
                                  className="form-select"
                                  value={selectedHouseKeeper || ''}
                                  onChange={(e) => setSelectedHouseKeeper(e.target.value || '')}
                                >
                                    <option value="">Choose Staff...</option>
                                    <option value="reception">Reception Staff</option>
                                    <option value="manager">Manager</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="frontdesk">Front Desk</option>
                                </select>
                            </div>
                            
                            <div className="col-md-6 col-lg-3">
                                <label className="form-label">
                                    <i className="bi bi-door-open me-2"></i>
                                    Room Type
                                </label>
                                <select 
                                  className="form-select"
                                  value={selectedRoomType || ''}
                                  onChange={(e) => setSelectedRoomType(e.target.value || '')}
                                >
                                    <option value="">All Room Types...</option>
                                    <option value="onsen">Onsen Villa</option>
                                    <option value="grand">Grand Serenity</option>
                                    <option value="standard">Standard Room</option>
                                    <option value="deluxe">Deluxe Room</option>
                                    <option value="suite">Suite</option>
                                    <option value="twin">Twin Room</option>
                                    <option value="single">Single Room</option>
                                    <option value="triple">Triple Room</option>
                                </select>
                            </div>
                            
                            {/* Status and Clear Filters */}
                            <div className="col-md-6 col-lg-6">
                                <label className="form-label">
                                    <i className="bi bi-activity me-2"></i>
                                    Status Filter
                                </label>
                                <select 
                                  className="form-select"
                                  value={selectedStatus || ''}
                                  onChange={(e) => setSelectedStatus(e.target.value || '')}
                                >
                                    <option value="">All Status...</option>
                                    <option value="Ready">Ready for Check-in</option>
                                    <option value="Available">Available</option>
                                    <option value="Occupied">Occupied</option>
                                    <option value="Booked">Booked (Pending)</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Cleaning">Cleaning</option>
                                </select>
                            </div>
                            
                            <div className="col-md-6 col-lg-6">
                                <label className="form-label">
                                    <i className="bi bi-funnel me-2"></i>
                                    Filter Actions
                                </label>
                                <div className="d-flex gap-2">
                                    <button 
                                      type="button" 
                                      className="btn btn-outline-secondary"
                                      onClick={() => {
                                        setSearchTerm('');
                                        setSelectedFloor('');
                                        setSelectedRoomType('');
                                        setSelectedStatus('');
                                        setSelectedHouseKeeper('');
                                      }}
                                    >
                                      <i className="bi bi-x-circle me-1"></i>
                                      Clear Filters
                                    </button>
                                    <button 
                                      type="button" 
                                      className="btn btn-outline-primary"
                                      onClick={fetchCheckinData}
                                    >
                                      <i className="bi bi-arrow-clockwise me-1"></i>
                                      Refresh
                                    </button>
                                </div>
                            </div>
                            
                            {/* Enhanced Room Grid - Grouped by Room Type */}
                            <div className="col-12">
                              <h6 className="mb-3">
                                <i className="bi bi-house-door me-2"></i>
                                Room Status Overview ({roomsData.length} total rooms)
                              </h6>
                              
                              {/* Room Type Groups */}
                              {Object.keys(groupedRooms).length > 0 ? (
                                Object.entries(groupedRooms).map(([roomTypeName, roomTypeData]) => (
                                  <div key={roomTypeName} className="mb-4">
                                    {/* Room Type Header */}
                                    <div className="card border-0 shadow-sm mb-3">
                                      <div className="card-header bg-gradient-primary text-white">
                                        <div className="row align-items-center">
                                          <div className="col-md-8">
                                            <h6 className="mb-0">
                                              <i className="bi bi-house me-2"></i>
                                              {roomTypeName}
                                            </h6>
                                            <small className="opacity-90">
                                              {roomTypeData.stats.available} Available • {roomTypeData.stats.ready} Ready • {roomTypeData.stats.occupied} Occupied
                                            </small>
                                          </div>
                                          <div className="col-md-4 text-end">
                                            {roomTypeData.stats.available > 0 && (
                                              <button 
                                                className="btn btn-light btn-sm"
                                                onClick={() => handleWalkInClick(roomTypeName)}
                                              >
                                                <i className="bi bi-person-plus me-1"></i>
                                                Walk-in
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Room Cards Grid */}
                                      <div className="card-body">
                                        <div className="row g-3">
                                          {roomTypeData.rooms.map((room, index) => {
                                            const isReady = room.assign === 'Ready' || room.canCheckin;
                                            const isBooked = room.assign === 'Booked';
                                            const isAvailable = room.assign === 'Available' || room.canAssign;
                                            const isOccupied = room.assign === 'Occupied';
                                            
                                            // Status color mapping
                                            const getStatusStyle = () => {
                                              if (isReady) return { bg: 'bg-success', border: 'border-success', text: 'text-success' };
                                              if (isAvailable) return { bg: 'bg-info', border: 'border-info', text: 'text-info' };
                                              if (isBooked) return { bg: 'bg-warning', border: 'border-warning', text: 'text-warning' };
                                              if (isOccupied) return { bg: 'bg-danger', border: 'border-danger', text: 'text-danger' };
                                              return { bg: 'bg-secondary', border: 'border-secondary', text: 'text-secondary' };
                                            };
                                            
                                            const statusStyle = getStatusStyle();
                                            
                                            return (
                                              <div className="col-md-3 col-lg-2" key={room.id || index}>
                                                <div 
                                                  className={`card h-100 ${statusStyle.border} room-card`}
                                                  style={{
                                                    cursor: (isReady || isAvailable) ? 'pointer' : 'default',
                                                    transition: 'all 0.3s ease',
                                                    transform: 'scale(1)'
                                                  }}
                                                  onClick={() => (isReady || isAvailable) && handleRoomSelect(room.id)}
                                                  onMouseEnter={(e) => {
                                                    if (isReady || isAvailable) {
                                                      e.currentTarget.style.transform = 'scale(1.05)';
                                                    }
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                  }}
                                                >
                                                  <div className="card-body text-center p-3">
                                                    {/* Room Number */}
                                                    <h6 className="card-title mb-2 fw-bold">
                                                      {room.roomNumber}
                                                    </h6>
                                                    
                                                    {/* Status Badge */}
                                                    <span className={`badge ${statusStyle.bg} mb-2`}>
                                                      {room.assign}
                                                    </span>
                                                    
                                                    {/* Guest Information */}
                                                    {room.guest && (
                                                      <div className="mt-2 border-top pt-2">
                                                        <small className="fw-semibold d-block text-dark">
                                                          {room.guest.name}
                                                        </small>
                                                        <small className="text-muted">
                                                          {room.bookingRef}
                                                        </small>
                                                        
                                                        {/* Outstanding Amount */}
                                                        {room.outstandingAmount > 0 && (
                                                          <div className="badge bg-danger mt-1">
                                                            ฿{room.outstandingAmount.toLocaleString()} due
                                                          </div>
                                                        )}
                                                        {room.outstandingAmount === 0 && (isBooked || isReady) && (
                                                          <div className="badge bg-success mt-1">
                                                            Paid
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
                                                    
                                                    {/* Available room action */}
                                                    {isAvailable && !room.guest && (
                                                      <div className="mt-2">
                                                        <small className="text-muted">Ready for Walk-in</small>
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  {/* Action Indicator */}
                                                  {(isReady || isAvailable) && (
                                                    <div className="position-absolute top-0 end-0 p-2">
                                                      <i className={`bi bi-check-circle-fill ${statusStyle.text}`}></i>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-5">
                                  <i className="bi bi-house-x display-4 text-muted"></i>
                                  <h5 className="mt-3 text-muted">No rooms available</h5>
                                  <p className="text-muted">Please check your filters or try refreshing the data.</p>
                                  <button className="btn btn-primary" onClick={fetchCheckinData}>
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Refresh Data
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="col-12">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted">
                                            Click on available rooms to check-in guests or use Walk-in for new bookings
                                        </small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                          type="button" 
                                          className="btn btn-outline-secondary"
                                          onClick={fetchCheckinData}
                                        >
                                          <i className="bi bi-arrow-clockwise me-1"></i>
                                          Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Check-in Modal */}
        <CheckInModal
          isOpen={showCheckinModal}
          onClose={() => setShowCheckinModal(false)}
          roomData={selectedRoom}
          onSuccess={handleCheckinSuccess}
        />
        
        {/* Walk-in Booking Modal */}
        <WalkInBookingModal
          isOpen={showWalkInModal}
          onClose={() => setShowWalkInModal(false)}
          roomType={selectedRoomTypeForWalkIn}
          onSuccess={handleWalkInSuccess}
        />
    </div>
  );
};

export default CheckinDashboard;
