import React from 'react'

const AddDepartment = () => {
  return (
    <div className="modal fade" id="depadd" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Add Department</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-12">
							<label className="form-label text-muted">Department Name</label>
							<input type="text" className="form-control form-control-lg"/>
						</div>
						<div className="col-sm-6">
							<label className="form-label text-muted">Department Head</label>
							<input type="text" className="form-control form-control-lg"/>
						</div>
						<div className="col-sm-6">
							<label className="form-label text-muted">Employee UnderWork</label>
							<input type="text" className="form-control form-control-lg"/>
						</div>
					</form>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Done</button>
					<button type="submit" className="btn btn-primary">Add</button>
				</div>
			</div>
		</div>
	</div>
  )
}

export default AddDepartment