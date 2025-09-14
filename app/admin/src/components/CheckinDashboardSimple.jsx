import React, { useState, useEffect } from 'react';
import bookingService from '../services/bookingService';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


const CheckinDashboardSimple = () => {
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoomsData();
  }, []);

  const fetchRoomsData = async () => {
    try {
      setLoading(true);
      setError(null);
      safeLog('🔄 Starting to fetch rooms data...');
      
      // Test basic room status API
      const roomsResponse = await bookingService.getRoomStatus();
      safeLog('📊 Raw rooms response:', roomsResponse);
      
      if (roomsResponse && roomsResponse.success && roomsResponse.data) {
        safeLog('✅ Rooms data is valid, transforming...');
        
        // Simple transformation
        const rooms = roomsResponse.data.map((room, index) => ({
          id: room.id || `room-${index}`,
          roomNo: `Room ${room.roomNumber}`,
          roomNumber: room.roomNumber,
          status: room.status,
          roomType: room.roomType?.name || 'Unknown',
          assign: room.status === 'Available' ? 'Ready' : room.status,
          canCheckin: room.canCheckin || false,
          canAssign: room.canAssign || false
        }));
        
        safeLog('🎯 Transformed rooms:', rooms);
        setRoomsData(rooms);
      } else {
        console.error('❌ Invalid rooms response structure');
        setError('Invalid response from server');
        
        // Fallback mock data
        const mockRooms = [
          { id: '1', roomNo: 'Room 101', roomNumber: '101', status: 'Available', assign: 'Ready', roomType: 'Standard' },
          { id: '2', roomNo: 'Room 102', roomNumber: '102', status: 'Available', assign: 'Ready', roomType: 'Deluxe' },
          { id: '3', roomNo: 'Room 103', roomNumber: '103', status: 'Occupied', assign: 'Occupied', roomType: 'Suite' }
        ];
        safeLog('🔄 Using mock data:', mockRooms);
        setRoomsData(mockRooms);
      }
    } catch (error) {
      console.error('💥 Error fetching rooms:', error);
      setError(error.message);
      
      // Fallback mock data
      const mockRooms = [
        { id: '1', roomNo: 'Room 101', roomNumber: '101', status: 'Available', assign: 'Ready', roomType: 'Standard' },
        { id: '2', roomNo: 'Room 102', roomNumber: '102', status: 'Available', assign: 'Ready', roomType: 'Deluxe' },
        { id: '3', roomNo: 'Room 103', roomNumber: '103', status: 'Occupied', assign: 'Occupied', roomType: 'Suite' }
      ];
      safeLog('🔄 Using mock data due to error:', mockRooms);
      setRoomsData(mockRooms);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="ms-3">Loading rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      <div className="row g-3">
        <div className="col-sm-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <h3 className="fw-bold mb-0">Simple Check-in Dashboard</h3>
            <div className="d-flex gap-2">
              <div className="badge bg-primary fs-6">
                {roomsData.length} Total Rooms
              </div>
              <div className="badge bg-success fs-6">
                {roomsData.filter(r => r.assign === 'Ready').length} Ready
              </div>
              {error && (
                <div className="badge bg-danger fs-6">
                  API Error
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <h5>Debug Information:</h5>
                  <p><strong>Total Rooms:</strong> {roomsData.length}</p>
                  <p><strong>Error:</strong> {error || 'None'}</p>
                  <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                </div>
                
                {/* Room Cards - Always Visible */}
                {roomsData.map((room, index) => (
                  <div className="col-md-4 col-lg-3" key={room.id || index}>
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <h6 className="card-title text-primary">{room.roomNo}</h6>
                        <div className={`badge ${
                          room.assign === 'Ready' ? 'bg-success' : 
                          room.assign === 'Available' ? 'bg-info' : 
                          room.assign === 'Occupied' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {room.assign}
                        </div>
                        <p className="card-text mt-2">
                          <small className="text-muted">{room.roomType}</small><br/>
                          <small className="text-muted">Status: {room.status}</small>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {roomsData.length === 0 && (
                  <div className="col-12">
                    <div className="alert alert-warning text-center">
                      <h5>No Room Data Available</h5>
                      <p>Please check console logs for details.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={fetchRoomsData}
                      >
                        Retry Loading
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinDashboardSimple;
