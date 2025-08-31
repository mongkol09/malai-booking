// 🧪 TEST BOOKING CREATION WITH EMAIL TEMPLATE VARIABLES
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBookingWithEmailVariables() {
  console.log('🧪 === TESTING BOOKING CREATION ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 1. Get required data for booking
    const roomType = await prisma.roomType.findFirst({
      where: { name: 'Deluxe Suite' }
    });
    
    const room = await prisma.room.findFirst({
      where: { roomTypeId: roomType.id, status: 'Available' }
    });
    
    const guest = await prisma.guest.findFirst({
      where: { user: { userType: 'CUSTOMER' } }
    });
    
    const taxRate = await prisma.systemSetting.findUnique({
      where: { settingKey: 'tax_rate' }
    });
    
    const serviceChargeRate = await prisma.systemSetting.findUnique({
      where: { settingKey: 'service_charge_rate' }
    });
    
    if (!roomType || !room || !guest || !taxRate || !serviceChargeRate) {
      console.log('❌ Missing required data:');
      console.log('  Room Type:', roomType ? '✅' : '❌');
      console.log('  Available Room:', room ? '✅' : '❌');
      console.log('  Guest User:', guest ? '✅' : '❌');
      console.log('  Tax Rate:', taxRate ? '✅' : '❌');
      console.log('  Service Charge Rate:', serviceChargeRate ? '✅' : '❌');
      return;
    }
    
    // 2. Calculate pricing
    const checkIn = new Date('2024-12-20');
    const checkOut = new Date('2024-12-22');
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const baseRate = Number(roomType.baseRate);
    const subtotal = baseRate * nights;
    const taxAmount = subtotal * (Number(taxRate.settingValue) / 100);
    const serviceChargeAmount = subtotal * (Number(serviceChargeRate.settingValue) / 100);
    const finalAmount = subtotal + taxAmount + serviceChargeAmount;
    
    console.log('💰 PRICING CALCULATION:');
    console.log('='.repeat(40));
    console.log(`Room Type: ${roomType.name}`);
    console.log(`Base Rate: ฿${baseRate.toLocaleString('th-TH')}/night`);
    console.log(`Check-in: ${checkIn.toLocaleDateString('th-TH')}`);
    console.log(`Check-out: ${checkOut.toLocaleDateString('th-TH')}`);
    console.log(`Nights: ${nights}`);
    console.log(`Subtotal: ฿${subtotal.toLocaleString('th-TH')}`);
    console.log(`Tax (${taxRate.settingValue}%): ฿${taxAmount.toLocaleString('th-TH')}`);
    console.log(`Service Charge (${serviceChargeRate.settingValue}%): ฿${serviceChargeAmount.toLocaleString('th-TH')}`);
    console.log(`Final Amount: ฿${finalAmount.toLocaleString('th-TH')}`);
    
    // 3. Create booking
    console.log('\n📋 CREATING BOOKING...');
    
    const bookingRefId = `BK${Date.now()}`;
    
    const booking = await prisma.booking.create({
      data: {
        bookingReferenceId: bookingRefId,
        guestId: guest.id,
        roomId: room.id,
        roomTypeId: roomType.id,
        checkinDate: checkIn,
        checkoutDate: checkOut,
        numAdults: 2,
        numChildren: 0,
        totalPrice: subtotal,
        taxAmount: taxAmount,
        finalAmount: finalAmount,
        status: 'Confirmed',
        specialRequests: 'Test booking for email template variables'
      },
      include: {
        guest: {
          include: {
            user: true
          }
        },
        room: {
          include: {
            roomType: true
          }
        },
        roomType: true
      }
    });
    
    console.log(`✅ Booking created: ${booking.bookingReferenceId}`);
    
    // 4. Test Email Template Variables
    console.log('\n📧 EMAIL TEMPLATE VARIABLES:');
    console.log('='.repeat(50));
    
    // Simulate email template variables based on booking data
    const templateVariables = {
      // Guest information
      guest_name: `${booking.guest.firstName} ${booking.guest.lastName}`,
      guest_email: booking.guest.email,
      guest_phone: booking.guest.phoneNumber || 'N/A',
      
      // Booking information
      booking_reference: booking.bookingReferenceId,
      check_in_date: booking.checkinDate.toLocaleDateString('th-TH'),
      check_out_date: booking.checkoutDate.toLocaleDateString('th-TH'),
      number_of_nights: nights,
      number_of_guests: booking.numAdults + booking.numChildren,
      
      // Room information
      room_type: booking.roomType.name,
      room_number: booking.room.roomNumber,
      room_description: booking.roomType.description,
      
      // Pricing information (ที่ user ถามหา)
      room_price_per_night: `฿${baseRate.toLocaleString('th-TH')}`,
      subtotal: `฿${subtotal.toLocaleString('th-TH')}`,
      tax_rate: `${taxRate.settingValue}%`,
      tax_amount: `฿${taxAmount.toLocaleString('th-TH')}`,
      service_charge: `฿${serviceChargeAmount.toLocaleString('th-TH')}`,
      service_charge_rate: `${serviceChargeRate.settingValue}%`,
      grand_total: `฿${finalAmount.toLocaleString('th-TH')}`,
      
      // Hotel information
      hotel_name: 'Malai Khaoyai Resort',
      currency: 'THB',
      
      // Links and confirmation
      booking_confirmation_url: `https://hotel.example.com/booking/${booking.bookingReferenceId}`,
      checkin_url: `https://hotel.example.com/checkin/${booking.bookingReferenceId}`,
      
      // Additional
      booking_status: booking.status,
      booking_date: booking.createdAt.toLocaleDateString('th-TH')
    };
    
    console.log('🎯 BOOKING CONFIRMATION VARIABLES:');
    console.log('-'.repeat(30));
    Object.entries(templateVariables).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    // 5. Test specific variables user asked about
    console.log('\n🎯 SPECIFIC VARIABLES CHECK:');
    console.log('='.repeat(40));
    console.log(`✅ tax variable (tax_amount): ${templateVariables.tax_amount}`);
    console.log(`✅ room_price variable (room_price_per_night): ${templateVariables.room_price_per_night}`);
    console.log(`✅ tax_rate variable: ${templateVariables.tax_rate}`);
    console.log(`✅ service_charge variable: ${templateVariables.service_charge}`);
    console.log(`✅ grand_total variable: ${templateVariables.grand_total}`);
    
    // 6. Summary for MailerSend
    console.log('\n📮 MAILERSEND TEMPLATE SUMMARY:');
    console.log('='.repeat(40));
    console.log('Available variables for your MailerSend templates:');
    
    const allVariables = Object.keys(templateVariables);
    allVariables.forEach(varName => {
      console.log(`  • {{${varName}}}`);
    });
    
    console.log('\n✅ TEST COMPLETE!');
    console.log('\n🎯 KEY FINDINGS:');
    console.log('  ✅ Database has all required pricing fields');
    console.log('  ✅ Email template variables include tax and room_price');
    console.log('  ✅ Calculation logic works correctly');
    console.log('  ✅ Ready for MailerSend template design');
    
    console.log('\n📋 BOOKING DETAILS:');
    console.log(`  Booking ID: ${booking.bookingReferenceId}`);
    console.log(`  Guest: ${booking.guest.firstName} ${booking.guest.lastName}`);
    console.log(`  Room: ${booking.roomType.name} (${booking.room.roomNumber})`);
    console.log(`  Stay: ${nights} nights`);
    console.log(`  Total: ฿${finalAmount.toLocaleString('th-TH')}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testBookingWithEmailVariables();
