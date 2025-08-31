import React from 'react'

const EditAttendance = () => {
  return (
    <div className="modal fade" id="editattendance" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Edit Attendance</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-12">
							<label className="form-label text-muted">Select Person</label>
							<select className="form-select form-control-lg">
								<option defaultValue='selected'>Joan Dyer</option>
								<option value="1">Ryan Randall</option>
								<option value="2">Phil Glover</option>
								<option value="3">Victor Rampling</option>
								<option value="4">Sally Graham</option>
								<option value="5">Robert Anderson</option>
								<option value="6">Ryan Stewart</option>
							</select>
						</div>
						<div className="col-12">
							<label className="form-label text-muted">Select Date</label>
							<input type="date" className="form-control form-control-lg"/>
						</div>
						<div className="col-12">
							<label className="form-label text-muted">Attendance Type</label>
							<select className="form-select form-control-lg">
								<option defaultValue='selected'>Full Day Present</option>
								<option value="1">Half Day Present</option>
								<option value="2">Full Day Absence</option>
							</select>
						</div>
						<div className="col-12">
							<label className="form-label text-muted">Edit Reason</label>
							<textarea className="form-control" rows="3"></textarea>
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

export default EditAttendance