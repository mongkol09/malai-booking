import React from 'react'
import Clasic from './Components/Clasic'
import Articles from './Components/Articles'
import Gallery from './Components/Gallery'
import { Link } from 'react-router-dom'

const SearchPage = () => {
  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            <div className="row g-3">
                <div className="col-12">
                    <ul className="nav nav-tabs tab-heading li_animate" role="tablist" style={{"--dynamic-color": "var(--theme-color1)"}}>
                        <li className="nav-item"><Link className="nav-link active show" data-bs-toggle="tab" to="#clasic_search">Clasic</Link></li>
                        <li className="nav-item"><Link className="nav-link" data-bs-toggle="tab" to="#articles_search">Articles</Link></li>
                        <li className="nav-item"><Link className="nav-link" data-bs-toggle="tab" to="#photos_search">Photos</Link></li>
                    </ul>
                </div>
                <div className="col-12">
                    <h5 className="mb-0">Search results</h5>
                    <small className="text-muted">About <span className="text-orange">12,284</span> result ( 0.17 seconds )</small>
                </div>
                <div className="col-12">
                    <div className="tab-content mb-4">
                        <div className="tab-pane show active" id="clasic_search">
                            <Clasic/>
                        </div>
                        <div className="tab-pane" id="articles_search">
                            <Articles/>
                        </div>
                        <div className="tab-pane" id="photos_search">
                            <Gallery/>
                        </div>
                    </div>
                    <nav aria-label="Page navigation">
                        <ul className="pagination">
                            <li className="page-item"><Link className="page-link" to="/">Previous</Link></li>
                            <li className="page-item active"><Link className="page-link" to="/">1</Link></li>
                            <li className="page-item"><Link className="page-link" to="/">2</Link></li>
                            <li className="page-item"><Link className="page-link" to="/">3</Link></li>
                            <li className="page-item"><Link className="page-link" to="/">Next</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default SearchPage