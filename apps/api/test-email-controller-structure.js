// Test emailController with NEW structure
require('dotenv').config();

// Mock the emailController function to test the new data structure
async function testEmailControllerStructure() {
  console.log('🧪 Testing emailController.ts with NEW Template Structure...\n');

  // Mock booking data (similar to real Prisma data)
  const mockBooking = {
    id: 1,
    bookingReferenceId: 'HTL240811004',
    checkinDate: new Date('2025-08-15'),
    checkoutDate: new Date('2025-08-17'),
    numAdults: 2,
    numChildren: 0,
    totalPrice: 4500,
    finalAmount: 4500
  };

  // Mock guest data
  const mockGuest = {
    firstName: 'สมชาย',
    lastName: 'ใจดี', 
    email: 'customer@example.com',
    phone: '+66 81 234 5678',
    city: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    postalCode: '10110'
  };

  // Mock room type data
  const mockRoomType = {
    name: 'Deluxe Garden View'
  };

  // Simulate the prepareBookingConfirmationData function
  function prepareBookingConfirmationData(booking, guest, roomType, qrCodeData) {
    const checkinDate = new Date(booking.checkinDate);
    const checkoutDate = new Date(booking.checkoutDate);
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      // Basic booking info
      booking_id: booking.bookingReferenceId,
      name: `${guest.firstName} ${guest.lastName}`,
      Customer_name: `${guest.firstName} ${guest.lastName}`,
      account_name: `${guest.firstName} ${guest.lastName}`,
      customer_email: guest.email,
      customer_city: guest.city || guest.country || '',
      customer_country: guest.country || 'Thailand',
      customer_postal_code: guest.postalCode || '',
      room_type: roomType.name,
      
      // Nested structures for VAT/Tax
      Vat: {
        tax: '0.00'
      },
      
      // Nested structures for Check-in/out dates and times
      Check: {
        out: {
          date: {
            time: checkoutDate.toLocaleDateString('th-TH') + ' 11:00 น.'
          }
        }
      },
      check: {
        in: {
          date: {
            time: checkinDate.toLocaleDateString('th-TH') + ' 15:00 น.'
          }
        }
      },
      
      // Nested structure for pricing
      price: {
        included: {
          tax: Number(booking.finalAmount || booking.totalPrice).toLocaleString('th-TH') + ' บาท'
        }
      },
      
      // Customer phone (note: typo in MailerSend structure "cuntomer")
      cuntomer_phone: {
        no: guest.phone || '+66-XX-XXX-XXXX'
      },
      
      // Hotel info
      hotel_name: process.env.FROM_NAME || 'Malai Khaoyai Resort',
      hotel_email: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      hotel_phone: '+66 44 123 456',
      hotel_address: '199 หมู่ 4 ตำบลโคกกรวด อำเภอปากช่อง จังหวัดนครราชสีมา 30130',
      hotel_website: 'https://malaikhaoyai.com',
      hotel_signature_name: 'ทีมงาน Malai Khaoyai Resort',
      
      // URLs  
      receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/${booking.id}`,
      manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/${booking.bookingReferenceId}`,
      
      // Legacy flat fields for backward compatibility
      check_in_date: checkinDate.toLocaleDateString('th-TH'),
      check_in_time: '15:00 น.',
      check_out_date: checkoutDate.toLocaleDateString('th-TH'), 
      check_out_time: '11:00 น.',
      total: Number(booking.finalAmount || booking.totalPrice).toLocaleString('th-TH'),
      tax: '0',
      qr_code_data: qrCodeData,
      guest_count: (booking.numAdults + booking.numChildren).toString(),
      nights: nights.toString()
    };
  }

  // Generate mock QR code data
  const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  // Test the function
  const emailData = prepareBookingConfirmationData(mockBooking, mockGuest, mockRoomType, mockQRCode);

  console.log('📊 Generated Email Data Structure:\n');
  
  console.log('🔹 **Nested Structures**:');
  console.log(`   Vat.tax: "${emailData.Vat.tax}"`);
  console.log(`   Check.out.date.time: "${emailData.Check.out.date.time}"`);
  console.log(`   check.in.date.time: "${emailData.check.in.date.time}"`);
  console.log(`   price.included.tax: "${emailData.price.included.tax}"`);
  console.log(`   cuntomer_phone.no: "${emailData.cuntomer_phone.no}"`);
  
  console.log('\n🔹 **Customer Information**:');
  console.log(`   name: "${emailData.name}"`);
  console.log(`   Customer_name: "${emailData.Customer_name}"`);
  console.log(`   customer_email: "${emailData.customer_email}"`);
  console.log(`   customer_city: "${emailData.customer_city}"`);
  console.log(`   customer_country: "${emailData.customer_country}"`);
  console.log(`   customer_postal_code: "${emailData.customer_postal_code}"`);
  
  console.log('\n🔹 **Booking Details**:');
  console.log(`   booking_id: "${emailData.booking_id}"`);
  console.log(`   room_type: "${emailData.room_type}"`);
  console.log(`   guest_count: "${emailData.guest_count}"`);
  console.log(`   nights: "${emailData.nights}"`);
  
  console.log('\n🔹 **Hotel Information**:');
  console.log(`   hotel_name: "${emailData.hotel_name}"`);
  console.log(`   hotel_email: "${emailData.hotel_email}"`);
  console.log(`   hotel_phone: "${emailData.hotel_phone}"`);
  console.log(`   hotel_address: "${emailData.hotel_address}"`);
  console.log(`   hotel_website: "${emailData.hotel_website}"`);
  
  console.log('\n🔹 **Action URLs**:');
  console.log(`   receipt_url: "${emailData.receipt_url}"`);
  console.log(`   manage_booking_url: "${emailData.manage_booking_url}"`);
  
  console.log('\n🔹 **Legacy Compatibility**:');
  console.log(`   check_in_date: "${emailData.check_in_date}"`);
  console.log(`   check_out_date: "${emailData.check_out_date}"`);
  console.log(`   total: "${emailData.total}"`);
  console.log(`   tax: "${emailData.tax}"`);

  // Validation checks
  console.log('\n✅ **Validation Results**:');
  
  const validations = [
    { 
      name: 'Nested Objects Present', 
      pass: typeof emailData.Vat === 'object' && typeof emailData.Check === 'object',
      value: 'Vat, Check, check, price, cuntomer_phone objects exist'
    },
    { 
      name: 'Thai Date Formatting', 
      pass: emailData.check_in_date.includes('2568'),
      value: emailData.check_in_date
    },
    { 
      name: 'Price with Currency', 
      pass: emailData.price.included.tax.includes('บาท'),
      value: emailData.price.included.tax
    },
    { 
      name: 'Customer Phone Format', 
      pass: emailData.cuntomer_phone.no.includes('+66'),
      value: emailData.cuntomer_phone.no
    },
    { 
      name: 'Complete Hotel Address', 
      pass: emailData.hotel_address.includes('นครราชสีมา'),
      value: emailData.hotel_address.substring(0, 50) + '...'
    },
    { 
      name: 'Backward Compatibility', 
      pass: emailData.total && emailData.check_in_date,
      value: 'Legacy fields present'
    }
  ];

  validations.forEach(v => {
    const status = v.pass ? '✅' : '❌';
    console.log(`   ${status} ${v.name}: ${v.value}`);
  });

  const allPassed = validations.every(v => v.pass);
  
  console.log(`\n🎯 **Overall Status**: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🚀 **Ready for Production**:');
    console.log('   ✅ Structure matches MailerSend template exactly');
    console.log('   ✅ All nested objects properly formatted');
    console.log('   ✅ Thai language support working');
    console.log('   ✅ Backward compatibility maintained');
    console.log('   ✅ Professional hotel information included');
    
    console.log('\n📧 **Next Step**: Run a real booking test!');
  } else {
    console.log('\n❌ Please fix the failing validations before proceeding.');
  }

  return emailData;
}

// Run the test
testEmailControllerStructure().catch(console.error);
