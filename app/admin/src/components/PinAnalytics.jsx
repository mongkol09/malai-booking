import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import './PinAnalytics.css';
import authTokenService from '../services/authTokenService';

/**
 * PIN Analytics Dashboard
 * แสดงสถิติและการวิเคราะห์การใช้งาน PIN
 */
const PinAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [realtimeData, setRealtimeData] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);

  // Colors for charts
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadRealtimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await authTokenService.authenticatedRequest(`/api/v1/admin/pin-analytics?timeRange=${timeRange}`, {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
        setSecurityAlerts(result.data.securityAlerts || []);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading PIN analytics:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ');
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const response = await authTokenService.authenticatedRequest('/api/v1/admin/pin-realtime', {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        setRealtimeData(prev => [...prev.slice(-20), result.data].filter(Boolean));
      }
    } catch (error) {
      console.error('Error loading realtime data:', error);
    }
  };

  const exportAnalytics = async () => {
    try {
      setLoading(true);

      const response = await authTokenService.authenticatedRequest(`/api/v1/admin/pin-analytics/export?timeRange=${timeRange}`, {
        method: 'GET'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pin_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to export analytics');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      setError('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = (range) => {
    const labels = {
      '1d': '24 ชั่วโมงที่ผ่านมา',
      '7d': '7 วันที่ผ่านมา',
      '30d': '30 วันที่ผ่านมา',
      '90d': '90 วันที่ผ่านมา'
    };
    return labels[range] || range;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const getAlertVariant = (level) => {
    const variants = {
      'low': 'info',
      'medium': 'warning',
      'high': 'danger',
      'critical': 'danger'
    };
    return variants[level] || 'secondary';
  };

  if (loading && !analytics) {
    return (
      <div className="pin-analytics-container">
        <div className="text-center py-5">
          <Spinner animation="border" size="lg" />
          <p className="mt-3">กำลังโหลดข้อมูลสถิติ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pin-analytics-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="bi bi-graph-up me-2"></i>
          PIN Analytics Dashboard
        </h4>
        <div className="d-flex gap-2">
          <Form.Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="1d">24 ชั่วโมง</option>
            <option value="7d">7 วัน</option>
            <option value="30d">30 วัน</option>
            <option value="90d">90 วัน</option>
          </Form.Select>
          <Button
            variant="outline-primary"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            รีเฟรช
          </Button>
          <Button
            variant="primary"
            onClick={exportAnalytics}
            disabled={loading}
          >
            <i className="bi bi-download me-1"></i>
            ส่งออก
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>
            <i className="bi bi-shield-exclamation me-2"></i>
            Security Alerts
          </Alert.Heading>
          {securityAlerts.map((alert, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
              <span>{alert.message}</span>
              <Badge bg={getAlertVariant(alert.level)}>{alert.level.toUpperCase()}</Badge>
            </div>
          ))}
        </Alert>
      )}

      {analytics && (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="summary-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Total PIN Usage</h6>
                      <h3 className="mb-0">{formatNumber(analytics.summary.totalUsage)}</h3>
                    </div>
                    <div className="summary-icon bg-primary">
                      <i className="bi bi-shield-check text-white"></i>
                    </div>
                  </div>
                  <small className="text-muted">
                    ช่วง{getTimeRangeLabel(timeRange)}
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="summary-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Success Rate</h6>
                      <h3 className="mb-0 text-success">{analytics.summary.successRate}%</h3>
                    </div>
                    <div className="summary-icon bg-success">
                      <i className="bi bi-check-circle text-white"></i>
                    </div>
                  </div>
                  <small className="text-muted">
                    {formatNumber(analytics.summary.successfulAttempts)} สำเร็จ
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="summary-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Failed Attempts</h6>
                      <h3 className="mb-0 text-danger">{formatNumber(analytics.summary.failedAttempts)}</h3>
                    </div>
                    <div className="summary-icon bg-danger">
                      <i className="bi bi-x-circle text-white"></i>
                    </div>
                  </div>
                  <small className="text-muted">
                    {analytics.summary.failureRate}% อัตราความผิดพลาด
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="summary-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Active Users</h6>
                      <h3 className="mb-0">{formatNumber(analytics.summary.activeUsers)}</h3>
                    </div>
                    <div className="summary-icon bg-info">
                      <i className="bi bi-people text-white"></i>
                    </div>
                  </div>
                  <small className="text-muted">
                    ใช้งาน PIN ล่าสุด
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row className="mb-4">
            {/* Usage Trend Chart */}
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    PIN Usage Trend
                  </h6>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.usageTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="successful" stroke="#48bb78" strokeWidth={2} name="สำเร็จ" />
                      <Line type="monotone" dataKey="failed" stroke="#f56565" strokeWidth={2} name="ล้มเหลว" />
                      <Line type="monotone" dataKey="locked" stroke="#ed8936" strokeWidth={2} name="ถูกล็อค" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            {/* User Type Distribution */}
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-pie-chart me-2"></i>
                    Usage by User Type
                  </h6>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.userTypeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.userTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Hour Distribution Chart */}
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-clock me-2"></i>
                    PIN Usage by Hour of Day
                  </h6>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.hourlyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity Table */}
          <Row>
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-activity me-2"></i>
                    Recent PIN Activity
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover size="sm">
                    <thead>
                      <tr>
                        <th>เวลา</th>
                        <th>ผู้ใช้</th>
                        <th>การกระทำ</th>
                        <th>สถานะ</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentActivity.map((activity) => (
                        <tr key={activity.id}>
                          <td>
                            <small>{new Date(activity.timestamp).toLocaleString('th-TH')}</small>
                          </td>
                          <td>{activity.userEmail}</td>
                          <td>{activity.action}</td>
                          <td>
                            <Badge bg={activity.success ? 'success' : 'danger'}>
                              {activity.success ? 'สำเร็จ' : 'ล้มเหลว'}
                            </Badge>
                          </td>
                          <td>
                            <small>{activity.ipAddress}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            {/* Real-time Monitor */}
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-broadcast me-2"></i>
                    Real-time Monitor
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="realtime-data">
                    {realtimeData.slice(-5).map((data, index) => (
                      <div key={index} className="realtime-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <small>{new Date(data.timestamp).toLocaleTimeString('th-TH')}</small>
                          <Badge bg={data.success ? 'success' : 'danger'}>
                            {data.action}
                          </Badge>
                        </div>
                        <small className="text-muted">{data.userEmail}</small>
                      </div>
                    ))}
                    
                    {realtimeData.length === 0 && (
                      <div className="text-center text-muted py-3">
                        <i className="bi bi-activity"></i>
                        <p className="mb-0 mt-2">ไม่มีกิจกรรมล่าสุด</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default PinAnalytics;
