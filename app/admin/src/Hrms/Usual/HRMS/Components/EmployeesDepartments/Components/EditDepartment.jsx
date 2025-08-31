import React from 'react'

const EditDepartment = () => {
  return (
    <div className="modal fade" id="depedit" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Edit Department</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-12">
							<label className="form-label text-muted">Department Name</label>
							<input type="text" className="form-control form-control-lg" defaultValue="Housekeeping Staff" />
						</div>
						<div className="col-sm-6">
							<label className="form-label text-muted">Department Head</label>
							<select className="form-select form-control-lg">
								<option defaultValue='selected'>Joan Dyer</option>
								<option value="1">Ryan Randall</option>
								<option value="2">Phil Glover</option>
								<option value="3">Victor Rampling</option>
								<option value="4">Sally Graham</option>
							</select>
						</div>
						<div className="col-sm-6">
							<label className="form-label text-muted">Employee UnderWork</label>
							<input type="text" className="form-control form-control-lg" defaultValue="40" />
						</div>
					</form>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Done</button>
					<button type="submit" className="btn btn-primary">Save</button>
				</div>
			</div>
		</div>
	</div>
  )
}

export default EditDepartment