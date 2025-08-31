// Enhanced CheckinDashboard with Room Type Groups and Walk-in Support
import React, { useState, useEffect } from 'react';
import CheckInModal from './CheckInModal';
import WalkInBookingModal from './WalkInBookingModal'; // เพิ่ม modal สำหรับ walk-in
import bookingService from '../services/bookingService';

const CheckinDashboard = () => {
  const [roomsData, setRoomsData] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedHouseKeeper, setSelectedHouseKeeper] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    readyForCheckin: 0,
    occupied: 0,
    maintenance: 0
  });

  useEffect(() => {
    fetchCheckinData();
  }, []);

  const fetchCheckinData = async () => {
    try {
      setLoading(true);
      
      const [roomsData, bookingsData] = await Promise.all([
        bookingService.getRoomStatus(),
        bookingService.getTodaysArrivals()
      ]);
      
      if (roomsData && roomsData.success) {
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
          bookingId: room.currentBooking?.id || null,
          outstandingAmount: room.currentBooking?.outstandingAmount || 0,
          floor: room.floor,
          lastCleaned: room.lastCleaned,
          pricing: room.roomType.pricing || {} // เพิ่มข้อมูลราคาสำหรับ walk-in
        }));
        
        setRoomsData(rooms);
        
        // จัดกลุ่มตาม Room Type
        const groupedByType = rooms.reduce((acc, room) => {
          if (!acc[room.roomType]) {
            acc[room.roomType] = [];
          }
          acc[room.roomType].push(room);
          return acc;
        }, {});
        
        setRoomTypes(Object.keys(groupedByType).map(type => ({
          name: type,
          rooms: groupedByType[type],
          availableCount: groupedByType[type].filter(r => r.assign === 'Available').length,
          readyCount: groupedByType[type].filter(r => r.assign === 'Ready').length,
          occupiedCount: groupedByType[type].filter(r => r.assign === 'Occupied').length
        })));
        
        // อัพเดท stats
        setDashboardStats({
          totalRooms: rooms.length,
          availableRooms: rooms.filter(r => r.assign === 'Available').length,
          readyForCheckin: rooms.filter(r => r.assign === 'Ready').length,
          occupied: rooms.filter(r => r.assign === 'Occupied').length,
          maintenance: rooms.filter(r => r.assign === 'Maintenance').length
        });
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalkInBooking = (roomType) => {
    // หาห้องว่างในประเภทที่เลือก
    const availableRooms = roomsData.filter(room => 
      room.roomType === roomType && room.assign === 'Available'
    );
    
    if (availableRooms.length === 0) {
      alert(`ไม่มีห้อง ${roomType} ว่างในขณะนี้`);
      return;
    }
    
    // เลือกห้องแรกที่ว่าง
    const selectedRoom = availableRooms[0];
    setSelectedRoom({
      ...selectedRoom,
      isWalkIn: true, // ระบุว่าเป็น walk-in
      walkInRoomType: roomType
    });
    setShowWalkInModal(true);
  };

  const handleRegularCheckin = (room) => {
    if (room && (room.assign === 'Ready' || room.bookingId)) {
      setSelectedRoom(room);
      setShowCheckinModal(true);
    }
  };

  const handleWalkInSuccess = async (newBookingData) => {
    console.log('Walk-in booking created:', newBookingData);
    // Refresh data หลังจากสร้าง booking สำเร็จ
    await fetchCheckinData();
    setShowWalkInModal(false);
    
    // เปิด Check-in modal ทันที
    if (newBookingData.room) {
      setSelectedRoom({
        ...newBookingData.room,
        bookingId: newBookingData.bookingId,
        guest: newBookingData.guest,
        bookingRef: newBookingData.bookingReferenceId
      });
      setShowCheckinModal(true);
    }
  };

  // Filter logic สำหรับ search และ floor
  const getFilteredRoomTypes = () => {
    if (!searchTerm && !selectedFloor) {
      return roomTypes;
    }
    
    return roomTypes.map(roomType => ({
      ...roomType,
      rooms: roomType.rooms.filter(room => {
        // Floor filter
        if (selectedFloor && room.floor && !room.floor.toLowerCase().includes(selectedFloor.toLowerCase())) {
          return false;
        }
        
        // Search term filter
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
      })
    })).filter(roomType => roomType.rooms.length > 0);
  };

  const filteredRoomTypes = getFilteredRoomTypes();

  if (loading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      <div className="row g-3">
        {/* Header with Real-time Stats */}
        <div className="col-sm-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <h3 className="fw-bold mb-0">
              <i className="bi bi-building me-2"></i>
              Check-in Dashboard
            </h3>
            <div className="d-flex gap-2">
              <div className="badge bg-primary fs-6">
                {dashboardStats.totalRooms} Total
              </div>
              <div className="badge bg-success fs-6">
                {dashboardStats.availableRooms} Available
              </div>
              <div className="badge bg-info fs-6">
                {dashboardStats.readyForCheckin} Ready
              </div>
              <div className="badge bg-warning fs-6">
                {dashboardStats.occupied} Occupied
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="col-sm-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <i className="bi bi-funnel me-2"></i>
                Quick Filters
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    <i className="bi bi-search me-2"></i>
                    Search
                  </label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Room, guest, booking ref..."
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm(e.target.value || '')}
                  />
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">
                    <i className="bi bi-building me-2"></i>
                    Floor
                  </label>
                  <select 
                    className="form-select"
                    value={selectedFloor || ''}
                    onChange={(e) => setSelectedFloor(e.target.value || '')}
                  >
                    <option value="">All Floors</option>
                    <option value="ground">Ground Floor</option>
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                    <option value="b">Building B</option>
                    <option value="c">Building C</option>
                    <option value="d">Building D</option>
                  </select>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">
                    <i className="bi bi-person-badge me-2"></i>
                    Staff
                  </label>
                  <select 
                    className="form-select"
                    value={selectedHouseKeeper || ''}
                    onChange={(e) => setSelectedHouseKeeper(e.target.value || '')}
                  >
                    <option value="">Choose Staff</option>
                    <option value="reception">Reception</option>
                    <option value="manager">Manager</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Types Grid */}
        {filteredRoomTypes.map((roomType, typeIndex) => (
          <div key={typeIndex} className="col-sm-12">
            <div className="card">
              <div className="card-header bg-gradient" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-door-open me-2"></i>
                    {roomType.name}
                  </h5>
                  <div className="d-flex gap-2">
                    <span className="badge bg-light text-dark">
                      {roomType.availableCount} Available
                    </span>
                    <span className="badge bg-success">
                      {roomType.readyCount} Ready
                    </span>
                    <span className="badge bg-warning">
                      {roomType.occupiedCount} Occupied
                    </span>
                    {/* Walk-in Button */}
                    {roomType.availableCount > 0 && (
                      <button 
                        className="btn btn-light btn-sm"
                        onClick={() => handleWalkInBooking(roomType.name)}
                        title={`Create Walk-in booking for ${roomType.name}`}
                      >
                        <i className="bi bi-person-plus me-1"></i>
                        Walk-in
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {roomType.rooms.map((room, roomIndex) => {
                    const isReady = room.assign === 'Ready';
                    const isBooked = room.assign === 'Booked';
                    const isAvailable = room.assign === 'Available';
                    const isOccupied = room.assign === 'Occupied';
                    
                    const cardClass = isReady ? 'border-success bg-success-subtle' : 
                                    isAvailable ? 'border-info bg-info-subtle' :
                                    isBooked ? 'border-warning bg-warning-subtle' : 
                                    isOccupied ? 'border-danger bg-danger-subtle' :
                                    'border-secondary bg-light';
                    
                    return (
                      <div className="col-md-6 col-lg-4 col-xl-3" key={room.id || roomIndex}>
                        <div 
                          className={`card h-100 ${cardClass} cursor-pointer transition-all`}
                          style={{
                            cursor: (isReady || isAvailable) ? 'pointer' : 'default',
                            transform: 'scale(1)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (isReady || isAvailable) {
                              e.currentTarget.style.transform = 'scale(1.02)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          onClick={() => {
                            if (isReady) {
                              handleRegularCheckin(room);
                            } else if (isAvailable) {
                              handleWalkInBooking(room.roomType);
                            }
                          }}
                        >
                          <div className="card-body text-center">
                            {/* Room Number */}
                            <h6 className="card-title text-primary fw-bold">
                              {room.roomNo}
                            </h6>
                            
                            {/* Status Badge */}
                            <span className={`badge mb-2 ${
                              isReady ? 'bg-success' : 
                              isAvailable ? 'bg-info' :
                              isBooked ? 'bg-warning' : 
                              isOccupied ? 'bg-danger' : 'bg-secondary'
                            }`}>
                              {room.assign}
                            </span>
                            
                            {/* Guest Info (if booked/ready) */}
                            {room.guest && (
                              <div className="mt-2 pt-2 border-top">
                                <small className="fw-bold d-block">{room.guest.name}</small>
                                <small className="text-muted d-block">{room.bookingRef}</small>
                                {room.outstandingAmount > 0 && (
                                  <div className="badge bg-danger mt-1">
                                    ฿{room.outstandingAmount.toLocaleString()} due
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Available Room Info */}
                            {isAvailable && (
                              <div className="mt-2 pt-2 border-top">
                                <small className="text-muted d-block">Ready for Walk-in</small>
                                <small className="text-success fw-bold">Click to book</small>
                              </div>
                            )}
                            
                            {/* Action Icons */}
                            <div className="mt-2">
                              {isReady && (
                                <i className="bi bi-check-circle text-success fs-5" title="Ready for Check-in"></i>
                              )}
                              {isAvailable && (
                                <i className="bi bi-person-plus text-info fs-5" title="Available for Walk-in"></i>
                              )}
                              {isOccupied && (
                                <i className="bi bi-person-fill text-danger fs-5" title="Occupied"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* No Results */}
        {filteredRoomTypes.length === 0 && (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-search fs-1 text-muted"></i>
                <h6 className="text-muted mt-3">No rooms found</h6>
                <p className="text-muted">Try adjusting your search criteria</p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFloor('');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <CheckInModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        roomData={selectedRoom}
        onSuccess={(result) => {
          console.log('Check-in successful:', result);
          fetchCheckinData();
          setShowCheckinModal(false);
        }}
      />
      
      <WalkInBookingModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        roomData={selectedRoom}
        onSuccess={handleWalkInSuccess}
      />
    </div>
  );
};

export default CheckinDashboard;
