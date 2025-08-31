import React from 'react'
import Chart from 'react-apexcharts'
import { empAvailabilityData, upcomingBirthdayData } from './Components/HrDashboardData'
import { hiringSources } from './Components/HiringSourcesChart'
import { empAnalytics } from './Components/EmployeesAnalyticsChart'
import { totalEmp } from './Components/TotalEmployeeChart'

const IndexHr = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
            <div className="col-lg-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0 fw-bold ">Top Hiring Sources</h6>
                    </div>
                    <div className="card-body">
                        <div id="hiringsources">
                            <Chart
                                options={hiringSources}
                                series={hiringSources.series}
                                height={hiringSources.chart.height}
                                type={hiringSources.chart.type}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-xxl-4 col-xl-12">
                <div className="row g-3">
                    <div className="col-xl-12 col-lg-6">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold ">Upcomming Birthday</h6>
                            </div>
                            <div className="card-body">
                                {upcomingBirthdayData.map((data, index)=> {
                                    return (
                                    <div className="d-flex align-items-start py-2" key={index}>
                                        <img className="avatar lg rounded-circle img-thumbnail" src={data.profileImg} alt="profile"/>
                                        <div className="ms-3 border-bottom flex-grow-1">
                                            <h6 className="fw-bold mb-1">{data.name}</h6>
                                            <p className="text-muted mb-1">{data.position}</p>
                                            <small>Date: {data.date}</small>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-xxl-8 col-xl-12">
                <div className="row g-3 row-deck">
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold ">Employees Info</h6>
                            </div>
                            <div className="card-body">
                                <div className="ac-line-transparent" id="apex-emplyoeeAnalytics">
                                    <Chart
                                        options={empAnalytics}
                                        series={empAnalytics.series}
                                        height={empAnalytics.chart.height}
                                        type={empAnalytics.chart.type}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0 fw-bold ">Total Employees</h6>
                                <h4 className="mb-0 fw-bold ">423</h4>
                            </div>
                            <div className="card-body">
                                <div className="mt-3" id="apex-MainCategories">
                                    <Chart
                                        options={totalEmp}
                                        series={totalEmp.series}
                                        height={totalEmp.chart.height}
                                        type={totalEmp.chart.type}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default IndexHr