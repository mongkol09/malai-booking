import React from 'react'
import Chart from 'react-apexcharts'

import { CardData, useDashboardKPIs } from './Components/DashboardData'
import { ReservationsChart, useReservationsChart } from './Components/ReservationsChart'
import RevenueTrendChart from './Components/RevenueTrendChart'
import RoomOccupancyChart from './Components/RoomOccupancyChart'
import PaymentStatusChart from './Components/PaymentStatusChart'

import BookingTable from './Components/BookingTable'

const Index = () => {
  // ใช้ hook สำหรับดึงข้อมูลจาก backend
  const { loading, error, cardData } = useDashboardKPIs();
  const { chartConfig, loading: chartLoading } = useReservationsChart();

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3 mb-3">
          {/* Loading state */}
          {loading && (
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {/* Error state - แสดงข้อมูล static */}
          {error && !loading && (
            <div className="col-12">
              <div className="alert alert-warning" role="alert">
                <small>⚠️ Using cached data - API connection issue</small>
              </div>
            </div>
          )}

          {/* Dashboard Cards */}
          {!loading && cardData.map((data, index) => {
          return (
            <div className="col-md-6 col-lg-3" key={index}>
              <div className="card">
                  <div className="card-header">
                      <h6 className="card-title mb-0">{data.title}</h6>
                  </div>
                  <div className="card-body">
                      <h2>{data.value}</h2>
                      <span className={`badge ${data.bg_color}`}>{data.per}</span>
                      <span className="text-muted"> {data.text}</span>
                  </div>
              </div>
            </div>
          )})}
        </div>
        
        {/* Priority 1 Charts Row */}
        <div className="row g-3 mb-3">
            <div className="col-md-8">
                <RevenueTrendChart />
            </div>
            <div className="col-md-4">
                <RoomOccupancyChart />
            </div>
        </div>

        {/* Original Charts Row */}
        <div className="row g-3 mb-3">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Reservations</h6>
                        {chartLoading && (
                          <small className="text-muted">
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Loading chart data...
                          </small>
                        )}
                    </div>
                    <div className="card-body">
                        <div id="reservations">
                          <Chart
                            options={chartConfig}
                            series={chartConfig.series}
                            height={chartConfig.chart.height}
                            type={chartConfig.chart.type}
                          />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <PaymentStatusChart />
            </div>
        </div>

        {/* Tables Row */}
        <div className="row g-3">
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title">Today Booking List</h6>
                    </div>
                    <div className="card-body">
                      <BookingTable/>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Index