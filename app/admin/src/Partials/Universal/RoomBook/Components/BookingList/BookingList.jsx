import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../../contexts/AuthContext';
import bookingService from '../../../../../services/bookingService';
import BookingTable from './BookingTable';

// Wrapper component สำหรับ authentication
const BookingListWithAuth = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="text-center p-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please login to access booking management
        </div>
      </div>
    );
  }

  return <BookingListMain />;
};

class BookingListMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: {
        todayCheckIns: 0,
        todayCheckOuts: 0,
        inHouse: 0,
        pending: 0
      },
      statsLoading: true
    };
    
    // Reference to BookingTable for refresh
    this.bookingTableRef = React.createRef();
  }

  async componentDidMount() {
    await this.loadBookingStats();
  }

  // ===============================
  // STATISTICS LOADING
  // ===============================

  loadBookingStats = async () => {
    try {
      this.setState({ statsLoading: true });
      
      const [todayArrivals, todayDepartures] = await Promise.all([
        bookingService.getTodaysArrivals(),
        bookingService.getTodaysDepartures()
      ]);

      // Get general booking statistics  
      const allBookings = await bookingService.getAllBookings();
      
      let inHouseCount = 0;
      let pendingCount = 0;
      
      if (allBookings && allBookings.bookings) {
        allBookings.bookings.forEach(booking => {
          const status = booking.status?.toLowerCase();
          if (status === 'inhouse' || status === 'in-house') {
            inHouseCount++;
          } else if (status === 'pending' || status === 'confirmed') {
            pendingCount++;
          }
        });
      }

      this.setState({
        stats: {
          todayCheckIns: todayArrivals?.arrivals?.length || 0,
          todayCheckOuts: todayDepartures?.departures?.length || 0,
          inHouse: inHouseCount,
          pending: pendingCount
        },
        statsLoading: false
      });

    } catch (error) {
      console.error('❌ Error loading booking stats:', error);
      this.setState({ statsLoading: false });
    }
  };

  // ===============================
  // QUICK ACTIONS
  // ===============================

  handleQuickAction = async (action) => {
    try {
      switch (action) {
        case 'refresh':
          console.log('🔄 Refreshing booking data...');
          if (this.bookingTableRef.current) {
            await this.bookingTableRef.current.refreshData();
          }
          await this.loadBookingStats();
          break;
          
        case 'export-all':
          console.log('📤 Exporting all bookings...');
          // TODO: Implement export all functionality
          alert('Export functionality will be implemented soon');
          break;
          
        default:
          console.warn('Unknown quick action:', action);
      }
    } catch (error) {
      console.error(`❌ Quick action ${action} failed:`, error);
      alert(`Action failed: ${error.message}`);
    }
  };

  render() {
    const { stats, statsLoading } = this.state;

    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
          {/* Page Header */}
          <div className="col-sm-12">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              <div>
                <h3 className="fw-bold mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Room Booking Management
                </h3>
                <p className="text-muted mb-0 mt-1">Manage all hotel bookings and guest check-ins</p>
              </div>
              <div className="col-auto d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => this.handleQuickAction('refresh')}
                  title="Refresh Data"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-success btn-sm"
                  onClick={() => this.handleQuickAction('export-all')}
                  title="Export All Bookings"
                >
                  <i className="bi bi-download me-1"></i>
                  Export
                </button>
                <Link to="/room-booking" className="btn btn-dark btn-set-task">
                  <i className="bi bi-plus-circle me-1"></i>
                  New Booking
                </Link>
              </div>
            </div>
          </div>

          {/* Booking Statistics Cards */}
          <div className="col-sm-12">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="icon-shape bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                        <i className="bi bi-box-arrow-in-right fs-4"></i>
                      </div>
                    </div>
                    <h4 className="card-title mb-1">
                      {statsLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                      ) : (
                        stats.todayCheckIns
                      )}
                    </h4>
                    <p className="card-text text-muted mb-0">Today's Check-ins</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="icon-shape bg-warning bg-opacity-10 text-warning rounded-circle p-3">
                        <i className="bi bi-box-arrow-right fs-4"></i>
                      </div>
                    </div>
                    <h4 className="card-title mb-1">
                      {statsLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                      ) : (
                        stats.todayCheckOuts
                      )}
                    </h4>
                    <p className="card-text text-muted mb-0">Today's Check-outs</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="icon-shape bg-success bg-opacity-10 text-success rounded-circle p-3">
                        <i className="bi bi-house fs-4"></i>
                      </div>
                    </div>
                    <h4 className="card-title mb-1">
                      {statsLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                      ) : (
                        stats.inHouse
                      )}
                    </h4>
                    <p className="card-text text-muted mb-0">Currently In-House</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="icon-shape bg-info bg-opacity-10 text-info rounded-circle p-3">
                        <i className="bi bi-clock fs-4"></i>
                      </div>
                    </div>
                    <h4 className="card-title mb-1">
                      {statsLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                      ) : (
                        stats.pending
                      )}
                    </h4>
                    <p className="card-text text-muted mb-0">Pending Bookings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Booking Table */}
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header bg-white border-bottom py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-table me-2"></i>
                    All Bookings
                  </h5>
                  <div className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Real-time booking data
                  </div>
                </div>
              </div>
              <div className="card-body">
                <BookingTable 
                  ref={this.bookingTableRef}
                />
              </div>
            </div>
          </div>

          {/* Footer Information */}
          <div className="col-sm-12">
            <div className="text-center text-muted small py-3">
              <i className="bi bi-shield-check me-1"></i>
              Secure booking management system
              <span className="mx-3">|</span>
              <i className="bi bi-clock me-1"></i>
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BookingListWithAuth;