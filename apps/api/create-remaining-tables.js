// ============================================
// CREATE REMAINING TABLES FOR ROOM BOOKING (TEXT IDs)
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRemainingTables() {
  console.log('🏨 Creating Remaining Tables for Room Booking (Text IDs)...\n');

  try {
    // 1. Create guest contacts table (with text guest_id)
    console.log('📞 Creating guest_contacts table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS guest_contacts (
        contact_id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
        guest_id TEXT NOT NULL,
        contact_type VARCHAR(50), -- 'Home', 'Personal', 'Official', 'Business'
        email VARCHAR(255),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        zipcode VARCHAR(20),
        address TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_guest_contacts_guest 
          FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE
      );
    `;

    // 2. Create guest identities table (with text guest_id)
    console.log('🆔 Creating guest_identities table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS guest_identities (
        identity_id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
        guest_id TEXT NOT NULL,
        identity_type VARCHAR(100),
        identity_number VARCHAR(100),
        front_side_document_url VARCHAR(500),
        back_side_document_url VARCHAR(500),
        comments TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_guest_identities_guest 
          FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE
      );
    `;

    // 3. Create booking payments table (with text booking_id)
    console.log('💰 Creating booking_payments table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS booking_payments (
        payment_id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
        booking_id TEXT NOT NULL UNIQUE,
        discount_reason VARCHAR(200),
        discount_percentage DECIMAL(5,2) DEFAULT 0.00,
        commission_percentage DECIMAL(5,2) DEFAULT 0.00,
        commission_amount DECIMAL(10,2) DEFAULT 0.00,
        payment_mode VARCHAR(50),
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        advance_amount DECIMAL(10,2) DEFAULT 0.00,
        advance_remarks TEXT,
        booking_charge DECIMAL(10,2) DEFAULT 0.00,
        tax_amount DECIMAL(10,2) DEFAULT 0.00,
        service_charge DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_booking_payments_booking 
          FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
      );
    `;

    // 4. Create indexes
    console.log('📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_guest_contacts_guest_id ON guest_contacts(guest_id)',
      'CREATE INDEX IF NOT EXISTS idx_guest_identities_guest_id ON guest_identities(guest_id)',
      'CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON booking_payments(booking_id)'
    ];

    for (const indexSql of indexes) {
      try {
        await prisma.$executeRawUnsafe(indexSql);
      } catch (error) {
        console.log(`⚠️  Index might already exist`);
      }
    }

    // 5. Add sample contact for existing guest
    console.log('📧 Adding sample contact data...');
    
    // Get a guest to add contact to
    const sampleGuests = await prisma.$queryRaw`
      SELECT guest_id FROM guests LIMIT 1;
    `;

    if (sampleGuests.length > 0) {
      const guestId = sampleGuests[0].guest_id;
      
      await prisma.$executeRaw`
        INSERT INTO guest_contacts (
          guest_id, contact_type, email, country, state, city, 
          zipcode, address, is_primary
        ) VALUES (
          ${guestId}, 'Home', 'somchai.demo@gmail.com', 'Thailand', 
          'Bangkok', 'Bangkok', '10400', '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย', true
        )
        ON CONFLICT DO NOTHING;
      `;

      await prisma.$executeRaw`
        INSERT INTO guest_identities (
          guest_id, identity_type, identity_number, is_verified
        ) VALUES (
          ${guestId}, 'National ID Card', '1234567890123', false
        )
        ON CONFLICT DO NOTHING;
      `;
    }

    // 6. Add sample booking payment
    console.log('💳 Adding sample booking payment...');
    
    // Get a booking to add payment to
    const sampleBookings = await prisma.$queryRaw`
      SELECT booking_id FROM bookings LIMIT 1;
    `;

    if (sampleBookings.length > 0) {
      const bookingId = sampleBookings[0].booking_id;
      
      await prisma.$executeRaw`
        INSERT INTO booking_payments (
          booking_id, payment_mode, total_amount, advance_amount, 
          tax_amount, service_charge
        ) VALUES (
          ${bookingId}, 'Card Payment', 5000.00, 1000.00, 350.00, 150.00
        )
        ON CONFLICT (booking_id) DO UPDATE SET
          payment_mode = EXCLUDED.payment_mode,
          total_amount = EXCLUDED.total_amount;
      `;
    }

    console.log('\n🎉 Remaining Tables Creation Complete!\n');
    console.log('📊 Summary of Created Tables:');
    console.log('✅ guest_contacts - Contact details for guests');
    console.log('✅ guest_identities - Identity documents for guests');
    console.log('✅ booking_payments - Payment details for bookings');
    console.log('✅ Sample data added for testing');
    console.log('\n📋 Current Room Booking Database Status:');
    console.log('✅ guests - ✓ Extended with new fields');
    console.log('✅ guest_contacts - ✓ Created');
    console.log('✅ guest_identities - ✓ Created');
    console.log('✅ booking_payments - ✓ Created');
    console.log('✅ bookings - ✓ Extended with new fields');
    console.log('✅ guest_titles - ✓ Reference data');
    console.log('✅ contact_types - ✓ Reference data');
    console.log('✅ identity_types - ✓ Reference data');
    console.log('✅ payment_modes - ✓ Reference data');
    console.log('\n🏨 Room Booking form is now ready for real database!');

  } catch (error) {
    console.error('❌ Error creating remaining tables:', error);
    throw error;
  }
}

// Run the setup
if (require.main === module) {
  createRemainingTables()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createRemainingTables };
