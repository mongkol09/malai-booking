import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import bookingService from '../../../../../services/bookingService';

const BookingDetailViewModal = ({ show, onHide, bookingId, bookingReferenceId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (show && (bookingId || bookingReferenceId)) {
      loadBookingDetails();
    }
  }, [show, bookingId, bookingReferenceId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use admin/all endpoint to get booking data since individual booking endpoint is not fully implemented
      const bookingsData = await bookingService.getAllBookings();
      
      if (bookingsData && bookingsData.success) {
        const allBookings = bookingsData.data?.bookings || bookingsData.data || [];
        
        // Find the specific booking by ID or reference ID
        const foundBooking = allBookings.find(booking => 
          booking.id === bookingId || 
          booking.bookingReferenceId === bookingReferenceId ||
          booking.id === bookingReferenceId
        );

        if (foundBooking) {
          // Transform the booking data to match our component structure
          const transformedBooking = {
            id: foundBooking.id,
            bookingReferenceId: foundBooking.bookingReferenceId,
            status: foundBooking.status,
            
            // Guest information  
            guest: {
              firstName: foundBooking.customerName?.split(' ')[0] || '',
              lastName: foundBooking.customerName?.split(' ').slice(1).join(' ') || '',
              name: foundBooking.customerName,
              email: foundBooking.customerEmail,
              phone: foundBooking.customerPhone,
              country: 'ไทย' // Default since not in current data structure
            },
            
            // Booking dates
            checkInDate: foundBooking.checkInDate,
            checkOutDate: foundBooking.checkOutDate,
            checkinDate: foundBooking.checkInDate, // Alternative naming
            checkoutDate: foundBooking.checkOutDate, // Alternative naming
            
            // Guest count (calculate from data or use defaults)
            adults: 2, // Default since not in current data structure
            children: 0, // Default since not in current data structure
            guestCount: {
              adults: 2,
              children: 0
            },
            
            // Calculate nights
            nights: foundBooking.checkInDate && foundBooking.checkOutDate ? 
              Math.ceil((new Date(foundBooking.checkOutDate) - new Date(foundBooking.checkInDate)) / (1000 * 60 * 60 * 24)) : 1,
            
            // Room information
            room: {
              type: foundBooking.roomType,
              number: foundBooking.roomId,
              roomNumber: foundBooking.roomId
            },
            roomType: foundBooking.roomType,
            roomNumber: foundBooking.roomId,
            
            // Special requests
            specialRequests: foundBooking.specialRequests,
            
            // Payment information
            totalAmount: foundBooking.totalAmount,
            total: foundBooking.totalAmount,
            paidAmount: foundBooking.paidAmount,
            paymentStatus: foundBooking.paidAmount >= foundBooking.totalAmount ? 'ชำระแล้ว' : 'รอการชำระเงิน',
            paymentMethod: 'ไม่ระบุ', // Not available in current data structure
            
            // Additional info
            source: foundBooking.source,
            createdAt: foundBooking.createdAt,
            updatedAt: foundBooking.updatedAt,
            
            // Booking actions (determine based on status and dates)
            canCheckIn: foundBooking.status === 'confirmed' && new Date(foundBooking.checkInDate) <= new Date(),
            canCheckOut: foundBooking.status === 'confirmed' || foundBooking.status === 'inhouse'
          };
          
          setBooking(transformedBooking);
          console.log('✅ Booking data transformed successfully:', transformedBooking);
        } else {
          setError('ไม่พบข้อมูลการจอง');
        }
      } else {
        setError('ไม่สามารถโหลดข้อมูลการจองได้');
      }
    } catch (err) {
      console.error('❌ Error loading booking details:', err);
      setError(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'inhouse': case 'in-house': return 'primary';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return `฿${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',  
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} size="xl" centered>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">กำลังโหลดข้อมูลการจอง...</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable className="booking-detail-modal">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="bi bi-receipt me-2"></i>
          รายละเอียดการจอง
          {booking?.bookingReferenceId && (
            <small className="text-muted ms-2">#{booking.bookingReferenceId}</small>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {error ? (
          <Alert variant="danger" className="m-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        ) : booking ? (
          <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            {/* Header Section */}
            <div className="row mb-4">
              <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div>
                    <h3 className="fw-bold mb-0">รายละเอียดการจอง</h3>
                    <p className="text-muted mb-0">หมายเลขการจอง: {booking.bookingReferenceId || booking.id}</p>
                  </div>
                  <div className="d-flex gap-2">
                    <Badge 
                      bg={getStatusBadgeVariant(booking.status)} 
                      className="fs-6 px-3 py-2"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div className="row g-3">
              <div className="col-sm-12">
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="card-title">รายละเอียดการจอง</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6 col-lg-4 col-xl-4">
                        <div className="form-group">
                          <label className="form-label text-muted">วันเช็คอิน</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-calendar-plus"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={formatDate(booking.checkInDate || booking.checkinDate)}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4 col-xl-4">
                        <div className="form-group">
                          <label className="form-label text-muted">วันเช็คเอาท์</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-calendar-minus"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={formatDate(booking.checkOutDate || booking.checkoutDate)}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4 col-xl-4">
                        <div className="form-group">
                          <label className="form-label text-muted">จำนวนคืน</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-moon"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={`${booking.nights || 'ไม่ระบุ'} คืน`}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4 col-xl-4">
                        <div className="form-group">
                          <label className="form-label text-muted">ผู้ใหญ่</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-person"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={`${booking.adults || booking.guestCount?.adults || 1} คน`}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4 col-xl-4">
                        <div className="form-group">
                          <label className="form-label text-muted">เด็ก</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-person"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={`${booking.children || booking.guestCount?.children || 0} คน`}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4 col-xl-4">
                        <div className="form-group">
                          <label className="form-label text-muted">หมายเลขการจอง</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-bookmark-heart"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={booking.bookingReferenceId || booking.reference || 'ไม่ระบุ'}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="card-title">รายละเอียดห้องพัก</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label text-muted">ประเภทห้อง</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-house"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={booking.room?.type || booking.roomType || 'ไม่ระบุ'}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label text-muted">หมายเลขห้อง</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-door-open"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={booking.room?.number || booking.roomNumber || 'ยังไม่ได้จัดห้อง'}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      {booking.specialRequests && (
                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="form-label text-muted">ความต้องการพิเศษ</label>
                            <div className="input-group">
                              <span className="input-group-text"><i className="bi bi-chat-text"></i></span>
                              <textarea 
                                className="form-control" 
                                value={booking.specialRequests}
                                readOnly
                                rows="2"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="card-title">ข้อมูลผู้เข้าพัก</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label text-muted">ชื่อ</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-person-circle"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={booking.guest?.firstName || booking.guestFirstName || 'ไม่ระบุ'}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label text-muted">นามสกุล</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-person-circle"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={booking.guest?.lastName || booking.guestLastName || 'ไม่ระบุ'}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label text-muted">อีเมล</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={booking.guest?.email || booking.guestEmail || 'ไม่ระบุ'}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label text-muted">เบอร์โทรศัพท์</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-phone"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={booking.guest?.phone || booking.guestPhone || 'ไม่ระบุ'}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      {booking.guest?.country && (
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label text-muted">ประเทศ</label>
                            <div className="input-group">
                              <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={booking.guest.country}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="card-title">รายละเอียดการชำระเงิน</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label text-muted">ราคารวม</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-currency-dollar"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={formatCurrency(booking.totalAmount || booking.total)}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label text-muted">สถานะการชำระเงิน</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={booking.paymentStatus || 'รอการชำระเงิน'}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                      {booking.paymentMethod && (
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label text-muted">วิธีการชำระเงิน</label>
                            <div className="input-group">
                              <span className="input-group-text"><i className="bi bi-wallet"></i></span>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={booking.paymentMethod}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title">สรุปการจอง</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th scope="row" className="bg-light">หมายเลขการจอง</th>
                            <td>{booking.bookingReferenceId || booking.reference || 'ไม่ระบุ'}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-light">ผู้เข้าพัก</th>
                            <td>{booking.guest?.name || `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.trim() || 'ไม่ระบุ'}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-light">ประเภทห้อง</th>
                            <td>{booking.room?.type || booking.roomType || 'ไม่ระบุ'}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-light">หมายเลขห้อง</th>
                            <td>{booking.room?.number || booking.roomNumber || 'ยังไม่ได้จัดห้อง'}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-light">วันที่เข้าพัก</th>
                            <td>{formatDate(booking.checkInDate || booking.checkinDate)}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-light">วันที่ออก</th>
                            <td>{formatDate(booking.checkOutDate || booking.checkoutDate)}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-light">ราคารวม</th>
                            <td><span className="badge bg-primary fs-6">{formatCurrency(booking.totalAmount || booking.total)}</span></td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-light">สถานะ</th>
                            <td>
                              <Badge bg={getStatusBadgeVariant(booking.status)}>
                                {booking.status}
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Alert variant="info" className="m-3">
            ไม่พบข้อมูลการจอง
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <div className="d-flex justify-content-between w-100">
          <div>
            {booking && (
              <>
                {booking.canCheckIn && (
                  <Button variant="success" className="me-2" disabled={loading}>
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    เช็คอิน
                  </Button>
                )}
                {booking.canCheckOut && (
                  <Button variant="warning" className="me-2" disabled={loading}>
                    <i className="bi bi-box-arrow-right me-1"></i>
                    เช็คเอาท์
                  </Button>
                )}
              </>
            )}
          </div>
          <div>
            <Button variant="outline-primary" onClick={handlePrint} className="me-2">
              <i className="bi bi-printer me-1"></i>
              พิมพ์
            </Button>
            <Button variant="secondary" onClick={onHide}>
              ปิด
            </Button>
          </div>
        </div>
      </Modal.Footer>

      {/* Print styles - moved to CSS file or use regular style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .modal-header,
            .modal-footer {
              display: none !important;
            }
            .modal-body {
              padding: 0 !important;
            }
            .btn {
              display: none !important;
            }
          }
        `
      }} />
    </Modal>
  );
};

export default BookingDetailViewModal;
