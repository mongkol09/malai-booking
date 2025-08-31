import React from 'react'
import { Link } from 'react-router-dom';

const Listgroup = () => {

	const listGroupCode = `<ul className="list-group">
  <li className="list-group-item">An item</li>
  <li className="list-group-item">A second item</li>
  <li className="list-group-item">A third item</li>
  <li className="list-group-item">A fourth item</li>
  <li className="list-group-item">And a fifth one</li>
</ul>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Listgroup</h4>	
				<p className="lead">List groups are a flexible and powerful component for displaying a series of content. Modify and extend them to support just about any content within.</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{listGroupCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<ul className="list-group">
							<li className="list-group-item">An item</li>
							<li className="list-group-item">A second item</li>
							<li className="list-group-item">A third item</li>
							<li className="list-group-item">A fourth item</li>
							<li className="list-group-item">And a fifth one</li>
						</ul>
						<div className="mt-5">
							<h5>Active &Disabled items</h5>
							<p>Add <code>.active</code>, <code>.disabled</code> to a <code>.list-group-item</code> to indicate the current active selection.</p>
							<ul className="list-group">
								<li className="list-group-item active" aria-current="true">An active item</li>
								<li className="list-group-item">A second item</li>
								<li className="list-group-item disabled ">A third item with A disabled item</li>
								<li className="list-group-item">A fourth item</li>
								<li className="list-group-item">And a fifth one</li>
							</ul>
						</div>
					</div>
					<div className="col-12">
						<h5>Links and buttons</h5>
						<p>Use <code>&lt;a&gt;</code>s or <code>&lt;button&gt;</code>s to create <em>actionable</em> list group items with hover, disabled, and active states by adding <code>.list-group-item-action</code>. We separate these pseudo-classes to ensure list groups made of non-interactive elements (like <code>&lt;li&gt;</code>s or <code>&lt;div&gt;</code>s) don’t provide a click or tap affordance.</p>
						<div className="list-group">
							<Link to="/" className="list-group-item list-group-item-action active" aria-current="true">The current link item</Link>
							<Link to="/" className="list-group-item list-group-item-action">A second link item</Link>
							<Link to="/" className="list-group-item list-group-item-action">A third link item</Link>
							<Link to="/" className="list-group-item list-group-item-action">A fourth link item</Link>
							<Link className="list-group-item list-group-item-action disabled">A disabled link item</Link>
						</div>
						<div className="mt-5">
							<div className="list-group">
								<button type="button" className="list-group-item list-group-item-action active" aria-current="true">The current button</button>
								<button type="button" className="list-group-item list-group-item-action">A second item</button>
								<button type="button" className="list-group-item list-group-item-action">A third button item</button>
								<button type="button" className="list-group-item list-group-item-action">A fourth button item</button>
								<button type="button" className="list-group-item list-group-item-action" disabled>A disabled button item</button>
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Flush</h5>
						<p>Add <code>.list-group-flush</code> to remove some borders and rounded corners to render list group items edge-to-edge in a parent container (e.g., cards).</p>
						<ul className="list-group list-group-flush">
							<li className="list-group-item">An item</li>
							<li className="list-group-item">A second item</li>
							<li className="list-group-item">A third item</li>
							<li className="list-group-item">A fourth item</li>
							<li className="list-group-item">And a fifth one</li>
						</ul>
					</div>
					<div className="col-12">
						<h5>Numbered</h5>
						<p>Add the <code>.list-group-numbered</code> modifier class (and optionally use an <code>&lt;ol&gt;</code> element) to opt into numbered list group items. Numbers are generated via CSS (as opposed to a <code>&lt;ol&gt;</code>s default browser styling) for better placement inside list group items and to allow for better customization.</p>
						<ol className="list-group list-group-numbered">
							<li className="list-group-item">A list item</li>
							<li className="list-group-item">A list item</li>
							<li className="list-group-item">A list item</li>
						</ol>
						<div className="mt-5">
							<ol className="list-group list-group-numbered">
								<li className="list-group-item d-flex justify-content-between align-items-start">
								<div className="ms-2 me-auto">
									<div className="fw-bold">Subheading</div>
									Content for list item
								</div>
								<span className="badge bg-primary rounded-pill">14</span>
								</li>
								<li className="list-group-item d-flex justify-content-between align-items-start">
								<div className="ms-2 me-auto">
									<div className="fw-bold">Subheading</div>
									Content for list item
								</div>
								<span className="badge bg-primary rounded-pill">14</span>
								</li>
								<li className="list-group-item d-flex justify-content-between align-items-start">
								<div className="ms-2 me-auto">
									<div className="fw-bold">Subheading</div>
									Content for list item
								</div>
								<span className="badge bg-primary rounded-pill">14</span>
								</li>
							</ol>
						</div>
					</div>
					<div className="col-12">
						<h5>With badges</h5>
						<p>Add badges to any list group item to show unread counts, activity, and more with the help of some <Link to="https://getbootstrap.com/docs/5.1/utilities/flex/">utilities</Link>.</p>
						<ul className="list-group">
							<li className="list-group-item d-flex justify-content-between align-items-center">
								A list item
								<span className="badge bg-primary rounded-pill">14</span>
							</li>
							<li className="list-group-item d-flex justify-content-between align-items-center">
								A second list item
								<span className="badge bg-primary rounded-pill">2</span>
							</li>
							<li className="list-group-item d-flex justify-content-between align-items-center">
								A third list item
								<span className="badge bg-primary rounded-pill">1</span>
							</li>
						</ul>
					</div>
					<div className="col-12">
						<h5>Checkboxes and radios</h5>
						<p>Place Bootstrap’s checkboxes and radios within list group items and customize as needed. You can use them without <code>&lt;label&gt;</code>s, but please remember to include an <code>aria-label</code> attribute and value for accessibility.</p>
						<ul className="list-group mb-2">
							<li className="list-group-item">
								<input className="form-check-input me-1" type="radio" value="" aria-label="..."/>
								First radio
							</li>
							<li className="list-group-item">
								<input className="form-check-input me-1" type="radio" value="" aria-label="..."/>
								Second radio
							</li>
							<li className="list-group-item">
								<input className="form-check-input me-1" type="radio" value="" aria-label="..."/>
								Third radio
							</li>
							<li className="list-group-item">
								<input className="form-check-input me-1" type="radio" value="" aria-label="..."/>
								Fourth radio
							</li>
							<li className="list-group-item">
								<input className="form-check-input me-1" type="radio" value="" aria-label="..."/>
								Fifth radio
							</li>
						</ul>
						<div className="list-group">
							<label className="list-group-item">
							<input className="form-check-input me-1" type="checkbox" value=""/>
							First checkbox
							</label>
							<label className="list-group-item">
							<input className="form-check-input me-1" type="checkbox" value=""/>
							Second checkbox
							</label>
							<label className="list-group-item">
							<input className="form-check-input me-1" type="checkbox" value=""/>
							Third checkbox
							</label>
							<label className="list-group-item">
							<input className="form-check-input me-1" type="checkbox" value=""/>
							Fourth checkbox
							</label>
							<label className="list-group-item">
							<input className="form-check-input me-1" type="checkbox" value=""/>
							Fifth checkbox
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Listgroup