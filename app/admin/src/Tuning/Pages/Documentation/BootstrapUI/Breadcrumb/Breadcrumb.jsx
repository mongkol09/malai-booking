import React from 'react'
import { Link } from 'react-router-dom';

const Breadcrumb = () => {

	const breadcrumbCode = `<ol className="breadcrumb p-2 rounded border">
  <li className="breadcrumb-item"><Link to="/">Home</Link></li>
  <li className="breadcrumb-item active" aria-current="page">Library</li>
</ol>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Breadcrumb</h4>
				<p className="lead">Use an ordered or unordered list with linked list items to create a minimally styled breadcrumb. Use our utilities to add additional styles as desired.</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{breadcrumbCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<nav aria-label="breadcrumb">
							<ol className="breadcrumb">
								<li className="breadcrumb-item active" aria-current="page">Home</li>
							</ol>
						</nav>
						<nav aria-label="breadcrumb">
							<ol className="breadcrumb p-2 rounded border">
								<li className="breadcrumb-item"><Link to="/">Home</Link></li>
								<li className="breadcrumb-item active" aria-current="page">Library</li>
							</ol>
						</nav>
						<nav aria-label="breadcrumb">
							<ol className="breadcrumb p-2 rounded border border-primary dashed mb-0">
								<li className="breadcrumb-item"><Link to="/">Home</Link></li>
								<li className="breadcrumb-item"><Link to="/">Library</Link></li>
								<li className="breadcrumb-item active" aria-current="page">Data</li>
							</ol>
						</nav>
					</div>
					<div className="col-12">
						<h5>Dividers</h5>
						<p>Dividers are automatically added in CSS through <Link to="https://developer.mozilla.org/en-US/docs/Web/CSS/::before"><code>::before</code></Link> and <Link to="https://developer.mozilla.org/en-US/docs/Web/CSS/content"><code>content</code></Link>. They can be changed by modifying a local CSS custom property <code>--bs-breadcrumb-divider</code>, or through the <code>$breadcrumb-divider</code> Sass variable — and <code>$breadcrumb-divider-flipped</code> for its RTL counterpart, if needed. We default to our Sass variable, which is set as a fallback to the custom property. This way, you get a global divider that you can override without recompiling CSS at any time.</p>
						<nav style={{ '--bs-breadcrumb-divider': '>' }} aria-label="breadcrumb">
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item"><Link to="/">Home</Link><span> {'  > '}</span></li>
								<li className="breadcrumb-item active" aria-current="page">Library</li>
							</ol>
						</nav>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Breadcrumb