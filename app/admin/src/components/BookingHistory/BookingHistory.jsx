import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const BookingHistory = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiredCount, setExpiredCount] = useState(0);
  const [filters, setFilters] = useState({
    guest_name: '',
    booking_status: '',
    room_type: '',
    limit: 20,
    page: 1
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Get token using AuthService
  const getToken = () => {
    return authService.getToken();
  };

  // Fetch booking history from API
  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      
      // Check authentication first
      if (!isAuthenticated) {
        console.error('User not authenticated');
        return;
      }

      const token = getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      // Use authService for API calls with proper URL
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/booking-history/?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data);
        setPagination(data.pagination);
        
        // Count expired bookings
        const today = new Date().toISOString().split('T')[0];
        const expired = data.data.filter(booking => {
          const checkoutDate = new Date(booking.check_out_date).toISOString().split('T')[0];
          return checkoutDate < today && 
                 ['Confirmed', 'Pending'].includes(booking.booking_status);
        });
        setExpiredCount(expired.length);
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      const token = getToken();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'page') { // Exclude page for export
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/booking-history/export/csv?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Export Error: ${response.status}`);
      }

      const csvContent = await response.text();
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Confirmed': return 'bg-success';
        case 'Cancelled': return 'bg-danger';
        case 'CheckedOut': return 'bg-warning';
        case 'Pending': return 'bg-warning';
        default: return 'bg-secondary';
      }
    };

    return (
      <span className={`badge ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Submit filters
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchBookingHistory();
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchBookingHistory();
  }, [filters.page]); // Only refetch when page changes

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="h3 mb-0 text-gradient">📚 Booking History</h1>
              <p className="text-muted">Manage all hotel bookings and guest check-ins</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/expired-bookings" className="btn btn-outline-warning">
                <i className="fa fa-clock-o"></i> Expired Bookings
                {expiredCount > 0 && (
                  <span className="badge bg-danger ms-1">{expiredCount}</span>
                )}
              </Link>
              <Link to="/archive-management" className="btn btn-outline-secondary">
                <i className="fa fa-archive"></i> Archive
              </Link>
              <button 
                className="btn btn-outline-success" 
                onClick={handleExportCSV}
                disabled={loading}
              >
                <i className="fa fa-download"></i> Export CSV
              </button>
              <Link to="/booking-analytics" className="btn btn-primary">
                <i className="fa fa-chart-bar"></i> Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Expired Bookings Alert */}
      {expiredCount > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning alert-dismissible d-flex align-items-center" role="alert">
              <i className="fa fa-exclamation-triangle me-3 fs-4"></i>
              <div className="flex-grow-1">
                <h6 className="alert-heading mb-1">⚠️ Attention Required</h6>
                <p className="mb-2">
                  You have <strong>{expiredCount}</strong> booking{expiredCount > 1 ? 's' : ''} that have passed their check-out date and require immediate attention.
                </p>
                <p className="mb-0">
                  <Link to="/expired-bookings" className="btn btn-warning btn-sm">
                    <i className="fa fa-eye"></i> Review Expired Bookings
                  </Link>
                </p>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleFilterSubmit}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Guest Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="guest_name"
                      value={filters.guest_name}
                      onChange={handleFilterChange}
                      placeholder="Search by guest name..."
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Booking Status</label>
                    <select
                      className="form-select"
                      name="booking_status"
                      value={filters.booking_status}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Status</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="CheckedOut">Checked Out</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Room Type</label>
                    <input
                      type="text"
                      className="form-control"
                      name="room_type"
                      value={filters.room_type}
                      onChange={handleFilterChange}
                      placeholder="Room type..."
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Items per page</label>
                    <select
                      className="form-select"
                      name="limit"
                      value={filters.limit}
                      onChange={handleFilterChange}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary me-2">
                      <i className="fa fa-search"></i> Search
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setFilters({
                          guest_name: '',
                          booking_status: '',
                          room_type: '',
                          limit: 20,
                          page: 1
                        });
                      }}
                    >
                      <i className="fa fa-refresh"></i> Clear
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                📋 Booking Records 
                {!loading && (
                  <span className="badge bg-secondary ms-2">
                    {pagination.total} total
                  </span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading booking history...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Booking Reference</th>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Duration</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length > 0 ? (
                        bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <strong className="text-primary">
                                {booking.booking_reference}
                              </strong>
                            </td>
                            <td>
                              <div>
                                <strong>{booking.guest_name}</strong><br />
                                <small className="text-muted">{booking.guest_email}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>{booking.room_number}</strong><br />
                                <small className="text-muted">{booking.room_type_name}</small>
                              </div>
                            </td>
                            <td>{formatDate(booking.check_in_date)}</td>
                            <td>{formatDate(booking.check_out_date)}</td>
                            <td>
                              <span className="badge bg-info">
                                {booking.stay_duration} night{booking.stay_duration > 1 ? 's' : ''}
                              </span>
                            </td>
                            <td>
                              <strong>{formatCurrency(booking.total_amount)}</strong>
                            </td>
                            <td>
                              <StatusBadge status={booking.booking_status} />
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {booking.source}
                              </span>
                            </td>
                            <td>
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-outline-primary dropdown-toggle"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                >
                                  Actions
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <a className="dropdown-item" href="#!">
                                      <i className="fa fa-eye"></i> View Details
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#!">
                                      <i className="fa fa-print"></i> Print
                                    </a>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <a className="dropdown-item text-warning" href="#!">
                                      <i className="fa fa-archive"></i> Archive
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="text-center py-5">
                            <div className="text-muted">
                              <i className="fa fa-inbox fa-3x mb-3"></i>
                              <p>No booking records found</p>
                              <small>Try adjusting your search filters</small>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} entries
                  </small>
                  
                  <nav aria-label="Booking history pagination">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          Previous
                        </button>
                      </li>
                      
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <li
                            key={pageNum}
                            className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;