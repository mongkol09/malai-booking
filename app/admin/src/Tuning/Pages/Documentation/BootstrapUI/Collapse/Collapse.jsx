import React from 'react'
import { Link } from 'react-router-dom';

const Collapse = () => {

	const collapseCode = `<p>
  <Link className="me-1 btn btn-primary" data-bs-toggle="collapse" to="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
    Link with href
  </Link>
</p>
<div className="collapse" id="collapseExample">
  <div className="card card-body bg-body">
    Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
  </div>
</div>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Collapse</h4>
				<p className="lead">Toggle the visibility of content across your project with a few classes and our JavaScript plugins.</p>
				<p className="lead">Click the buttons below to show and hide another element via class changes:</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{collapseCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<ul>
							<li><code>.collapse</code> hides content</li>
							<li><code>.collapsing</code> is applied during transitions</li>
							<li><code>.collapse.show</code> shows content</li>
						</ul>
						<p>Generally, we recommend using a button with the <code>data-bs-target</code> attribute. While not recommended from a semantic point of view, you can also use a link with the <code>href</code> attribute (and a <code>role="button"</code>). In both cases, the <code>data-bs-toggle="collapse"</code> is required.</p>
						<p>
							<Link className="me-1 btn btn-primary" data-bs-toggle="collapse" to="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
							Link with href
							</Link>
							<button className="me-1 btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
							Button with data-bs-target
							</button>
						</p>
						<div className="collapse" id="collapseExample">
							<div className="card card-body bg-body">
							Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Horizontal</h5>
						<p>The collapse plugin also supports horizontal collapsing. Add the <code>.collapse-horizontal</code> modifier class to transition the <code>width</code> instead of <code>height</code> and set a <code>width</code> on the immediate child element. Feel free to write your own custom Sass, use inline styles, or use our <Link to="https://getbootstrap.com/docs/5.1/utilities/sizing/">width utilities</Link>.</p>
						<p>
							<button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
								Toggle width collapse
							</button>
						</p>
						<div style={{minHeight: "120px"}}>
							<div className="collapse collapse-horizontal" id="collapseWidthExample">
								<div className="card card-body bg-body" style={{width: "300px"}}>
								This is some placeholder content for a horizontal collapse. It's hidden by default and shown when triggered.
								</div>
							</div>
						</div>
					</div>
					<div className="col-12">
						<h5>Multiple targets</h5>
						<p>
							<Link className="me-1 btn btn-primary" data-bs-toggle="collapse" to="#multiCollapseExample1" role="button" aria-expanded="false" aria-controls="multiCollapseExample1">Toggle first element</Link>
							<button className="me-1 btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#multiCollapseExample2" aria-expanded="false" aria-controls="multiCollapseExample2">Toggle second element</button>
							<button className="me-1 btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target=".multi-collapse" aria-expanded="false" aria-controls="multiCollapseExample1 multiCollapseExample2">Toggle both elements</button>
						</p>
						<div className="row">
							<div className="col">
								<div className="collapse multi-collapse" id="multiCollapseExample1">
								<div className="card card-body bg-body">
									Some placeholder content for the first collapse component of this multi-collapse example. This panel is hidden by default but revealed when the user activates the relevant trigger.
								</div>
								</div>
							</div>
							<div className="col">
								<div className="collapse multi-collapse" id="multiCollapseExample2">
								<div className="card card-body bg-body">
									Some placeholder content for the second collapse component of this multi-collapse example. This panel is hidden by default but revealed when the user activates the relevant trigger.
								</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Collapse