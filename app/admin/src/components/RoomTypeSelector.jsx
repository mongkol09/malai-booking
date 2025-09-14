import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


// Fallback toast function if react-toastify is not available
const toast = {
  error: (message) => alert(`❌ ${message}`),
  success: (message) => alert(`✅ ${message}`),
  warning: (message) => alert(`⚠️ ${message}`),
  info: (message) => alert(`ℹ️ ${message}`)
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const RoomTypeSelector = ({ 
  selectedRoomType, 
  onRoomTypeChange, 
  disabled = false,
  showQuickSearch = false,
  onQuickSearchToggle 
}) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({
    checkinDate: '',
    checkoutDate: '',
    numberOfGuests: 2
  });
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_admin_token');
  };

  // Fetch room types
  const fetchRoomTypes = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/availability/room-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room types');
      }

      const data = await response.json();
      if (data.success) {
        setRoomTypes(data.data);
        safeLog('🏨 Room types loaded for selector:', data.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching room types:', error);
      alert('ไม่สามารถโหลดข้อมูลประเภทห้องได้');
    } finally {
      setLoading(false);
    }
  };

  // Quick search for availability
  const handleQuickSearch = async () => {
    if (!searchData.checkinDate || !searchData.checkoutDate) {
      alert('กรุณาเลือกวันที่เช็คอิน-เช็คเอาท์');
      return;
    }

    setSearching(true);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        checkinDate: new Date(searchData.checkinDate).toISOString(),
        checkoutDate: new Date(searchData.checkoutDate).toISOString(),
        numberOfGuests: searchData.numberOfGuests.toString()
      });

      const response = await fetch(`${API_BASE}/admin/availability/quick-search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search availability');
      }

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
        safeLog('🔍 Quick search results:', data.data);
        
        alert(`พบห้องว่าง ${data.data.totalOptions} ตัวเลือก`);
      }
    } catch (error) {
      console.error('❌ Error in quick search:', error);
      alert('ไม่สามารถค้นหาห้องว่างได้');
    } finally {
      setSearching(false);
    }
  };

  // Handle date input changes
  const handleSearchDataChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  return (
    <div className="room-type-selector">
      {/* Main Room Type Filter */}
      <div className="mb-3">
        <label className="form-label mb-2">
          <i className="fa fa-filter me-1"></i>
          เลือกประเภทห้อง:
        </label>
        
        {loading ? (
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <span className="text-muted">กำลังโหลดข้อมูลห้อง...</span>
          </div>
        ) : (
          <select 
            className="form-select"
            value={selectedRoomType}
            onChange={(e) => onRoomTypeChange(e.target.value)}
            disabled={disabled}
          >
            <option value="all">🏨 ทุกประเภทห้อง (แสดงทั้งหมด)</option>
            {roomTypes.map(rt => {
              const occupancyRate = rt.totalRooms > 0 ? 
                Math.round(((rt.totalRooms - rt.availableRooms) / rt.totalRooms) * 100) : 0;
              
              let statusIcon = '🟢'; // Green - available
              if (occupancyRate > 80) statusIcon = '🔴'; // Red - almost full
              else if (occupancyRate > 60) statusIcon = '🟠'; // Orange - medium
              else if (occupancyRate > 40) statusIcon = '🟡'; // Yellow - low-medium
              
              return (
                <option key={rt.id} value={rt.id}>
                  {statusIcon} {rt.name} - {rt.availableRooms}/{rt.totalRooms} ห้องว่าง ({occupancyRate}%)
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Room Type Cards Display */}
      {!loading && roomTypes.length > 0 && (
        <div className="room-types-grid mb-3">
          <div className="row g-2">
            {roomTypes.slice(0, 4).map(rt => {
              const occupancyRate = rt.totalRooms > 0 ? 
                Math.round(((rt.totalRooms - rt.availableRooms) / rt.totalRooms) * 100) : 0;
              
              let cardClass = 'border-success'; // Green
              let statusText = 'ว่างมาก';
              let statusIcon = '🟢';
              
              if (occupancyRate > 80) {
                cardClass = 'border-danger';
                statusText = 'เต็มเกือบหมด';
                statusIcon = '🔴';
              } else if (occupancyRate > 60) {
                cardClass = 'border-warning';
                statusText = 'ว่างน้อย';
                statusIcon = '🟠';
              } else if (occupancyRate > 40) {
                cardClass = 'border-warning';
                statusText = 'ว่างปานกลาง';
                statusIcon = '🟡';
              }

              return (
                <div key={rt.id} className="col-6 col-md-3">
                  <div 
                    className={`card h-100 ${cardClass} ${selectedRoomType === rt.id ? 'bg-light' : ''}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => onRoomTypeChange(rt.id)}
                  >
                    <div className="card-body p-2 text-center">
                      <div className="fs-5 mb-1">{statusIcon}</div>
                      <h6 className="card-title mb-1 small">{rt.name}</h6>
                      <p className="card-text mb-1">
                        <strong>{rt.availableRooms}</strong>/{rt.totalRooms} ห้องว่าง
                      </p>
                      <small className="text-muted">{statusText}</small>
                      <div className="progress mt-1" style={{ height: '4px' }}>
                        <div 
                          className={`progress-bar ${
                            occupancyRate > 80 ? 'bg-danger' : 
                            occupancyRate > 60 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                      <small className="text-muted">{occupancyRate}% เต็ม</small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Search Section */}
      <div className="quick-search-section">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <label className="form-label mb-0">
            <i className="fa fa-search me-1"></i>
            ค้นหาห้องว่างด่วน:
          </label>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onQuickSearchToggle && onQuickSearchToggle(!showQuickSearch)}
          >
            {showQuickSearch ? 'ซ่อน' : 'แสดง'} ค้นหาด่วน
          </button>
        </div>

        {showQuickSearch && (
          <div className="quick-search-form bg-light p-3 rounded">
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label small">วันที่เช็คอิน:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={searchData.checkinDate}
                  onChange={(e) => handleSearchDataChange('checkinDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">วันที่เช็คเอาท์:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={searchData.checkoutDate}
                  onChange={(e) => handleSearchDataChange('checkoutDate', e.target.value)}
                  min={searchData.checkinDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">จำนวนผู้เข้าพัก:</label>
                <select
                  className="form-select form-select-sm"
                  value={searchData.numberOfGuests}
                  onChange={(e) => handleSearchDataChange('numberOfGuests', parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} คน</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-primary btn-sm w-100"
                  onClick={handleQuickSearch}
                  disabled={searching || !searchData.checkinDate || !searchData.checkoutDate}
                >
                  {searching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      กำลังค้นหา...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-search me-1"></i>
                      ค้นหาห้องว่าง
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="search-results mt-3">
                <h6 className="mb-2">
                  <i className="fa fa-check-circle text-success me-1"></i>
                  ผลการค้นหา: พบ {searchResults.totalOptions} ตัวเลือก
                </h6>
                <div className="row g-2">
                  {searchResults.availableOptions?.slice(0, 3).map((option, index) => (
                    <div key={index} className="col-md-4">
                      <div className="card border-success">
                        <div className="card-body p-2">
                          <h6 className="card-title mb-1">{option.roomTypeName}</h6>
                          <p className="card-text small mb-1">
                            💰 ราคา: ฿{Number(option.totalPrice).toLocaleString()}
                          </p>
                          <p className="card-text small mb-1">
                            🛏️ ห้องว่าง: {option.availableRooms} ห้อง
                          </p>
                          <small className="text-muted">
                            📅 {option.nights} คืน
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {searchResults.availableOptions?.length > 3 && (
                  <small className="text-muted">
                    และอีก {searchResults.availableOptions.length - 3} ตัวเลือก...
                  </small>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .room-type-selector .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .room-type-selector .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .room-types-grid .card.bg-light {
          box-shadow: 0 2px 8px rgba(0,123,255,0.3);
        }
        
        .quick-search-form {
          border: 1px solid #dee2e6;
        }
      `}</style>
    </div>
  );
};

export default RoomTypeSelector;
