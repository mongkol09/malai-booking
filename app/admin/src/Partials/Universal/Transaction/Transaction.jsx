import React from 'react'
import Chart from 'react-apexcharts'
import { transactionData } from './Components/TransactionData'
import TransactionTable from './Components/TransactionTable'
import CalendarTab from './Components/CalendarTab'

const Transaction = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row mb-3">
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Transaction</h3>
                </div>
            </div>
        </div>
        <ul className="row g-3 list-unstyled row-deck">
            {transactionData.map((data, index) => {
            return (
                <li className="col-xl-3 col-lg-6" key={index}>
                    <div className="card rounded-4 p-xl-3">
                        <div className="card-body d-flex align-items-start">
                            <div className="avatar rounded no-thumbnail"><i className={data.icon}></i></div>
                            <div className="ms-3 me-auto">
                                <h5 className={`fw-normal ${data.textColor} mb-1`}>{data.title}</h5>
                                <p>{data.amount}</p>
                                <div>
                                <Chart
                                    options={data.options}
                                    series={data.series}
                                    height={data.options.chart.height}
                                    type={data.options.chart.type}
                                />
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            )})}
        </ul> 

        <div className="border border-primary p-4 rounded-2 rounded-4">
            <CalendarTab/>
            <TransactionTable/>
        </div>
    </div>
  )
}

export default Transaction