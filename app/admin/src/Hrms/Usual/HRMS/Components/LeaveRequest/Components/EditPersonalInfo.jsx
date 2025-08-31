import React from 'react'

const EditPersonalInfo = () => {
  return (
    <div className="modal fade" id="PersonalInfo" tabIndex="-1" aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title fw-bold"> Personal Informations</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-6">
							<label className="form-label text-muted">Nationality</label>
							<input type="text" className="form-control form-control-lg" defaultValue="Indian"/> 
						</div>
						<div className="col-6">
							<label className="form-label text-muted">Religion</label>
							<input type="text" className="form-control form-control-lg" defaultValue="Hindu"/> 
						</div>
						<div className="col-6">
							<label className="form-label text-muted">Marital Status</label>
							<input type="text" className="form-control form-control-lg" defaultValue="Married"/>
						</div>
						<div className="col-6">
							<label className="form-label text-muted">Passport No</label>
							<input type="text" className="form-control form-control-lg" defaultValue="5468953210"/>
						</div>
						<div className="col-6">
							<label className="form-label text-muted">Emergency Contact</label>
							<input type="text" className="form-control form-control-lg" defaultValue="7468953210"/>
						</div>
					</form>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
					<button type="button" className="btn btn-primary">Update Details</button>
				</div> 
			</div>  
		</div>
	</div>
  )
}

export default EditPersonalInfo