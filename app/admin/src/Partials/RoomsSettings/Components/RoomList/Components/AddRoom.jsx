import React, { useState } from 'react'
import roomService from '../../../../../services/roomService'

const AddRoom = ({ onRoomAdded }) => {
  const [formData, setFormData] = useState({
    number: '',
    type: '',
    capacity: '',
    extraCapability: '',
    price: '',
    bedCharge: '',
    size: '',
    bedCount: '',
    bedType: '',
    description: '',
    condition: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.number?.trim()) newErrors.number = 'Room number is required';
    if (!formData.type?.trim()) newErrors.type = 'Room type is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid room price is required';
    if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = 'Valid capacity is required';
    if (!formData.size) newErrors.size = 'Room size is required';
    if (!formData.bedCount || formData.bedCount <= 0) newErrors.bedCount = 'Valid bed number is required';
    if (!formData.bedType) newErrors.bedType = 'Bed type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('💾 Saving room data:', formData);

      const roomData = {
        number: formData.number,
        type: formData.type,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        size: formData.size,
        bedType: formData.bedType,
        bedCount: parseInt(formData.bedCount),
        extraBedCharge: parseFloat(formData.bedCharge) || 0,
        description: formData.description,
        condition: formData.condition,
        amenities: []
      };

      const response = await roomService.createRoom(roomData);
      console.log('✅ Room created successfully:', response);

      // Clear form
      setFormData({
        number: '',
        type: '',
        capacity: '',
        extraCapability: '',
        price: '',
        bedCharge: '',
        size: '',
        bedCount: '',
        bedType: '',
        description: '',
        condition: ''
      });

      // Close modal
      const modalElement = document.getElementById('add-room');
      if (modalElement) {
        const modal = window.bootstrap?.Offcanvas?.getInstance(modalElement);
        modal?.hide();
      }

      // Notify parent component to refresh data
      if (onRoomAdded) {
        onRoomAdded(response.data);
      }

      alert('Room added successfully!');
    } catch (error) {
      console.error('❌ Error creating room:', error);
      alert(`Failed to create room: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      number: '',
      type: '',
      capacity: '',
      extraCapability: '',
      price: '',
      bedCharge: '',
      size: '',
      bedCount: '',
      bedType: '',
      description: '',
      condition: ''
    });
    setErrors({});
  };
  return (
    <div className="offcanvas offcanvas-end" tabIndex="-1" id="add-room" aria-labelledby="add-room">
		<div className="offcanvas-header">
			<h5 className="offcanvas-title">Add Room</h5>
			<button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
		</div>
		<div className="offcanvas-body">
			<form onSubmit={handleSubmit}>
				<div className="form-group mb-3">
					<label className="form-label text-muted">Room Number <span className="text-danger">*</span></label>
					<input 
						type="text" 
						name="number"
						className={`form-control ${errors.number ? 'is-invalid' : ''}`}
						placeholder="e.g., 101, 102A"
						value={formData.number}
						onChange={handleInputChange}
					/>
					{errors.number && <div className="invalid-feedback">{errors.number}</div>}
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Room Type <span className="text-danger">*</span></label>
					<input 
						type="text" 
						name="type"
						className={`form-control ${errors.type ? 'is-invalid' : ''}`}
						placeholder="e.g., Deluxe Room, Suite"
						value={formData.type}
						onChange={handleInputChange}
					/>
					{errors.type && <div className="invalid-feedback">{errors.type}</div>}
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Capacity <span className="text-danger">*</span></label>
					<input 
						type="number" 
						name="capacity"
						className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
						placeholder="Number of guests"
						value={formData.capacity}
						onChange={handleInputChange}
						min="1"
					/>
					{errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Extra Capability</label>
					<input 
						type="number" 
						name="extraCapability"
						className="form-control"
						placeholder="Additional guests capacity"
						value={formData.extraCapability}
						onChange={handleInputChange}
						min="0"
					/>
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Room Price <span className="text-danger">*</span></label>
					<input 
						type="number" 
						name="price"
						className={`form-control ${errors.price ? 'is-invalid' : ''}`}
						placeholder="Price per night (THB)"
						value={formData.price}
						onChange={handleInputChange}
						min="0"
						step="0.01"
					/>
					{errors.price && <div className="invalid-feedback">{errors.price}</div>}
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Bed Charge</label>
					<input 
						type="number" 
						name="bedCharge"
						className="form-control"
						placeholder="Extra bed charge (THB)"
						value={formData.bedCharge}
						onChange={handleInputChange}
						min="0"
						step="0.01"
					/>
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Room Size <span className="text-danger">*</span></label>
					<select 
						name="size"
						className={`form-select ${errors.size ? 'is-invalid' : ''}`}
						value={formData.size}
						onChange={handleInputChange}
					>
						<option value="">Choose Room Size</option>
						<option value="Single">Single</option>
						<option value="Double">Double</option>
						<option value="Triple">Triple</option>
						<option value="Quad">Quad</option>
						<option value="Queen">Queen</option>
						<option value="King">King</option>
						<option value="Presidential">Presidential</option>
						<option value="Others">Others</option>
					</select>
					{errors.size && <div className="invalid-feedback">{errors.size}</div>}
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Bed Number <span className="text-danger">*</span></label>
					<input 
						type="number" 
						name="bedCount"
						className={`form-control ${errors.bedCount ? 'is-invalid' : ''}`}
						placeholder="Number of beds"
						value={formData.bedCount}
						onChange={handleInputChange}
						min="1"
					/>
					{errors.bedCount && <div className="invalid-feedback">{errors.bedCount}</div>}
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Bed Type <span className="text-danger">*</span></label>
					<select 
						name="bedType"
						className={`form-select ${errors.bedType ? 'is-invalid' : ''}`}
						value={formData.bedType}
						onChange={handleInputChange}
					>
						<option value="">Choose Bed Type</option>
						<option value="King Bed">King Bed</option>
						<option value="Queen Bed">Queen Bed</option>
						<option value="Double Bed">Double Bed</option>
						<option value="Single Bed">Single Bed</option>
						<option value="Sofa Bed">Sofa Bed</option>
						<option value="Futon Bed">Futon Bed</option>
						<option value="Bunk Bed">Bunk Bed</option>
						<option value="Mixed">Mixed</option>
					</select>
					{errors.bedType && <div className="invalid-feedback">{errors.bedType}</div>}
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Room Description</label>
					<textarea 
						name="description"
						className="form-control"
						placeholder="Describe the room features and amenities"
						value={formData.description}
						onChange={handleInputChange}
						rows="3"
					/>
				</div>

				<div className="form-group mb-3">
					<label className="form-label text-muted">Reserve Condition</label>
					<textarea 
						name="condition"
						className="form-control"
						placeholder="Special conditions or requirements"
						value={formData.condition}
						onChange={handleInputChange}
						rows="3"
					/>
				</div>
			</form>
			
			<div className="d-flex">
				<button 
					type="button" 
					className="btn w-100 me-1 py-2 btn-secondary"
					onClick={handleClear}
					disabled={loading}
				>
					Clear
				</button>
				<button 
					type="button" 
					className="btn w-100 ms-1 py-2 btn-dark"
					onClick={handleSubmit}
					disabled={loading}
				>
					{loading ? (
						<>
							<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
							Saving...
						</>
					) : (
						'Save'
					)}
				</button>
			</div>
		</div>
	</div>
  )
}

export default AddRoom