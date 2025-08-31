import React from 'react'

const ApproveLeave = () => {
  return (
    <div className="modal fade" id="leaveapprove" tabIndex="-1"  aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Leave Approve</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body justify-content-center flex-column d-flex text-center bg-success-subtle">
					<i className="bi bi-emoji-smile text-success display-2 my-2"></i>
					<p className="fs-5">Leave Approve Successfully</p>
				</div>
			</div>
		</div>
	</div> 
  )
}

export default ApproveLeave