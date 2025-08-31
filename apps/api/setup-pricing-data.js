// 🏗️ SETUP PRICING DATA FOR EMAIL TEMPLATE TESTING
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupPricingData() {
  console.log('🏗️ === SETTING UP PRICING DATA ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 1. Create System Settings for Tax & Service Charge
    console.log('⚙️ 1. Creating System Settings...');
    
    const systemSettings = [
      {
        settingKey: 'tax_rate',
        settingValue: '7.00',
        dataType: 'DECIMAL',
        description: 'Default tax rate percentage',
        category: 'FINANCIAL'
      },
      {
        settingKey: 'service_charge_rate',
        settingValue: '10.00',
        dataType: 'DECIMAL',
        description: 'Service charge percentage',
        category: 'FINANCIAL'
      },
      {
        settingKey: 'hotel_name',
        settingValue: 'Malai Khaoyai Resort',
        dataType: 'STRING',
        description: 'Hotel name for documents',
        category: 'GENERAL'
      },
      {
        settingKey: 'default_currency',
        settingValue: 'THB',
        dataType: 'STRING',
        description: 'Default currency code',
        category: 'FINANCIAL'
      }
    ];
    
    for (const setting of systemSettings) {
      try {
        const existing = await prisma.systemSetting.findUnique({
          where: { settingKey: setting.settingKey }
        });
        
        if (existing) {
          await prisma.systemSetting.update({
            where: { settingKey: setting.settingKey },
            data: setting
          });
          console.log(`  ✅ Updated: ${setting.settingKey} = ${setting.settingValue}`);
        } else {
          await prisma.systemSetting.create({ data: setting });
          console.log(`  ➕ Created: ${setting.settingKey} = ${setting.settingValue}`);
        }
      } catch (error) {
        console.log(`  ❌ Error with ${setting.settingKey}:`, error.message);
      }
    }
    
    // 2. Create Room Types with Base Rates
    console.log('\n🏠 2. Creating Room Types...');
    
    const roomTypes = [
      {
        name: 'Standard Room',
        description: 'Comfortable standard room with essential amenities',
        baseRate: 1500.00,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 25.0,
        bedType: 'Queen Bed',
        amenities: ['Air Conditioning', 'Free WiFi', 'TV', 'Minibar']
      },
      {
        name: 'Deluxe Suite',
        description: 'Spacious deluxe suite with premium amenities and city view',
        baseRate: 2500.00,
        capacityAdults: 2,
        capacityChildren: 2,
        sizeSqm: 45.0,
        bedType: 'King Bed',
        amenities: ['Air Conditioning', 'Free WiFi', 'Smart TV', 'Minibar', 'Coffee Machine', 'City View']
      },
      {
        name: 'Premium Villa',
        description: 'Luxury villa with private pool and garden view',
        baseRate: 4500.00,
        capacityAdults: 4,
        capacityChildren: 2,
        sizeSqm: 80.0,
        bedType: 'King Bed + Sofa Bed',
        amenities: ['Private Pool', 'Garden View', 'Free WiFi', 'Smart TV', 'Kitchen', 'Balcony']
      },
      {
        name: 'Grand Serenity',
        description: 'Ultimate luxury suite with panoramic mountain view',
        baseRate: 6000.00,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 60.0,
        bedType: 'King Bed',
        amenities: ['Mountain View', 'Jacuzzi', 'Free WiFi', 'Smart TV', 'Premium Minibar', 'Butler Service']
      }
    ];
    
    for (const roomType of roomTypes) {
      try {
        const existing = await prisma.roomType.findFirst({
          where: { name: roomType.name }
        });
        
        if (existing) {
          await prisma.roomType.update({
            where: { id: existing.id },
            data: roomType
          });
          console.log(`  ✅ Updated: ${roomType.name} - ฿${roomType.baseRate.toLocaleString('th-TH')}/night`);
        } else {
          const created = await prisma.roomType.create({ data: roomType });
          console.log(`  ➕ Created: ${roomType.name} - ฿${roomType.baseRate.toLocaleString('th-TH')}/night`);
        }
      } catch (error) {
        console.log(`  ❌ Error with ${roomType.name}:`, error.message);
      }
    }
    
    // 3. Create Sample Rooms
    console.log('\n🚪 3. Creating Sample Rooms...');
    
    const roomTypesList = await prisma.roomType.findMany();
    const sampleRooms = [];
    
    // Create 2 rooms for each room type
    roomTypesList.forEach((roomType, index) => {
      for (let i = 1; i <= 2; i++) {
        const roomNumber = `${String.fromCharCode(65 + index)}${i}`; // A1, A2, B1, B2, etc.
        sampleRooms.push({
          roomNumber,
          roomTypeId: roomType.id,
          status: 'Available'
        });
      }
    });
    
    for (const room of sampleRooms) {
      try {
        const existing = await prisma.room.findUnique({
          where: { roomNumber: room.roomNumber }
        });
        
        if (!existing) {
          await prisma.room.create({ data: room });
          console.log(`  ➕ Created room: ${room.roomNumber}`);
        } else {
          console.log(`  ✅ Room exists: ${room.roomNumber}`);
        }
      } catch (error) {
        console.log(`  ❌ Error with room ${room.roomNumber}:`, error.message);
      }
    }
    
    // 4. Verify Setup
    console.log('\n🔍 4. Verification...');
    
    const settingsCount = await prisma.systemSetting.count();
    const roomTypesCount = await prisma.roomType.count();
    const roomsCount = await prisma.room.count();
    
    console.log(`  ✅ System Settings: ${settingsCount} records`);
    console.log(`  ✅ Room Types: ${roomTypesCount} types`);
    console.log(`  ✅ Rooms: ${roomsCount} rooms`);
    
    // Show sample pricing calculation
    console.log('\n🧮 5. Sample Pricing Calculation:');
    console.log('='.repeat(50));
    
    const taxRate = await prisma.systemSetting.findUnique({
      where: { settingKey: 'tax_rate' }
    });
    const serviceChargeRate = await prisma.systemSetting.findUnique({
      where: { settingKey: 'service_charge_rate' }
    });
    
    const sampleRoomType = await prisma.roomType.findFirst();
    
    if (sampleRoomType && taxRate && serviceChargeRate) {
      const nights = 2;
      const baseRate = Number(sampleRoomType.baseRate);
      const subtotal = baseRate * nights;
      const tax = subtotal * (Number(taxRate.settingValue) / 100);
      const serviceCharge = subtotal * (Number(serviceChargeRate.settingValue) / 100);
      const total = subtotal + tax + serviceCharge;
      
      console.log(`Room Type: ${sampleRoomType.name}`);
      console.log(`Base Rate: ฿${baseRate.toLocaleString('th-TH')}/night`);
      console.log(`Nights: ${nights}`);
      console.log(`Subtotal: ฿${subtotal.toLocaleString('th-TH')}`);
      console.log(`Tax (${taxRate.settingValue}%): ฿${tax.toLocaleString('th-TH')}`);
      console.log(`Service Charge (${serviceChargeRate.settingValue}%): ฿${serviceCharge.toLocaleString('th-TH')}`);
      console.log(`Grand Total: ฿${total.toLocaleString('th-TH')}`);
    }
    
    console.log('\n✅ PRICING DATA SETUP COMPLETE!');
    console.log('\n🎯 Next Steps:');
    console.log('  1. ✅ System settings configured');
    console.log('  2. ✅ Room types with base rates ready');
    console.log('  3. ✅ Sample rooms created');
    console.log('  4. 📧 Email template variables ready to use');
    console.log('  5. 🧪 Test booking creation with proper calculations');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupPricingData();
