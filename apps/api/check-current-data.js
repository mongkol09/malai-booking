const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('=== CURRENT DATA ANALYSIS ===\n');

    // Check data counts
    const paymentCount = await prisma.payment.count();
    const bookingCount = await prisma.booking.count();
    const webhookCount = await prisma.webhookEvent.count();
    const guestCount = await prisma.guest.count();
    const userCount = await prisma.user.count();

    console.log('📊 DATA COUNTS:');
    console.log(`├── Payments: ${paymentCount}`);
    console.log(`├── Bookings: ${bookingCount}`);  
    console.log(`├── Webhook Events: ${webhookCount}`);
    console.log(`├── Guests: ${guestCount}`);
    console.log(`└── Users: ${userCount}\n`);

    // Check payment data structure (if any exists)
    if (paymentCount > 0) {
      const samplePayment = await prisma.payment.findFirst({
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          omiseChargeId: true,
          paymentMethodType: true,
          createdAt: true,
          gatewayResponse: true
        }
      });

      console.log('💳 SAMPLE PAYMENT DATA:');
      console.log('ID:', samplePayment.id);
      console.log('Amount:', samplePayment.amount);
      console.log('Currency:', samplePayment.currency);
      console.log('Status:', samplePayment.status);
      console.log('Omise Charge ID:', samplePayment.omiseChargeId || 'NULL');
      console.log('Payment Type:', samplePayment.paymentMethodType || 'NULL');
      console.log('Gateway Response:', samplePayment.gatewayResponse ? 'EXISTS' : 'NULL');
      console.log('Created:', samplePayment.createdAt);
    }

    // Check booking data structure (if any exists)
    if (bookingCount > 0) {
      const sampleBooking = await prisma.booking.findFirst({
        select: {
          id: true,
          bookingReferenceId: true,
          status: true,
          finalAmount: true,
          createdAt: true
        }
      });

      console.log('\n🏨 SAMPLE BOOKING DATA:');
      console.log('ID:', sampleBooking.id);
      console.log('Reference:', sampleBooking.bookingReferenceId);
      console.log('Status:', sampleBooking.status);
      console.log('Amount:', sampleBooking.finalAmount);
      console.log('Created:', sampleBooking.createdAt);
    }

    // Security check - what fields exist in Payment table
    console.log('\n🔍 PAYMENT SCHEMA ANALYSIS:');
    const paymentFields = Object.keys((await prisma.payment.findFirst()) || {});
    console.log('Available fields:', paymentFields.length > 0 ? paymentFields.join(', ') : 'No data to analyze');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n🔌 Database connection issue. Check:');
      console.log('- PostgreSQL is running');
      console.log('- Connection string in .env');
      console.log('- Database exists');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();
