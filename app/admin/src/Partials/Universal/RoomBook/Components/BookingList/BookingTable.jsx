import React, { Component, forwardRef } from 'react';
import { bookingColumns } from './BookingTableData';
import bookingService from '../../../../../services/bookingService';
import { useAuth } from '../../../../../contexts/AuthContext';
import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';
import BookingDetailModal from './BookingDetailModal';
import BookingDetailViewModal from './BookingDetailViewModal';
import BookingEditModal from './BookingEditModal';
import BookingCancelModal from './BookingCancelModal';
import GuestDataCompletionModal from './GuestDataCompletionModal';

// Wrapper component สำหรับ authentication with forwardRef
const BookingTableWithAuth = forwardRef((props, ref) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="alert alert-warning" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Please login to view booking data
      </div>
    );
  }

  return <BookingTable ref={ref} {...props} />;
});

// Add display name for debugging
BookingTableWithAuth.displayName = 'BookingTableWithAuth';

class BookingTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookings: [],
      allBookings: [], // Store all bookings for filtering
      loading: true,
      error: null,
      filters: {
        search: '',
        status: 'all',
        dateFrom: '',
        dateTo: ''
      },
      pageSize: 10,
      globalFilter: '',
      // Modal states
      showDetailModal: false,
      showDetailViewModal: false,
      showEditModal: false,
      showCancelModal: false,
      showGuestDataModal: false,
      selectedBookingId: null,
      selectedBookingReferenceId: null,
      selectedBooking: null
    };
  }

  async componentDidMount() {
    await this.loadBookingsData();
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
    return this.loadBookingsData();
  };

  loadBookingsData = async () => {
    try {
      this.setState({ loading: true, error: null });
      console.log('📋 Loading bookings data...');
      
      // Get all bookings first (server-side filtering may not be fully implemented)
      const response = await bookingService.getAllBookings();
      console.log('📊 Bookings API Response:', response);
      
      if (response && response.bookings) {
        const formattedData = response.bookings.map(booking => {
          const formattedBooking = bookingService.formatBookingForDisplay(booking);
          return {
            id: formattedBooking.id,
            bookingReference: (
              <div className="d-flex align-items-center">
                <span className="badge bg-primary text-white border me-2 fs-6 px-3 py-2">
                  <i className="bi bi-receipt-cutoff me-1"></i>
                  {formattedBooking.bookingReferenceId || 'N/A'}
                </span>
                {formattedBooking.bookingReferenceId && (
                  <button 
                    className="btn btn-outline-secondary btn-sm" 
                    onClick={() => this.copyBookingReference(formattedBooking.bookingReferenceId)}
                    title="คัดลอกหมายเลขการจอง"
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                )}
              </div>
            ),
            name: formattedBooking.guestName,
            roomNumber: (
              <div className="text-center">
                <span className="badge bg-secondary text-white fs-6 px-3 py-2">
                  <i className="bi bi-door-open me-1"></i>
                  {formattedBooking.roomNumber || 'ยังไม่มีห้อง'}
                </span>
              </div>
            ),
            roomType: formattedBooking.roomType,
            checkIn: formattedBooking.checkIn,
            checkOut: formattedBooking.checkOut,
            paidAmount: `฿${parseFloat(formattedBooking.paidAmount || 0).toLocaleString()}`,
            dueAmount: `฿${parseFloat(formattedBooking.dueAmount || 0).toLocaleString()}`,
            paymentStatus: (
              <span className={`badge ${formattedBooking.statusColor}`}>
                {this.formatStatus(formattedBooking.status)}
              </span>
            ),
            originalStatus: formattedBooking.status, // Keep original status for filtering
            originalBooking: formattedBooking, // Keep original for filtering
            actions: (
              <div className="btn-group btn-group-sm">
                <button 
                  type="button" 
                  className="btn btn-outline-primary dropdown-toggle" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  title="Booking Actions"
                >
                  Actions
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => this.handleViewBooking(formattedBooking.id, formattedBooking.bookingReferenceId)}
                    >
                      <i className="bi bi-info-circle me-2"></i>ดูข้อมูลสรุป
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item text-primary" 
                      onClick={() => this.handleViewBookingDetail(formattedBooking.id, formattedBooking.bookingReferenceId)}
                    >
                      <i className="bi bi-receipt me-2"></i>ดูรายละเอียดครบถ้วน
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  {formattedBooking.canCheckIn && (
                    <li>
                      <button 
                        className="dropdown-item text-success" 
                        onClick={() => this.handleCheckIn(formattedBooking.id)}
                      >
                        <i className="bi bi-box-arrow-in-right me-2"></i>Check In
                      </button>
                    </li>
                  )}
                  {formattedBooking.canCheckOut && (
                    <li>
                      <button 
                        className="dropdown-item text-warning" 
                        onClick={() => this.handleCheckOut(formattedBooking.id)}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Check Out
                      </button>
                    </li>
                  )}
                  {(formattedBooking.canCheckIn || formattedBooking.canCheckOut) && (
                    <li><hr className="dropdown-divider" /></li>
                  )}
                  <li>
                    <button 
                      className="dropdown-item text-info" 
                      onClick={() => this.handleCompleteGuestData(formattedBooking.id, formattedBooking.bookingReferenceId)}
                    >
                      <i className="bi bi-person-plus me-2"></i>เพิ่มข้อมูลลูกค้า
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => this.handleEditBooking(formattedBooking.id)}
                    >
                      <i className="bi bi-pencil me-2"></i>แก้ไข
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={() => this.handleCancelBooking(formattedBooking.id)}
                    >
                      <i className="bi bi-x-circle me-2"></i>ยกเลิก
                    </button>
                  </li>
                </ul>
              </div>
            )
          };
        });

        // Apply client-side filtering
        const filteredData = this.applyClientFilters(formattedData);

        this.setState({ 
          bookings: filteredData,
          allBookings: formattedData, // Store all bookings for filtering
          loading: false 
        });
        
        console.log('✅ Bookings data loaded successfully:', filteredData.length, 'bookings (filtered from', formattedData.length, 'total)');
      } else {
        console.warn('⚠️ No bookings data received');
        console.warn('Response structure:', response);
        this.setState({ 
          bookings: [],
          allBookings: [],
          loading: false 
        });
      }
    } catch (error) {
      console.error('❌ Error loading bookings data:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('Authentication failed')) {
        this.setState({ 
          error: 'Session expired. Please login again.',
          bookings: [],
          allBookings: [],
          loading: false
        });
        return;
      }
      
      this.setState({ 
        error: error.message || 'Failed to load bookings data',
        bookings: [],
        allBookings: [],
        loading: false
      });
    }
  };

  // Client-side filtering function
  applyClientFilters = (data) => {
    const { filters } = this.state;
    let filteredData = [...data];

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.roomType.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm) ||
        (item.originalBooking && item.originalBooking.roomNumber && 
         item.originalBooking.roomNumber.toLowerCase().includes(searchTerm)) ||
        (item.originalBooking && item.originalBooking.bookingReferenceId && 
         item.originalBooking.bookingReferenceId.toLowerCase().includes(searchTerm))
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredData = filteredData.filter(item => {
        const status = item.originalStatus ? item.originalStatus.toLowerCase() : '';
        const filterStatus = filters.status.toLowerCase();
        
        // Handle different status name variations
        if (filterStatus === 'inhouse' && (status === 'inhouse' || status === 'in-house')) {
          return true;
        }
        return status === filterStatus;
      });
    }

    // Date range filter (check-in date)
    if (filters.dateFrom || filters.dateTo) {
      filteredData = filteredData.filter(item => {
        if (!item.originalBooking || !item.originalBooking.checkIn) return true;
        
        const checkInDate = new Date(item.originalBooking.checkIn);
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (checkInDate < fromDate) return false;
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          if (checkInDate > toDate) return false;
        }
        
        return true;
      });
    }

    return filteredData;
  };

  // ===============================
  // ACTION HANDLERS
  // ===============================

  // Copy booking reference to clipboard
  copyBookingReference = async (bookingReference) => {
    try {
      await navigator.clipboard.writeText(bookingReference);
      
      // Show success toast (if available)
      if (window.bootstrap && window.bootstrap.Toast) {
        this.showCopyToast('success', 'คัดลอกหมายเลขการจองสำเร็จ');
      } else {
        // Fallback to console message
        console.log(`✅ Copied booking reference: ${bookingReference}`);
      }
    } catch (error) {
      console.error('❌ Failed to copy booking reference:', error);
      // Fallback to alert
      alert(`หมายเลขการจอง: ${bookingReference}`);
    }
  };

  // Show copy toast notification
  showCopyToast = (type, message) => {
    try {
      const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
      const toastId = `copy-toast-${Date.now()}`;
      const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-success border-0" role="alert">
          <div class="d-flex">
            <div class="toast-body">
              <i class="bi bi-check-circle me-2"></i>
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        </div>
      `;
      
      toastContainer.insertAdjacentHTML('beforeend', toastHtml);
      
      const toastElement = document.getElementById(toastId);
      const toast = new window.bootstrap.Toast(toastElement, { delay: 2000 });
      toast.show();
      
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    } catch (error) {
      console.log('Toast not available, using console message');
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

  handleViewBooking = (bookingId, bookingReferenceId = null) => {
    console.log('📖 Viewing booking summary:', { bookingId, bookingReferenceId });
    this.setState({
      showDetailModal: true,
      selectedBookingId: bookingId,
      selectedBookingReferenceId: bookingReferenceId
    });
  };

  handleViewBookingDetail = (bookingId, bookingReferenceId = null) => {
    console.log('📋 Viewing booking detail (full form):', { bookingId, bookingReferenceId });
    this.setState({
      showDetailViewModal: true,
      selectedBookingId: bookingId,
      selectedBookingReferenceId: bookingReferenceId
    });
  };

  handleCloseDetailModal = () => {
    this.setState({
      showDetailModal: false,
      selectedBookingId: null,
      selectedBookingReferenceId: null
    });
  };

  handleCloseDetailViewModal = () => {
    this.setState({
      showDetailViewModal: false,
      selectedBookingId: null,
      selectedBookingReferenceId: null
    });
  };

  handleCheckIn = async (bookingId) => {
    try {
      console.log('🏨 Processing check-in for booking:', bookingId);
      
      const confirmCheckIn = window.confirm('Are you sure you want to check in this guest?');
      if (!confirmCheckIn) return;

      await bookingService.processCheckIn(bookingId);
      
      // Refresh data
      await this.loadBookingsData();
      
      // Show success message
      // TODO: Add proper notification system
      alert('Check-in completed successfully!');
      
    } catch (error) {
      console.error('❌ Check-in failed:', error);
      alert(`Check-in failed: ${error.message}`);
    }
  };

  handleCheckOut = async (bookingId) => {
    try {
      console.log('🚪 Processing check-out for booking:', bookingId);
      
      const confirmCheckOut = window.confirm('Are you sure you want to check out this guest?');
      if (!confirmCheckOut) return;

      await bookingService.processCheckOut(bookingId);
      
      // Refresh data
      await this.loadBookingsData();
      
      // Show success message
      alert('Check-out completed successfully!');
      
    } catch (error) {
      console.error('❌ Check-out failed:', error);
      alert(`Check-out failed: ${error.message}`);
    }
  };

  handleCompleteGuestData = (bookingId, bookingReferenceId) => {
    console.log('👤 Complete guest data for booking:', bookingId, bookingReferenceId);
    
    // Find the booking data
    const booking = this.state.bookings.find(b => b.id === bookingId || b.bookingReferenceId === bookingReferenceId);
    
    if (!booking) {
      console.error('❌ Booking not found:', { bookingId, bookingReferenceId });
      alert('ไม่พบข้อมูลการจอง');
      return;
    }
    
    // Open guest data completion modal
    this.setState({
      showGuestDataModal: true,
      selectedBooking: booking,
      selectedBookingId: bookingId,
      selectedBookingReferenceId: bookingReferenceId
    });
  };

  handleEditBooking = (bookingId) => {
    console.log('✏️ Editing booking:', bookingId);
    
    // Find the booking data
    const booking = this.state.bookings.find(b => b.id === bookingId);
    
    this.setState({
      selectedBooking: booking,
      showEditModal: true
    });
  };

  // Handle guest data save
  handleGuestDataSave = (updatedData) => {
    console.log('✅ Guest data saved:', updatedData);
    
    // Refresh booking data
    this.loadBookingsData();
    
    // Show success message
    if (window.Swal) {
      window.Swal.fire({
        title: '✅ สำเร็จ!',
        text: 'บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  handleCancelBooking = (bookingId) => {
    console.log('❌ Preparing to cancel booking:', bookingId);
    
    // Find the booking data
    const booking = this.state.bookings.find(b => b.id === bookingId);
    
    this.setState({
      selectedBooking: booking,
      showCancelModal: true
    });
  };

  // Modal handlers
  handleCloseEditModal = () => {
    this.setState({
      showEditModal: false,
      selectedBooking: null
    });
  };

  handleCloseCancelModal = () => {
    this.setState({
      showCancelModal: false,
      selectedBooking: null
    });
  };

  handleBookingUpdate = () => {
    this.loadBookingsData(); // Refresh data after update
  };

  handleBookingCancel = (cancellationData) => {
    console.log('📝 Booking canceled:', cancellationData);
    this.loadBookingsData(); // Refresh data after cancellation
  };

  // ===============================
  // HELPER METHODS
  // ===============================

  formatStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Confirmed';
      case 'inhouse':
      case 'in-house':
        return 'In House';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'noshow':
      case 'no-show':
        return 'No Show';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  // ===============================
  // FILTER HANDLERS
  // ===============================

  handleFilterChange = (filterType, value) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [filterType]: value
      }
    }), () => {
      // For client-side filtering, apply filters immediately
      this.applyFilters();
    });
  };

  // Handle search from DataTableHeader
  handleGlobalFilterChange = (value) => {
    this.setState({ globalFilter: value });
    this.handleFilterChange('search', value);
  };

  // Handle page size change from DataTableHeader
  handlePageSizeChange = (newPageSize) => {
    this.setState({ pageSize: newPageSize });
  };

  // Apply filters and update displayed data
  applyFilters = () => {
    const { allBookings } = this.state;
    if (!allBookings || allBookings.length === 0) return;

    const filteredData = this.applyClientFilters(allBookings);
    this.setState({ bookings: filteredData });
  };

  render() {
    const { bookings, loading, error, pageSize, globalFilter } = this.state;

    if (loading) {
      return (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading bookings...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-warning" role="alert">
          <h6 className="alert-heading">⚠️ Loading Error</h6>
          <p className="mb-2">{error}</p>
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={this.loadBookingsData}
          >
            🔄 Try Again
          </button>
        </div>
      );
    }

    return (
      <div>
        {/* Search and Filter Section */}
        <div className="row mb-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search by guest name, room number..."
              value={this.state.filters.search}
              onChange={(e) => this.handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={this.state.filters.status}
              onChange={(e) => this.handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="inhouse">In House</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={this.state.filters.dateFrom}
              onChange={(e) => this.handleFilterChange('dateFrom', e.target.value)}
              title="From Date"
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={this.state.filters.dateTo}
              onChange={(e) => this.handleFilterChange('dateTo', e.target.value)}
              title="To Date"
            />
          </div>
          <div className="col-md-1">
            <button 
              className="btn btn-outline-secondary btn-sm w-100" 
              onClick={this.loadBookingsData}
              title="Refresh Data"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTableHeader 
          pageSize={pageSize}
          setPageSize={this.handlePageSizeChange}
          globalFilter={globalFilter}
          setGlobalFilter={this.handleGlobalFilterChange}
        />
        <DataTable 
          columns={[...bookingColumns, { Header: 'Actions', accessor: 'actions' }]}
          data={bookings}
          pageSize={pageSize}
          globalFilter={globalFilter}
          setGlobalFilter={this.handleGlobalFilterChange}
          setPageSize={this.handlePageSizeChange}
        />
        <DataTableFooter dataT={bookings} />

        {/* Summary */}
        <div className="mt-3">
          <small className="text-muted">
            📊 Total: {bookings.length} bookings
          </small>
        </div>

        {/* Booking Detail Modal (Summary) */}
        <BookingDetailModal
          show={this.state.showDetailModal}
          onHide={this.handleCloseDetailModal}
          bookingId={this.state.selectedBookingId}
          bookingReferenceId={this.state.selectedBookingReferenceId}
        />

        {/* Booking Detail View Modal (Full Form) */}
        <BookingDetailViewModal
          show={this.state.showDetailViewModal}
          onHide={this.handleCloseDetailViewModal}
          bookingId={this.state.selectedBookingId}
          bookingReferenceId={this.state.selectedBookingReferenceId}
        />

        {/* Booking Edit Modal */}
        <BookingEditModal
          show={this.state.showEditModal}
          onHide={this.handleCloseEditModal}
          booking={this.state.selectedBooking}
          onUpdate={this.handleBookingUpdate}
        />

        {/* Booking Cancel Modal */}
        <BookingCancelModal
          show={this.state.showCancelModal}
          onHide={this.handleCloseCancelModal}
          booking={this.state.selectedBooking}
          onCancel={this.handleBookingCancel}
        />

        {/* Guest Data Completion Modal */}
        <GuestDataCompletionModal
          show={this.state.showGuestDataModal}
          onHide={() => this.setState({ showGuestDataModal: false })}
          booking={this.state.selectedBooking}
          onSave={this.handleGuestDataSave}
        />
      </div>
    );
  }
}

export default BookingTableWithAuth;