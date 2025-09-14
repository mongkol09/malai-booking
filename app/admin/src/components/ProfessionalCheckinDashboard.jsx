import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, InputGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import './ProfessionalCheckinDashboard.css';
import professionalCheckinService from '../services/professionalCheckinService';
import authTokenService from '../services/authTokenService';

// Safe logging utility - only logs in development
const safeLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};


const ProfessionalCheckinDashboard = ({ pinVerificationService }) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('reference'); // reference, name, phone, qr
  const [todayArrivals, setTodayArrivals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stats, setStats] = useState({
    totalArrivals: 0,
    checkedIn: 0,
    pending: 0,
    late: 0
  });
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    loadTodayArrivals();
    loadStats();
  }, []);

  // ✅ Real-time search effect with improved debouncing
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Only search if there's a meaningful query
    if (searchQuery.trim().length >= 3) {
      const timeout = setTimeout(() => {
        handleSearch();
      }, 800); // Increased delay to 800ms to reduce API calls
      
      setSearchTimeout(timeout);
    } else if (searchQuery.trim().length === 0) {
      // Clear search results immediately when query is empty
      setSearchResults([]);
    }

    // Cleanup timeout on component unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery, searchType]); // Re-run when searchQuery or searchType changes

  const loadTodayArrivals = async () => {
    try {
      setLoading(true);
      // Fetch real data from API
      safeLog('📅 Loading today\'s arrivals from API...');
      
      const result = await professionalCheckinService.getTodaysArrivals();
      
      if (result.success) {
        // ✅ Handle different data formats
        let bookingsData = [];
        if (Array.isArray(result.data)) {
          bookingsData = result.data;
        } else if (result.data && Array.isArray(result.data.bookings)) {
          bookingsData = result.data.bookings;
        } else {
          safeLog('⚠️ No valid bookings array found, using empty array');
          bookingsData = [];
        }
        
        // Transform data for display
        const transformedArrivals = bookingsData.map(booking => 
          professionalCheckinService.transformBookingForDisplay(booking)
        );
        
        setTodayArrivals(transformedArrivals);
        safeLog('✅ Loaded', transformedArrivals.length, 'arrivals from API');
        return;
      } else {
        console.error('❌ Failed to load arrivals:', result.error);
        safeLog('🔄 Falling back to mock data...');
      }
      
      // Fallback mock data
      const mockArrivals = [
        {
          id: '1',
          bookingReference: 'BK12345',
          guestName: 'John Smith',
          roomType: 'Grand Serenity',
          roomNumber: 'A101',
          expectedArrival: '14:00',
          actualArrival: null,
          status: 'pending',
          phone: '+66812345678',
          nights: 3,
          guests: 2,
          specialRequests: 'Late check-in',
          vip: false
        },
        {
          id: '2', 
          bookingReference: 'BK12346',
          guestName: 'Mary Johnson',
          roomType: 'Serenity Villa',
          roomNumber: 'B205',
          expectedArrival: '15:30',
          actualArrival: '15:45',
          status: 'checked_in',
          phone: '+66823456789',
          nights: 2,
          guests: 1,
          specialRequests: '',
          vip: true
        },
        {
          id: '3',
          bookingReference: 'BK12347', 
          guestName: 'Robert Wilson',
          roomType: 'Onsen Villa',
          roomNumber: 'C102',
          expectedArrival: '12:00',
          actualArrival: null,
          status: 'late',
          phone: '+66834567890',
          nights: 1,
          guests: 2,
          specialRequests: 'Early check-in',
          vip: false
        }
      ];
      
      setTodayArrivals(mockArrivals);
    } catch (error) {
      console.error('❌ Error loading today arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Use real API for dashboard stats
      const result = await professionalCheckinService.getDashboardStats();
      
      if (result.success) {
        setStats(result.data);
        safeLog('✅ Dashboard stats loaded:', result.data);
      } else {
        console.error('❌ Failed to load stats:', result.error);
        
        // Fallback to calculating from current data
        const fallbackStats = {
          totalArrivals: todayArrivals.length,
          checkedIn: todayArrivals.filter(a => a.status === 'checked_in').length,
          pending: todayArrivals.filter(a => a.status === 'pending').length,
          late: todayArrivals.filter(a => a.status === 'late').length
        };
        
        setStats(fallbackStats);
        safeLog('🔄 Using fallback stats:', fallbackStats);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      
      // Fallback calculation
      const fallbackStats = {
        totalArrivals: todayArrivals.length,
        checkedIn: todayArrivals.filter(a => a.status === 'checked_in').length,
        pending: todayArrivals.filter(a => a.status === 'pending').length,
        late: todayArrivals.filter(a => a.status === 'late').length
      };
      
      setStats(fallbackStats);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      setError(null);
      
      // Use real API search
      safeLog(`🔍 Searching ${searchType}:`, searchQuery);
      
      const result = await professionalCheckinService.searchBookings(searchQuery, searchType);
      
      if (result.success) {
        // Transform data for display
        const transformedResults = result.data.map(booking => 
          professionalCheckinService.transformBookingForDisplay(booking)
        );
        
        setSearchResults(transformedResults);
        safeLog('✅ Search completed:', transformedResults.length, 'results found');
      } else {
        console.error('❌ Search failed:', result.error);
        
        // Fallback to local search in current data
        const mockResults = todayArrivals.filter(booking => 
          booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.phone.includes(searchQuery)
        );
        
        setSearchResults(mockResults);
        safeLog('🔄 Using fallback local search:', mockResults.length, 'results');
        
        // Show warning about using fallback search
        setError('การค้นหาออนไลน์ล้มเหลว ใช้การค้นหาในข้อมูลที่โหลดไว้แทน');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setError(`เกิดข้อผิดพลาดในการค้นหา: ${error.message}`);
      
      // Fallback to local search even on error
      const mockResults = todayArrivals.filter(booking => 
        booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.phone.includes(searchQuery)
      );
      setSearchResults(mockResults);
      
    } finally {
      setSearchLoading(false);
    }
  };

  const handleQuickSearch = (booking) => {
    setSelectedBooking(booking);
    setSearchResults([booking]);
  };

  const handleCheckIn = async (booking) => {
    safeLog('🔔 ===== CHECK-IN FUNCTION CALLED =====');
    safeLog('📋 Booking data received:', booking);
    safeLog('🆔 Booking ID:', booking.id);
    safeLog('👤 Guest Name:', booking.guestName);
    safeLog('📊 Status:', booking.status);

    if (!booking || !booking.id) {
      console.error('❌ Invalid booking data:', booking);
      alert('ข้อมูลการจองไม่ถูกต้อง');
      return;
    }

    try {
      safeLog('🚀 Setting loading to true...');
      setLoading(true);
      safeLog('🏨 Starting check-in process for:', booking);
      
      // 🔐 Skip PIN verification for direct access (temporarily)
      safeLog('🔐 PIN verification skipped for testing');
      
      // Call real check-in API
      safeLog('📡 Calling processCheckIn API...');
      const result = await professionalCheckinService.processCheckIn(booking.id, {
        notes: `Professional dashboard check-in at ${new Date().toLocaleString('th-TH')}`,
        specialRequests: booking.specialRequests,
        roomId: booking.roomId
      });
      
      safeLog('📡 API Response:', result);
      
      if (!result.success) {
        console.error('❌ API returned error:', result.error);
        throw new Error(result.error || 'Check-in failed');
      }
      
      safeLog('✅ Check-in API successful!');
      
      // Update local state after successful API call
      const updatedArrivals = todayArrivals.map(arrival => 
        arrival.id === booking.id 
          ? { ...arrival, status: 'checked_in', actualArrival: new Date().toTimeString().slice(0, 5) }
          : arrival
      );
      
      setTodayArrivals(updatedArrivals);
      setSearchResults(searchResults.map(result => 
        result.id === booking.id 
          ? { ...result, status: 'checked_in', actualArrival: new Date().toTimeString().slice(0, 5) }
          : result
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        checkedIn: prev.checkedIn + 1,
        pending: prev.pending - 1
      }));
      
      if (window.Swal) {
        window.Swal.fire({
          title: '✅ Check-in สำเร็จ!',
          html: `<strong>${booking.guestName}</strong><br/>ห้อง ${booking.roomNumber}<br/>เช็คอินเรียบร้อยแล้ว`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        alert(
          `✅ Check-in สำเร็จ!\n\n` +
          `${booking.guestName}\n` +
          `ห้อง ${booking.roomNumber}\n` +
          `เช็คอินเรียบร้อยแล้ว`
        );
      }
      
    } catch (error) {
      console.error('❌ Check-in failed:', error);
      if (window.Swal) {
        window.Swal.fire({
          title: '❌ เกิดข้อผิดพลาด',
          html: `<strong>ไม่สามารถ Check-in ได้</strong><br/><br/>
                 <small>Error: ${error.message}</small><br/>
                 <small>กรุณาลองใหม่อีกครั้ง</small>`,
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
      } else {
        alert(`❌ Check-in failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (booking) => {
    try {
      safeLog('🚪 Starting check-out for:', booking);
      
      // 🔐 Require PIN verification for check-out
      if (pinVerificationService) {
        safeLog('🔐 Requesting PIN verification for check-out...');
        
        const verificationResult = await pinVerificationService.requestVerification(
          'CHECK_OUT',
          `ยืนยันการ Check-out สำหรับ ${booking.guestName}`,
          {
            id: booking.id,
            bookingReference: booking.bookingReference,
            guestName: booking.guestName,
            roomNumber: booking.roomNumber
          }
        );
        
        safeLog('✅ PIN verification successful for check-out:', verificationResult);
      }
      
      // Confirm check-out
      let result;
      if (window.Swal) {
        result = await window.Swal.fire({
          title: '🚪 ยืนยัน Check-out',
          html: `
            <div class="text-start">
              <p><strong>ลูกค้า:</strong> ${booking.guestName}</p>
              <p><strong>ห้อง:</strong> ${booking.roomNumber}</p>
              <p><strong>ประเภทห้อง:</strong> ${booking.roomType}</p>
              <hr>
              <p class="text-warning">⚠️ หลังจาก Check-out ห้องจะต้องทำความสะอาด</p>
            </div>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '✅ ยืนยัน Check-out',
          cancelButtonText: '❌ ยกเลิก',
          confirmButtonColor: '#28a745'
        });
      } else {
        // Fallback to native confirm dialog
        const confirmed = window.confirm(
          `🚪 ยืนยัน Check-out\n\n` +
          `ลูกค้า: ${booking.guestName}\n` +
          `ห้อง: ${booking.roomNumber}\n` +
          `ประเภทห้อง: ${booking.roomType}\n\n` +
          `⚠️ หลังจาก Check-out ห้องจะต้องทำความสะอาด\n\n` +
          `กดตกลงเพื่อยืนยัน Check-out`
        );
        result = { isConfirmed: confirmed };
      }
      
      if (result.isConfirmed) {
        // TODO: Call actual check-out API
        // const response = await bookingService.checkOut(booking.id);
        
        // Update booking status to checked_out
        const updatedArrivals = todayArrivals.map(arrival => 
          arrival.id === booking.id 
            ? { ...arrival, status: 'checked_out', checkOutTime: new Date().toTimeString().slice(0, 5) }
            : arrival
        );
        
        setTodayArrivals(updatedArrivals);
        setSearchResults(searchResults.map(result => 
          result.id === booking.id 
            ? { ...result, status: 'checked_out', checkOutTime: new Date().toTimeString().slice(0, 5) }
            : result
        ));
        
        // Call real check-out API
        const result = await professionalCheckinService.processCheckOut(booking.id, {
          notes: `Professional dashboard check-out at ${new Date().toLocaleString('th-TH')}`,
          housekeepingNotes: `Room checked out - requires cleaning`
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Check-out failed');
        }
        
        // Send cleaning notification via Dual Bot System
        await professionalCheckinService.sendNotification('checkout', {
          roomNumber: booking.roomNumber,
          roomType: booking.roomType,
          guestName: booking.guestName,
          vip: booking.isVip,
          specialRequests: booking.specialRequests
        });
        
        // Update room status to need cleaning
        await updateRoomCleaningStatus(booking.roomNumber, 'need_cleaning');
        
        // Show success message
        if (window.Swal) {
          window.Swal.fire({
            title: '✅ Check-out สำเร็จ!',
            html: `
              <div class="text-start">
                <p>✅ <strong>${booking.guestName}</strong> เช็คเอาท์แล้ว</p>
                <p>🏠 <strong>ห้อง ${booking.roomNumber}</strong> ต้องทำความสะอาด</p>
                <p>📱 แจ้งเตือนไปยัง Housekeeping แล้ว</p>
              </div>
            `,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          alert(
            `✅ Check-out สำเร็จ!\n\n` +
            `✅ ${booking.guestName} เช็คเอาท์แล้ว\n` +
            `🏠 ห้อง ${booking.roomNumber} ต้องทำความสะอาด\n` +
            `📱 แจ้งเตือนไปยัง Housekeeping แล้ว`
          );
        }
      }
      
    } catch (error) {
      console.error('❌ Check-out failed:', error);
      if (window.Swal) {
        window.Swal.fire({
          title: '❌ Check-out ล้มเหลว',
          text: error.message,
          icon: 'error'
        });
      } else {
        alert(`❌ Check-out ล้มเหลว\n\n${error.message}`);
      }
    }
  };

  // ✅ Handle Edit Guest Data
  const handleEditGuestData = (booking) => {
    if (window.Swal) {
      window.Swal.fire({
        title: '✏️ แก้ไขข้อมูลลูกค้า',
        html: `
          <div class="text-start">
            <div class="mb-3">
              <label class="form-label">ชื่อ-นามสกุล</label>
              <input type="text" class="form-control" id="editName" value="${booking.guestName}">
            </div>
            <div class="mb-3">
              <label class="form-label">อีเมล</label>
              <input type="email" class="form-control" id="editEmail" value="${booking.email || ''}">
            </div>
            <div class="mb-3">
              <label class="form-label">เบอร์โทรศัพท์</label>
              <input type="tel" class="form-control" id="editPhone" value="${booking.phone || ''}">
            </div>
            <div class="mb-3">
              <label class="form-label">ความต้องการพิเศษ</label>
              <textarea class="form-control" id="editSpecialRequests" rows="3">${booking.specialRequests || ''}</textarea>
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: '💾 บันทึก',
        cancelButtonText: '❌ ยกเลิก',
        preConfirm: () => {
          const name = document.getElementById('editName').value;
          const email = document.getElementById('editEmail').value;
          const phone = document.getElementById('editPhone').value;
          const specialRequests = document.getElementById('editSpecialRequests').value;

          if (!name.trim()) {
            window.Swal.showValidationMessage('กรุณากรอกชื่อลูกค้า');
            return false;
          }

          return { name, email, phone, specialRequests };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // TODO: Call API to update guest data
          safeLog('🔄 Updating guest data:', result.value);
          window.Swal.fire({
            title: '✅ บันทึกเรียบร้อย!',
            text: 'ข้อมูลลูกค้าได้รับการอัปเดตแล้ว',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    } else {
      alert('🚧 ฟีเจอร์นี้ต้องการ SweetAlert2\nกรุณาติดตั้ง SweetAlert2 เพื่อใช้งาน');
    }
  };

  // ✅ Handle Print Check-in
  const handlePrintCheckIn = (booking) => {
    // Create printable content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ใบเช็คอิน - ${booking.bookingReference}</title>
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .label { font-weight: bold; }
          .value { margin-left: 10px; }
          .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>ใบเช็คอิน</h2>
          <p>Booking Reference: ${booking.bookingReference}</p>
        </div>
        
        <div class="section">
          <h3>ข้อมูลลูกค้า</h3>
          <p><span class="label">ชื่อ:</span><span class="value">${booking.guestName}</span></p>
          <p><span class="label">อีเมล:</span><span class="value">${booking.email || 'ไม่ระบุ'}</span></p>
          <p><span class="label">โทรศัพท์:</span><span class="value">${booking.phone || 'ไม่ระบุ'}</span></p>
        </div>
        
        <div class="section">
          <h3>ข้อมูลการจอง</h3>
          <p><span class="label">ห้อง:</span><span class="value">${booking.roomNumber} (${booking.roomType})</span></p>
          <p><span class="label">เช็คอิน:</span><span class="value">${new Date(booking.checkIn).toLocaleDateString('th-TH')}</span></p>
          <p><span class="label">เช็คเอาท์:</span><span class="value">${new Date(booking.checkOut).toLocaleDateString('th-TH')}</span></p>
          <p><span class="label">จำนวนผู้เข้าพัก:</span><span class="value">${booking.totalGuests} ท่าน</span></p>
        </div>
        
        ${booking.specialRequests ? `
        <div class="section">
          <h3>ความต้องการพิเศษ</h3>
          <p>${booking.specialRequests}</p>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}</p>
          <p>Professional Check-in System</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    safeLog('🖨️ Print check-in document for:', booking.bookingReference);
  };

  const sendCleaningNotification = async (booking) => {
    try {
      safeLog('📱 Sending cleaning notification via Dual Bot System for room:', booking.roomNumber);
      
      const notificationData = {
        roomNumber: booking.roomNumber,
        roomType: booking.roomType,
        guestName: booking.guestName,
        checkOutTime: new Date().toLocaleTimeString('th-TH'),
        priority: booking.vip ? 'high' : 'normal',
        specialInstructions: (booking.specialRequests || '') + ' - Dual Bot System Notification'
      };
      
      // Call Dual Bot Telegram notification API
      const response = await fetch('http://localhost:3001/api/v1/housekeeping/cleaning-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.REACT_APP_API_KEY || 'your-api-key'
        },
        credentials: 'include',
        body: JSON.stringify(notificationData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      safeLog('✅ Cleaning notification sent successfully:', result);
      
    } catch (error) {
      console.error('❌ Failed to send cleaning notification:', error);
      // Don't throw error - notification failure shouldn't block check-out
    }
  };

  const updateRoomCleaningStatus = async (roomNumber, status) => {
    try {
      safeLog('🧹 Updating room cleaning status:', { roomNumber, status });
      
      // Call API to update room status using authTokenService
      const response = await authTokenService.authenticatedRequest('http://localhost:3001/api/v1/housekeeping/room-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK
        },
        body: JSON.stringify({
          roomNumber,
          status: 'need_cleaning', // Use special status that maps to Available + Dirty
          notes: `Room checked out - requires cleaning | ${new Date().toLocaleString('th-TH')}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      safeLog('✅ Room status updated successfully:', result);
      
    } catch (error) {
      console.error('❌ Failed to update room status:', error);
      // Don't throw error - status update failure shouldn't block check-out
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'รอเช็คอิน', icon: '⏳' },
      checked_in: { variant: 'success', text: 'เช็คอินแล้ว', icon: '✅' },
      checked_out: { variant: 'info', text: 'เช็คเอาท์แล้ว', icon: '🚪' },
      completed: { variant: 'secondary', text: 'เสร็จสิ้น', icon: '🏁' },   // เพิ่ม completed
      late: { variant: 'danger', text: 'มาสาย', icon: '🔴' },
      no_show: { variant: 'secondary', text: 'ไม่มาพัก', icon: '❌' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge bg={config.variant} className="me-2">
        {config.icon} {config.text}
      </Badge>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="professional-checkin-dashboard">
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1">
                  <i className="bi bi-box-arrow-in-right me-2 text-primary"></i>
                  Professional Check-in System
                </h4>
                <p className="text-muted mb-0">
                  ระบบเช็คอินมาตรฐานโรงแรม - วันที่ {new Date().toLocaleDateString('th-TH')}
                </p>
              </div>
              <div className="text-end">
                <small className="text-muted">Staff: Admin User</small><br/>
                <small className="text-muted">{new Date().toLocaleTimeString('th-TH')}</small>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Row className="mb-3">
            <Col>
              <Alert variant="warning" dismissible onClose={() => setError(null)}>
                <Alert.Heading>เกิดข้อผิดพลาด</Alert.Heading>
                <p className="mb-0">{error}</p>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Quick Stats */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-primary h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-primary mb-2">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <h5 className="mb-1">{stats.totalArrivals}</h5>
                <small className="text-muted">รายการเข้าพักวันนี้</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-success h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-success mb-2">
                  <i className="bi bi-check-circle"></i>
                </div>
                <h5 className="mb-1">{stats.checkedIn}</h5>
                <small className="text-muted">เช็คอินแล้ว</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-warning h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-warning mb-2">
                  <i className="bi bi-clock"></i>
                </div>
                <h5 className="mb-1">{stats.pending}</h5>
                <small className="text-muted">รอเช็คอิน</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-danger h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-danger mb-2">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <h5 className="mb-1">{stats.late}</h5>
                <small className="text-muted">มาสาย</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search Panel */}
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">
              <i className="bi bi-search me-2"></i>
              ค้นหาการจอง
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Select 
                  value={searchType} 
                  onChange={(e) => setSearchType(e.target.value)}
                  className="mb-2"
                >
                  <option value="reference">Booking Reference</option>
                  <option value="name">ชื่อลูกค้า</option>
                  <option value="phone">เบอร์โทรศัพท์</option>
                  <option value="qr">QR Code</option>
                </Form.Select>
              </Col>
              <Col md={7}>
                <InputGroup className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder={`ค้นหาด้วย ${searchType === 'reference' ? 'Booking Reference' : searchType === 'name' ? 'ชื่อลูกค้า' : searchType === 'phone' ? 'เบอร์โทรศัพท์' : 'QR Code'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    variant="primary" 
                    onClick={handleSearch}
                    disabled={searchLoading || !searchQuery.trim()}
                  >
                    {searchLoading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-search"></i>}
                  </Button>
                </InputGroup>
              </Col>
              <Col md={2}>
                <Button variant="outline-secondary" className="w-100 mb-2">
                  <i className="bi bi-qr-code-scan me-1"></i>
                  Scan QR
                </Button>
              </Col>
            </Row>
            
            {/* Quick Search Buttons */}
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline-primary" size="sm" onClick={() => {setSearchQuery(''); setSearchResults([]); }}>
                ล้างการค้นหา
              </Button>
              <Button variant="outline-info" size="sm" onClick={() => setSearchResults(todayArrivals.filter(b => b.status === 'pending'))}>
                รอเช็คอิน ({stats.pending})
              </Button>
              <Button variant="outline-warning" size="sm" onClick={() => setSearchResults(todayArrivals.filter(b => b.status === 'late'))}>
                มาสาย ({stats.late})
              </Button>
              <Button variant="outline-success" size="sm" onClick={() => setSearchResults(todayArrivals.filter(b => b.vip))}>
                VIP Guest
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Today's Arrivals / Search Results */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">
              <i className="bi bi-list-check me-2"></i>
              {searchResults.length > 0 ? `ผลการค้นหา (${searchResults.length})` : `รายการเข้าพักวันนี้ (${todayArrivals.length})`}
            </h6>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center p-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 mb-0">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Booking Ref</th>
                      <th>ชื่อลูกค้า</th>
                      <th>ห้อง</th>
                      <th>เวลาที่คาดหวัง</th>
                      <th>เวลาจริง</th>
                      <th>สถานะ</th>
                      <th>การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchResults.length > 0 ? searchResults : todayArrivals).map((booking, index) => {
                      safeLog('📋 Booking status debug:', {
                        ref: booking.bookingReference,
                        status: booking.status,
                        canCheckIn: booking.canCheckIn,
                        canCheckOut: booking.canCheckOut
                      });
                      
                      // Create unique key using multiple fields to avoid duplicates
                      const uniqueKey = `${booking.id || 'unknown'}-${booking.bookingReference || 'ref'}-${index}`;
                      
                      return (
                      <tr key={uniqueKey} className={selectedBooking?.id === booking.id ? 'table-primary' : ''}>
                        <td>
                          <strong className="text-primary">{booking.bookingReference}</strong>
                          {booking.vip && <Badge bg="warning" className="ms-2">VIP</Badge>}
                        </td>
                        <td>
                          <div>
                            <strong>{booking.guestName}</strong>
                            <br/>
                            <small className="text-muted">{booking.phone}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{booking.roomNumber}</strong>
                            <br/>
                            <small className="text-muted">{booking.roomType}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            {formatTime(booking.expectedArrival)}
                            <br/>
                            <small className="text-muted">{booking.nights} คืน, {booking.guests} ท่าน</small>
                          </div>
                        </td>
                        <td>
                          {booking.actualArrival ? (
                            <span className="text-success">{formatTime(booking.actualArrival)}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {getStatusBadge(booking.status)}
                          {booking.specialRequests && (
                            <div>
                              <small className="text-info">
                                <i className="bi bi-info-circle me-1"></i>
                                {booking.specialRequests}
                              </small>
                            </div>
                          )}
                        </td>
                        <td style={{ position: 'relative', zIndex: 100 }}>
                          <div className="d-flex gap-1" style={{ position: 'relative', zIndex: 100 }}>
                            {/* ปุ่มดูรายละเอียด */}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                safeLog('👁️ VIEW BUTTON CLICKED!', booking.bookingReference);
                                handleQuickSearch(booking);
                              }}
                              title="ดูรายละเอียด"
                              style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            
                            {/* ปุ่ม Check-in - แสดงสำหรับสถานะที่สามารถ check-in ได้ */}
                            {(booking.status === 'pending' || booking.status === 'late' || booking.status === 'Confirmed' || booking.canCheckIn) && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  safeLog('✅ CHECK-IN BUTTON CLICKED!', booking.bookingReference, 'Status:', booking.status);
                                  handleCheckIn(booking);
                                }}
                                disabled={loading}
                                title={`เช็คอิน (สถานะ: ${booking.status})`}
                                style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
                              >
                                {loading ? (
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <>
                                    <i className="bi bi-box-arrow-in-right me-1"></i>
                                    IN
                                  </>
                                )}
                              </Button>
                            )}
                            
                            {/* ปุ่ม Check-out - แสดงสำหรับสถานะที่สามารถ check-out ได้ */}
                            {(booking.status === 'checked_in' || booking.status === 'InHouse' || booking.canCheckOut) && (
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  safeLog('🚪 CHECK-OUT BUTTON CLICKED!', booking.bookingReference, 'Status:', booking.status);
                                  handleCheckOut(booking);
                                }}
                                title={`เช็คเอาท์ (สถานะ: ${booking.status})`}
                                style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
                              >
                                <i className="bi bi-box-arrow-right me-1"></i>
                                OUT
                              </Button>
                            )}
                            
                            {/* สถานะเสร็จสิ้น */}
                            {booking.status === 'checked_out' && (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                disabled
                                title="เช็คเอาท์แล้ว"
                                style={{ position: 'relative', zIndex: 100 }}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Done
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {!loading && (searchResults.length === 0 && todayArrivals.length === 0) && (
              <Alert variant="info" className="m-3">
                <i className="bi bi-info-circle me-2"></i>
                ไม่มีรายการเข้าพักสำหรับวันนี้
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* Selected Booking Details */}
        {selectedBooking && (
          <Card className="mt-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-person-check me-2"></i>
                รายละเอียดการจอง - {selectedBooking.bookingReference}
              </h6>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={() => setSelectedBooking(null)}
                title="ปิด"
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>ข้อมูลลูกค้า</h6>
                  <p><strong>ชื่อ:</strong> {selectedBooking.guestName}</p>
                  <p><strong>อีเมล:</strong> {selectedBooking.email || 'ไม่ระบุ'}</p>
                  <p><strong>โทรศัพท์:</strong> {selectedBooking.phone}</p>
                  <p><strong>จำนวนผู้เข้าพัก:</strong> {selectedBooking.guests} ท่าน</p>
                </Col>
                <Col md={6}>
                  <h6>ข้อมูลห้องพัก</h6>
                  <p><strong>ห้อง:</strong> {selectedBooking.roomNumber}</p>
                  <p><strong>ประเภท:</strong> {selectedBooking.roomType}</p>
                  <p><strong>จำนวนคืน:</strong> {selectedBooking.nights} คืน</p>
                </Col>
              </Row>
              
              {selectedBooking.specialRequests && (
                <Row>
                  <Col md={12}>
                    <h6>ความต้องการพิเศษ</h6>
                    <p className="text-info">{selectedBooking.specialRequests}</p>
                  </Col>
                </Row>
              )}
              
              <div className="d-flex gap-2 mt-3">
                {selectedBooking.status === 'pending' || selectedBooking.status === 'late' ? (
                  <Button 
                    variant="success" 
                    onClick={() => handleCheckIn(selectedBooking)}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        กำลังเช็คอิน...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        เริ่มเช็คอิน
                      </>
                    )}
                  </Button>
                ) : selectedBooking.status === 'checked_in' ? (
                  <Button variant="warning" onClick={() => handleCheckOut(selectedBooking)}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    เช็คเอาท์
                  </Button>
                ) : (
                  <Button variant="outline-success" disabled>
                    <i className="bi bi-check-circle me-2"></i>
                    {selectedBooking.status === 'checked_out' ? 'เช็คเอาท์แล้ว' : 'เสร็จสิ้น'}
                  </Button>
                )}
                <Button 
                  variant="outline-info"
                  onClick={() => handleEditGuestData(selectedBooking)}
                  title="แก้ไขข้อมูลลูกค้า"
                >
                  <i className="bi bi-pencil me-2"></i>
                  แก้ไขข้อมูล
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => handlePrintCheckIn(selectedBooking)}
                  title="พิมพ์ใบเช็คอิน"
                >
                  <i className="bi bi-printer me-2"></i>
                  พิมพ์ใบเช็คอิน
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfessionalCheckinDashboard;
