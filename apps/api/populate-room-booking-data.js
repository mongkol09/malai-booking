// ============================================
// POPULATE SAMPLE DATA FOR ROOM BOOKING FORM
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateRoomBookingData() {
  console.log('🏨 Populating Room Booking Sample Data...\n');

  try {
    // 1. Add guest titles
    console.log('📝 Adding Guest Titles...');
    const titles = ['Mr', 'Ms', 'Mrs', 'Dr', 'Engineer'];
    for (const title of titles) {
      await prisma.$executeRaw`
        INSERT INTO guest_titles (title_name) 
        VALUES (${title})
        ON CONFLICT DO NOTHING;
      `;
    }
    console.log('✅ Guest titles added');

    // 2. Add contact types
    console.log('📞 Adding Contact Types...');
    const contactTypes = ['Home', 'Personal', 'Official', 'Business'];
    for (const type of contactTypes) {
      await prisma.$executeRaw`
        INSERT INTO contact_types (type_name) 
        VALUES (${type})
        ON CONFLICT DO NOTHING;
      `;
    }
    console.log('✅ Contact types added');

    // 3. Add identity types
    console.log('🆔 Adding Identity Types...');
    const identityTypes = ['Passport', 'National ID Card', 'Driving License', 'Other Government ID'];
    for (const type of identityTypes) {
      await prisma.$executeRaw`
        INSERT INTO identity_types (type_name) 
        VALUES (${type})
        ON CONFLICT DO NOTHING;
      `;
    }
    console.log('✅ Identity types added');

    // 4. Add payment modes
    console.log('💳 Adding Payment Modes...');
    const paymentModes = ['Card Payment', 'Paypal', 'Cash Payment', 'Bank Payment'];
    for (const mode of paymentModes) {
      await prisma.$executeRaw`
        INSERT INTO payment_modes (mode_name) 
        VALUES (${mode})
        ON CONFLICT DO NOTHING;
      `;
    }
    console.log('✅ Payment modes added');

    // 5. Check if guests table needs the new columns
    console.log('👤 Checking Guest table structure...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE guests ADD COLUMN IF NOT EXISTS title VARCHAR(20);
      `;
      await prisma.$executeRaw`
        ALTER TABLE guests ADD COLUMN IF NOT EXISTS father_name VARCHAR(100);
      `;
      await prisma.$executeRaw`
        ALTER TABLE guests ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);
      `;
      await prisma.$executeRaw`
        ALTER TABLE guests ADD COLUMN IF NOT EXISTS anniversary DATE;
      `;
      await prisma.$executeRaw`
        ALTER TABLE guests ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
      `;
      await prisma.$executeRaw`
        ALTER TABLE guests ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;
      `;
      await prisma.$executeRaw`
        ALTER TABLE guests ADD COLUMN IF NOT EXISTS customer_image_url VARCHAR(500);
      `;
      console.log('✅ Guest table columns updated');
    } catch (error) {
      console.log('⚠️  Guest table already has extended columns or update failed:', error.message);
    }

    // 6. Check if bookings table needs the new columns
    console.log('📋 Checking Booking table structure...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrival_from VARCHAR(200);
      `;
      await prisma.$executeRaw`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS purpose_of_visit VARCHAR(200);
      `;
      await prisma.$executeRaw`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_remarks TEXT;
      `;
      console.log('✅ Booking table columns updated');
    } catch (error) {
      console.log('⚠️  Booking table already has extended columns or update failed:', error.message);
    }

    // 7. Create guest_contacts table if not exists
    console.log('📧 Creating Guest Contacts table...');
    try {
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
          FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE
        );
      `;
      console.log('✅ Guest contacts table created');
    } catch (error) {
      console.log('⚠️  Guest contacts table already exists or creation failed');
    }

    // 8. Create guest_identities table if not exists
    console.log('🆔 Creating Guest Identities table...');
    try {
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
          FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE
        );
      `;
      console.log('✅ Guest identities table created');
    } catch (error) {
      console.log('⚠️  Guest identities table already exists or creation failed');
    }

    // 9. Create booking_payments table if not exists
    console.log('💰 Creating Booking Payments table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS booking_payments (
          payment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          booking_id UUID NOT NULL,
          discount_reason VARCHAR(200),
          discount_percentage DECIMAL(5,2) DEFAULT 0.00,
          commission_percentage DECIMAL(5,2) DEFAULT 0.00,
          commission_amount DECIMAL(10,2) DEFAULT 0.00,
          payment_mode VARCHAR(50),
          total_amount DECIMAL(10,2) NOT NULL,
          advance_amount DECIMAL(10,2) DEFAULT 0.00,
          advance_remarks TEXT,
          booking_charge DECIMAL(10,2) DEFAULT 0.00,
          tax_amount DECIMAL(10,2) DEFAULT 0.00,
          service_charge DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
        );
      `;
      console.log('✅ Booking payments table created');
    } catch (error) {
      console.log('⚠️  Booking payments table already exists or creation failed');
    }

    // 10. Add sample guest with extended data
    console.log('👨‍💼 Adding sample guest with extended details...');
    try {
      const sampleGuest = await prisma.$executeRaw`
        INSERT INTO guests (
          first_name, last_name, email, phone_number, country,
          title, father_name, occupation, nationality, is_vip
        ) VALUES (
          'สมชาย', 'ใจดี', 'somchai.demo@gmail.com', '081-234-5678', 'Thailand',
          'Mr', 'สมศักดิ์ ใจดี', 'นักธุรกิจ', 'Thai', FALSE
        )
        ON CONFLICT (email) DO UPDATE SET
          title = EXCLUDED.title,
          father_name = EXCLUDED.father_name,
          occupation = EXCLUDED.occupation,
          nationality = EXCLUDED.nationality
        RETURNING guest_id;
      `;
      console.log('✅ Sample guest added with extended details');
    } catch (error) {
      console.log('⚠️  Sample guest creation failed:', error.message);
    }

    console.log('\n🎉 Room Booking Data Population Complete!');
    console.log('\n📊 Summary of Available Data:');
    console.log('✅ Guest Titles: Mr, Ms, Mrs, Dr, Engineer');
    console.log('✅ Contact Types: Home, Personal, Official, Business');
    console.log('✅ Identity Types: Passport, National ID Card, Driving License, Other');
    console.log('✅ Payment Modes: Card Payment, Paypal, Cash Payment, Bank Payment');
    console.log('✅ Extended Guest fields: title, father_name, occupation, nationality, is_vip');
    console.log('✅ Extended Booking fields: arrival_from, purpose_of_visit, booking_remarks');
    console.log('✅ New tables: guest_contacts, guest_identities, booking_payments');

  } catch (error) {
    console.error('❌ Error populating room booking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the population script
if (require.main === module) {
  populateRoomBookingData();
}

module.exports = { populateRoomBookingData };
