import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  User,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  X,
  RefreshCw,
  AlertCircle,
  Bed,
  Wifi,
  Tv,
  Coffee
} from 'lucide-react';
import { apiService } from '../services/apiService';

// ============================================
// ADVANCED ROOM ASSIGNMENT COMPONENT
// ============================================
// Professional room assignment interface for check-in

const RoomAssignmentModal = ({ booking, isOpen, onClose, onAssign }) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignmentReason, setAssignmentReason] = useState('');

  // Fetch available rooms
  const fetchAvailableRooms = async () => {
    if (!booking) return;
    
    try {
      setLoading(true);
      const response = await apiService.get(
        `/checkin/rooms/available?roomTypeId=${booking.roomTypeId}&checkinDate=${booking.checkinDate}&checkoutDate=${booking.checkoutDate}`
      );
      setAvailableRooms(response.data || response);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && booking) {
      fetchAvailableRooms();
      setSelectedRoom(null);
      setAssignmentReason('');
    }
  }, [isOpen, booking]);

  const handleAssignRoom = async () => {
    if (!selectedRoom || !booking) return;

    try {
      setLoading(true);
      const response = await apiService.put(`/checkin/${booking.id}/assign-room`, {
        roomId: selectedRoom.id,
        reason: assignmentReason || 'Room assignment during check-in'
      });

      onAssign(response.data || response);
      onClose();
    } catch (error) {
      console.error('Error assigning room:', error);
      alert(`Room assignment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomAmenities = () => {
    // Mock amenities - in real app, this would come from room data
    return [
      { icon: Bed, label: 'King Bed' },
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Tv, label: 'Smart TV' },
      { icon: Coffee, label: 'Coffee Maker' }
    ];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">Room Assignment</h2>
                {booking && (
                  <div className="text-blue-100">
                    <p className="font-medium">
                      {booking.guest.firstName} {booking.guest.lastName}
                    </p>
                    <p className="text-sm">
                      Booking: {booking.bookingReferenceId}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Current Assignment */}
            {booking && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Current Assignment</h3>
                <div className="flex items-center text-blue-800">
                  <Home className="w-5 h-5 mr-2" />
                  <span>Room {booking.room.roomNumber} - {booking.roomType.name}</span>
                </div>
              </div>
            )}

            {/* Available Rooms */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Available Rooms ({availableRooms.length})
                </h3>
                <button
                  onClick={fetchAvailableRooms}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-600">Loading available rooms...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      whileHover={{ scale: 1.02 }}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedRoom?.id === room.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      {/* Room Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Room {room.roomNumber}
                          </h4>
                          <p className="text-sm text-gray-600">{room.roomType}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
                          {room.status}
                        </span>
                      </div>

                      {/* Room Rate */}
                      <div className="mb-3">
                        <p className="text-lg font-bold text-green-600">
                          ฿{parseFloat(room.baseRate).toLocaleString()}/night
                        </p>
                      </div>

                      {/* Amenities */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {getRoomAmenities().slice(0, 4).map((amenity, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <amenity.icon className="w-3 h-3 mr-1" />
                            {amenity.label}
                          </div>
                        ))}
                      </div>

                      {/* Selection Indicator */}
                      {selectedRoom?.id === room.id && (
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Selected
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && availableRooms.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Available Rooms
                  </h3>
                  <p className="text-gray-500">
                    No rooms of this type are currently available for the selected dates.
                  </p>
                </div>
              )}
            </div>

            {/* Assignment Reason */}
            {selectedRoom && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Reason (Optional)
                </label>
                <textarea
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value)}
                  placeholder="Enter reason for room assignment or change..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignRoom}
              disabled={!selectedRoom || loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Assign Room
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoomAssignmentModal;
