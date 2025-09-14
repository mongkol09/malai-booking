// ============================================
// ROOM STATUS SERVICE - USING API SERVICE WITH AUTHSERVICE INTEGRATION
// ============================================

import { apiService } from './apiService';

// Safe logging utility - only logs in development
const safeLog = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};


const roomStatusService = {
  // ===============================
  // ROOM STATUS API METHODS
  // ===============================
  
  async getRoomStatuses() {
    try {
      safeLog('🏠 Fetching room statuses via ApiService...');
      const response = await apiService.get('/rooms/status');
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch room statuses:', error);
      throw error;
    }
  },

  async updateRoomStatus(roomId, statusData) {
    try {
      safeLog(`🔄 Updating room ${roomId} status via ApiService...`);
      const response = await apiService.post(`/rooms/${roomId}/status`, {
        status: statusData.status || statusData,
        notes: statusData.notes || '',
        updated_by: apiService.getCurrentUser()?.id || 'admin',
        updated_at: new Date().toISOString()
      });
      return response.data || response;
    } catch (error) {
      console.error(`❌ Failed to update room ${roomId} status:`, error);
      throw error;
    }
  },

  async getRoomById(roomId) {
    try {
      safeLog(`🏠 Fetching room ${roomId} details via ApiService...`);
      const response = await apiService.get(`/rooms/${roomId}`);
      return response.data || response;
    } catch (error) {
      console.error(`❌ Failed to fetch room ${roomId}:`, error);
      throw error;
    }
  },

  // Get all rooms with their current status
  async getAllRoomsStatus() {
    try {
      safeLog('🏠 Getting all rooms status via ApiService...');
      const response = await apiService.get('/rooms');
      safeLog('📊 Room status API response:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error getting rooms status:', error);
      throw error;
    }
  },

  // Get today's arrivals
  async getTodaysArrivals() {
    try {
      safeLog('📅 Getting today arrivals via ApiService...');
      const response = await apiService.get('/bookings/arrivals');
      return response.data || response;
    } catch (error) {
      console.error('❌ Error getting arrivals:', error);
      throw error;
    }
  },

  // Get today's departures
  async getTodaysDepartures() {
    try {
      safeLog('📅 Getting today departures via ApiService...');
      const response = await apiService.get('/bookings/departures');
      return response.data || response;
    } catch (error) {
      console.error('❌ Error getting departures:', error);
      throw error;
    }
  },

  // ===============================
  // DATA FORMATTING METHODS
  // ===============================

  // Format room data for status display
  formatRoomForStatus(room) {
    return {
      id: room.id,
      roomNumber: room.number || room.roomNumber,
      roomType: room.type || 'Standard',
      floor: Math.floor(parseInt(room.number || room.roomNumber || '101') / 100) || 1,
      checkOut: room.checkOut || '-',
      status: room.status || 'available',
      statusColor: this.getStatusColor(room.status || 'available'),
      capacity: room.capacity || 2,
      price: room.price || 0
    };
  },

  // Get status color for display
  getStatusColor(status) {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-success';
      case 'occupied':
        return 'bg-danger';
      case 'dirty':
        return 'bg-warning';
      case 'maintenance':
        return 'bg-secondary';
      case 'out-of-order':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  },

  // Get room status options for dropdown
  getRoomStatusOptions() {
    return [
      { value: 'available', label: 'ว่าง', color: 'bg-success' },
      { value: 'occupied', label: 'ไม่ว่าง', color: 'bg-danger' },
      { value: 'dirty', label: 'สกปรก', color: 'bg-warning' },
      { value: 'maintenance', label: 'ซ่อมแซม', color: 'bg-secondary' },
      { value: 'out-of-order', label: 'ไม่พร้อมใช้', color: 'bg-dark' }
    ];
  }
};

export default roomStatusService;
