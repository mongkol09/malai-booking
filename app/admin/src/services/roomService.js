// Room Management Service สำหรับ Hotel Admin Panel
// เชื่อมต่อกับ Backend Room Management APIs (JWT-Based Auth)

import { apiService } from './apiService';

class RoomService {
  constructor() {
    // apiService จัดการ baseURL และ authentication เอง
  }

  // ใช้ apiService สำหรับ JWT-based requests
  async makeRequest(url, options = {}) {
    try {
      console.log(`🏠 Room API Request: ${options.method || 'GET'} ${url}`);
      
      const method = options.method?.toLowerCase() || 'get';
      let response;
      
      if (method === 'get') {
        response = await apiService.get(url);
      } else if (method === 'post') {
        response = await apiService.post(url, JSON.parse(options.body || '{}'));
      } else if (method === 'put') {
        response = await apiService.put(url, JSON.parse(options.body || '{}'));
      } else if (method === 'delete') {
        response = await apiService.delete(url);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
      
      console.log(`✅ Room API Response:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Room API Error:`, error);
      throw error;
    }
  }

  // ============================================
  // ROOM MANAGEMENT METHODS
  // ============================================

  /**
   * Get all rooms with optional filters
   */
  async getAllRooms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/rooms${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest(url);
  }

  /**
   * Get all available rooms with filters
   */
  async getAvailableRooms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/rooms${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest(url);
  }

  /**
   * Get room types
   */
  async getRoomTypes() {
    return await this.makeRequest('/room-types');
  }

  /**
   * Get room details by ID
   */
  async getRoomById(roomId) {
    return await this.makeRequest(`/rooms/${roomId}`);
  }

  /**
   * Create new room
   */
  async createRoom(roomData) {
    return await this.makeRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  }

  /**
   * Update existing room
   */
  async updateRoom(roomId, roomData) {
    return await this.makeRequest(`/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  }

  /**
   * Delete room
   */
  async deleteRoom(roomId) {
    return await this.makeRequest(`/rooms/${roomId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get room status overview
   */
  async getRoomStatus() {
    return await this.makeRequest('/rooms/status');
  }

  /**
   * Update room status
   */
  async updateRoomStatus(roomId, statusData) {
    return await this.makeRequest(`/bookings/admin/rooms/${roomId}/status`, {
      method: 'POST',
      body: JSON.stringify(statusData)
    });
  }

  /**
   * Search rooms
   */
  async searchRooms(query) {
    return await this.makeRequest(`/rooms/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get room availability
   */
  async getRoomAvailability(checkIn, checkOut, guests = 1) {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString()
    });
    return await this.makeRequest(`/bookings/availability?${params}`);
  }

  /**
   * Get room statistics
   */
  async getRoomStats() {
    return await this.makeRequest('/rooms/stats');
  }

  // ============================================
  // ROOM TYPE MANAGEMENT
  // ============================================

  /**
   * Create new room type
   */
  async createRoomType(roomTypeData) {
    return await this.makeRequest('/room-types', {
      method: 'POST',
      body: JSON.stringify(roomTypeData)
    });
  }

  /**
   * Update room type
   */
  async updateRoomType(roomTypeId, roomTypeData) {
    return await this.makeRequest(`/room-types/${roomTypeId}`, {
      method: 'PUT',
      body: JSON.stringify(roomTypeData)
    });
  }

  /**
   * Delete room type
   */
  async deleteRoomType(roomTypeId) {
    return await this.makeRequest(`/room-types/${roomTypeId}`, {
      method: 'DELETE'
    });
  }

  // ============================================
  // HOUSEKEEPING & MAINTENANCE
  // ============================================

  /**
   * Get housekeeping tasks for rooms
   */
  async getHousekeepingTasks() {
    return await this.makeRequest('/rooms/housekeeping');
  }

  /**
   * Create housekeeping task
   */
  async createHousekeepingTask(taskData) {
    return await this.makeRequest('/rooms/housekeeping', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  /**
   * Update housekeeping task status
   */
  async updateHousekeepingTask(taskId, status) {
    return await this.makeRequest(`/rooms/housekeeping/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  /**
   * Get maintenance requests
   */
  async getMaintenanceRequests() {
    return await this.makeRequest('/rooms/maintenance');
  }

  /**
   * Create maintenance request
   */
  async createMaintenanceRequest(requestData) {
    return await this.makeRequest('/rooms/maintenance', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get room occupancy report
   */
  async getRoomOccupancyReport(startDate, endDate) {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    return await this.makeRequest(`/rooms/occupancy?${params}`);
  }

  /**
   * Get revenue report by room
   */
  async getRoomRevenueReport(startDate, endDate) {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    return await this.makeRequest(`/rooms/revenue?${params}`);
  }

  // ============================================
  // DATA FORMATTING METHODS
  // ============================================

  /**
   * Format room data for display in UI components
   */
  formatRoomForDisplay(room) {
    console.log('🏠 Formatting room for display:', room.roomNumber, room);
    
    const formatted = {
      id: room.id,
      roomNumber: room.roomNumber || room.number || 'N/A',
      roomType: room.roomType?.name || room.type || 'Unknown',
      status: room.status || 'Available',
      statusColor: this.getRoomStatusColor(room.status),
      floor: room.floor || this.getFloorFromRoomNumber(room.roomNumber),
      capacity: room.capacity || room.maxOccupancy || 1,
      rate: room.roomType?.baseRate || room.rate || 0,
      currency: 'THB',
      
      // Room List Table specific fields
      roomPrice: room.roomType?.baseRate || room.price || 0,
      bedCharge: room.extraBedCharge || 0,
      roomSize: room.size || (room.roomType?.sizeSqm ? `${room.roomType.sizeSqm} sqm` : 'Standard'),
      bedNo: room.bedCount || 1,
      bedType: room.bedType || room.roomType?.bedType || 'Standard',
      
      // Booking information
      currentBooking: room.bookings?.[0] || null,
      guestName: room.bookings?.[0]?.guest ? 
        `${room.bookings[0].guest.firstName || ''} ${room.bookings[0].guest.lastName || ''}`.trim() : 
        null,
      
      // Amenities and features
      amenities: room.amenities || [],
      features: room.features || [],
      
      // Metadata
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      
      // Display helpers
      formattedRate: `฿${parseFloat(room.roomType?.baseRate || room.rate || 0).toLocaleString()}`,
      isOccupied: room.status === 'Occupied' || room.status === 'InHouse',
      isAvailable: room.status === 'Available',
      isOutOfOrder: room.status === 'OutOfOrder' || room.status === 'Maintenance'
    };
    
    console.log('✅ Formatted room:', formatted);
    return formatted;
  }

  /**
   * Get room status color for UI display
   */
  getRoomStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'success';
      case 'occupied':
      case 'inhouse':
        return 'danger';
      case 'reserved':
      case 'confirmed':
        return 'warning';
      case 'cleaning':
        return 'info';
      case 'maintenance':
      case 'outoforder':
        return 'secondary';
      case 'dirty':
        return 'dark';
      default:
        return 'light';
    }
  }

  /**
   * Extract floor number from room number
   */
  getFloorFromRoomNumber(roomNumber) {
    if (!roomNumber) return 1;
    const numStr = roomNumber.toString();
    if (numStr.length >= 3) {
      return parseInt(numStr.charAt(0)) || 1;
    }
    return 1;
  }

  /**
   * Get room status options for dropdowns
   */
  getRoomStatusOptions() {
    return [
      { value: 'Available', label: 'Available', color: 'success' },
      { value: 'Occupied', label: 'Occupied', color: 'danger' },
      { value: 'Reserved', label: 'Reserved', color: 'warning' },
      { value: 'Cleaning', label: 'Cleaning', color: 'info' },
      { value: 'Maintenance', label: 'Maintenance', color: 'secondary' },
      { value: 'OutOfOrder', label: 'Out of Order', color: 'secondary' }
    ];
  }

  /**
   * Validate room data
   */
  validateRoomData(roomData) {
    const errors = [];

    if (!roomData.roomNumber?.trim()) {
      errors.push('Room number is required');
    }

    if (!roomData.roomType?.trim()) {
      errors.push('Room type is required');
    }

    if (!roomData.status?.trim()) {
      errors.push('Room status is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
const roomService = new RoomService();
export default roomService;
