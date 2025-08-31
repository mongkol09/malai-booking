import React from 'react'
import { Link } from 'react-router-dom';

const Spinners = () => {

	const spinnersCode = `<div className="me-1 spinner-border text-primary" role="status">
  <span className="visually-hidden">Loading...</span>
</div>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Spinners</h4>
				<p className="lead">Indicate the loading state of a component or page with Bootstrap spinners, built entirely with HTML, CSS, and no JavaScript.</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{spinnersCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<div className="card">
							<div className="card-header">
								<h6 className="card-title mb-0">Basic Example</h6>
							</div>
							<div className="card-body">
								<p>Use the border spinners for a lightweight loading indicator.</p>
								<div className="spinner-border" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
							</div>
							<div className="card-footer">
								<h5></h5>
								<p>The border spinner uses <code>currentColor</code> for its <code>border-color</code>, meaning you can customize the color with <Link to="https://getbootstrap.com/docs/5.0/utilities/colors/">text color utilities</Link>. You can use any of our text color utilities on the standard spinner.</p>
								<div className="me-1 spinner-border text-primary" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<div className="me-1 spinner-border text-secondary" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<div className="me-1 spinner-border text-success" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<div className="me-1 spinner-border text-danger" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<div className="me-1 spinner-border text-warning" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<div className="me-1 spinner-border text-info" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<div className="me-1 spinner-border text-light" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<div className="me-1 spinner-border text-dark" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Growing spinner</h5>
						<p>If you don’t fancy a border spinner, switch to the grow spinner. While it doesn’t technically spin, it does repeatedly grow!</p>
						<div className="me-1 spinner-grow text-primary" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow text-secondary" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow text-success" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow text-danger" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow text-warning" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow text-info" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow text-light" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow text-dark" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
					<div className="col-12">
						<h5>Size</h5>
						<p>Add <code>.spinner-border-sm</code> and <code>.spinner-grow-sm</code> to make a smaller spinner that can quickly be used within other components.</p>
						<div className="me-1 spinner-border spinner-border-sm" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow spinner-grow-sm" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-border" style={{width: "3rem", height: "3rem"}} role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<div className="me-1 spinner-grow" style={{width: "3rem", height: "3rem"}} role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
					<div className="col-12">
						<h5>Buttons</h5>
						<p>Use spinners within buttons to indicate an action is currently processing or taking place. You may also swap the text out of the spinner element and utilize button text as needed.</p>
						<button className="me-1 btn btn-primary" type="button" disabled>
							<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
							<span className="visually-hidden me-2"> Loading...</span>
						</button>
						<button className="me-1 btn btn-primary" type="button" disabled>
							<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
							Loading...
						</button>
						<button className="me-1 btn btn-primary" type="button" disabled>
							<span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
							<span className="visually-hidden me-2"> Loading...</span>
						</button>
						<button className="me-1 btn btn-primary" type="button" disabled>
							<span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
							Loading...
						</button>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Spinners