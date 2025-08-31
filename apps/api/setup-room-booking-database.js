// ============================================
// SETUP ROOM BOOKING DATABASE EXTENSIONS
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupRoomBookingDatabase() {
  console.log('🏨 Setting up Room Booking Database Extensions...\n');

  try {
    // 1. Create reference tables first
    console.log('📝 Creating reference tables...');
    
    // Guest Titles table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS guest_titles (
        title_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title_name VARCHAR(20) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE
      );
    `;

    // Contact Types table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS contact_types (
        contact_type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type_name VARCHAR(50) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE
      );
    `;

    // Identity Types table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS identity_types (
        identity_type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type_name VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE
      );
    `;

    // Payment Modes table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS payment_modes (
        payment_mode_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        mode_name VARCHAR(50) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE
      );
    `;

    console.log('✅ Reference tables created');

    // 2. Extend existing tables
    console.log('👤 Extending guests table...');
    
    const guestExtensions = [
      'ALTER TABLE guests ADD COLUMN IF NOT EXISTS title VARCHAR(20)',
      'ALTER TABLE guests ADD COLUMN IF NOT EXISTS father_name VARCHAR(100)',
      'ALTER TABLE guests ADD COLUMN IF NOT EXISTS occupation VARCHAR(100)',
      'ALTER TABLE guests ADD COLUMN IF NOT EXISTS anniversary DATE',
      'ALTER TABLE guests ADD COLUMN IF NOT EXISTS nationality VARCHAR(100)',
      'ALTER TABLE guests ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE',
      'ALTER TABLE guests ADD COLUMN IF NOT EXISTS customer_image_url VARCHAR(500)'
    ];

    for (const sql of guestExtensions) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (error) {
        console.log(`⚠️  Column might already exist: ${error.message.split('DETAIL:')[0]}`);
      }
    }

    console.log('📋 Extending bookings table...');
    
    const bookingExtensions = [
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrival_from VARCHAR(200)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS purpose_of_visit VARCHAR(200)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_remarks TEXT'
    ];

    for (const sql of bookingExtensions) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (error) {
        console.log(`⚠️  Column might already exist: ${error.message.split('DETAIL:')[0]}`);
      }
    }

    // 3. Create new relation tables
    console.log('📧 Creating guest contacts table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS guest_contacts (
        contact_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        guest_id UUID NOT NULL,
        contact_type VARCHAR(50),
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

    console.log('🆔 Creating guest identities table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS guest_identities (
        identity_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        guest_id UUID NOT NULL,
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

    console.log('💰 Creating booking payments table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS booking_payments (
        payment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        booking_id UUID NOT NULL UNIQUE,
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

    console.log('✅ All tables created');

    // 4. Populate reference data
    console.log('📝 Populating reference data...');
    
    // Guest titles
    const titles = ['Mr', 'Ms', 'Mrs', 'Dr', 'Engineer'];
    for (const title of titles) {
      await prisma.$executeRaw`
        INSERT INTO guest_titles (title_name) 
        VALUES (${title})
        ON CONFLICT (title_name) DO NOTHING;
      `;
    }

    // Contact types
    const contactTypes = ['Home', 'Personal', 'Official', 'Business'];
    for (const type of contactTypes) {
      await prisma.$executeRaw`
        INSERT INTO contact_types (type_name) 
        VALUES (${type})
        ON CONFLICT (type_name) DO NOTHING;
      `;
    }

    // Identity types
    const identityTypes = ['Passport', 'National ID Card', 'Driving License', 'Other Government ID'];
    for (const type of identityTypes) {
      await prisma.$executeRaw`
        INSERT INTO identity_types (type_name) 
        VALUES (${type})
        ON CONFLICT (type_name) DO NOTHING;
      `;
    }

    // Payment modes
    const paymentModes = ['Card Payment', 'Paypal', 'Cash Payment', 'Bank Payment'];
    for (const mode of paymentModes) {
      await prisma.$executeRaw`
        INSERT INTO payment_modes (mode_name) 
        VALUES (${mode})
        ON CONFLICT (mode_name) DO NOTHING;
      `;
    }

    console.log('✅ Reference data populated');

    // 5. Create indexes for performance
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

    console.log('✅ Indexes created');

    console.log('\n🎉 Room Booking Database Setup Complete!\n');
    console.log('📊 Database Ready for Room Booking Form:');
    console.log('✅ Guest Titles: Mr, Ms, Mrs, Dr, Engineer');
    console.log('✅ Contact Types: Home, Personal, Official, Business');
    console.log('✅ Identity Types: Passport, National ID Card, Driving License, Other');
    console.log('✅ Payment Modes: Card Payment, Paypal, Cash Payment, Bank Payment');
    console.log('✅ Extended Guest fields: title, father_name, occupation, nationality, is_vip');
    console.log('✅ Extended Booking fields: arrival_from, purpose_of_visit, booking_remarks');
    console.log('✅ New tables: guest_contacts, guest_identities, booking_payments');
    console.log('\n🏨 Admin Room Booking form can now use real database!');

  } catch (error) {
    console.error('❌ Error setting up room booking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
if (require.main === module) {
  setupRoomBookingDatabase();
}

module.exports = { setupRoomBookingDatabase };
