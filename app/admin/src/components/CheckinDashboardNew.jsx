import React, { useState, useEffect } from 'react';

const CheckinDashboard = () => {
  const [roomsData, setRoomsData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [selectedHouseKeeper, setSelectedHouseKeeper] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckinData();
  }, []);

  const fetchCheckinData = async () => {
    try {
      // Fetch bookings ready for check-in
      const response = await fetch('/api/checkin/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'X-API-Key': 'hotel-booking-api-key-2024'
        }
      });
      
      if (response.ok) {
        const bookings = await response.json();
        
        if (bookings.success) {
          setBookingsData(bookings.data);
          
          // Transform bookings data to room-centric view
          const rooms = bookings.data.map(booking => ({
            id: booking.id,
            roomNo: `Room No. ${booking.room.number}`,
            assign: booking.canCheckin ? 'Ready' : 'Booked',
            status: booking.status,
            guest: booking.guest,
            bookingRef: booking.bookingReference,
            outstandingAmount: booking.outstandingAmount,
            roomType: booking.roomType
          }));
          
          setRoomsData(rooms);
        }
      } else {
        throw new Error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching checkin data:', error);
      // Fallback to mock data
      setRoomsData([
        { 
          id: '1', 
          roomNo: 'Room No. 101', 
          assign: 'Booked', 
          status: 'Confirmed',
          guest: { name: 'John Doe' },
          bookingRef: 'HTL001',
          outstandingAmount: 500,
          roomType: 'Deluxe'
        },
        { 
          id: '2', 
          roomNo: 'Room No. 102', 
          assign: 'Ready', 
          status: 'Available',
          roomType: 'Standard'
        },
        { 
          id: '3', 
          roomNo: 'Room No. 103', 
          assign: 'Ready', 
          status: 'Available',
          roomType: 'Deluxe'
        },
        { 
          id: '4', 
          roomNo: 'Room No. 104', 
          assign: 'Booked', 
          status: 'Confirmed',
          guest: { name: 'Jane Smith' },
          bookingRef: 'HTL002',
          outstandingAmount: 0,
          roomType: 'Suite'
        },
        { 
          id: '5', 
          roomNo: 'Room No. B-1201', 
          assign: 'Ready', 
          status: 'Available',
          roomType: 'Standard'
        },
        { 
          id: '6', 
          roomNo: 'Room No. B-1202', 
          assign: 'Ready', 
          status: 'Available',
          roomType: 'Deluxe'
        },
        { 
          id: '7', 
          roomNo: 'Room No. D-1201', 
          assign: 'Ready', 
          status: 'Available',
          roomType: 'Suite'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId) => {
    console.log('Room selected:', roomId);
  };

  const handleApplyCheckin = async () => {
    try {
      const selectedRooms = roomsData.filter(room => 
        document.querySelector(`input[data-room-id="${room.id}"]`)?.checked
      );
      
      if (selectedRooms.length === 0) {
        alert('Please select at least one room to check-in');
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      
      for (const room of selectedRooms) {
        if (room.assign === 'Ready') {
          try {
            const response = await fetch(`/api/checkin/${room.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'X-API-Key': 'hotel-booking-api-key-2024'
              },
              body: JSON.stringify({
                roomId: room.id,
                checkinNotes: 'Checked in via dashboard',
                assignedBy: selectedHouseKeeper
              })
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              console.error(`Failed to check-in room ${room.roomNo}`);
            }
          } catch (error) {
            errorCount++;
            console.error(`Error checking in room ${room.roomNo}:`, error);
          }
        }
      }
      
      // Refresh data
      await fetchCheckinData();
      
      // Show result
      if (successCount > 0) {
        alert(`Check-in completed successfully for ${successCount} room(s)!`);
      }
      if (errorCount > 0) {
        alert(`Failed to check-in ${errorCount} room(s). Please try again.`);
      }
      
    } catch (error) {
      console.error('Error performing check-in:', error);
      alert('Error performing check-in');
    }
  };

  // Filter rooms based on selections
  const filteredRooms = roomsData.filter(room => {
    if (selectedRoomType && room.roomType && !room.roomType.toLowerCase().includes(selectedRoomType.toLowerCase())) {
      return false;
    }
    if (selectedStatus && room.assign !== selectedStatus) {
      return false;
    }
    return true;
  });

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
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Check-in Management System</h3>
                    <div className="d-flex gap-2">
                      <div className="badge bg-primary fs-6">
                        {filteredRooms.length} Rooms Available
                      </div>
                      <div className="badge bg-success fs-6">
                        {filteredRooms.filter(r => r.assign === 'Ready').length} Ready
                      </div>
                      <div className="badge bg-warning fs-6">
                        {filteredRooms.filter(r => r.assign === 'Booked').length} Booked
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
                            <div className="col-md-4 col-lg-4">
                                <label className="form-label">
                                    <i className="bi bi-person-badge me-2"></i>
                                    Staff Member
                                </label>
                                <select 
                                  className="form-select"
                                  value={selectedHouseKeeper}
                                  onChange={(e) => setSelectedHouseKeeper(e.target.value)}
                                >
                                    <option value="">Choose Staff...</option>
                                    <option value="reception">Reception Staff</option>
                                    <option value="manager">Manager</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="frontdesk">Front Desk</option>
                                </select>
                            </div>
                            <div className="col-md-4 col-lg-4">
                                <label className="form-label">
                                    <i className="bi bi-door-open me-2"></i>
                                    Room Type
                                </label>
                                <select 
                                  className="form-select"
                                  value={selectedRoomType}
                                  onChange={(e) => setSelectedRoomType(e.target.value)}
                                >
                                    <option value="">All Room Types...</option>
                                    <option value="standard">Standard Room</option>
                                    <option value="deluxe">Deluxe Room</option>
                                    <option value="suite">Suite</option>
                                    <option value="twin">Twin Room</option>
                                    <option value="single">Single Room</option>
                                    <option value="triple">Triple Room</option>
                                </select>
                            </div>
                            <div className="col-md-4 col-lg-4">
                                <label className="form-label">
                                    <i className="bi bi-activity me-2"></i>
                                    Status Filter
                                </label>
                                <select 
                                  className="form-select"
                                  value={selectedStatus}
                                  onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="">All Status...</option>
                                    <option value="Ready">Ready for Check-in</option>
                                    <option value="Booked">Booked (Pending)</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Cleaning">Cleaning</option>
                                </select>
                            </div>
                            
                            {/* Room Grid */}
                            {filteredRooms.map((room, index) => {
                                const isReady = room.assign === 'Ready';
                                const isBooked = room.assign === 'Booked';
                                const statusColor = isReady ? 'text-success' : isBooked ? 'text-warning' : 'text-danger';
                                const borderColor = isReady ? 'border-success' : isBooked ? 'border-warning' : 'border-danger';
                                
                                return(
                                    <div className="col-md-4 col-lg-3 col-xl-3" key={room.id || index}>
                                        <div className={`room-select border p-3 rounded ${borderColor} position-relative`}>
                                            <div className="form-check form-switch form-check-reverse">
                                                <input 
                                                  className="form-check-input" 
                                                  type="checkbox" 
                                                  role="switch"
                                                  data-room-id={room.id}
                                                  disabled={!isReady}
                                                  onChange={() => handleRoomSelect(room.id)}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <span className="fw-bold d-block text-primary">{room.roomNo}</span>
                                                <span className={`mt-1 badge ${isReady ? 'bg-success' : isBooked ? 'bg-warning' : 'bg-danger'}`}>
                                                  {room.assign}
                                                </span>
                                                
                                                {room.roomType && (
                                                  <div className="mt-1">
                                                    <small className="text-muted">{room.roomType}</small>
                                                  </div>
                                                )}
                                                
                                                {room.guest && (
                                                  <div className="mt-2 border-top pt-2">
                                                    <small className="fw-bold d-block text-dark">{room.guest.name}</small>
                                                    <small className="text-muted d-block">{room.bookingRef}</small>
                                                    {room.outstandingAmount > 0 && (
                                                      <div className="badge bg-danger mt-1">
                                                        ฿{room.outstandingAmount.toLocaleString()} due
                                                      </div>
                                                    )}
                                                    {room.outstandingAmount === 0 && isBooked && (
                                                      <div className="badge bg-success mt-1">
                                                        Paid in Full
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )})}
                                
                            {filteredRooms.length === 0 && (
                              <div className="col-12">
                                <div className="text-center py-5">
                                  <i className="bi bi-search fs-1 text-muted"></i>
                                  <h6 className="text-muted mt-3">No rooms match your filter criteria</h6>
                                  <p className="text-muted">Try adjusting your filters or check back later</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="col-12">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted">
                                            Selected rooms will be processed for check-in
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
                                        <button 
                                          type="button" 
                                          className="btn btn-primary"
                                          onClick={handleApplyCheckin}
                                        >
                                          <i className="bi bi-check-circle me-1"></i>
                                          Process Check-in
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CheckinDashboard;
