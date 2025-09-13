import React, { Component } from 'react';
import { roomListColumn } from './RoomListTableData';
import roomService from '../../../../../services/roomService';
import { authService } from '../../../../../services/authService';
import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';

class RoomListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataT: [],
      loading: true,
      error: null,
      // Pagination state
      pageSize: 10,
      globalFilter: '',
    };
  }

  async componentDidMount() {
    await this.loadRoomsData();
  }

  // Pagination handlers
  setPageSize = (newPageSize) => {
    this.setState({ pageSize: newPageSize });
  };

  setGlobalFilter = (filterValue) => {
    this.setState({ globalFilter: filterValue });
  };

  // Expose refresh method to parent via ref
  refreshData = () => {
    return this.loadRoomsData();
  };

  loadRoomsData = async () => {
    try {
      this.setState({ loading: true, error: null });
      console.log('🏠 Loading rooms data...');
      
      // ตรวจสอบ authentication ก่อนเรียก API (ใช้ sync check ก่อน)
      const isAuthenticated = authService.isAuthenticatedSync();
      if (!isAuthenticated) {
        console.log('❌ User not authenticated, redirecting to login...');
        window.location.href = '/login';
        return;
      }
      
      console.log('✅ User authentication check passed, proceeding with API call...');
      
      const response = await roomService.getAllRooms();
      console.log('📊 Rooms API Response:', response);
      console.log('📊 Response Type:', Array.isArray(response) ? 'Array' : typeof response);
      console.log('📊 Response Keys:', typeof response === 'object' ? Object.keys(response) : 'N/A');
      
      // Handle new wrapped response format
      let roomsData = [];
      if (response && response.success && response.data && response.data.rooms) {
        // New format: {success: true, data: {rooms: [...], summary: {...}}}
        roomsData = response.data.rooms;
        console.log('✅ Using new wrapped format:', roomsData.length, 'rooms');
        console.log('📊 Summary:', response.data.summary);
      } else if (Array.isArray(response)) {
        // Fallback: direct array format
        roomsData = response;
        console.log('✅ Using fallback format (direct array):', roomsData.length, 'rooms');
      } else if (response && response.data && Array.isArray(response.data)) {
        // Legacy format: {data: [...]}
        roomsData = response.data;
        console.log('✅ Using legacy format (response.data):', roomsData.length, 'rooms');
      } else {
        console.warn('⚠️ Unknown response format:', response);
      }
      
      if (roomsData && roomsData.length >= 0) {
        console.log('📋 Processing rooms data:', roomsData.length, 'items');
        const formattedData = roomsData.map(room => {
          const formattedRoom = roomService.formatRoomForDisplay(room);
          return {
            id: formattedRoom.id,
            roomNumber: formattedRoom.roomNumber,
            roomType: formattedRoom.roomType,
            roomPrice: `฿${formattedRoom.roomPrice?.toLocaleString() || '0'}`,
            bedCharge: `฿${formattedRoom.bedCharge?.toLocaleString() || '0'}`,
            capacity: `${formattedRoom.capacity} คน`,
            roomSize: formattedRoom.roomSize,
            bedNo: formattedRoom.bedNo,
            bedType: formattedRoom.bedType,
            status: (
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${this.getStatusBadgeClass(formattedRoom.status)}`}>
                  {this.getStatusText(formattedRoom.status)}
                </span>
                <div className="dropdown">
                  <button 
                    className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown"
                    title="เปลี่ยนสถานะ"
                  >
                    <i className="bi bi-gear"></i>
                  </button>
                  <ul className="dropdown-menu">
                    <li><button className="dropdown-item" onClick={() => this.updateRoomStatus(formattedRoom.id, 'available')}>
                      <i className="bi bi-check-circle text-success me-2"></i>ว่าง
                    </button></li>
                    <li><button className="dropdown-item" onClick={() => this.updateRoomStatus(formattedRoom.id, 'occupied')}>
                      <i className="bi bi-person-fill text-danger me-2"></i>ไม่ว่าง
                    </button></li>
                    <li><button className="dropdown-item" onClick={() => this.updateRoomStatus(formattedRoom.id, 'cleaning')}>
                      <i className="bi bi-broom text-info me-2"></i>ทำความสะอาด
                    </button></li>
                    <li><button className="dropdown-item" onClick={() => this.updateRoomStatus(formattedRoom.id, 'maintenance')}>
                      <i className="bi bi-tools text-warning me-2"></i>ซ่อมแซม
                    </button></li>
                    <li><button className="dropdown-item" onClick={() => this.updateRoomStatus(formattedRoom.id, 'out-of-order')}>
                      <i className="bi bi-exclamation-triangle text-secondary me-2"></i>ไม่พร้อมใช้งาน
                    </button></li>
                  </ul>
                </div>
              </div>
            ),
            actions: (
              <>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary me-1" 
                  data-bs-toggle="offcanvas" 
                  data-bs-target="#edit-room" 
                  aria-controls="edit-room"
                  onClick={() => this.handleEdit(formattedRoom.id)}
                  title="แก้ไขห้อง"
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => this.handleDelete(formattedRoom.id)}
                  title="ลบห้อง"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </>
            ),
          };
        });
        
        this.setState({ dataT: formattedData });
        console.log('✅ Rooms data loaded successfully:', formattedData.length, 'rooms');
      } else {
        console.warn('⚠️ No rooms data received');
        this.setState({ dataT: [] });
      }
    } catch (error) {
      console.error('❌ Error loading rooms data:', error);
      this.setState({ 
        error: error.message || 'Failed to load rooms data',
        dataT: []
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleEdit = (roomId) => {
    console.log('✏️ Editing room:', roomId);
    // TODO: Pass room data to edit modal
  };

  handleDelete = async (roomId) => {
    if (!window.confirm('คุณต้องการลบห้องนี้หรือไม่?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting room:', roomId);
      await roomService.deleteRoom(roomId);
      
      // Reload data after successful deletion
      await this.loadRoomsData();
      console.log('✅ Room deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting room:', error);
      alert(`ไม่สามารถลบห้องได้: ${error.message}`);
    }
  };

  // Update room status
  updateRoomStatus = async (roomId, newStatus) => {
    try {
      console.log(`🔄 Updating room ${roomId} status to: ${newStatus}`);
      
      // Use roomService to call the correct API endpoint with proper authentication
      const response = await roomService.updateRoomStatus(roomId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
        updated_by: 'admin'
      });

      console.log('✅ Room status updated successfully:', response);
      
      // Show success message
      this.showToast('success', `อัพเดทสถานะห้องเป็น "${this.getStatusText(newStatus)}" สำเร็จ`);
      
      // Reload data to reflect changes
      await this.loadRoomsData();
    } catch (error) {
      console.error('❌ Error updating room status:', error);
      
      // Extract error message from different error formats
      let errorMessage = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.log('📋 Extracted error message:', errorMessage);
      this.showToast('error', `เกิดข้อผิดพลาด: ${errorMessage}`);
    }
  };

  // Helper methods for status display
  getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-success';
      case 'occupied':
        return 'bg-danger';
      case 'cleaning':
        return 'bg-info';
      case 'maintenance':
        return 'bg-warning';
      case 'out-of-order':
      case 'outoforder':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  };

  getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'ว่าง';
      case 'occupied':
        return 'ไม่ว่าง';
      case 'cleaning':
        return 'ทำความสะอาด';
      case 'maintenance':
        return 'ซ่อมแซม';
      case 'out-of-order':
      case 'outoforder':
        return 'ไม่พร้อมใช้งาน';
      default:
        return status || 'ไม่ทราบสถานะ';
    }
  };

  // Show toast notification
  showToast = (type, message) => {
    try {
      // Check if Bootstrap is available
      if (!window.bootstrap || !window.bootstrap.Toast) {
        console.warn('Bootstrap Toast not available, using console message instead');
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message); // Fallback to browser alert
        return;
      }

      // Create toast element
      const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
      
      const toastId = `toast-${Date.now()}`;
      const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0" role="alert">
          <div class="d-flex">
            <div class="toast-body">
              <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        </div>
      `;
      
      toastContainer.insertAdjacentHTML('beforeend', toastHtml);
      
      // Show toast
      const toastElement = document.getElementById(toastId);
      const toast = new window.bootstrap.Toast(toastElement, { delay: 3000 });
      toast.show();
      
      // Remove toast element after it's hidden
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    } catch (error) {
      console.error('Toast error:', error);
      // Fallback to console and alert
      console.log(`${type.toUpperCase()}: ${message}`);
      alert(message);
    }
  };

  // Create toast container if it doesn't exist
  createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  };

  render() {
    const { dataT, loading, error, pageSize, globalFilter } = this.state;

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <span className="ms-2">กำลังโหลดข้อมูลห้อง...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          <h6 className="alert-heading">เกิดข้อผิดพลาด!</h6>
          <p className="mb-0">{error}</p>
          <hr />
          <button 
            className="btn btn-outline-danger btn-sm" 
            onClick={this.loadRoomsData}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            ลองใหม่
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">
            พบ {dataT.length} ห้อง
          </h6>
          <button 
            className="btn btn-outline-secondary btn-sm" 
            onClick={this.loadRoomsData}
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
          columns={roomListColumn} 
          data={dataT}
          pageSize={pageSize}
          globalFilter={globalFilter}
          setGlobalFilter={this.setGlobalFilter}
          setPageSize={this.setPageSize}
        />
        <DataTableFooter dataT={dataT} />
      </>
    );
  }
}

export default RoomListTable;
