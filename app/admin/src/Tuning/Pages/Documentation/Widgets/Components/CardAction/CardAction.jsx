import React from 'react'
import { Link } from 'react-router-dom';

const CardAction = () => {

    const toggleFullscreen = (e) => {
        e.preventDefault();
        const DIV_CARD = 'div.card';
        const cardFullscreen = e.target;
        const card = cardFullscreen.closest(DIV_CARD);
        
        if (card) {
            card.classList.toggle('fullscreen');
        }
    };

    return (
        <span>
            <Link to="/" className="card-fullscreen me-2" data-bs-toggle="tooltip" title="Card Full Screen" onMouseDown={toggleFullscreen}>
                <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M3 16m0 1a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1z"></path>
                    <path d="M4 12v-6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-6"></path>
                    <path d="M12 8h4v4"></path>
                    <path d="M16 8l-5 5"></path>
                </svg>
            </Link>
            <Link to="/" className="dropdown-toggle after-none" data-bs-toggle="dropdown" aria-expanded="false" title="More Action">
                <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                    <path d="M8 12l0 .01"></path>
                    <path d="M12 12l0 .01"></path>
                    <path d="M16 12l0 .01"></path>
                </svg>
            </Link>
            <div className="dropdown-menu dropdown-menu-end shadow rounded-4 p-2">
                <Link to="/" className="dropdown-item rounded-pill"><i className="me-2 fa fa-share"></i>Share</Link>
                <Link to="/" className="dropdown-item rounded-pill"><i className="me-2 fa fa-pencil"></i>Rename</Link>
                <div className="dropdown-divider"></div>
                <Link to="/" className="dropdown-item rounded-pill"><i className="me-2 fa fa-link"></i>Copy Link Address</Link>
                <Link to="/" className="dropdown-item rounded-pill"><i className="me-2 fa fa-folder"></i>Move to</Link>
                <Link to="/" className="dropdown-item rounded-pill"><i className="me-2 fa fa-copy"></i>Copy to</Link>
                <Link to="/" className="dropdown-item rounded-pill"><i className="me-2 fa fa-edit"></i>Make Private</Link>
                <Link to="/" className="dropdown-item rounded-pill"><i className="me-2 fa fa-download"></i>Download</Link>
                <div className="dropdown-divider"></div>
                <Link to="/" className="dropdown-item rounded-pill card-options-remove" data-toggle="card-remove"><i className="me-2 fa fa-trash"></i>Delete</Link>
            </div>
        </span>
    )
}

export default CardAction