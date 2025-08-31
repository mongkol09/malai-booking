import React from 'react'

import g1 from '../../../../../assets/images/gallery/1.jpg';
import { Link } from 'react-router-dom';

const Cards = () => {

	const cardsCode = `<div className="card" style={{width: "18rem"}}>
  <img src={g1} className="card-img-top" alt="..."/>
  <div className="card-body">
    <h5 className="card-title">Card title</h5>
    <p className="card-text">Some quick example text to build on the card title and 
    make up the bulk of the card's content.</p>
    <Link to="/" className="btn btn-primary">Go somewhere</Link>
  </div>
</div>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Cards</h4>				
				<p className="lead">Bootstrap’s cards provide a flexible and extensible content container with multiple variants and options.</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{cardsCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<div className="card" style={{width: "18rem"}}>
							<img src={g1} className="card-img-top" alt="..."/>
							<div className="card-body">
								<h5 className="card-title">Card title</h5>
								<p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
								<Link to="/" className="btn btn-primary">Go somewhere</Link>
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Body</h5>
						<p>The building block of a card is the <code>.card-body</code>. Use it whenever you need a padded section within a card.</p>
						<div className="card">
							<div className="card-body">
								This is some text within a card body.
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Titles, text, and links</h5>
						<p>Card titles are used by adding <code>.card-title</code> to a <code>&lt;h*&gt;</code> tag. In the same way, links are added and placed next to each other by adding <code>.card-link</code> to an <code>&lt;a&gt;</code> tag.</p>
						<div className="card">
							<div className="card-body">
								<h5 className="card-title">Card title</h5>
								<h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>
								<p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
								<Link to="/" className="card-link">Card link</Link>
								<Link to="/" className="card-link">Another link</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Cards