// ============================================
// NOTIFICATION INTEGRATION SERVICE
// ============================================

import { getNotificationService } from './notificationService';

const notificationService = getNotificationService();

// ============================================
// BOOKING EVENT INTEGRATIONS
// ============================================

export const notifyBookingCreated = async (bookingData: any) => {
  await notificationService.notifyAll('NewBookingCreated', {
    bookingId: bookingData.id,
    roomNumber: bookingData.room?.roomNumber || 'N/A',
    roomTypeName: bookingData.room?.roomType?.name || 'N/A',
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    checkinDate: bookingData.checkinDate,
    checkoutDate: bookingData.checkoutDate,
    totalPrice: bookingData.totalPrice,
    newStatus: bookingData.status
  });
};

export const notifyBookingStatusChanged = async (bookingData: any, oldStatus: string) => {
  await notificationService.notifyAll('BookingStatusChanged', {
    bookingId: bookingData.id,
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    roomNumber: bookingData.room?.roomNumber || 'N/A',
    oldStatus,
    newStatus: bookingData.status,
    changedAt: new Date().toISOString()
  });
};

export const notifyBookingCancelled = async (bookingData: any, reason: string) => {
  await notificationService.notifyAll('BookingCancelled', {
    bookingId: bookingData.id,
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    roomNumber: bookingData.room?.roomNumber || 'N/A',
    checkinDate: bookingData.checkinDate,
    checkoutDate: bookingData.checkoutDate,
    totalPrice: bookingData.totalPrice,
    reason,
    cancelledAt: new Date().toISOString()
  });
};

// ============================================
// PAYMENT EVENT INTEGRATIONS
// ============================================

export const notifyPaymentSuccessful = async (paymentData: any, bookingData: any) => {
  await notificationService.notifyAll('PaymentSuccessful', {
    paymentId: paymentData.id,
    bookingId: bookingData.id,
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    roomNumber: bookingData.room?.roomNumber || 'N/A',
    transactionTime: paymentData.createdAt
  });
};

export const notifyPaymentFailed = async (paymentData: any, bookingData: any, error: string) => {
  await notificationService.notifyAll('PaymentFailed', {
    paymentId: paymentData.id,
    bookingId: bookingData.id,
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    roomNumber: bookingData.room?.roomNumber || 'N/A',
    error,
    failedAt: new Date().toISOString()
  });
};

// ============================================
// CHECK-IN/OUT EVENT INTEGRATIONS
// ============================================

export const notifyGuestCheckIn = async (bookingData: any, checkInTime: Date) => {
  await notificationService.notifyAll('GuestCheckIn', {
    bookingId: bookingData.id,
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    roomNumber: bookingData.room?.roomNumber || 'N/A',
    checkInTime: checkInTime.toISOString(),
    expectedCheckin: bookingData.checkinDate,
    totalStay: Math.ceil((new Date(bookingData.checkoutDate).getTime() - new Date(bookingData.checkinDate).getTime()) / (1000 * 60 * 60 * 24))
  });
};

export const notifyGuestCheckOut = async (bookingData: any, checkOutTime: Date, additionalCharges?: number) => {
  await notificationService.notifyAll('GuestCheckOut', {
    bookingId: bookingData.id,
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    roomNumber: bookingData.room?.roomNumber || 'N/A',
    checkOutTime: checkOutTime.toISOString(),
    expectedCheckout: bookingData.checkoutDate,
    totalPrice: bookingData.totalPrice,
    additionalCharges: additionalCharges || 0,
    finalAmount: (bookingData.totalPrice || 0) + (additionalCharges || 0)
  });
};

export const notifyLateCheckout = async (bookingData: any, currentTime: Date) => {
  await notificationService.notifyAll('LateCheckout', {
    bookingId: bookingData.id,
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    roomNumber: bookingData.room?.roomNumber || 'N/A',
    expectedCheckout: bookingData.checkoutDate,
    currentTime: currentTime.toISOString(),
    hoursLate: Math.ceil((currentTime.getTime() - new Date(bookingData.checkoutDate).getTime()) / (1000 * 60 * 60))
  });
};

// ============================================
// ROOM STATUS EVENT INTEGRATIONS
// ============================================

export const notifyRoomStatusChange = async (roomData: any, oldStatus: string, newStatus: string, notes?: string) => {
  await notificationService.notifyAll('RoomStatusChange', {
    roomId: roomData.id,
    roomNumber: roomData.roomNumber,
    roomType: roomData.roomType?.name || 'N/A',
    oldStatus,
    newStatus,
    notes: notes || '',
    changedAt: new Date().toISOString()
  });
};

export const notifyMaintenanceRequired = async (roomData: any, issue: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => {
  await notificationService.notifyAll('MaintenanceRequired', {
    roomId: roomData.id,
    roomNumber: roomData.roomNumber,
    roomType: roomData.roomType?.name || 'N/A',
    issue,
    priority,
    reportedAt: new Date().toISOString()
  });
};

// ============================================
// SYSTEM EVENT INTEGRATIONS
// ============================================

export const notifySystemAlert = async (alertType: string, message: string, severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL', metadata?: any) => {
  await notificationService.notifyAll('SystemAlert', {
    alertType,
    message,
    severity,
    metadata: metadata || {},
    timestamp: new Date().toISOString()
  });
};

export const notifyHighOccupancyAlert = async (occupancyRate: number, totalRooms: number, availableRooms: number) => {
  await notificationService.notifyAll('HighOccupancyAlert', {
    occupancyRate,
    totalRooms,
    availableRooms,
    occupiedRooms: totalRooms - availableRooms,
    alertedAt: new Date().toISOString()
  });
};

// ============================================
// FINANCIAL EVENT INTEGRATIONS
// ============================================

export const notifyRefundProcessed = async (refundData: any, bookingData: any) => {
  await notificationService.notifyAll('RefundProcessed', {
    refundId: refundData.id,
    bookingId: bookingData.id,
    amount: refundData.amount,
    reason: refundData.reason,
    guestName: `${bookingData.guest?.firstName} ${bookingData.guest?.lastName}`,
    processedAt: refundData.createdAt
  });
};

export const notifyDailyRevenueReport = async (revenueData: any, date: string) => {
  await notificationService.notifyAll('DailyRevenueReport', {
    date,
    totalRevenue: revenueData.totalRevenue,
    totalBookings: revenueData.totalBookings,
    averageRate: revenueData.averageRate,
    occupancyRate: revenueData.occupancyRate,
    reportGeneratedAt: new Date().toISOString()
  });
};

// ============================================
// EXPORT ALL NOTIFICATION FUNCTIONS
// ============================================

export const notificationIntegration = {
  // Booking events
  notifyBookingCreated,
  notifyBookingStatusChanged,
  notifyBookingCancelled,
  
  // Payment events
  notifyPaymentSuccessful,
  notifyPaymentFailed,
  
  // Check-in/out events
  notifyGuestCheckIn,
  notifyGuestCheckOut,
  notifyLateCheckout,
  
  // Room events
  notifyRoomStatusChange,
  notifyMaintenanceRequired,
  
  // System events
  notifySystemAlert,
  notifyHighOccupancyAlert,
  
  // Financial events
  notifyRefundProcessed,
  notifyDailyRevenueReport
};
