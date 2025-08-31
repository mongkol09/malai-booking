  /**
   * Create new booking - FIXED VERSION WITH NESTED STRUCTURE
   */
  async createBooking(bookingData) {
    try {
      console.log('📝 Creating new booking via ApiService...');
      console.log('📋 Input booking data:', bookingData);
      
      // Transform data to match simpleBookingController expectations
      const apiData = {
        guestData: {
          name: `${bookingData.guestFirstName || ''} ${bookingData.guestLastName || ''}`.trim(),
          email: bookingData.guestEmail || '',
          phone: bookingData.guestPhone || '',
          nationality: bookingData.guestNationality || 'Thai',
          address: bookingData.guestAddress || '',
          city: bookingData.guestCity || '',
          country: bookingData.guestCountry || 'Thailand',
          zipCode: bookingData.guestZipCode || '',
          idType: bookingData.guestIdType || '',
          idNumber: bookingData.guestIdNumber || '',
          dateOfBirth: bookingData.guestDateOfBirth || null
        },
        roomData: {
          type: bookingData.roomTypeId || '',
          number: bookingData.roomId || '',
          guests: parseInt(bookingData.adults) || 1,
          children: parseInt(bookingData.children) || 0,
          preferences: bookingData.remarks || ''
        },
        dates: {
          checkIn: bookingData.checkInDate,
          checkOut: bookingData.checkOutDate,
          arrivalFrom: bookingData.arrivalFrom || ''
        },
        pricing: {
          total: parseFloat(bookingData.totalAmount) || 0,
          currency: 'THB',
          breakdown: {
            roomRate: parseFloat(bookingData.totalAmount) || 0,
            taxes: 0,
            fees: 0
          }
        },
        specialRequests: bookingData.remarks || '',
        source: 'admin_panel',
        paymentMethod: bookingData.paymentMethod || 'Cash',
        status: 'confirmed'
      };

      console.log('📋 Transformed booking data:', apiData);
      
      const response = await apiService.post('/bookings', apiData);
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      throw error;
    }
  },

};
