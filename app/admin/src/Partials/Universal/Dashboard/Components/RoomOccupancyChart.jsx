import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import apiService from '../../../../services/apiService.js';

// Room Occupancy Donut Chart Component
const RoomOccupancyChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomData, setRoomData] = useState([]);

  // Static fallback data
  const fallbackChartConfig = {
    chart: {
      type: 'donut',
      height: 350
    },
    series: [12, 7, 18, 9],
    labels: ['Deluxe Suite', 'Premium Villa', 'Standard Room', 'Family Suite'],
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Occupied',
              fontSize: '16px',
              fontWeight: 600,
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return total + ' rooms';
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + '%';
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex }) {
          const roomTypes = ['Deluxe Suite', 'Premium Villa', 'Standard Room', 'Family Suite'];
          return val + ' rooms occupied';
        }
      }
    }
  };

  const fallbackRoomData = [
    { roomType: 'Deluxe Suite', occupiedRooms: 12, totalRooms: 15, occupancyRate: 80.0 },
    { roomType: 'Premium Villa', occupiedRooms: 7, totalRooms: 8, occupancyRate: 87.5 },
    { roomType: 'Standard Room', occupiedRooms: 18, totalRooms: 25, occupancyRate: 72.0 },
    { roomType: 'Family Suite', occupiedRooms: 9, totalRooms: 12, occupancyRate: 75.0 }
  ];

  // Fetch room occupancy data
  useEffect(() => {
    const fetchRoomOccupancy = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiService.getRoomOccupancyByType();
        
        if (data && data.roomTypes && data.roomTypes.length > 0) {
          // Format data for ApexCharts
          const chartConfig = {
            ...fallbackChartConfig,
            series: data.roomTypes.map(room => room.occupiedRooms),
            labels: data.roomTypes.map(room => room.roomType),
            colors: data.chartData?.map(item => item.color) || fallbackChartConfig.colors
          };

          setChartData(chartConfig);
          setRoomData(data.roomTypes);
        } else {
          // Use fallback data
          setChartData(fallbackChartConfig);
          setRoomData(fallbackRoomData);
        }
      } catch (error) {
        console.error('Failed to fetch room occupancy:', error);
        setError(error.message);
        setChartData(fallbackChartConfig);
        setRoomData(fallbackRoomData);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomOccupancy();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchRoomOccupancy, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="card-title mb-0">🏠 Room Occupancy by Type</h6>
        
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

        <div className="row">
          <div className="col-md-8">
            <div id="room-occupancy-chart">
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
          
          <div className="col-md-4">
            <div className="room-stats">
              <h6 className="text-muted mb-3">Occupancy Details</h6>
              {roomData.map((room, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <div 
                      className="me-2" 
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: chartData?.colors?.[index] || '#ccc',
                        borderRadius: '50%'
                      }}
                    ></div>
                    <small className="text-muted">{room.roomType}</small>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold">{room.occupiedRooms}/{room.totalRooms}</div>
                    <small className="text-success">{room.occupancyRate}%</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomOccupancyChart;
