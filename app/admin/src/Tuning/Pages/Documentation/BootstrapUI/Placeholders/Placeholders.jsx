import React from 'react'

import gallery1 from '../../../../../assets/images/gallery/1.jpg';
import { Link } from 'react-router-dom';

const Placeholders = () => {

	const placeholdersCode = `<div className="card" aria-hidden="true">
  <img src={gallery1} className="card-img-top" alt="..."/>
  <div className="card-body">
    <h5 className="card-title placeholder-glow">
      <span className="placeholder col-6"></span>
    </h5>
    <p className="card-text placeholder-glow">
      <span className="placeholder col-7"></span>
      <span className="placeholder col-4"></span>
      <span className="placeholder col-4"></span>
      <span className="placeholder col-6"></span>
      <span className="placeholder col-8"></span>
    </p>
    <Link to="/" tabIndex="-1" className="btn btn-primary disabled placeholder col-6"></Link>
  </div>
</div>`;

  return (
    <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Placeholders</h4>
				<p className="lead">Create placeholders with the <code>.placeholder</code> class and a grid column class (e.g., <code>.col-6</code>) to set the <code>width</code>. They can replace the text inside an element or be added as a modifier class to an existing component.</p>
				<p className="lead">We apply additional styling to <code>.btn</code>s via <code>::before</code> to ensure the <code>height</code> is respected. You may extend this pattern for other situations as needed, or add a <code>&amp;nbsp;</code> within the element to reflect the height when actual text is rendered in its place.</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{placeholdersCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<h6>Basic Example</h6>
						<p aria-hidden="true"><span className="placeholder col-6"></span></p>
						<Link to="/" tabIndex="-1" className="btn btn-primary disabled placeholder col-4" aria-hidden="true"></Link>
					</div>
					<div className="col-lg-3 col-md-6 col-sm-12">
						<div className="card">
							<img src={gallery1} className="card-img-top" alt="..."/>
						
							<div className="card-body">
							<h5 className="card-title">Card title</h5>
							<p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
							<Link to="/" className="btn btn-primary">Go somewhere</Link>
							</div>
						</div>
					</div>
					<div className="col-lg-3 col-md-6 col-sm-12">
						<div className="card" aria-hidden="true">
							<img src={gallery1} className="card-img-top" alt="..."/>
							<div className="card-body">
							<h5 className="card-title placeholder-glow">
								<span className="placeholder col-6"></span>
							</h5>
							<p className="card-text placeholder-glow">
								<span className="placeholder col-7"></span>
								<span className="placeholder col-4"></span>
								<span className="placeholder col-4"></span>
								<span className="placeholder col-6"></span>
								<span className="placeholder col-8"></span>
							</p>
							<Link to="/" tabIndex="-1" className="btn btn-primary disabled placeholder col-6"></Link>
							</div>
						</div>
					</div>
					<div className="col-lg-6 col-md-6 col-sm-12">
						<div className="card" aria-hidden="true" style={{maxWidth: "540px"}}>
							<div className="row g-0">
								<div className="col-md-4">
								<img src={gallery1} className="img-fluid rounded-start" alt="..."/>
								</div>
								<div className="col-md-8">
								<div className="card-body">
									<h5 className="card-title placeholder-glow">
										<span className="placeholder col-6"></span>
									</h5>
									<p className="card-text placeholder-glow">
										<span className="placeholder col-7"></span>
										<span className="placeholder col-4"></span>
										<span className="placeholder col-4"></span>
										<span className="placeholder col-6"></span>
										<span className="placeholder col-8"></span>
									</p>
									<Link to="/" tabIndex="-1" className="btn btn-primary disabled placeholder col-6"></Link>
								</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Width and Color</h5>
						<p>You can change the <code>width</code> through grid column classes, width utilities, or inline styles.</p>
						<span className="placeholder col-6"></span>
						<span className="placeholder w-75"></span>
						<span className="placeholder" style={{width: "25%"}}></span>
						<div className="my-4">
							<p>By default, the <code>placeholder</code> uses <code>currentColor</code>. This can be overridden with a custom color or utility class.</p>
							<span className="placeholder col-12"></span>
							<span className="placeholder col-12 bg-primary"></span>
							<span className="placeholder col-12 bg-secondary"></span>
							<span className="placeholder col-12 bg-success"></span>
							<span className="placeholder col-12 bg-danger"></span>
							<span className="placeholder col-12 bg-warning"></span>
							<span className="placeholder col-12 bg-info"></span>
							<span className="placeholder col-12 bg-light"></span>
							<span className="placeholder col-12 bg-dark"></span>
						</div>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Placeholders