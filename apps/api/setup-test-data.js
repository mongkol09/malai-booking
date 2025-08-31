// Create test rooms and booking data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestData() {
  console.log('🏗️  Setting up test data...\n');
  
  try {
    // Check existing rooms
    const existingRooms = await prisma.room.count();
    console.log(`📊 Existing rooms: ${existingRooms}`);
    
    if (existingRooms === 0) {
      console.log('🏠 Creating test room type and rooms...');
      
      // Create room type
      const roomType = await prisma.roomType.create({
        data: {
          name: 'Standard Room',
          description: 'ห้องพักสำหรับ 2 ท่าน พร้อมสิ่งอำนวยความสะดวกครบครัน',
          baseRate: 1500.00,
          capacityAdults: 2,
          capacityChildren: 1,
          amenities: ['WiFi', 'แอร์', 'ทีวี', 'ตู้เซฟ'],
          isActive: true
        }
      });
      
      console.log('✅ Room type created:', roomType.id);
      
      // Create 3 rooms
      const rooms = [];
      for (let i = 1; i <= 3; i++) {
        const room = await prisma.room.create({
          data: {
            roomNumber: `10${i}`,
            roomTypeId: roomType.id,
            status: 'Available',
            notes: 'Test room'
          }
        });
        rooms.push(room);
      }
      
      console.log('✅ Created 3 rooms:', rooms.map(r => r.roomNumber).join(', '));
    }
    
    // Create a test guest and booking
    console.log('\n📝 Creating test booking...');
    
    let guest = await prisma.guest.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          firstName: 'ลูกค้า',
          lastName: 'ทดสอบ',
          email: 'test@example.com',
          phoneNumber: '081-234-5678',
          country: 'TH'
        }
      });
      console.log('✅ Test guest created:', guest.id);
    }
    
    // Get available room
    const roomType = await prisma.roomType.findFirst({
      where: { isActive: true },
      include: {
        rooms: {
          where: { status: 'Available' },
          take: 1
        }
      }
    });
    
    if (roomType && roomType.rooms.length > 0) {
      const room = roomType.rooms[0];
      
      const booking = await prisma.booking.create({
        data: {
          bookingReferenceId: `BK${Date.now()}`,
          guestId: guest.id,
          roomTypeId: roomType.id,
          roomId: room.id,
          checkinDate: new Date('2025-08-20'),
          checkoutDate: new Date('2025-08-22'),
          numAdults: 2,
          numChildren: 0,
          totalPrice: 3000.00,
          taxAmount: 210.00,
          finalAmount: 3210.00,
          status: 'Confirmed',
          source: 'TEST_SETUP'
        }
      });
      
      console.log('✅ Test booking created:', booking.id);
      
      // Update room status
      await prisma.room.update({
        where: { id: room.id },
        data: { status: 'Occupied' }
      });
      
      console.log('✅ Room status updated to Occupied');
    }
    
    // Check final booking count
    const totalBookings = await prisma.booking.count();
    console.log(`\n🎉 Setup complete! Total bookings: ${totalBookings}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
