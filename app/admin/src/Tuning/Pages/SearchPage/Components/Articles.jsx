import React from 'react'
import { articlesdata } from './SearchPageData'
import { Link } from 'react-router-dom'

const Articles = () => {
  return (
        <div className="row g-3">
            {articlesdata.map ((data, index) => {
                return(
                <div key={index} className="col-lx-3 col-lg-4 col-md-6">
                    <div className="card">
                        <img className="card-img-top" src={data.img} alt="Card image cap"/>
                        <div className="card-body">
                            <span className={`badge ${data.theme_color}`} style={{position: "absolute", top: "1rem"}}>{data.theme_name}</span>
                            <h5 className="fw-light mb-2"><Link to="/">{data.title}</Link></h5>
                            <p>{data.text}</p>
                            <small className="text-muted">{data.last_update}</small>
                        </div>
                    </div>
                </div>
            )})}
        </div>
    )
}

export default Articles