import React, { useState, useEffect } from 'react';
import roomService from '../../../../../services/roomService';

const EditRoom = ({ room, isVisible, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    price: '',
    capacity: '',
    capacityChildren: '',
    size: '',
    bedType: '',
    bedCount: '',
    extraBedCharge: '',
    description: '',
    condition: '',
    amenities: [],
    status: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when room changes
  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || room.number || '',
        type: room.type || '',
        price: room.price?.toString() || '',
        capacity: room.capacity?.toString() || '',
        capacityChildren: room.capacityChildren?.toString() || '0',
        size: room.size || '',
        bedType: room.bedType || '',
        bedCount: room.bedCount?.toString() || '1',
        extraBedCharge: room.extraBedCharge?.toString() || '0',
        description: room.description || '',
        condition: room.condition || room.notes || '',
        amenities: room.amenities || [],
        status: room.status || 'available'
      });
      setError('');
    }
  }, [room]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleAmenitiesChange = (e) => {
    const value = e.target.value;
    const amenitiesArray = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      amenities: amenitiesArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!room?.id) {
      setError('ไม่พบ Room ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Updating room:', room.id, 'with data:', formData);
      
      // Prepare update data
      const updateData = {
        number: formData.roomNumber,
        type: formData.type,
        price: formData.price,
        capacity: formData.capacity,
        capacityChildren: formData.capacityChildren,
        size: formData.size,
        bedType: formData.bedType,
        bedCount: formData.bedCount,
        extraBedCharge: formData.extraBedCharge,
        description: formData.description,
        condition: formData.condition,
        amenities: formData.amenities,
        status: formData.status
      };

      // Call API to update room
      const response = await roomService.updateRoom(room.id, updateData);
      
      console.log('✅ Room updated successfully:', response);
      
      // Call onSave callback to refresh parent component
      if (onSave) {
        onSave(response.data || response);
      }
      
      // Close modal
      onClose();
      
      // Show success message
      alert('✅ บันทึกข้อมูลห้องเรียบร้อยแล้ว!');
      
    } catch (error) {
      console.error('❌ Error updating room:', error);
      setError(error?.message || error?.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  if (!isVisible || !room) {
    return null;
  }

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil-square me-2"></i>
              แก้ไขข้อมูลห้อง {room.roomNumber || room.number}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleCancel}
              disabled={isLoading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">หมายเลขห้อง *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">ประเภทห้อง *</label>
                    <select
                      className="form-select"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- เลือกประเภทห้อง --</option>
                      <option value="Private House">Private House</option>
                      <option value="Onsen Villa">Onsen Villa</option>
                      <option value="Serenity Villa">Serenity Villa</option>
                      <option value="Grand Serenity">Grand Serenity</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">ราคาต่อคืน (บาท) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">ผู้ใหญ่ *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">เด็ก</label>
                    <input
                      type="number"
                      className="form-control"
                      name="capacityChildren"
                      value={formData.capacityChildren}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">ขนาดห้อง</label>
                    <input
                      type="text"
                      className="form-control"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="เช่น 25 sqm"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">ประเภทเตียง *</label>
                    <select
                      className="form-select"
                      name="bedType"
                      value={formData.bedType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- เลือกประเภทเตียง --</option>
                      <option value="King Bed">King Bed</option>
                      <option value="Queen Bed">Queen Bed</option>
                      <option value="Standard Double">Standard Double</option>
                      <option value="Twin Beds">Twin Beds</option>
                      <option value="Single Bed">Single Bed</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">จำนวนเตียง</label>
                    <input
                      type="number"
                      className="form-control"
                      name="bedCount"
                      value={formData.bedCount}
                      onChange={handleInputChange}
                      min="1"
                      max="4"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">สถานะห้อง</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="available">Available (ว่าง)</option>
                      <option value="occupied">Occupied (มีผู้เข้าพัก)</option>
                      <option value="dirty">Dirty (รอทำความสะอาด)</option>
                      <option value="cleaning">Cleaning (กำลังทำความสะอาด)</option>
                      <option value="maintenance">Maintenance (ซ่อมแซม)</option>
                      <option value="out-of-order">Out of Order (ใช้งานไม่ได้)</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">ค่าเตียงเสริม (บาท)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="extraBedCharge"
                      value={formData.extraBedCharge}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">รายละเอียดห้อง</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="รายละเอียดเพิ่มเติมของห้อง"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">สิ่งอำนวยความสะดวก</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.amenities.join(', ')}
                  onChange={handleAmenitiesChange}
                  placeholder="เช่น WiFi, แอร์, ทีวี, ตู้เซฟ (คั่นด้วยจุลภาค)"
                />
                <div className="form-text">คั่นแต่ละรายการด้วยจุลภาค (,)</div>
              </div>

              <div className="mb-3">
                <label className="form-label">หมายเหตุ/สภาพห้อง</label>
                <textarea
                  className="form-control"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="หมายเหตุหรือสภาพปัจจุบันของห้อง"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                <i className="bi bi-x-circle me-2"></i>
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    บันทึกการเปลี่ยนแปลง
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRoom;
