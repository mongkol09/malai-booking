import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HolidayPricingManagement = () => {
  const [pricingRules, setPricingRules] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [showHolidayModal, setShowHolidayModal] = useState(false);

  // API Base URL
  const API_BASE = 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchPricingRules();
    fetchHolidays();
  }, []);

  const fetchPricingRules = async () => {
    try {
      const response = await fetch(`${API_BASE}/pricing/rules`);
      const data = await response.json();
      if (data.success && data.data?.rules) {
        setPricingRules(data.data.rules);
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch(`${API_BASE}/holidays`);
      const data = await response.json();
      if (data.success && data.data?.holidays) {
        setHolidays(data.data.holidays);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      // Fallback to mock data if API fails
      const mockHolidays = [
        { date: '2025-08-12', name: 'วันเฉลิมพระชนมพรรษาฯ', type: 'royal' },
        { date: '2025-04-13', name: 'วันสงกรานต์ วันที่ 1', type: 'national' },
        { date: '2025-01-01', name: 'วันขึ้นปีใหม่', type: 'national' },
        { date: '2025-12-05', name: 'วันคล้ายวันพระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดช', type: 'royal' }
      ];
      setHolidays(mockHolidays);
    }
  };

  const handleEditRule = (rule) => {
    setEditingRule({
      ...rule,
      newValue: rule.action.value
    });
    setShowEditModal(true);
  };

  const handleSaveRule = async () => {
    try {
      const response = await fetch(`${API_BASE}/pricing/rules/${editingRule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, // Assuming token storage
          'x-api-key': 'dev-api-key-2024' // Development API key
        },
        body: JSON.stringify({
          ...editingRule,
          action: {
            ...editingRule.action,
            value: parseFloat(editingRule.newValue)
          }
        })
      });

      if (response.ok) {
        fetchPricingRules();
        setShowEditModal(false);
        setEditingRule(null);
        alert('✅ Pricing rule updated successfully!');
      } else {
        alert('❌ Failed to update pricing rule');
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      alert('❌ Error updating pricing rule');
    }
  };

  const testPricing = async (testDate, ruleName) => {
    try {
      // Use first available room type for testing
      const roomTypeId = '616ff855-212e-4b9f-8731-ac53c563496a'; // Grand Serenity
      
      const response = await fetch(`${API_BASE}/pricing/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomTypeId,
          checkInDate: testDate,
          checkOutDate: new Date(new Date(testDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          leadTimeDays: 7
        })
      });

      const data = await response.json();
      if (data.success) {
        const result = data.data;
        alert(`📊 Pricing Test for ${ruleName}:\n\n` +
              `Date: ${testDate}\n` +
              `Base Rate: ${result.baseRate} THB\n` +
              `Final Rate: ${result.finalRate} THB\n` +
              `Applied Rule: ${result.appliedRule?.name || 'Base pricing'}\n` +
              `Holiday: ${result.holidayInfo?.isHoliday ? 'Yes' : 'No'}\n` +
              `Festival: ${result.holidayInfo?.isFestival ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.error('Error testing pricing:', error);
      alert('❌ Error testing pricing');
    }
  };

  const bulkTestHolidayPricing = async () => {
    try {
      if (holidays.length === 0) {
        alert('⚠️ No holidays loaded for testing');
        return;
      }

      const testDates = holidays.slice(0, 5).map(h => h.date); // Test first 5 holidays
      
      const response = await fetch(`${API_BASE}/holidays/test-pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dates: testDates,
          roomTypeId: '616ff855-212e-4b9f-8731-ac53c563496a'
        })
      });

      const data = await response.json();
      if (data.success) {
        const results = data.data;
        let message = `🎉 Holiday Pricing Test Results:\n\n`;
        message += `Total Dates Tested: ${results.summary.totalDates}\n`;
        message += `Holiday Dates: ${results.summary.holidayDates}\n`;
        message += `Festival Dates: ${results.summary.festivalDates}\n`;
        message += `Long Weekend Dates: ${results.summary.longWeekendDates}\n\n`;
        
        message += `Detailed Results:\n`;
        results.testResults.forEach(result => {
          const holiday = holidays.find(h => h.date === result.date);
          message += `📅 ${result.date} (${holiday?.name || 'Unknown'})\n`;
          message += `   - Holiday: ${result.holidayInfo.isHoliday ? 'Yes' : 'No'}\n`;
          message += `   - Festival: ${result.holidayInfo.isFestival.isFestival ? 'Yes' : 'No'}\n`;
          message += `   - Intensity: ${result.holidayInfo.intensity}/3\n\n`;
        });
        
        alert(message);
      }
    } catch (error) {
      console.error('Error bulk testing:', error);
      alert('❌ Error testing holiday pricing');
    }
  };

  const getRuleTypeColor = (rule) => {
    if (rule.name.includes('Holiday')) return 'danger';
    if (rule.name.includes('Weekend')) return 'warning';
    if (rule.name.includes('Early Bird')) return 'success';
    if (rule.name.includes('Last Minute')) return 'info';
    return 'secondary';
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('increase')) return '📈';
    if (actionType.includes('decrease')) return '📉';
    return '💰';
  };

  if (loading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Holiday Pricing Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-sm-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div>
              <h3 className="fw-bold mb-0">🗓️ Holiday Pricing Management</h3>
              <p className="text-muted mb-0">จัดการราคาพิเศษสำหรับวันหยุดและเทศกาล</p>
            </div>
            <div>
              <button 
                className="btn btn-outline-primary me-2"
                onClick={() => setShowHolidayModal(true)}
              >
                📅 View Holidays
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar-lg mx-auto mb-3 bg-primary-soft rounded-circle d-flex align-items-center justify-content-center">
                <i className="fa fa-calendar text-primary" style={{fontSize: '24px'}}></i>
              </div>
              <h5 className="mb-1">{pricingRules.length}</h5>
              <p className="text-muted mb-0">Active Rules</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar-lg mx-auto mb-3 bg-danger-soft rounded-circle d-flex align-items-center justify-content-center">
                <i className="fa fa-star text-danger" style={{fontSize: '24px'}}></i>
              </div>
              <h5 className="mb-1">{pricingRules.filter(r => r.name.includes('Holiday')).length}</h5>
              <p className="text-muted mb-0">Holiday Rules</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar-lg mx-auto mb-3 bg-success-soft rounded-circle d-flex align-items-center justify-content-center">
                <i className="fa fa-percentage text-success" style={{fontSize: '24px'}}></i>
              </div>
              <h5 className="mb-1">{holidays.length}</h5>
              <p className="text-muted mb-0">Thai Holidays</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="avatar-lg mx-auto mb-3 bg-warning-soft rounded-circle d-flex align-items-center justify-content-center">
                <i className="fa fa-cog text-warning" style={{fontSize: '24px'}}></i>
              </div>
              <h5 className="mb-1">{pricingRules.filter(r => r.isActive).length}</h5>
              <p className="text-muted mb-0">Active Rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Rules Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">💰 Dynamic Pricing Rules</h5>
              <div>
                <button 
                  className="btn btn-success btn-sm me-2"
                  onClick={bulkTestHolidayPricing}
                  title="Test Holiday Pricing"
                >
                  🧪 Test Holiday Pricing
                </button>
                <span className="badge bg-primary">{pricingRules.length} Rules</span>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Rule Name</th>
                      <th>Priority</th>
                      <th>Action</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRules.map((rule) => (
                      <tr key={rule.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className={`badge bg-${getRuleTypeColor(rule)} me-2`}>
                              {rule.priority}
                            </span>
                            <div>
                              <div className="fw-bold">{rule.name}</div>
                              <small className="text-muted">{rule.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">{rule.priority}</span>
                        </td>
                        <td>
                          <span className="me-1">{getActionIcon(rule.action.type)}</span>
                          {rule.action.type.replace('_', ' ').replace('rate by', '')}
                        </td>
                        <td>
                          <span className={`fw-bold ${rule.action.type.includes('increase') ? 'text-danger' : 'text-success'}`}>
                            {rule.action.type.includes('increase') ? '+' : '-'}{rule.action.value}%
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${rule.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => handleEditRule(rule)}
                              title="Edit Rule"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-outline-info"
                              onClick={() => {
                                const testDate = prompt('Enter test date (YYYY-MM-DD):', '2025-08-12');
                                if (testDate) testPricing(testDate, rule.name);
                              }}
                              title="Test Rule"
                            >
                              🧪
                            </button>
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

      {/* Edit Rule Modal */}
      {showEditModal && editingRule && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">✏️ Edit Pricing Rule</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Rule Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editingRule.name}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control"
                    value={editingRule.description}
                    disabled
                    rows="2"
                  ></textarea>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Action Type</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editingRule.action.type}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Value (%) 
                      <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={editingRule.newValue}
                      onChange={(e) => setEditingRule({
                        ...editingRule,
                        newValue: e.target.value
                      })}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    💡 <strong>Example:</strong> Early Bird Discount จาก -15% เป็น -10%
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveRule}
                >
                  💾 Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holidays Modal */}
      {showHolidayModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📅 Thai Holidays 2025</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowHolidayModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Holiday Name</th>
                        <th>Type</th>
                        <th>Test</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holidays.map((holiday, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{new Date(holiday.date).toLocaleDateString('th-TH')}</strong>
                            <br />
                            <small className="text-muted">{holiday.date}</small>
                          </td>
                          <td>{holiday.name}</td>
                          <td>
                            <span className={`badge ${holiday.type === 'royal' ? 'bg-warning' : 'bg-info'}`}>
                              {holiday.type === 'royal' ? '👑 Royal' : '🇹🇭 National'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => testPricing(holiday.date, holiday.name)}
                            >
                              🧪 Test
                            </button>
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
      )}
    </div>
  );
};

export default HolidayPricingManagement;
