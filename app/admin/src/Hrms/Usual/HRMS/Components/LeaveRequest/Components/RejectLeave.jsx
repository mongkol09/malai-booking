import React from 'react'

const RejectLeave = () => {
  return (
    <div className="modal fade" id="leavereject" tabIndex="-1"  aria-hidden="true"> 
		<div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Leave Reject</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div className="modal-body justify-content-center flex-column d-flex text-center bg-danger-subtle">
					<i className="bi bi-emoji-frown text-danger display-2 my-2"></i>
					<p className="fs-5">Leave Reject</p>
				</div>
			</div>
		</div>
	</div>
  )
}

export default RejectLeave