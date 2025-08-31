import React from 'react'

import avatar1 from '../../../../../assets/images/xs/avatar1.jpg';
import avatar3 from '../../../../../assets/images/xs/avatar3.jpg';
import { Link } from 'react-router-dom';

const Toasts = () => {

	const toastsCode = `<div className="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
  <div className="toast-header">
	<img src={avatar3} className="avatar sm rounded me-2" alt="" />
	<strong className="me-auto">Bootstrap</strong>
	<small className="text-muted">2 seconds ago</small>
	<button type="button" className="btn-close" data-dismiss="toast" aria-label="Close"></button>
  </div>
  <div className="toast-body">
	Heads up, toasts will stack automatically
  </div>
</div>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Toasts</h4>
				<p className="lead">Things to know when using the toast plugin.</p>
				<div className="row g-4">
					<div className="col-12">							
						<ul className="lh-lg">
							<li>Toasts are opt-in for performance reasons, so <strong>you must initialize them yourself</strong>.</li>
							<li>Toasts will automatically hide if you do not specify <code>autohide: false</code>.</li>
						</ul>
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{toastsCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<h6>Basic Example</h6>
						<div className="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
							<div className="toast-header">
								<img src={avatar1} className="avatar sm rounded me-2" alt="" />
								<strong className="me-auto">Bootstrap</strong>
								<small>11 mins ago</small>
								<button type="button" className="btn-close" data-dismiss="toast" aria-label="Close"></button>
							</div>
							<div className="toast-body">
								Hello, world! This is a toast message.
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Stacking</h5>
						<p>You can stack toasts by wrapping them in a toast container, which will vertically add some spacing.</p>
						<div className="toast fade show mb-2" role="alert" aria-live="assertive" aria-atomic="true">
							<div className="toast-header">
								<img src={avatar3} className="avatar sm rounded me-2" alt="" />
								<strong className="me-auto">Bootstrap</strong>
								<small className="text-muted">just now</small>
								<button type="button" className="btn-close" data-dismiss="toast" aria-label="Close"></button>
							</div>
							<div className="toast-body">
								See? Just like this.
							</div>
						</div>
						<div className="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
							<div className="toast-header">
								<img src={avatar3} className="avatar sm rounded me-2" alt="" />
								<strong className="me-auto">Bootstrap</strong>
								<small className="text-muted">2 seconds ago</small>
								<button type="button" className="btn-close" data-dismiss="toast" aria-label="Close"></button>
							</div>
							<div className="toast-body">
								Heads up, toasts will stack automatically
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Custom content</h5>
						<p>Customize your toasts by removing sub-components, tweaking with <Link to="https://v5.getbootstrap.com/docs/5.0/utilities/api/">utilities</Link>, or adding your own markup. Here we’ve created a simpler toast by removing the default <code>.toast-header</code>, adding a custom hide icon from <Link to="https://icons.getbootstrap.com/">Bootstrap Icons</Link>, and using some <Link to="https://v5.getbootstrap.com/docs/5.0/utilities/flex/">flexbox utilities</Link> to adjust the layout.</p>
						<div className="toast d-flex align-items-center fade show mb-5" role="alert" aria-live="assertive" aria-atomic="true">
							<div className="toast-body">
								Hello, world! This is a toast message.
							</div>
							<button type="button" className="btn-close ms-auto me-2" data-dismiss="toast" aria-label="Close"></button>
						</div>
						<p>Building on the above example, you can create different toast color schemes with our <Link to="https://v5.getbootstrap.com/docs/5.0/utilities/colors/">color utilities</Link>. Here we’ve added <code>.bg-primary</code> and <code>.text-white</code> to the <code>.toast</code>, and then added <code>.text-white</code> to our close button. For a crisp edge, we remove the default border with <code>.border-0</code>.</p>
						<div className="toast d-flex align-items-center text-white bg-primary border-0 fade show mb-2" role="alert" aria-live="assertive" aria-atomic="true">
							<div className="toast-body">
								Hello, world! This is a toast message.
							</div>
							<button type="button" className="btn-close btn-close-white ms-auto me-2" data-dismiss="toast" aria-label="Close"></button>
						</div>
						<div className="toast d-flex align-items-center text-white bg-success border-0 fade show mb-2" role="alert" aria-live="assertive" aria-atomic="true">
							<div className="toast-body">
								Hello, world! This is a toast message.
							</div>
							<button type="button" className="btn-close btn-close-white ms-auto me-2" data-dismiss="toast" aria-label="Close"></button>
						</div>
						<div className="toast d-flex align-items-center text-white bg-danger border-0 fade show mb-5" role="alert" aria-live="assertive" aria-atomic="true">
							<div className="toast-body">
								Hello, world! This is a toast message.
							</div>
							<button type="button" className="btn-close btn-close-white ms-auto me-2" data-dismiss="toast" aria-label="Close"></button>
						</div>
						<p>Alternatively, you can also add additional controls and components to toasts.</p>
						<div className="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
							<div className="toast-body">
								Hello, world! This is a toast message.
								<div className="mt-2 pt-2 border-top">
									<button type="button" className="btn btn-primary btn-sm me-1">Take action</button>
									<button type="button" className="btn btn-secondary btn-sm" data-dismiss="toast">Close</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Toasts