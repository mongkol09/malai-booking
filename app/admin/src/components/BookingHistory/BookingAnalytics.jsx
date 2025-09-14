import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingHistoryApi from '../../services/bookingHistoryApi';

const BookingAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data using API service
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const result = await bookingHistoryApi.getAnalyticsStatistics();
      
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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

  // Get status color
  const getStatusColor = (reason) => {
    switch (reason) {
      case 'Confirmed': return 'text-success';
      case 'Cancelled': return 'text-danger';
      case 'CheckedOut': return 'text-warning';
      default: return 'text-secondary';
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="h3 mb-0 text-gradient">📊 Booking Analytics</h1>
              <p className="text-muted">Comprehensive booking statistics and insights</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/booking-history" className="btn btn-outline-primary">
                <i className="fa fa-arrow-left"></i> Back to History
              </Link>
              <button 
                className="btn btn-primary" 
                onClick={fetchAnalytics}
                disabled={loading}
              >
                <i className="fa fa-refresh"></i> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 text-primary mb-2">
                    <i className="fa fa-database"></i>
                  </div>
                  <h3 className="mb-1">{analytics.total_archived}</h3>
                  <p className="text-muted mb-0">Total Bookings</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 text-success mb-2">
                    <i className="fa fa-check-circle"></i>
                  </div>
                  <h3 className="mb-1">
                    {analytics.by_reason.find(r => r.reason === 'CheckedOut')?.count || 0}
                  </h3>
                  <p className="text-muted mb-0">Completed Stays</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 text-danger mb-2">
                    <i className="fa fa-times-circle"></i>
                  </div>
                  <h3 className="mb-1">
                    {analytics.by_reason.find(r => r.reason === 'Cancelled')?.count || 0}
                  </h3>
                  <p className="text-muted mb-0">Cancelled Bookings</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 text-info mb-2">
                    <i className="fa fa-clock-o"></i>
                  </div>
                  <h3 className="mb-1">
                    {analytics.by_reason.find(r => r.reason === 'Confirmed')?.count || 0}
                  </h3>
                  <p className="text-muted mb-0">Active Bookings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Status */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">💰 Revenue by Status</h5>
                </div>
                <div className="card-body">
                  {analytics.by_reason.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <div className={`badge ${getStatusColor(item.reason).replace('text-', 'bg-')} me-3`}>
                          {item.count}
                        </div>
                        <div>
                          <h6 className={`mb-0 ${getStatusColor(item.reason)}`}>
                            {item.reason}
                          </h6>
                          <small className="text-muted">Bookings</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <h6 className="mb-0">{formatCurrency(item.total_value)}</h6>
                        <small className="text-muted">Total Value</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Trends by Date */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">📈 Booking Trends</h5>
                </div>
                <div className="card-body">
                  {analytics.by_date.slice(0, 10).map((item, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="mb-0">{formatDate(item.date)}</h6>
                        <small className="text-muted">{item.count} bookings</small>
                      </div>
                      <div className="text-end">
                        <h6 className="mb-0">{formatCurrency(item.total_value)}</h6>
                        <div className="progress" style={{ width: '100px', height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ 
                              width: `${(item.count / Math.max(...analytics.by_date.map(d => d.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">🕒 Recent Activity</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Action</th>
                          <th>Count</th>
                          <th>Activity Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recent_activity.map((activity, index) => (
                          <tr key={index}>
                            <td>{formatDate(activity.date)}</td>
                            <td>
                              <span className={`badge ${getStatusColor(activity.action).replace('text-', 'bg-')}`}>
                                {activity.action}
                              </span>
                            </td>
                            <td>
                              <strong>{activity.count}</strong>
                            </td>
                            <td>
                              <div className="progress" style={{ height: '6px', width: '100px' }}>
                                <div 
                                  className="progress-bar bg-info" 
                                  style={{ 
                                    width: `${(activity.count / Math.max(...analytics.recent_activity.map(a => a.count))) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights & Recommendations */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <i className="fa fa-lightbulb-o"></i> Business Insights
                </h6>
                <ul className="mb-0">
                  <li>
                    <strong>Cancellation Rate:</strong>{' '}
                    {analytics.total_archived > 0 
                      ? ((analytics.by_reason.find(r => r.reason === 'Cancelled')?.count || 0) / analytics.total_archived * 100).toFixed(1)
                      : 0}% 
                    of total bookings
                  </li>
                  <li>
                    <strong>Average Revenue per Booking:</strong>{' '}
                    {formatCurrency(
                      analytics.by_reason.reduce((sum, item) => sum + item.total_value, 0) / analytics.total_archived
                    )}
                  </li>
                  <li>
                    <strong>Most Active Day:</strong>{' '}
                    {analytics.by_date.length > 0 
                      ? formatDate(analytics.by_date.reduce((max, item) => item.count > max.count ? item : max).date)
                      : 'N/A'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingAnalytics;