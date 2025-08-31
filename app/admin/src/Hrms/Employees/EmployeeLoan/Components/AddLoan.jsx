import React from 'react'

const AddLoan = () => {
  return (
    <div className="modal fade" id="LoanAdd" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Add Loan</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-12">
							<label className="form-label text-muted">Employee Name</label>
							<input type="text" className="form-control form-control-lg"/>
						</div>
						<div className="col-sm-6">
							<label className="form-label text-muted">Loan Amount</label>
							<input type="text" className="form-control form-control-lg"/>
						</div>
						<div className="col-sm-6">
							<label className="form-label text-muted">Date</label>
							<input type="date" className="form-control form-control-lg"/>
						</div>
						<div className="col-sm-12">
							<label className="form-label text-muted">Loan Purpose</label>
							<input type="text" className="form-control form-control-lg"/>
						</div>
					</form>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" className="btn btn-primary">Submit</button>
				</div>
			</div>
		</div>
	</div>
  )
}

export default AddLoan