import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const PasswordReset = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setMessage('Please enter your email address')
      setIsSuccess(false)
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      // ตรวจสอบว่า response เป็น JSON หรือไม่
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: Expected JSON but got ${contentType}`);
      }

      const data = await response.json()

      if (data.success) {
        setMessage('Password reset link has been sent to your email')
        setIsSuccess(true)
      } else {
        setMessage(data.message || 'Something went wrong. Please try again.')
        setIsSuccess(false)
      }
    } catch (error) {
      console.error('Password reset error:', error)
      
      // ให้ error message ที่เข้าใจง่าย
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่')
      } else if (error.message.includes('404')) {
        setMessage('ไม่พบ API endpoint กรุณาตรวจสอบการตั้งค่าเซิร์ฟเวอร์')
      } else if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
        setMessage('เซิร์ฟเวอร์ตอบกลับในรูปแบบที่ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ')
      } else {
        setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      }
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
        <div className="px-xl-5 px-4 auth-body">
			<form onSubmit={handleSubmit}>
				<ul className="row g-3 list-unstyled li_animate">
					{/* Success/Error Message */}
					{message && (
						<li className="col-12">
							<div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`} role="alert">
								{message}
							</div>
						</li>
					)}

					<li className="col-12">
						<label className="form-label">Email address</label>
						<input 
							type="email" 
							className="form-control form-control-lg" 
							placeholder="name@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading}
							required
						/>
						<small className="text-muted">An email will be sent to the above address with a link to set your new password.</small>
					</li>
					<li className="col-12 my-lg-4">
						<button 
							type="submit"
							className="btn btn-lg w-100 btn-primary text-uppercase mb-2"
							disabled={isLoading}
						>
							{isLoading ? 'SENDING...' : 'SUBMIT'}
						</button>
					</li>
					<li className="col-12 text-center">
						<span className="text-muted"><Link to="/signin">Back to Sign in</Link></span>
					</li>
				</ul>
			</form>
		</div>
    )
}

export default PasswordReset