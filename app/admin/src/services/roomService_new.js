// Room Management Service สำหรับ Hotel Admin Panel
// เชื่อมต่อกับ Backend Room Management APIs (Session-Based Auth)

import { authService } from './authService';

class RoomService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
  }

  // ใช้ authService สำหรับ session-based requests
  async makeRequest(url, options = {}) {
    try {
      console.log(`🏠 Room API Request: ${options.method || 'GET'} ${url}`);
      
      // ใช้ authService.request เพื่อการจัดการ session และ token
      const response = await authService.request(url, options);
      
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
  async updateRoomStatus(roomId, status) {
    return await this.makeRequest(`/rooms/${roomId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
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
}

// Export singleton instance
const roomService = new RoomService();
export default roomService;
