import React from 'react'

const AddLeave = () => {
  return (
    <div className="modal fade" id="leaveadd" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Leave Add</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-12">
							<label className="form-label">Select Leave type</label>
							<select className="form-select form-control-lg">
								<option defaultValue='selected'>Medical Leave</option>
								<option value="1">Casual Leave</option>
								<option value="2">Maternity Leave</option>
							</select>
						</div>
						<div className="col-sm-6">
							<label className="form-label">Leave From Date</label>
							<input type="date" className="form-control form-control-lg"/>
						</div>
						<div className="col-sm-6">
							<label className="form-label">Leave to Date</label>
							<input type="date" className="form-control form-control-lg"/>
						</div>
						<div className="col-12">
							<label className="form-label">Leave Reason</label>
							<textarea className="form-control" rows="3"></textarea>
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

export default AddLeave