import React from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {

	const navbarCode = `<nav className="navbar navbar-expand-lg navbar-light bg-light">
  <div className="container-xxl">
    <Link className="navbar-brand" to="/">Navbar</Link>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className="nav-link active" aria-current="page" to="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/">Link</Link>
        </li>
        <li className="nav-item dropdown">
          <Link className="nav-link dropdown-toggle" to="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Dropdown
          </Link>
          <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
            <li><Link className="dropdown-item" to="/">Action</Link></li>
            <li><Link className="dropdown-item" to="/">Another action</Link></li>
            <li><hr className="dropdown-divider"/></li>
            <li><Link className="dropdown-item" to="/">Something else here</Link></li>
          </ul>
        </li>
        <li className="nav-item">
          <Link className="nav-link disabled">Disabled</Link>
        </li>
      </ul>
      <form className="d-flex">
      <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
      <button className="btn btn-outline-success" type="button">Search</button>
      </form>
    </div>
  </div>
</nav>`;

  	return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Navbar</h4>
				<p className="lead">Here’s what you need to know before getting started with the navbar:</p>
				<div className="row g-4">
					<div className="col-12">
						<ul>
							<li>Navbars require a wrapping <code>.navbar</code> with <code>.navbar-expand{'-sm|-md|-lg|-xl|-xxl'}</code> for responsive collapsing and <Link to="#color-schemes">color scheme</Link> classes.</li>
							<li>Navbars and their contents are fluid by default. Change the <Link to="#containers">container</Link> to limit their horizontal width in different ways.</li>
							<li>Use our <Link to="https://getbootstrap.com/docs/5.1/utilities/spacing/">spacing</Link> and <Link to="https://getbootstrap.com/docs/5.1/utilities/flex/">flex</Link> utility classes for controlling spacing and alignment within navbars.</li>
							<li>Navbars are responsive by default, but you can easily modify them to change that. Responsive behavior depends on our Collapse JavaScript plugin.</li>
							<li>Ensure accessibility by using a <code>&lt;nav&gt;</code> element or, if using a more generic element such as a <code>&lt;div&gt;</code>, add a <code>role="navigation"</code> to every navbar to explicitly identify it as a landmark region for users of assistive technologies.</li>
							<li>Indicate the current item by using <code>aria-current="page"</code> for the current page or <code>aria-current="true"</code> for the current item in a set.</li>
						</ul>
					</div>
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{navbarCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<h6>Basic Example</h6>
						<div className="mb-3 pb-3 border-bottom">
							<nav className="navbar navbar-expand-lg navbar-light bg-light">
								<div className="container-xxl">
								<Link className="navbar-brand" to="/">Navbar</Link>
								<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
									<span className="navbar-toggler-icon"></span>
								</button>
								<div className="collapse navbar-collapse" id="navbarSupportedContent">
									<ul className="navbar-nav me-auto mb-2 mb-lg-0">
									<li className="nav-item">
										<Link className="nav-link active" aria-current="page" to="/">Home</Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link" to="/">Link</Link>
									</li>
									<li className="nav-item dropdown">
										<Link className="nav-link dropdown-toggle" to="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										Dropdown
										</Link>
										<ul className="dropdown-menu" aria-labelledby="navbarDropdown">
										<li><Link className="dropdown-item" to="/">Action</Link></li>
										<li><Link className="dropdown-item" to="/">Another action</Link></li>
										<li><hr className="dropdown-divider"/></li>
										<li><Link className="dropdown-item" to="/">Something else here</Link></li>
										</ul>
									</li>
									<li className="nav-item">
										<Link className="nav-link disabled">Disabled</Link>
									</li>
									</ul>
									<form className="d-flex">
									<input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
									<button className="btn btn-outline-success" type="button">Search</button>
									</form>
								</div>
								</div>
							</nav>
						</div>
						<h5>Color schemes</h5>
						<p>Theming the navbar has never been easier thanks to the combination of theming classes and <code>background-color</code> utilities. Choose from <code>.navbar-light</code> for use with light background colors, or <code>.navbar-dark</code> for dark background colors. Then, customize with <code>.bg-*</code> utilities.</p>
						<nav className="navbar mb-2 navbar-expand-lg navbar-dark bg-dark">
							<div className="container-xxl">
								<Link className="navbar-brand" to="/">Navbar</Link>
								<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
								<span className="navbar-toggler-icon"></span>
								</button>
								<div className="collapse navbar-collapse" id="navbarColor01">
								<ul className="navbar-nav me-auto mb-2 mb-lg-0">
									<li className="nav-item">
									<Link className="nav-link active" aria-current="page" to="/">Home</Link>
									</li>
									<li className="nav-item">
									<Link className="nav-link" to="/">Features</Link>
									</li>
									<li className="nav-item">
									<Link className="nav-link" to="/">Pricing</Link>
									</li>
									<li className="nav-item">
									<Link className="nav-link" to="/">About</Link>
									</li>
								</ul>
								<form className="d-flex">
									<input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
									<button className="btn btn-outline-light" type="button">Search</button>
								</form>
								</div>
							</div>
						</nav>
						<nav className="navbar mb-2 navbar-expand-lg navbar-dark bg-primary">
							<div className="container-xxl">
								<Link className="navbar-brand" to="/">Navbar</Link>
								<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
								<span className="navbar-toggler-icon"></span>
								</button>
								<div className="collapse navbar-collapse" id="navbarColor02">
								<ul className="navbar-nav me-auto mb-2 mb-lg-0">
									<li className="nav-item">
									<Link className="nav-link active" aria-current="page" to="/">Home</Link>
									</li>
									<li className="nav-item">
									<Link className="nav-link" to="/">Features</Link>
									</li>
									<li className="nav-item">
									<Link className="nav-link" to="/">Pricing</Link>
									</li>
									<li className="nav-item">
									<Link className="nav-link" to="/">About</Link>
									</li>
								</ul>
								<form className="d-flex">
									<input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
									<button className="btn btn-outline-light" type="button">Search</button>
								</form>
								</div>
							</div>
						</nav>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Navbar