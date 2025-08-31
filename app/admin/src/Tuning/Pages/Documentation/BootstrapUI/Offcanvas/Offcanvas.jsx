import React from 'react'
import { Link } from 'react-router-dom';

const Offcanvas = () => {

	const offcanvasCode = `<Link className="me-1 btn btn-primary" data-bs-toggle="offcanvas" to="#offcanvasExample" role="button" aria-controls="offcanvasExample">
	Link with href
</Link>
<button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
	Button with data-bs-target
</button>
	
<div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
  <div className="offcanvas-header">
    <h5 className="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
    <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div className="offcanvas-body">
    <div>
      Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
    </div>
    <div className="dropdown mt-3">
      <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown">
        Dropdown button
      </button>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <li><Link className="dropdown-item" to="/">Action</Link></li>
        <li><Link className="dropdown-item" to="/">Another action</Link></li>
        <li><Link className="dropdown-item" to="/">Something else here</Link></li>
      </ul>
    </div>
  </div>
</div>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Offcanvas</h4>
				<p className="lead">Offcanvas is a sidebar component that can be toggled via JavaScript to appear from the left, right, or bottom edge of the viewport. Buttons or anchors are used as triggers that are attached to specific elements you toggle, and <code>data</code> attributes are used to invoke our JavaScript.</p>
				<div className="row g-4">
          <div className="col-12">
						<ul className="lh-lg">
							<li>Offcanvas shares some of the same JavaScript code as modals. Conceptually, they are quite similar, but they are separate plugins.</li>
							<li>Similarly, some <Link to="#sass">source Sass</Link> variables for offcanvas’s styles and dimensions are inherited from the modal’s variables.</li>
							<li>When shown, offcanvas includes a default backdrop that can be clicked to hide the offcanvas.</li>
							<li>Similar to modals, only one offcanvas can be shown at a time.</li>
						</ul>
						<p className="mb-5"><strong>Heads up!</strong> Given how CSS handles animations, you cannot use <code>margin</code> or <code>translate</code> on an <code>.offcanvas</code> element. Instead, use the class as an independent wrapping element.</p>
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{offcanvasCode}</code></pre>
						</div>
          </div>
					<div className="col-12">
						<div className="card">
							<div className="card-header">
								<h6 className="card-title mb-0">Basic Example</h6>
							</div>
							<div className="card-body">
								<p>Use the buttons below to show and hide an offcanvas element via JavaScript that toggles the <code>.show</code> class on an element with the <code>.offcanvas</code> class.</p>
								<ul>
									<li><code>.offcanvas</code> hides content (default)</li>
									<li><code>.offcanvas.show</code> shows content</li>
								</ul>
								<p>You can use a link with the <code>href</code> attribute, or a button with the <code>data-bs-target</code> attribute. In both cases, the <code>data-bs-toggle="offcanvas"</code> is required.</p>
								<Link className="me-1 btn btn-primary" data-bs-toggle="offcanvas" to="#offcanvasExample" role="button" aria-controls="offcanvasExample">
									Link with href
								</Link>
								<button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
									Button with data-bs-target
								</button>
									
								<div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
									<div className="offcanvas-header">
										<h5 className="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
										<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
									</div>
									<div className="offcanvas-body">
										<div>
											Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
										</div>
										<div className="dropdown mt-3">
											<button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown">
												Dropdown button
											</button>
											<ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
												<li><Link className="dropdown-item" to="/">Action</Link></li>
												<li><Link className="dropdown-item" to="/">Another action</Link></li>
												<li><Link className="dropdown-item" to="/">Something else here</Link></li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Placement</h5>
						<p>There’s no default placement for offcanvas components, so you must add one of the modifier classes below;</p>
						<ul>
							<li><code>.offcanvas-start</code> places offcanvas on the left of the viewport (shown above)</li>
							<li><code>.offcanvas-end</code> places offcanvas on the right of the viewport</li>
							<li><code>.offcanvas-top</code> places offcanvas on the top of the viewport</li>
							<li><code>.offcanvas-bottom</code> places offcanvas on the bottom of the viewport</li>
						</ul>
						<p>Try the top, right, and bottom examples out below.</p>
						<button className="me-1 btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">Toggle top offcanvas</button>
						<div className="offcanvas offcanvas-top" tabIndex="-1" id="offcanvasTop" aria-labelledby="offcanvasTopLabel">
							<div className="offcanvas-header">
								<h5 id="offcanvasTopLabel">Offcanvas top</h5>
								<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
							</div>
							<div className="offcanvas-body">
								...
							</div>
						</div>

						<button className="me-1 btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">Toggle right offcanvas</button>
						<div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
							<div className="offcanvas-header">
								<h5 id="offcanvasRightLabel">Offcanvas right</h5>
								<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
							</div>
							<div className="offcanvas-body">
								...
							</div>
						</div>

						<button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom">Toggle bottom offcanvas</button>
						<div className="offcanvas offcanvas-bottom" tabIndex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
							<div className="offcanvas-header">
								<h5 className="offcanvas-title" id="offcanvasBottomLabel">Offcanvas bottom</h5>
								<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
							</div>
							<div className="offcanvas-body small">
								...
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Backdrop</h5>
						<p>Scrolling the <code>&lt;body&gt;</code> element is disabled when an offcanvas and its backdrop are visible. Use the <code>data-bs-scroll</code> attribute to toggle <code>&lt;body&gt;</code> scrolling and <code>data-bs-backdrop</code> to toggle the backdrop.</p>
						<button className="me-1 btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasScrolling" aria-controls="offcanvasScrolling">Enable body scrolling</button>
						<button className="me-1 btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBackdrop" aria-controls="offcanvasWithBackdrop">Enable backdrop (default)</button>
						<button className="me-1 btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">Enable both scrolling & backdrop</button>

						<div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id="offcanvasScrolling" aria-labelledby="offcanvasScrollingLabel">
							<div className="offcanvas-header">
								<h5 className="offcanvas-title" id="offcanvasScrollingLabel">Colored with scrolling</h5>
								<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
							</div>
							<div className="offcanvas-body">
								<p>Try scrolling the rest of the page to see this option in action.</p>
							</div>
						</div>
						<div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasWithBackdrop" aria-labelledby="offcanvasWithBackdropLabel">
							<div className="offcanvas-header">
								<h5 className="offcanvas-title" id="offcanvasWithBackdropLabel">Offcanvas with backdrop</h5>
								<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
							</div>
							<div className="offcanvas-body">
								<p>.....</p>
							</div>
						</div>
						<div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
							<div className="offcanvas-header">
								<h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel">Backdrop with scrolling</h5>
								<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
							</div>
							<div className="offcanvas-body">
								<p>Try scrolling the rest of the page to see this option in action.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Offcanvas