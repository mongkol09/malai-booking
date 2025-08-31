// ============================================
// CREATE COMPLETE GUEST TABLE FOR ROOM BOOKING
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createGuestTables() {
  console.log('🏨 Creating Complete Guest Tables for Room Booking...\n');

  try {
    // 1. Create main guests table with all required fields
    console.log('👤 Creating guests table with extended fields...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS guests (
        guest_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID UNIQUE,
        
        -- Basic Information
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20),
        country VARCHAR(100),
        id_number VARCHAR(100),
        date_of_birth DATE,
        gender VARCHAR(20),
        
        -- Extended Guest Details for Room Booking Form
        title VARCHAR(20), -- Mr, Ms, Mrs, Dr, Engineer
        father_name VARCHAR(100),
        occupation VARCHAR(100),
        anniversary DATE,
        nationality VARCHAR(100),
        is_vip BOOLEAN DEFAULT FALSE,
        customer_image_url VARCHAR(500),
        
        -- Metadata
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Foreign key constraint (if users table exists)
        CONSTRAINT fk_guest_user 
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      );
    `;

    // 2. Create contact details table
    console.log('📞 Creating guest contacts table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS guest_contacts (
        contact_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        guest_id UUID NOT NULL,
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

    // 3. Create identity details table
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

    // 4. Create booking payments table
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

    // 5. Extend bookings table
    console.log('📋 Extending bookings table...');
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
    } catch (error) {
      console.log('⚠️  Booking table extensions might already exist');
    }

    // 6. Create reference tables
    console.log('📝 Creating reference tables...');
    
    const referenceTables = [
      `CREATE TABLE IF NOT EXISTS guest_titles (
        title_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title_name VARCHAR(20) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE
      )`,
      `CREATE TABLE IF NOT EXISTS contact_types (
        contact_type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type_name VARCHAR(50) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE
      )`,
      `CREATE TABLE IF NOT EXISTS identity_types (
        identity_type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type_name VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE
      )`,
      `CREATE TABLE IF NOT EXISTS payment_modes (
        payment_mode_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        mode_name VARCHAR(50) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE
      )`
    ];

    for (const sql of referenceTables) {
      await prisma.$executeRawUnsafe(sql);
    }

    // 7. Create indexes
    console.log('📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email)',
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

    // 8. Populate reference data
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

    // 9. Add sample guest
    console.log('👨‍💼 Adding sample guest data...');
    await prisma.$executeRaw`
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
        nationality = EXCLUDED.nationality;
    `;

    console.log('\n🎉 Guest Tables Creation Complete!\n');
    console.log('📊 Summary of Created Tables:');
    console.log('✅ guests - Main guest table with extended fields');
    console.log('✅ guest_contacts - Contact details');
    console.log('✅ guest_identities - Identity documents');
    console.log('✅ booking_payments - Payment details');
    console.log('✅ guest_titles - Title reference data');
    console.log('✅ contact_types - Contact type reference data');
    console.log('✅ identity_types - Identity type reference data');
    console.log('✅ payment_modes - Payment mode reference data');
    console.log('\n🏨 Room Booking form can now use complete database!');

  } catch (error) {
    console.error('❌ Error creating guest tables:', error);
    throw error;
  }
}

// Run the setup
if (require.main === module) {
  createGuestTables()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createGuestTables };
