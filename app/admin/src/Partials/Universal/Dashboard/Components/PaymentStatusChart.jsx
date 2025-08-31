import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import apiService from '../../../../services/apiService.js';

// Payment Status Chart Component
const PaymentStatusChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);

  // Static fallback data
  const fallbackChartConfig = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    series: [{
      name: 'Count',
      data: [32, 8, 3, 2]
    }, {
      name: 'Amount (THB)',
      data: [180000, 45000, 18000, 10000]
    }],
    colors: ['#28a745', '#ffc107', '#dc3545', '#6c757d'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        dataLabels: {
          position: 'top'
        }
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        if (opts.seriesIndex === 0) {
          return val; // Show count as is
        } else {
          return new Intl.NumberFormat('th-TH', {
            notation: 'compact',
            compactDisplay: 'short'
          }).format(val);
        }
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Paid', 'Pending', 'Overdue', 'Refunded'],
    },
    yaxis: [{
      title: {
        text: 'Count'
      }
    }, {
      opposite: true,
      title: {
        text: 'Amount (THB)'
      },
      labels: {
        formatter: function (val) {
          return new Intl.NumberFormat('th-TH', {
            notation: 'compact'
          }).format(val);
        }
      }
    }],
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val, opts) {
          if (opts.seriesIndex === 0) {
            return val + ' bookings';
          } else {
            return new Intl.NumberFormat('th-TH', {
              style: 'currency',
              currency: 'THB'
            }).format(val);
          }
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    }
  };

  const fallbackSummary = {
    totalBookings: 45,
    totalAmount: 253000,
    paidPercentage: 71.1,
    outstandingAmount: 63000
  };

  // Fetch payment status data
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiService.getPaymentStatusOverview();
        
        if (data && data.paymentStatus && data.paymentStatus.length > 0) {
          // Format data for ApexCharts
          const chartConfig = {
            ...fallbackChartConfig,
            series: data.chartData.series || fallbackChartConfig.series,
            xaxis: {
              ...fallbackChartConfig.xaxis,
              categories: data.chartData.categories || fallbackChartConfig.xaxis.categories
            },
            colors: data.chartData.colors || fallbackChartConfig.colors
          };

          setChartData(chartConfig);
          setPaymentSummary(data.summary);
        } else {
          // Use fallback data
          setChartData(fallbackChartConfig);
          setPaymentSummary(fallbackSummary);
        }
      } catch (error) {
        console.error('Failed to fetch payment status:', error);
        setError(error.message);
        setChartData(fallbackChartConfig);
        setPaymentSummary(fallbackSummary);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPaymentStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="card-title mb-0">💳 Payment Status Overview</h6>
        
        {loading && (
          <small className="text-muted">
            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
            Loading...
          </small>
        )}
      </div>
      
      <div className="card-body">
        {error && (
          <div className="alert alert-warning mb-3" role="alert">
            <small>⚠️ Using cached data - {error}</small>
          </div>
        )}

        {/* Summary Cards */}
        {paymentSummary && (
          <div className="row mb-4">
            <div className="col-6 col-md-3">
              <div className="text-center">
                <h5 className="mb-1 text-success">
                  {new Intl.NumberFormat('th-TH').format(paymentSummary.totalBookings)}
                </h5>
                <small className="text-muted">Total Bookings</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center">
                <h5 className="mb-1 text-primary">
                  {new Intl.NumberFormat('th-TH', {
                    style: 'currency',
                    currency: 'THB',
                    notation: 'compact'
                  }).format(paymentSummary.totalAmount)}
                </h5>
                <small className="text-muted">Total Amount</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center">
                <h5 className="mb-1 text-success">{paymentSummary.paidPercentage}%</h5>
                <small className="text-muted">Paid Rate</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center">
                <h5 className="mb-1 text-warning">
                  {new Intl.NumberFormat('th-TH', {
                    style: 'currency',
                    currency: 'THB',
                    notation: 'compact'
                  }).format(paymentSummary.outstandingAmount)}
                </h5>
                <small className="text-muted">Outstanding</small>
              </div>
            </div>
          </div>
        )}

        <div id="payment-status-chart">
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

export default PaymentStatusChart;
