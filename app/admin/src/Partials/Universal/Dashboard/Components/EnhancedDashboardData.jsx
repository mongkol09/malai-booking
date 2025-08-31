// Enhanced Dashboard Data Service
// ใช้แทน static data และเชื่อมต่อกับ backend API

import apiService from '../../services/apiService';

// Hook สำหรับ Dashboard KPIs
export const useDashboardData = () => {
  const [data, setData] = React.useState({
    loading: true,
    error: null,
    kpis: {},
    realtimeData: {}
  });

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true }));

        // Fetch KPIs and realtime data in parallel
        const [kpis, realtimeData] = await Promise.all([
          apiService.getDashboardKPIs(),
          apiService.getRealtimeDashboard()
        ]);

        setData({
          loading: false,
          error: null,
          kpis,
          realtimeData
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return data;
};

// Function to convert backend data to CardData format
export const formatCardData = (kpis, realtimeData) => {
  if (!kpis || !realtimeData) {
    // Return original static data as fallback
    return [
      {
        title: 'Today Booking',
        value: '1,587',
        text: 'From previous period',
        per: '+11%',
        bg_color: 'bg-primary'
      },
      {
        title: 'Total Amount',
        value: '$2,258',
        text: 'New income',
        per: '+05%',
        bg_color: 'bg-info'
      },
      {
        title: 'Total Customer',
        value: '2.3k',
        text: 'From previous period',
        per: '+11%',
        bg_color: 'bg-warning'
      },
      {
        title: 'Total Revenue',
        value: '11,5587',
        text: 'From previous period',
        per: '+21%',
        bg_color: 'bg-success'
      }
    ];
  }

  // Format numbers for display
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
      per: '+' + (((realtimeData.activeBookings || 0) / (kpis.totalBookings || 1)) * 100).toFixed(0) + '%',
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
      per: '+' + (kpis.occupancyGrowth || 8).toFixed(1) + '%',
      bg_color: 'bg-success'
    }
  ];
};

// Hook สำหรับ Revenue Chart Data
export const useRevenueChartData = () => {
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const data = await apiService.getRevenueAnalytics('monthly');
        
        // Convert to ApexCharts format
        const formattedData = {
          series: [{
            name: 'Revenue',
            data: data.monthly ? data.monthly.map(item => item.revenue) : []
          }],
          categories: data.monthly ? data.monthly.map(item => item.month) : []
        };

        setChartData(formattedData);
      } catch (error) {
        console.error('Failed to fetch revenue chart data:', error);
        // Keep current chart data or set fallback
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  return { chartData, loading };
};

// Hook สำหรับ Booking Trends
export const useBookingTrends = () => {
  const [trends, setTrends] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBookingTrends = async () => {
      try {
        const data = await apiService.getBookingTrends('daily');
        setTrends(data.daily || []);
      } catch (error) {
        console.error('Failed to fetch booking trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingTrends();
  }, []);

  return { trends, loading };
};

// Export original CardData as fallback
export const CardData = [
  {
    title: 'Today Booking',
    value: '1,587',
    text: 'From previous period',
    per: '+11%',
    bg_color: 'bg-primary'
  },
  {
    title: 'Total Amount',
    value: '$2,258',
    text: 'New income',
    per: '+05%',
    bg_color: 'bg-info'
  },
  {
    title: 'Total Customer',
    value: '2.3k',
    text: 'From previous period',
    per: '+11%',
    bg_color: 'bg-warning'
  },
  {
    title: 'Total Revenue',
    value: '11,5587',
    text: 'From previous period',
    per: '+21%',
    bg_color: 'bg-success'
  }
];
