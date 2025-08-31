import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import apiService from '../../../../services/apiService.js';

// Revenue Trend Chart Component
const RevenueTrendChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('daily');

  // Static fallback data
  const fallbackChartConfig = {
    chart: {
      height: 350,
      type: 'line',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
    },
    colors: ['#28a745', '#17a2b8'],
    series: [{
      name: 'Revenue (THB)',
      data: [25000, 28000, 22000, 35000, 31000, 29000, 33000]
    }],
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    xaxis: {
      categories: ['Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11', 'Aug 12', 'Aug 13'],
      title: {
        text: 'Date'
      }
    },
    yaxis: {
      title: {
        text: 'Revenue (THB)'
      },
      labels: {
        formatter: function (val) {
          return new Intl.NumberFormat('th-TH').format(val);
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
          }).format(val);
        }
      }
    },
    grid: {
      borderColor: '#e0e6ed',
      strokeDashArray: 5
    }
  };

  // Fetch revenue trends data
  useEffect(() => {
    const fetchRevenueTrends = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiService.getRevenueTrends(period, 30);
        
        if (data && data.trends && data.trends.length > 0) {
          // Format data for ApexCharts
          const chartConfig = {
            ...fallbackChartConfig,
            series: [{
              name: 'Revenue (THB)',
              data: data.trends.map(item => item.revenue)
            }],
            xaxis: {
              ...fallbackChartConfig.xaxis,
              categories: data.trends.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-GB', { 
                  month: 'short', 
                  day: 'numeric' 
                });
              })
            }
          };

          setChartData(chartConfig);
        } else {
          // Use fallback data
          setChartData(fallbackChartConfig);
        }
      } catch (error) {
        console.error('Failed to fetch revenue trends:', error);
        setError(error.message);
        setChartData(fallbackChartConfig);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueTrends();

    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchRevenueTrends, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [period]);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="card-title mb-0">💰 Revenue Trends</h6>
        
        <div className="d-flex align-items-center">
          {loading && (
            <span className="me-3">
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
              <small className="text-muted">Loading...</small>
            </span>
          )}
          
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={loading}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      
      <div className="card-body">
        {error && (
          <div className="alert alert-warning mb-3" role="alert">
            <small>⚠️ Using cached data - {error}</small>
          </div>
        )}

        <div id="revenue-trends-chart">
          {chartData && (
            <Chart
              options={chartData}
              series={chartData.series}
              height={chartData.chart.height}
              type={chartData.chart.type}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
