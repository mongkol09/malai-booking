import React, { Component } from 'react';
import { roomListColumn } from './RoomListTableData';
import roomService from '../../../../../services/roomService';
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
      
      const response = await roomService.getAllRooms();
      console.log('📊 Rooms API Response:', response);
      
      if (response && response.data) {
        const formattedData = response.data.map(room => {
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
              <span className={`badge ${formattedRoom.status === 'available' ? 'bg-success' : 
                formattedRoom.status === 'occupied' ? 'bg-danger' : 'bg-warning'}`}>
                {formattedRoom.status === 'available' ? 'ว่าง' : 
                 formattedRoom.status === 'occupied' ? 'ไม่ว่าง' : 'ไม่พร้อม'}
              </span>
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
