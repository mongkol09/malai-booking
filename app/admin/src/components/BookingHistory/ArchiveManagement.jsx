import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingHistoryApi from '../../services/bookingHistoryApi';

const ArchiveManagement = () => {
  const [archivedBookings, setArchivedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [archiveReasonFilter, setArchiveReasonFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    totalArchived: 0,
    totalRevenue: 0,
    autoArchived: 0,
    manualArchived: 0
  });

  // Fetch archived bookings
  const fetchArchivedBookings = async (page = 1) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: 'archived'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (archiveReasonFilter) {
        params.append('archive_reason', archiveReasonFilter);
      }

      if (dateRange.start) {
        params.append('date_from', dateRange.start);
      }

      if (dateRange.end) {
        params.append('date_to', dateRange.end);
      }

      const result = await bookingHistoryApi.getBookingHistory(`?${params}`);
      
      if (result.success) {
        setArchivedBookings(result.data);
        setTotalPages(Math.ceil(result.total / 20));
        setCurrentPage(page);
      }

    } catch (error) {
      console.error('Error fetching archived bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch archive statistics
  const fetchArchiveStatistics = async () => {
    try {
      const result = await bookingHistoryApi.getAnalyticsStatistics();
      
      if (result.success && result.data) {
        console.log('📊 Archive Statistics Response:', result.data);
        
        // Use the actual API response structure
        const totalArchived = result.data.total_archived || 0;
        const byReason = result.data.by_reason || [];
        const recentActivity = result.data.recent_activity || [];
        
        // Calculate statistics from actual response
        const totalRevenue = byReason.reduce((sum, item) => sum + (item.total_value || 0), 0);
        
        setStatistics({
          totalArchived: totalArchived,
          totalRevenue: totalRevenue,
          autoArchived: byReason.find(r => r.reason === 'AUTO_EXPIRED')?.count || 0,
          manualArchived: byReason.filter(r => r.reason !== 'AUTO_EXPIRED').reduce((sum, r) => sum + r.count, 0)
        });
      } else {
        console.warn('⚠️ Invalid API response structure:', result);
        // Set default values
        setStatistics({
          totalArchived: 0,
          totalRevenue: 0,
          autoArchived: 0,
          manualArchived: 0
        });
      }
    } catch (error) {
      console.error('Error fetching archive statistics:', error);
      // Set default values on error
      setStatistics({
        totalArchived: 0,
        totalRevenue: 0,
        autoArchived: 0,
        manualArchived: 0
      });
    }
  };

  // Restore archived booking
  const handleRestoreBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to restore this booking from archive?')) {
      return;
    }

    try {
      const result = await bookingHistoryApi.restoreBooking(bookingId);

      if (result.success) {
        alert('Booking restored successfully!');
        fetchArchivedBookings(currentPage);
        fetchArchiveStatistics();
      } else {
        throw new Error('Failed to restore booking');
      }
    } catch (error) {
      console.error('Error restoring booking:', error);
      alert('Error restoring booking. Please try again.');
    }
  };

  // Permanent delete archived booking
  const handlePermanentDelete = async (bookingId) => {
    if (!window.confirm('WARNING: This will permanently delete the booking. This action cannot be undone. Are you sure?')) {
      return;
    }

    if (!window.confirm('FINAL CONFIRMATION: This booking will be permanently removed from the system. Continue?')) {
      return;
    }

    try {
      const result = await bookingHistoryApi.deleteBooking(bookingId);

      if (result.success) {
        alert('Booking permanently deleted!');
        fetchArchivedBookings(currentPage);
        fetchArchiveStatistics();
      } else {
        throw new Error('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking. Please try again.');
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchArchivedBookings(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setArchiveReasonFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
    fetchArchivedBookings(1);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount || 0);
  };

  // Get archive reason badge
  const getArchiveReasonBadge = (reason) => {
    const reasons = {
      'AUTO_EXPIRED': { color: 'warning', text: 'Auto-Expired', icon: 'clock-o' },
      'MANUAL_ADMIN': { color: 'info', text: 'Manual', icon: 'user' },
      'CANCELLED_CLEANUP': { color: 'danger', text: 'Cancelled', icon: 'times' },
      'CHECKED_OUT_OLD': { color: 'success', text: 'Old Checkout', icon: 'check' },
      'DATA_CLEANUP': { color: 'secondary', text: 'Data Cleanup', icon: 'database' }
    };

    const config = reasons[reason] || { color: 'secondary', text: reason, icon: 'archive' };
    
    return (
      <span className={`badge bg-${config.color}`}>
        <i className={`fa fa-${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  // Load data on component mount
  useEffect(() => {
    fetchArchivedBookings();
    fetchArchiveStatistics();
  }, []);

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="h3 mb-0 text-gradient">🗄️ Archive Management</h1>
              <p className="text-muted">Manage archived bookings and restore when needed</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/booking-history" className="btn btn-outline-primary">
                <i className="fa fa-arrow-left"></i> Back to History
              </Link>
              <Link to="/expired-bookings" className="btn btn-outline-warning">
                <i className="fa fa-clock-o"></i> Expired Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <div className="display-6 text-primary mb-2">
                <i className="fa fa-archive"></i>
              </div>
              <h3 className="mb-1">{statistics.totalArchived}</h3>
              <p className="text-muted mb-0">Total Archived</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <div className="display-6 text-success mb-2">
                <i className="fa fa-dollar"></i>
              </div>
              <h3 className="mb-1">{formatCurrency(statistics.totalRevenue)}</h3>
              <p className="text-muted mb-0">Archived Revenue</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <div className="display-6 text-warning mb-2">
                <i className="fa fa-robot"></i>
              </div>
              <h3 className="mb-1">{statistics.autoArchived}</h3>
              <p className="text-muted mb-0">Auto-Archived</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <div className="display-6 text-info mb-2">
                <i className="fa fa-user"></i>
              </div>
              <h3 className="mb-1">{statistics.manualArchived}</h3>
              <p className="text-muted mb-0">Manual Archives</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fa fa-search"></i> Search & Filter Archived Bookings
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Search Term</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Booking ref, guest name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Archive Reason</label>
                  <select
                    className="form-select"
                    value={archiveReasonFilter}
                    onChange={(e) => setArchiveReasonFilter(e.target.value)}
                  >
                    <option value="">All Reasons</option>
                    <option value="AUTO_EXPIRED">Auto-Expired</option>
                    <option value="MANUAL_ADMIN">Manual</option>
                    <option value="CANCELLED_CLEANUP">Cancelled</option>
                    <option value="CHECKED_OUT_OLD">Old Checkout</option>
                    <option value="DATA_CLEANUP">Data Cleanup</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={handleSearch}
                    >
                      <i className="fa fa-search"></i> Search
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={clearFilters}
                    >
                      <i className="fa fa-times"></i> Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Archived Bookings Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                📋 Archived Bookings ({archivedBookings.length})
              </h5>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => fetchArchivedBookings(currentPage)}
                disabled={loading}
              >
                <i className="fa fa-refresh"></i> Refresh
              </button>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading archived bookings...</p>
                </div>
              ) : archivedBookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Booking Ref</th>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Check-in/out</th>
                        <th>Amount</th>
                        <th>Original Status</th>
                        <th>Archive Reason</th>
                        <th>Archived Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedBookings.map((booking) => (
                        <tr key={booking.id} className="table-light">
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
                          <td>
                            <div>
                              <small>In: {formatDate(booking.check_in_date)}</small><br />
                              <small>Out: {formatDate(booking.check_out_date)}</small>
                            </div>
                          </td>
                          <td>
                            <strong>{formatCurrency(booking.total_amount)}</strong>
                          </td>
                          <td>
                            <span className={`badge ${
                              booking.booking_status === 'Cancelled' ? 'bg-danger' :
                              booking.booking_status === 'CheckedOut' ? 'bg-success' :
                              booking.booking_status === 'Confirmed' ? 'bg-primary' :
                              'bg-warning'
                            }`}>
                              {booking.booking_status}
                            </span>
                          </td>
                          <td>
                            {getArchiveReasonBadge(booking.archive_reason)}
                          </td>
                          <td>
                            <small>{formatDate(booking.archived_at)}</small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleRestoreBooking(booking.id)}
                                title="Restore booking"
                              >
                                <i className="fa fa-undo"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handlePermanentDelete(booking.id)}
                                title="Permanently delete"
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="text-muted">
                    <i className="fa fa-archive fa-3x mb-3"></i>
                    <p>No archived bookings found</p>
                    <small>Try adjusting your search criteria</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <nav aria-label="Archived bookings pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => fetchArchivedBookings(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                  return (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => fetchArchivedBookings(page)}
                      >
                        {page}
                      </button>
                    </li>
                  );
                })}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => fetchArchivedBookings(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Bulk Operations */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-warning">
            <h6 className="alert-heading">
              <i className="fa fa-exclamation-triangle"></i> Archive Management Guidelines
            </h6>
            <ul className="mb-2">
              <li><strong>Restore:</strong> Moves booking back to active status</li>
              <li><strong>Permanent Delete:</strong> Completely removes booking from system (cannot be undone)</li>
              <li><strong>Data Retention:</strong> Consider legal requirements before permanent deletion</li>
              <li><strong>Backup:</strong> Ensure proper backups before bulk operations</li>
            </ul>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-info btn-sm">
                <i className="fa fa-download"></i> Export Archive List
              </button>
              <button className="btn btn-outline-warning btn-sm">
                <i className="fa fa-cog"></i> Archive Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveManagement;