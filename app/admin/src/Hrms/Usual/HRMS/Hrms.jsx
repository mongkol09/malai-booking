import React from 'react'
import { hrmsData } from './Components/HrmsData'
import { Link } from 'react-router-dom'

const Hrms = () => {
  return (
    <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <ul className="row g-2 list-unstyled li_animate row-cols-lg-3 row-cols-md-3 row-cols-sm-2 row-cols-2 row-deck mb-lg-5 mb-4">
            {hrmsData.map((data, index) => {
                return (
                <li className="col" key={index}>
                    <Link className="card hr-arrow p-4" to={`/${data.path}`} title={data.path} style={{"--dynamic-color": data.theme_color}}>
                        {data.icon}
                        <h6 className="title mb-1">{data.title}</h6>
                        <p className="small text-muted mb-0 d-none d-xl-inline-flex">{data.text}</p>
                        <div className="go-corner">
                            <div className="go-arrow">→</div>
                        </div>
                    </Link>
                </li>
                )
            })}
        </ul>
    </div>
  )
}

export default Hrms