import React from 'react'

const EditLoan = () => {
  return (
    <div className="modal fade" id="LoanEdit" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Edit Loan</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-12">
							<label className="form-label">Employee Name</label>
							<input type="text" className="form-control form-control-lg" defaultValue="Joan Dyer"/>
						</div>
						<div className="col-sm-6">
							<label className="form-label">Loan Amount</label>
							<input type="text" className="form-control form-control-lg" defaultValue="$4000"/>
						</div>
						<div className="col-sm-6">
							<label className="form-label">Date</label>
							<input type="date" className="form-control form-control-lg" defaultValue="2022-01-14"/>
						</div>
						<div className="col-sm-12">
							<label className="form-label">Loan Purpose </label>
							<input type="text" className="form-control form-control-lg" defaultValue="for weddings and family functions"/>
						</div>
					</form>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" className="btn btn-primary">Save</button>
				</div>
			</div>
		</div>
	</div> 
  )
}

export default EditLoan