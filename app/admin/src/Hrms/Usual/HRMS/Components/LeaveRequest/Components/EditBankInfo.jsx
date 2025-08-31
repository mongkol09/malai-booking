import React from 'react'

const EditBankInfo = () => {
  return (
    <div className="modal fade" id="BankInfo" tabIndex="-1" aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title  fw-bold" id="edit2Label"> Bank information</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body">
					<form className="row g-3">
						<div className="col-6">
							<label className="form-label text-muted">Bank Name</label>
							<input type="text" className="form-control form-control-lg" defaultValue="Kotak"/> 
						</div>
						<div className="col-6">
							<label className="form-label text-muted">Account No.</label>
							<input type="text" className="form-control form-control-lg" defaultValue="5436874596325486"/> 
						</div>
						<div className="col-6">
							<label className="form-label text-muted">IFSC Code</label>
							<input type="text" className="form-control form-control-lg" defaultValue="Kotak000021"/>
						</div>
						<div className="col-6">
							<label className="form-label text-muted">Pan No</label>
							<input type="text" className="form-control form-control-lg" defaultValue="ACQPF6584L"/>
						</div>
						<div className="col-6">
							<label className="form-label text-muted">UPI Id</label>
							<input type="text" className="form-control form-control-lg" defaultValue="454812kotak@upi"/>
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

export default EditBankInfo