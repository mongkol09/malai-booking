import React from 'react'
import { Link } from 'react-router-dom'
import { personalisedData } from './Components/PersonalisedData'

const Personalised = () => {
  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            <div className="row mb-3">
                <div className="col-sm-12">
                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <h3 className="fw-bold mb-0">Personalised</h3>
                    </div>
                </div>
            </div>
            <ul className="row g-2 list-unstyled li_animate row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-1 row-deck mb-lg-5 mb-4">
            {personalisedData.map((data, index) => {
                return (
                <li className="col" key={index}>
                    <Link className="card hr-arrow p-4" to={`/${data.path}`} title={data.path} style={{"--dynamic-color": `${data.theme_color}`}}>
                        {data.icon}
                        <h6 className="title mb-1">{data.title}</h6>
                        <p className="small text-muted mb-0 d-none d-xl-inline-flex">{data.text}</p>
                        <div className="go-corner">
                            <div className="go-arrow">→</div>
                        </div>
                    </Link>
                </li>
            )})}   
            </ul>
        </div>
    )
}

export default Personalised