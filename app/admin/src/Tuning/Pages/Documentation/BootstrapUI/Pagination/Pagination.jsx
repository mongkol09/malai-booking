import React from 'react'
import { Link } from 'react-router-dom';

const Pagination = () => {

	const paginationCode = `<ul className="pagination">
  <li className="page-item"><Link className="page-link" to="/">Previous</Link></li>
  <li className="page-item"><Link className="page-link" to="/">1</Link></li>
  <li className="page-item"><Link className="page-link" to="/">2</Link></li>
  <li className="page-item"><Link className="page-link" to="/">3</Link></li>
  <li className="page-item"><Link className="page-link" to="/">Next</Link></li>
</ul>`;

  return (
    	<div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<div className="card-body p-0">
				<h4 className="mb-4">Pagination</h4>
				<p className="lead">Documentation and examples for showing pagination to indicate a series of related content exists across multiple pages.</p>
				<div className="row g-4">
					<div className="col-12">							
						<div className="rounded-4" data-lang="html">
							<pre className='h6 language-html text-primary'><code>{paginationCode}</code></pre>
						</div>
					</div>
					<div className="col-12">
						<h6>Basic Example</h6>
						<nav aria-label="Page navigation">
							<ul className="pagination">
								<li className="page-item"><Link className="page-link" to="/">Previous</Link></li>
								<li className="page-item"><Link className="page-link" to="/">1</Link></li>
								<li className="page-item"><Link className="page-link" to="/">2</Link></li>
								<li className="page-item"><Link className="page-link" to="/">3</Link></li>
								<li className="page-item"><Link className="page-link" to="/">Next</Link></li>
							</ul>
						</nav>
					</div>
					<div className="col-12">
						<h5>Working with icons</h5>
						<p>Looking to use an icon or symbol in place of text for some pagination links? Be sure to provide proper screen reader support with <code>aria</code> attributes.</p>
						<nav aria-label="Page navigation">
							<ul className="pagination">
								<li className="page-item">
								<Link className="page-link" to="/" aria-label="Previous">
									<span aria-hidden="true">&laquo;</span>
								</Link>
								</li>
								<li className="page-item"><Link className="page-link" to="/">1</Link></li>
								<li className="page-item"><Link className="page-link" to="/">2</Link></li>
								<li className="page-item"><Link className="page-link" to="/">3</Link></li>
								<li className="page-item">
								<Link className="page-link" to="/" aria-label="Next">
									<span aria-hidden="true">&raquo;</span>
								</Link>
								</li>
							</ul>
						</nav>
					</div>
					<div className="col-12">
						<h5>Sizing</h5>
						<p>Fancy larger or smaller pagination? Add <code>.pagination-lg</code> or <code>.pagination-sm</code> for additional sizes.</p>
						<nav aria-label="...">
							<ul className="pagination pagination-lg">
								<li className="page-item active" aria-current="page">
								<span className="page-link">1</span>
								</li>
								<li className="page-item"><Link className="page-link" to="/">2</Link></li>
								<li className="page-item"><Link className="page-link" to="/">3</Link></li>
							</ul>
						</nav>
						<nav aria-label="...">
							<ul className="pagination pagination-sm">
								<li className="page-item active" aria-current="page">
								<span className="page-link">1</span>
								</li>
								<li className="page-item"><Link className="page-link" to="/">2</Link></li>
								<li className="page-item"><Link className="page-link" to="/">3</Link></li>
							</ul>
						</nav>
					</div>
					<div className="col-12">
						<h5>Alignment</h5>
						<p>Change the alignment of pagination components with <Link to="https://getbootstrap.com/docs/5.1/utilities/flex/">flexbox utilities</Link>.</p>
						<div className="card">
							<div className="card-body">
								<nav aria-label="Page navigation">
									<ul className="pagination justify-content-center">
									<li className="page-item disabled">
										<Link className="page-link">Previous</Link>
									</li>
									<li className="page-item"><Link className="page-link" to="/">1</Link></li>
									<li className="page-item"><Link className="page-link" to="/">2</Link></li>
									<li className="page-item"><Link className="page-link" to="/">3</Link></li>
									<li className="page-item">
										<Link className="page-link" to="/">Next</Link>
									</li>
									</ul>
								</nav>
							</div>
							<div className="card-footer">
								<nav aria-label="Page navigation">
									<ul className="pagination justify-content-end">
									<li className="page-item disabled">
										<Link className="page-link">Previous</Link>
									</li>
									<li className="page-item"><Link className="page-link" to="/">1</Link></li>
									<li className="page-item"><Link className="page-link" to="/">2</Link></li>
									<li className="page-item"><Link className="page-link" to="/">3</Link></li>
									<li className="page-item">
										<Link className="page-link" to="/">Next</Link>
									</li>
									</ul>
								</nav>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
    )
}

export default Pagination