import React from 'react';
import apiService from '../../../../services/apiService.js';

// Static chart configuration
export var ReservationsChart = {
    chart: {
        height: 280,
        type: 'line',
        toolbar: {
            show: false,
        },
    },
    colors: ['var(--theme-color4)', 'var(--theme-color5)'],
    series: [{
        name: 'Booking Confirmed',
        type: 'column',
        data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
    }, {
        name: 'Booking Pending',
        type: 'line',
        data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
    }],
    stroke: {
        width: [0, 4]
    },
    labels: ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
    xaxis: {
        type: 'datetime'
    },
    yaxis: [{
        title: {
            text: 'Booking Confirmed',
        },
    },{
        opposite: true,
        title: {
            text: 'Booking Pending'
        }
    }]
};

// Hook สำหรับดึงข้อมูล booking trends
export const useReservationsChart = () => {
    const [chartConfig, setChartConfig] = React.useState(ReservationsChart);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchBookingTrends = async () => {
            try {
                setLoading(true);
                
                // Fetch booking trends from backend
                const data = await apiService.getBookingTrends('daily');
                
                if (data && data.daily && data.daily.length > 0) {
                    // Format data for chart
                    const confirmedData = data.daily.map(item => item.confirmed || 0);
                    const pendingData = data.daily.map(item => item.pending || 0);
                    const labels = data.daily.map(item => {
                        const date = new Date(item.date);
                        return date.toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                        });
                    });

                    // Update chart configuration with real data
                    setChartConfig({
                        ...ReservationsChart,
                        series: [{
                            name: 'Booking Confirmed',
                            type: 'column',
                            data: confirmedData
                        }, {
                            name: 'Booking Pending',
                            type: 'line',
                            data: pendingData
                        }],
                        labels: labels
                    });
                }
            } catch (error) {
                console.error('Failed to fetch booking trends:', error);
                // Keep using static data as fallback
            } finally {
                setLoading(false);
            }
        };

        fetchBookingTrends();
        
        // Auto-refresh every 10 minutes
        const interval = setInterval(fetchBookingTrends, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { chartConfig, loading };
};