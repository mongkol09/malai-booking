import React from 'react'

import { bookingColumns, bookingTableData } from './BookingTableData';
import apiService from '../../../../services/apiService.js';

import DataTable from '../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../Common/DataTableFooter/DataTableFooter';

// Hook สำหรับดึงข้อมูล booking ล่าสุด
const useRecentBookings = () => {
    const [data, setData] = React.useState({
        loading: true,
        error: null,
        bookings: bookingTableData // Static data as fallback
    });

    React.useEffect(() => {
        const fetchRecentBookings = async () => {
            try {
                setData(prev => ({ ...prev, loading: true }));

                // ดึงข้อมูล realtime dashboard ที่มี recent bookings
                const realtimeData = await apiService.getRealtimeDashboard();
                
                if (realtimeData && realtimeData.recentBookings) {
                    // Format data สำหรับ table
                    const formattedBookings = realtimeData.recentBookings.map(booking => ({
                        name: booking.guest_name || 'N/A',
                        roomType: booking.room_type || 'Standard',
                        checkIn: new Date(booking.check_in_date).toLocaleDateString('en-GB'),
                        checkOut: new Date(booking.check_out_date).toLocaleDateString('en-GB'),
                        paidAmount: new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB'
                        }).format(booking.paid_amount || 0),
                        dueAmount: new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB'
                        }).format(booking.total_amount - (booking.paid_amount || 0)),
                        status: booking.status || 'Pending',
                        statusColor: getStatusColor(booking.status)
                    }));

                    setData({
                        loading: false,
                        error: null,
                        bookings: formattedBookings
                    });
                } else {
                    // ใช้ static data
                    setData(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('Failed to fetch recent bookings:', error);
                setData(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message
                }));
            }
        };

        fetchRecentBookings();

        // Auto-refresh every 2 minutes
        const interval = setInterval(fetchRecentBookings, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return data;
};

// Helper function สำหรับ status color
const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'confirmed':
        case 'paid':
            return 'text-bg-success';
        case 'pending':
            return 'text-bg-warning';
        case 'cancelled':
            return 'text-bg-danger';
        case 'checked_in':
            return 'text-bg-primary';
        case 'checked_out':
        case 'completed':              // เพิ่ม: รองรับ completed status
            return 'text-bg-secondary';
        default:
            return 'text-bg-warning';
    }
};

const BookingTable = () => {
    const { loading, error, bookings } = useRecentBookings();

    const dataT = bookings.map((data) => {
        return {
            name: data.name,
            roomType: data.roomType,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            paidAmount: data.paidAmount,
            dueAmount: data.dueAmount,
            paymentStatus: (<><span className={`badge ${data.statusColor}`}>{data.status}</span></>),
        };
    });

  return (
    <>
      {loading && (
        <div className="text-center p-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <small className="ms-2">Loading recent bookings...</small>
        </div>
      )}
      
      {error && (
        <div className="alert alert-warning" role="alert">
          <small>⚠️ Using cached booking data</small>
        </div>
      )}

      {!loading && (
        <>
          <DataTableHeader />
          <DataTable columns={bookingColumns} data={dataT} />
          <DataTableFooter dataT={dataT}/>
        </>
      )}
    </>
  )
}

export default BookingTable