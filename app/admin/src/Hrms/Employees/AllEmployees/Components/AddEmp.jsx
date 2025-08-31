import React from 'react'

const AddEmp = () => {
  return (
    <div className="modal fade" id="createemp" tabIndex="-1" aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title fw-bold"> Add Employee</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-lg-6 col-12">
							<label className="form-label text-muted">Employee Name</label>
							<input type="text" className="form-control form-control-lg" placeholder=""/>
						</div>
						<div className="col-lg-6 col-12">
							<label className="form-label text-muted">Employee Company</label>
							<input type="text" className="form-control form-control-lg" placeholder=""/>
						</div>
						<div className="col-12">
							<label className="form-label text-muted">Employee Profile</label>
							<input className="form-control" type="file"/>
						</div>
						<div className="col-lg-4 col-md-6">
							<label className="form-label text-muted">Employee ID</label>
							<input type="text" className="form-control form-control-lg" placeholder="User ID"/>
						</div>
						<div className="col-lg-4 col-md-6">
							<label className="form-label text-muted">Joining Date</label>
							<input type="date" className="form-control form-control-lg"/>
						</div>
						<div className="col-lg-4 col-md-6">
							<label className="form-label text-muted">User Name</label>
							<input type="text" className="form-control form-control-lg" placeholder="User Name"/>
						</div>
						<div className="col-lg-4 col-md-6">
							<label className="form-label text-muted">Password</label>
							<input type="Password" className="form-control form-control-lg" placeholder="Password"/>
						</div>
						<div className="col-lg-4 col-md-6">
							<label className="form-label text-muted">Email ID</label>
							<input type="email" className="form-control form-control-lg" placeholder="Email"/>
						</div>
						<div className="col-lg-4 col-md-6">
							<label className="form-label text-muted">Phone</label>
							<input type="number" className="form-control form-control-lg" placeholder="Phone number"/>
						</div>
						<div className="col-sm-6">
							<label  className="form-label text-muted">Department</label>
							<select className="form-select form-control-lg" aria-label="Default select Project Category">
								<option defaultValue='selected'>Housekeeping Staff</option>
								<option value="1">It Management</option>
								<option value="2">Marketing</option>
							</select>
						</div>
						<div className="col-sm-6">
							<label  className="form-label text-muted">Designation</label>
							<select className="form-select form-control-lg" aria-label="Default select Project Category">
								<option defaultValue='selected'>Master Safe</option>
								<option value="1">BarTender</option>
								<option value="2">Manager</option>
								<option value="3">BarTender</option>
								<option value="4">Housekeeping Staff</option>
								<option value="5">Receptionist</option>
								<option value="6">HR Manager</option>
								<option value="7">BarTender</option>
								<option value="10">Other</option>
							</select>
						</div>
						<div className="col-12">
							<label className="form-label text-muted">Description (optional)</label>
							<textarea className="form-control" rows="3" placeholder="Add any extra details about the request"></textarea>
						</div> 
					</form>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
					<button type="button" className="btn btn-primary">Create</button>
				</div> 
			</div>  
		</div>
	</div>
  )
}

export default AddEmp