import React from 'react'
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const popToggle = (
	<Popover id="popover-positioned-top">
		<Popover.Header><b>Popover title</b></Popover.Header>
	  	<Popover.Body>And here's some amazing content. It's very engaging. Right?</Popover.Body>
	</Popover>
  );

const popDismis = (
	<Popover id="popover-positioned-top">
		<Popover.Header><b>Dismissible popover</b></Popover.Header>
		<Popover.Body>And here's some amazing content. It's very engaging. Right?</Popover.Body>
	</Popover>
);

const popTop = (
	<Popover id="popover-positioned-top">
	  <Popover.Body>Top Popover</Popover.Body>
	</Popover>
  );
  
const popRight = (
	<Popover id="popover-positioned-right">
	  <Popover.Body>Right Popover</Popover.Body>
</Popover>
);

const popBottom = (
  <Popover id="popover-positioned-bottom">
    <Popover.Body>Bottom Popover</Popover.Body>
  </Popover>
);

const popLeft = (
  <Popover id="popover-positioned-left">
    <Popover.Body>Left Popover</Popover.Body>
  </Popover>
);

const PopoversContent = () => {

	const popoversCode = `<OverlayTrigger trigger="click" placement="right" overlay={popToggle}>
  <Button variant="danger" className="me-1 btn-lg">Click to toggle popover</Button>
</OverlayTrigger>`;
      
  return (
    <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Popovers</h4>
				<p className="lead">Things to know when using the popover plugin:</p>
				<div className="row g-4">
					<div className="col-12">							
						<ul className="lh-lg">
							<li>Popovers rely on the 3rd party library <Link to="https://popper.js.org/">Popper</Link> for positioning. You must include <Link to="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js">popper.min.js</Link> before bootstrap.js or use <code>bootstrap.bundle.min.js</code> / <code>bootstrap.bundle.js</code> which contains Popper in order for popovers to work!</li>
							<li>Popovers require the <Link to="https://getbootstrap.com/docs/5.1/components/tooltips/">tooltip plugin</Link> as a dependency.</li>
							<li>Popovers are opt-in for performance reasons, so <strong>you must initialize them yourself</strong>.</li>
							<li>Zero-length <code>title</code> and <code>content</code> values will never show a popover.</li>
							<li>Specify <code>container: 'body'</code> to avoid rendering problems in more complex components (like our input groups, button groups, etc).</li>
							<li>Triggering popovers on hidden elements will not work.</li>
							<li>Popovers for <code>.disabled</code> or <code>disabled</code> elements must be triggered on a wrapper element.</li>
							<li>When triggered from anchors that wrap across multiple lines, popovers will be centered between the anchors' overall width. Use <code>.text-nowrap</code> on your <code>&lt;a&gt;</code>s to avoid this behavior.</li>
							<li>Popovers must be hidden before their corresponding elements have been removed from the DOM.</li>
							<li>Popovers can be triggered thanks to an element inside a shadow DOM.</li>
						</ul>
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{popoversCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<h6>Basic Example</h6>
						<OverlayTrigger trigger="click" placement="right" overlay={popToggle}>
							<Button variant="danger" className="me-1 btn-lg">Click to toggle popover</Button>
						</OverlayTrigger>
					</div>
					<div className="col-12">
						<h5>Four directions</h5>
						<p>Four options are available: top, right, bottom, and left aligned. Directions are mirrored when using Bootstrap in RTL.</p>
						<OverlayTrigger trigger="click" placement="top" overlay={popTop}>
							<Button variant="secondary" className="me-1">Popover on top</Button>
						</OverlayTrigger>
						<OverlayTrigger trigger="click" placement="right" overlay={popRight}>
							<Button variant="secondary" className="me-1">Popover on right</Button>
						</OverlayTrigger>
						<OverlayTrigger trigger="click" placement="bottom" overlay={popBottom}>
							<Button variant="secondary" className="me-1">Popover on bottom</Button>
						</OverlayTrigger>
						<OverlayTrigger trigger="click" placement="left" overlay={popLeft}>
							<Button variant="secondary">Popover on left</Button>
						</OverlayTrigger>
					</div>
					<div className="col-12">
						<h5>Dismiss on next click</h5>
						<p>Use the <code>focus</code> trigger to dismiss popovers on the user’s next click of a different element than the toggle element.</p>
						<OverlayTrigger trigger="focus" placement="right" overlay={popDismis}>
							<Button variant="danger" className="me-1 btn-lg">Click to toggle popover</Button>
						</OverlayTrigger>
					</div>
				</div>
			</div>
		</div>
    )
}

export default PopoversContent