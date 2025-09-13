import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ExpiredBookings = () => {
  const [expiredBookings, setExpiredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archiveCandidates, setArchiveCandidates] = useState([]);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  };

  // Fetch expired bookings and archive candidates
  const fetchExpiredBookings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Get archive candidates (expired bookings)
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/booking-history/archive/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setArchiveCandidates(result.data);
      }

      // Also get current bookings that might be expired
      await fetchCurrentExpiredBookings(token);

    } catch (error) {
      console.error('Error fetching expired bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current bookings that are expired (check-out date passed)
  const fetchCurrentExpiredBookings = async (token) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/booking-history/?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Filter for bookings that should have checked out but haven't
          const expired = result.data.filter(booking => {
            const checkoutDate = new Date(booking.check_out_date);
            const todayDate = new Date(today);
            return checkoutDate < todayDate && 
                   ['Confirmed', 'Pending'].includes(booking.booking_status);
          });
          
          setExpiredBookings(expired);
        }
      }
    } catch (error) {
      console.error('Error fetching current expired bookings:', error);
    }
  };

  // Auto-archive a booking
  const handleAutoArchive = async (bookingId) => {
    try {
      const token = getToken();
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/booking-history/archive/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_id: bookingId,
          archive_reason: 'AUTO_EXPIRED'
        })
      });

      if (response.ok) {
        // Refresh the lists
        fetchExpiredBookings();
        alert('Booking archived successfully!');
      } else {
        throw new Error('Failed to archive booking');
      }
    } catch (error) {
      console.error('Error archiving booking:', error);
      alert('Error archiving booking. Please try again.');
    }
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

  // Calculate days overdue
  const getDaysOverdue = (checkoutDate) => {
    const today = new Date();
    const checkout = new Date(checkoutDate);
    const diffTime = today.getTime() - checkout.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get urgency level
  const getUrgencyLevel = (daysOverdue) => {
    if (daysOverdue <= 1) return { level: 'low', color: 'warning', text: 'Due Today' };
    if (daysOverdue <= 7) return { level: 'medium', color: 'danger', text: 'Overdue' };
    return { level: 'high', color: 'dark', text: 'Critical' };
  };

  // Load data on component mount
  useEffect(() => {
    fetchExpiredBookings();
  }, []);

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="h3 mb-0 text-gradient">⏰ Expired Bookings</h1>
              <p className="text-muted">Manage bookings that have passed their check-out date</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/booking-history" className="btn btn-outline-primary">
                <i className="fa fa-arrow-left"></i> Back to History
              </Link>
              <button 
                className="btn btn-primary" 
                onClick={fetchExpiredBookings}
                disabled={loading}
              >
                <i className="fa fa-refresh"></i> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading expired bookings...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card border-warning">
                <div className="card-body text-center">
                  <div className="display-6 text-warning mb-2">
                    <i className="fa fa-clock-o"></i>
                  </div>
                  <h3 className="mb-1">{expiredBookings.length}</h3>
                  <p className="text-muted mb-0">Currently Expired</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-info">
                <div className="card-body text-center">
                  <div className="display-6 text-info mb-2">
                    <i className="fa fa-archive"></i>
                  </div>
                  <h3 className="mb-1">{archiveCandidates.length}</h3>
                  <p className="text-muted mb-0">Archive Candidates</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-success">
                <div className="card-body text-center">
                  <div className="display-6 text-success mb-2">
                    <i className="fa fa-dollar"></i>
                  </div>
                  <h3 className="mb-1">
                    {formatCurrency(
                      expiredBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
                    )}
                  </h3>
                  <p className="text-muted mb-0">Total Revenue at Risk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Currently Expired Bookings */}
          {expiredBookings.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-danger">
                  <div className="card-header bg-danger text-white">
                    <h5 className="card-title mb-0">
                      🚨 Currently Expired Bookings ({expiredBookings.length})
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Booking Ref</th>
                            <th>Guest</th>
                            <th>Room</th>
                            <th>Should Have Checked Out</th>
                            <th>Days Overdue</th>
                            <th>Amount</th>
                            <th>Urgency</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expiredBookings.map((booking) => {
                            const daysOverdue = getDaysOverdue(booking.check_out_date);
                            const urgency = getUrgencyLevel(daysOverdue);
                            
                            return (
                              <tr key={booking.id} className="table-warning">
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
                                <td>{formatDate(booking.check_out_date)}</td>
                                <td>
                                  <span className={`badge bg-${urgency.color}`}>
                                    {daysOverdue} day{daysOverdue > 1 ? 's' : ''}
                                  </span>
                                </td>
                                <td>
                                  <strong>{formatCurrency(booking.total_amount)}</strong>
                                </td>
                                <td>
                                  <span className={`badge bg-${urgency.color}`}>
                                    {urgency.text}
                                  </span>
                                </td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      className="btn btn-outline-primary"
                                      onClick={() => {
                                        // Handle manual check-out
                                        alert('Manual check-out functionality would go here');
                                      }}
                                    >
                                      Check Out
                                    </button>
                                    <button
                                      className="btn btn-outline-warning"
                                      onClick={() => handleAutoArchive(booking.id)}
                                    >
                                      Archive
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Archive Candidates */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    📋 Archive Candidates ({archiveCandidates.length})
                  </h5>
                </div>
                <div className="card-body p-0">
                  {archiveCandidates.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Booking Ref</th>
                            <th>Guest</th>
                            <th>Room</th>
                            <th>Check Out Date</th>
                            <th>Status</th>
                            <th>Suggested Reason</th>
                            <th>Days Since Criteria</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {archiveCandidates.map((candidate) => (
                            <tr key={candidate.booking_id}>
                              <td>
                                <strong className="text-primary">
                                  {candidate.booking_reference}
                                </strong>
                              </td>
                              <td>
                                <strong>{candidate.guest_name}</strong>
                              </td>
                              <td>
                                <strong>{candidate.room_number}</strong>
                              </td>
                              <td>{formatDate(candidate.check_out_date)}</td>
                              <td>
                                <span className={`badge ${
                                  candidate.booking_status === 'Cancelled' ? 'bg-danger' :
                                  candidate.booking_status === 'CheckedOut' ? 'bg-success' :
                                  'bg-warning'
                                }`}>
                                  {candidate.booking_status}
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {candidate.suggested_reason}
                                </small>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {candidate.days_since_criteria} days
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => handleAutoArchive(candidate.booking_id)}
                                >
                                  Archive Now
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div className="text-muted">
                        <i className="fa fa-check-circle fa-3x mb-3 text-success"></i>
                        <p>No archive candidates found</p>
                        <small>All bookings are current or already archived</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Archive Settings */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <i className="fa fa-cog"></i> Auto-Archive Settings
                </h6>
                <p className="mb-2">
                  Configure automatic archiving rules for different booking scenarios:
                </p>
                <ul className="mb-3">
                  <li><strong>Cancelled Bookings:</strong> Auto-archive after 7 days</li>
                  <li><strong>Checked Out Bookings:</strong> Auto-archive after 30 days</li>
                  <li><strong>Expired Confirmed Bookings:</strong> Review after check-out date passes</li>
                </ul>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="fa fa-cog"></i> Configure Rules
                  </button>
                  <button className="btn btn-outline-success btn-sm">
                    <i className="fa fa-play"></i> Enable Auto-Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpiredBookings;