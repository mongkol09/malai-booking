import React from 'react'
import { ArticleData, InstagramData, MattersData, TrendingData } from './Components/BlogData'
import ads01 from '../../../assets/images/ads-01.png'
import { Link } from 'react-router-dom'

const Blog = () => {
  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body"> 
            <div className="col-sm-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h3 className="fw-bold mb-0">Blog List</h3>
                </div>
            </div> 
            <ul className="row g-4 justify-content-between list-unstyled li_animate mb-0 mt-2">
                <li className="col-lg-7 col-md-12">
                    {ArticleData.map((data, index) => {
                    return(
                    <article key={index} className="mb-4 pb-5 border-bottom">
                        <h5><Link className={`title-font ${data.text_color}`} to="/app/blog-detail" title="blog title">{data.title}</Link></h5>
                        <div className="d-flex align-items-center text-muted mb-3">
                            <span className="pe-4">By <Link to="/">Malai</Link></span>
                            <span className="pe-4">{data.date}</span>
                            <span className="pe-4">{data.comment}</span>
                        </div>
                        <p className="fw-light mb-4">{data.text}</p>
                        <Link className="btn btn-primary" to="/blog-detail"> Read more</Link>
                    </article>
                    )})}
                    <nav aria-label="Page navigation example">
                        <ul className="pagination">
                            <li className="page-item"><Link className="page-link" to="/">Previous</Link></li>
                            <li className="page-item"><Link className="page-link" to="/">1</Link></li>
                            <li className="page-item"><Link className="page-link" to="/">2</Link></li>
                            <li className="page-item"><Link className="page-link" to="/">3</Link></li>
                            <li className="page-item"><Link className="page-link" to="/">Next</Link></li>
                        </ul>
                    </nav>
                </li>
                <li className="col-lg-4 col-md-12">
                    <div className="overflow-hidden mb-xl-5 mb-3">
                            <img src={ads01} alt="" className="img-fluid border rounded-4"/>
                    </div>
                    <div className="text-uppercase mb-3 pb-2 border-bottom">Discover more of what matters to you</div>
                    <div className="card bg-transparent border-0 mb-xl-5 mb-3">
                        <div className="d-flex flex-wrap tag-group">
                            {MattersData.map((data, index) => {
                            return(
                            <Link key={index} className="btn btn-hover-fill m-1" style={{ '--hover-bg': data.theme_color }} to="/">{data.title}</Link>
                            )})}
                        </div>
                    </div>
                    <div className="text-uppercase mb-3 pb-2 border-bottom">Instagram</div>
                    <div className="card bg-transparent border-0">
                        <div className="row g-1">
                            {InstagramData.map((data, index) => {
                            return(
                                <div key={index} className="col-4">
                                    <Link className="rounded d-block" rel="ligthbox" to="/">
                                        <img className="img-fluid rounded" alt="Instagram post img" src={data.gallery}/>
                                    </Link>
                                </div>
                            )})}
                        </div>
                    </div>
                </li>
            </ul> 
        </div>
    )
}

export default Blog