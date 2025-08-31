import React from 'react'
import profile_av from '../../../../assets/images/profile_av.png';

const EmployeeReview = () => {
  return (
    <div className="modal fade" id="ViewMore" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Employee Review</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<div className="d-flex align-items-md-start align-items-center flex-column flex-md-row w-100">
						<img src={profile_av} alt="" className="rounded-4"/>
						<div className="media-body ms-md-4 m-0 mt-4 mt-md-0 text-md-start text-center">
							<h4 className="mb-1">Andew Jon</h4>
							<span>Housekeeping Staff</span>
							<p className="text-muted">Looking for a sleek and modern admin template for your next project? Check out our brand new bootstrap admin template! 🚀</p>
							<div className="d-flex gap-1 flex-row flex-wrap align-items-center justify-content-center justify-content-md-start">
								<div className="bg-light rounded-2 py-2 px-3">
									<small className="text-muted">City</small>
									<div className="fs-5">New york</div>
								</div>
								<div className="bg-light rounded-2 py-2 px-3">
									<small className="text-muted">Awards</small>
									<div className="fs-5">6</div>
								</div>
								<div className="bg-light rounded-2 py-2 px-3">
									<small className="text-muted">Experience</small>
									<div className="fs-5">5+</div>
								</div>
								<div className="bg-light rounded-2 py-2 px-3">
									<small className="text-muted">E-Mail</small>
									<div className="fs-5">andew.jon@tt.com</div>
								</div>
							</div>
						</div>
					</div>
					<div className="table-responsive border p-3 rounded mt-4">
						<table className="table table-borderless table-sm">
							<thead>
								<tr>
									<th scope="col"></th>
									<th scope="col" className="table-danger">Poor</th>
									<th scope="col" className="table-warning">Average</th>
									<th scope="col" className="table-info">Good</th>
									<th scope="col" className="table-success">Excellent</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">Knowledge of job</th>
									<td className="table-danger">-</td>
									<td className="table-warning">-</td>
									<td className="table-info"><i className="bi bi-check"></i></td>
									<td className="table-success">-</td>
								</tr>
								<tr>
									<th scope="row">Work Quality</th>
									<td className="table-danger">-</td>
									<td className="table-warning">-</td>
									<td className="table-info">-</td>
									<td className="table-success"><i className="bi bi-check"></i></td>
								</tr>
								<tr>
									<th scope="row">Listening Capability</th>
									<td className="table-danger">-</td>
									<td className="table-warning">-</td>
									<td className="table-info"><i className="bi bi-check"></i></td>
									<td className="table-success">-</td>
								</tr>
								<tr>
									<th scope="row">Nature</th>
									<td className="table-danger">-</td>
									<td className="table-warning">-</td>
									<td className="table-info">-</td>
									<td className="table-success"><i className="bi bi-check"></i></td>
								</tr>
								<tr>
									<th scope="row">Dependability</th>
									<td className="table-danger">-</td>
									<td className="table-warning">-</td>
									<td className="table-info"><i className="bi bi-check"></i></td>
									<td className="table-success">-</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" className="btn btn-primary">Approved</button>
				</div>
			</div>
		</div>
	</div>
  )
}

export default EmployeeReview