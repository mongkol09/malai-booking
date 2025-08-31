import React from 'react'
import { Link } from 'react-router-dom'

const Clasic = () => {
  return (
        <ul className="list-group li_animate">
            <li className="list-group-item py-3">
                <h6><Link to="/">Bootstrap Admin Application Template & Ui Kit</Link></h6>
                <p className="text-muted">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</p>
                <ul className="list-inline small">
                    <li className="list-inline-item"><span className="badge bg-secondary">React</span></li>
                    <li className="list-inline-item text-muted">Dec 27 2021</li>
                </ul>
            </li>
            <li className="list-group-item py-3">
                <h6><Link to="/">HR & Project Management Admin Template and UI Kit</Link></h6>
                <p className="text-muted">he point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>
                <ul className="list-inline small">
                    <li className="list-inline-item"><span className="badge bg-success">HTML</span></li>
                    <li className="list-inline-item text-muted">Oct 13 2020</li>
                </ul>
            </li>
            <li className="list-group-item py-3">
                <h6><Link to="/">Responsive Admin Dashboard Template</Link></h6>
                <p className="text-muted">Commodo excepteur non ut aliqua ex qui velit sed esse consequat in </p>
                <ul className="list-inline small">
                    <li className="list-inline-item"><span className="badge bg-danger">Bootstrap</span></li>
                    <li className="list-inline-item text-muted">Sep 27 2020</li>
                </ul>
            </li>
            <li className="list-group-item py-3">
                <h6><Link to="/">Laravel Admin Dashboard Template</Link></h6>
                <p className="text-muted">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words</p>
                <ul className="list-inline small">
                    <li className="list-inline-item"><span className="badge bg-primary">Laravel</span></li>
                    <li className="list-inline-item text-muted">Dec 27 2020</li>
                </ul>
            </li>
            <li className="list-group-item py-3">
                <h6><Link to="/">Bootstrap 4.4.1 Admin Dashboard Template & UI KIT</Link></h6>
                <p className="text-muted">It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.</p>
                <ul className="list-inline small">
                    <li className="list-inline-item"><span className="badge bg-warning">HTML</span></li>
                    <li className="list-inline-item text-muted">Dec 27 2020</li>
                </ul>
            </li>
        </ul>
    )
}

export default Clasic