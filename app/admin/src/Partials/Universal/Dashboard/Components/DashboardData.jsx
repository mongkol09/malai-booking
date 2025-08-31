import React from 'react';
import apiService from '../../../../services/apiService.js';

// Original static data as fallback
export const CardData = [
    {
        title:'Today Booking',
        value:'1,587',
        text:'From previous period',
        per:'+11%',
        bg_color:'bg-primary'
    },
    {
        title:'Total Amount',
        value:'$2,258',
        text:'New income',
        per:'+05%',
        bg_color:'bg-info'
    },
    {
        title:'Total Customer',
        value:'2.3k',
        text:'From previous period',
        per:'+11%',
        bg_color:'bg-warning'
    },
    {
        title:'Total Revenue',
        value:'11,5587',
        text:'From previous period',
        per:'+21%',
        bg_color:'bg-success'
    },
];

// Hook สำหรับดึงข้อมูลจาก backend
export const useDashboardKPIs = () => {
    const [data, setData] = React.useState({
        loading: true,
        error: null,
        kpis: null,
        realtimeData: null,
        cardData: CardData // Use static data as default
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setData(prev => ({ ...prev, loading: true }));

                // Fetch data from backend
                const [kpis, realtimeData] = await Promise.all([
                    apiService.getDashboardKPIs(),
                    apiService.getRealtimeDashboard()
                ]);

                // Format data for cards
                const cardData = formatCardData(kpis, realtimeData);

                setData({
                    loading: false,
                    error: null,
                    kpis,
                    realtimeData,
                    cardData
                });
            } catch (error) {
                console.error('Dashboard KPIs fetch error:', error);
                setData(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message,
                    cardData: CardData // Fallback to static data
                }));
            }
        };

        fetchData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return data;
};

// Function to format backend data to card format
const formatCardData = (kpis, realtimeData) => {
    if (!kpis || !realtimeData) {
        return CardData; // Fallback to static data
    }

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toLocaleString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return [
        {
            title: 'Today Booking',
            value: formatNumber(realtimeData.activeBookings || 0),
            text: 'Active bookings',
            per: '+' + (realtimeData.bookingGrowth || 11).toFixed(0) + '%',
            bg_color: 'bg-primary'
        },
        {
            title: 'Total Amount',
            value: formatCurrency(kpis.totalRevenue || 0),
            text: 'Total revenue',
            per: '+' + (kpis.revenueGrowth || 5).toFixed(1) + '%',
            bg_color: 'bg-info'
        },
        {
            title: 'Total Customer',
            value: formatNumber(kpis.totalCustomers || 0),
            text: 'Registered guests',
            per: '+' + (kpis.customerGrowth || 11).toFixed(0) + '%',
            bg_color: 'bg-warning'
        },
        {
            title: 'Occupancy Rate',
            value: (kpis.occupancyRate || 0).toFixed(1) + '%',
            text: 'Current occupancy',
            per: '+' + (kpis.occupancyGrowth || 21).toFixed(1) + '%',
            bg_color: 'bg-success'
        }
    ];
};