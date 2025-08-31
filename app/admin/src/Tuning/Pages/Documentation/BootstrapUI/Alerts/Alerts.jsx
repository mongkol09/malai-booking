import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const Alerts = () => {

    const [alerts, setAlerts] = useState([]);

    const showAlert = (message, type) => {
      const newAlert = (
        <div key={alerts.length} className={`alert alert-${type} alert-dismissible`} role="alert">
          {message}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => removeAlert(alerts.length)}></button>
        </div>
      );
  
      setAlerts([...alerts, newAlert]);
    };
  
    const removeAlert = (index) => {
      const updatedAlerts = alerts.filter((_, i) => i !== index);
      setAlerts(updatedAlerts);
    };

	const alertCode = `<div className="alert alert-primary" role="alert">
	A simple primary alert with 
	<Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
</div>`;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">	
			<div className="card-body p-0">
				<h4 className="mb-4">Alerts</h4>
				<p className="lead mb-5">Alerts are available for any length of text, as well as an optional close button. For proper styling, use one of the eight <strong>required</strong> contextual classes (e.g., <code>.alert-success</code>).</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{alertCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<div className="alert alert-primary" role="alert">A simple primary alert—check it out!</div>
						<div className="alert alert-secondary" role="alert">A simple secondary alert—check it out!</div>
						<div className="alert alert-success" role="alert">A simple success alert—check it out!</div>
						<div className="alert alert-danger" role="alert">A simple danger alert—check it out!</div>
						<div className="alert alert-warning" role="alert">A simple warning alert—check it out!</div>
						<div className="alert alert-info" role="alert">A simple info alert—check it out!</div>
						<div className="alert alert-light" role="alert">A simple light alert—check it out!</div>
						<div className="alert alert-dark" role="alert">A simple dark alert—check it out!</div>
					</div>
					<div className="col-12">
						<h5>Live example</h5>
						<p>Click the button below to show an alert (hidden with inline styles to start), then dismiss (and destroy) it with the built-in close button.</p>
						<div id="liveAlertPlaceholder">
						{alerts.map((alert, index) => (
							<div key={index}>{alert}</div>
						))}
						</div>
						<button type="button" className="btn btn-primary" id="liveAlertBtn" onClick={() => showAlert('Nice, you triggered this alert message!', 'success')} >Show live alert</button>
					</div>
					<div className="col-12">
						<h5>Link color</h5>
						<p>Use the <code>.alert-link</code> utility class to quickly provide matching colored links within any alert.</p>
						<div className="alert alert-primary" role="alert">
							A simple primary alert with <Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
						</div>
						<div className="alert alert-secondary" role="alert">
							A simple secondary alert with <Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
						</div>
						<div className="alert alert-success" role="alert">
							A simple success alert with <Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
						</div>
						<div className="alert alert-danger" role="alert">
							A simple danger alert with <Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
						</div>
						<div className="alert alert-warning" role="alert">
							A simple warning alert with <Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
						</div>
						<div className="alert alert-info" role="alert">
							A simple info alert with <Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
						</div>
						<div className="alert alert-light" role="alert">
							A simple light alert with <Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
						</div>
						<div className="alert alert-dark" role="alert">
							A simple dark alert with <Link to="/" className="alert-link">an example link</Link>. Give it a click if you like.
						</div>
					</div>
					<div className="col-12">
						<h5>Additional content</h5>
						<p>Alerts can also contain additional HTML elements like headings, paragraphs and dividers.</p>
						<div className="alert alert-success" role="alert">
							<h4 className="alert-heading">Well done!</h4>
							<p>Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p>
							<hr/>
							<p className="mb-0">Whenever you need to, be sure to use margin utilities to keep things nice and tidy.</p>
						</div>
					</div>
					<div className="col-12">
						<h5>Icons</h5>
						<p>Similarly, you can use <Link to="https://getbootstrap.com/docs/5.3/utilities/flex/">flexbox utilities</Link> and <Link to="https://icons.getbootstrap.com/">Bootstrap Icons</Link> to create alerts with icons. Depending on your icons and content, you may want to add more utilities or custom styles.</p>
						<div className="alert alert-primary d-flex align-items-center" role="alert">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
								<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
							</svg>
							<div>An example alert with an icon</div>
						</div>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Alerts