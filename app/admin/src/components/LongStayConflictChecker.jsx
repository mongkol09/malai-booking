import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const LongStayConflictChecker = ({ roomTypes = [] }) => {
  const [checkData, setCheckData] = useState({
    checkIn: '',
    checkOut: '',
    roomType: 'all',
    guests: 2
  });
  const [conflictResults, setConflictResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_admin_token');
  };

  // Show toast message
  const showToast = (message, type = 'info') => {
    if (window.Swal) {
      window.Swal.fire({
        title: type === 'error' ? 'เกิดข้อผิดพลาด' : type === 'success' ? 'สำเร็จ' : 'แจ้งเตือน',
        html: message.replace(/\n/g, '<br>'),
        icon: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
        confirmButtonText: 'ตกลง'
      });
    } else {
      alert(message);
    }
  };

  // Calculate days between dates
  const calculateDays = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  // Check long stay availability with conflict detection
  const handleLongStayCheck = async () => {
    if (!checkData.checkIn || !checkData.checkOut) {
      showToast('กรุณาเลือกวันที่เช็คอิน และเช็คเอาท์', 'error');
      return;
    }

    const days = calculateDays(checkData.checkIn, checkData.checkOut);
    if (days <= 0) {
      showToast('วันที่เช็คเอาท์ต้องหลังจากวันที่เช็คอิน', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      
      // First, get general availability
      const params = new URLSearchParams({
        checkinDate: new Date(checkData.checkIn + 'T14:00:00.000Z').toISOString(),
        checkoutDate: new Date(checkData.checkOut + 'T12:00:00.000Z').toISOString(),
        numberOfGuests: checkData.guests
      });

      if (checkData.roomType && checkData.roomType !== 'all') {
        params.append('roomTypeId', checkData.roomType);
      }

      const response = await fetch(`${API_BASE}/admin/availability/quick-search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': 'hotel-booking-api-key-2024',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      const data = await response.json();
      
      if (data.success) {
        // Now get detailed day-by-day analysis
        const detailedAnalysis = await getDetailedConflictAnalysis(checkData.checkIn, checkData.checkOut, checkData.roomType);
        
        const results = {
          general: data.data,
          detailed: detailedAnalysis,
          summary: {
            totalDays: days,
            checkIn: checkData.checkIn,
            checkOut: checkData.checkOut,
            roomType: checkData.roomType,
            guests: checkData.guests
          }
        };
        
        setConflictResults(results);
        
        // Show summary
        const availableRoomTypes = data.data.availableRoomTypes || [];
        if (availableRoomTypes.length > 0) {
          const roomInfo = availableRoomTypes.map(rt => 
            `✅ ${rt.name}: ${rt.availableRooms} ห้องว่าง (฿${rt.totalPrice.toLocaleString()})`
          ).join('\n');
          
          showToast(
            `🏨 Long Stay Analysis (${days} คืน)\n` +
            `📅 ${checkData.checkIn} ถึง ${checkData.checkOut}\n\n` +
            `${roomInfo}\n\n` +
            `📊 ดูรายละเอียดเพิ่มเติมด้านล่าง`, 
            'success'
          );
        } else {
          showToast(
            `❌ Long Stay Check (${days} คืน)\n` +
            `📅 ${checkData.checkIn} ถึง ${checkData.checkOut}\n\n` +
            `ไม่มีห้องว่างสำหรับช่วงเวลานี้\n\n` +
            `📊 ดูการวิเคราะห์ความขัดแย้งด้านล่าง`, 
            'error'
          );
        }
      }
    } catch (error) {
      console.error('❌ Error in long stay check:', error);
      showToast('ไม่สามารถตรวจสอบการพักยาวได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get detailed day-by-day conflict analysis
  const getDetailedConflictAnalysis = async (checkIn, checkOut, roomTypeId) => {
    try {
      const token = getAuthToken();
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const analysis = [];

      // Check each day in the range
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString();
        const params = new URLSearchParams({ date: dateStr });
        
        if (roomTypeId && roomTypeId !== 'all') {
          params.append('roomTypeId', roomTypeId);
        }

        const response = await fetch(`${API_BASE}/admin/availability/date-detail?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-API-Key': 'hotel-booking-api-key-2024',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            analysis.push({
              date: d.toISOString().split('T')[0],
              data: data.data
            });
          }
        }
      }

      return analysis;
    } catch (error) {
      console.error('Error in detailed analysis:', error);
      return [];
    }
  };

  // Analyze conflicts and bottlenecks
  const analyzeConflicts = () => {
    if (!conflictResults?.detailed) return null;

    const conflicts = [];
    const bottlenecks = [];
    const recommendations = [];

    conflictResults.detailed.forEach(day => {
      const dateStr = day.date;
      let dayConflicts = [];

      if (day.data.roomTypes) {
        // Multiple room types response
        day.data.roomTypes.forEach(rt => {
          const occupancyRate = rt.totalRooms > 0 ? ((rt.totalRooms - rt.availableRooms) / rt.totalRooms * 100) : 0;
          
          if (rt.availableRooms === 0) {
            conflicts.push({
              date: dateStr,
              roomType: rt.name,
              issue: 'เต็มหมด',
              severity: 'high'
            });
          } else if (occupancyRate >= 90) {
            bottlenecks.push({
              date: dateStr,
              roomType: rt.name,
              issue: `เหลือเพียง ${rt.availableRooms} ห้อง`,
              occupancy: occupancyRate,
              severity: 'medium'
            });
          }
        });
      } else {
        // Single room type response
        const occupancyRate = day.data.totalRooms > 0 ? 
          ((day.data.totalRooms - day.data.availableRooms) / day.data.totalRooms * 100) : 0;
        
        if (day.data.availableRooms === 0) {
          conflicts.push({
            date: dateStr,
            issue: 'เต็มหมด',
            severity: 'high'
          });
        } else if (occupancyRate >= 90) {
          bottlenecks.push({
            date: dateStr,
            issue: `เหลือเพียง ${day.data.availableRooms} ห้อง`,
            occupancy: occupancyRate,
            severity: 'medium'
          });
        }
      }
    });

    // Generate recommendations
    if (conflicts.length > 0) {
      recommendations.push('🔴 มีวันที่ห้องเต็มหมด - พิจารณาแนะนำวันที่อื่น');
    }
    if (bottlenecks.length > 0) {
      recommendations.push('🟡 มีหลายวันที่เหลือห้องน้อย - แนะนำให้จองเร็ว');
    }
    if (conflicts.length === 0 && bottlenecks.length === 0) {
      recommendations.push('🟢 ไม่มีความขัดแย้ง - สามารถจองได้');
    }

    return { conflicts, bottlenecks, recommendations };
  };

  const conflictAnalysis = analyzeConflicts();

  return (
    <div className="long-stay-checker">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-gradient-primary text-white">
          <h6 className="mb-0">
            <i className="fa fa-calendar-check me-2"></i>
            Long Stay Conflict Checker
          </h6>
          <small>ตรวจสอบความขัดแย้งสำหรับการพักยาว</small>
        </div>
        
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small">Check-in Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={checkData.checkIn}
                onChange={(e) => setCheckData({...checkData, checkIn: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label small">Check-out Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={checkData.checkOut}
                onChange={(e) => setCheckData({...checkData, checkOut: e.target.value})}
                min={checkData.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label small">Room Type</label>
              <select 
                className="form-select form-select-sm"
                value={checkData.roomType}
                onChange={(e) => setCheckData({...checkData, roomType: e.target.value})}
              >
                <option value="all">ทุกประเภทห้อง</option>
                {roomTypes.map(roomType => (
                  <option key={roomType.id} value={roomType.id}>
                    {roomType.name} (฿{roomType.baseRate})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label small">Number of Guests</label>
              <select 
                className="form-select form-select-sm"
                value={checkData.guests}
                onChange={(e) => setCheckData({...checkData, guests: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num} ท่าน</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-3 d-flex gap-2 align-items-center">
            <button
              className="btn btn-primary btn-sm flex-fill"
              onClick={handleLongStayCheck}
              disabled={loading || !checkData.checkIn || !checkData.checkOut}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fa fa-search me-2"></i>
                  Check Long Stay ({calculateDays(checkData.checkIn, checkData.checkOut)} days)
                </>
              )}
            </button>
            
            {conflictResults && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setConflictResults(null)}
              >
                <i className="fa fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {conflictResults && (
        <div className="mt-4">
          {/* Summary Card */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="fa fa-chart-line me-2"></i>
                Booking Summary
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <div className="h4 text-primary mb-0">{conflictResults.summary.totalDays}</div>
                  <small className="text-muted">คืน</small>
                </div>
                <div className="col-3">
                  <div className="h4 text-success mb-0">
                    {conflictResults.general.availableRoomTypes?.length || 0}
                  </div>
                  <small className="text-muted">ประเภทห้องที่มี</small>
                </div>
                <div className="col-3">
                  <div className="h4 text-warning mb-0">
                    {conflictAnalysis?.bottlenecks?.length || 0}
                  </div>
                  <small className="text-muted">วันที่มีปัญหา</small>
                </div>
                <div className="col-3">
                  <div className="h4 text-danger mb-0">
                    {conflictAnalysis?.conflicts?.length || 0}
                  </div>
                  <small className="text-muted">วันที่เต็ม</small>
                </div>
              </div>
            </div>
          </div>

          {/* Available Room Types */}
          {conflictResults.general.availableRoomTypes && conflictResults.general.availableRoomTypes.length > 0 && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="fa fa-check-circle me-2"></i>
                  Available Room Types
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {conflictResults.general.availableRoomTypes.map((roomType, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="border rounded p-3 bg-light">
                        <h6 className="text-success mb-1">{roomType.name}</h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted small">
                            {roomType.availableRooms} ห้องว่าง
                          </span>
                          <span className="fw-bold text-primary">
                            ฿{roomType.totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-muted small mt-1">
                          ฿{Math.round(roomType.totalPrice / conflictResults.summary.totalDays).toLocaleString()}/คืน (เฉลี่ย)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conflict Analysis */}
          {conflictAnalysis && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  Conflict Analysis
                </h6>
              </div>
              <div className="card-body">
                {/* Recommendations */}
                {conflictAnalysis.recommendations.length > 0 && (
                  <div className="alert alert-info">
                    <h6 className="alert-heading">คำแนะนำ:</h6>
                    <ul className="mb-0">
                      {conflictAnalysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* High Conflicts */}
                {conflictAnalysis.conflicts.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-danger">
                      <i className="fa fa-times-circle me-2"></i>
                      Critical Issues ({conflictAnalysis.conflicts.length})
                    </h6>
                    <div className="row">
                      {conflictAnalysis.conflicts.map((conflict, index) => (
                        <div key={index} className="col-md-4 mb-2">
                          <div className="border border-danger rounded p-2 bg-light">
                            <small className="fw-bold text-danger d-block">{conflict.date}</small>
                            <small className="text-muted">
                              {conflict.roomType && `${conflict.roomType}: `}{conflict.issue}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottlenecks */}
                {conflictAnalysis.bottlenecks.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-warning">
                      <i className="fa fa-exclamation-circle me-2"></i>
                      Potential Issues ({conflictAnalysis.bottlenecks.length})
                    </h6>
                    <div className="row">
                      {conflictAnalysis.bottlenecks.map((bottleneck, index) => (
                        <div key={index} className="col-md-4 mb-2">
                          <div className="border border-warning rounded p-2 bg-light">
                            <small className="fw-bold text-warning d-block">{bottleneck.date}</small>
                            <small className="text-muted">
                              {bottleneck.roomType && `${bottleneck.roomType}: `}{bottleneck.issue}
                            </small>
                            {bottleneck.occupancy && (
                              <small className="text-muted d-block">
                                Occupancy: {Math.round(bottleneck.occupancy)}%
                              </small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Issues */}
                {conflictAnalysis.conflicts.length === 0 && conflictAnalysis.bottlenecks.length === 0 && (
                  <div className="alert alert-success">
                    <h6 className="alert-heading">
                      <i className="fa fa-check-circle me-2"></i>
                      No Conflicts Detected
                    </h6>
                    <p className="mb-0">
                      ไม่พบความขัดแย้งในช่วงวันที่เลือก สามารถรับจองได้อย่างมั่นใจ
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LongStayConflictChecker;
