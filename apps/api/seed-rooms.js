/**
 * Seed Script - Add Room Types and Rooms Data
 * Creates the room inventory for Malai Resort
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Room Types Data
const roomTypesData = [
  {
    name: 'Private House',
    description: 'Luxurious private house with exclusive amenities and stunning views. Perfect for couples or families seeking ultimate privacy and comfort.',
    capacityAdults: 4,
    capacityChildren: 2,
    baseRate: 15000, // ฿15,000 per night
    amenities: [
      'Private terrace',
      'King-size bed',
      'Living area',
      'Kitchenette',
      'Private bathroom',
      'Air conditioning',
      'Wi-Fi',
      'Mini bar',
      'Safety box',
      'Room service'
    ],
    imageUrl: 'https://example.com/private-house.jpg',
    sizeSqm: 80,
    bedType: 'King bed',
    roomCount: 1 // Only 1 private house
  },
  {
    name: 'Onsen Villa',
    description: 'Traditional Japanese-style villa with private onsen (hot spring bath). Experience authentic relaxation with natural hot spring water.',
    capacityAdults: 3,
    capacityChildren: 1,
    baseRate: 8000, // ฿8,000 per night
    amenities: [
      'Private onsen (hot spring)',
      'Japanese-style room',
      'Tatami flooring',
      'Traditional futon bed',
      'Private bathroom',
      'Tea ceremony set',
      'Kimono robes',
      'Garden view',
      'Air conditioning',
      'Wi-Fi'
    ],
    imageUrl: 'https://example.com/onsen-villa.jpg',
    sizeSqm: 45,
    bedType: 'Japanese futon',
    roomCount: 4 // 4 onsen villas
  },
  {
    name: 'Standard Room',
    description: 'Comfortable and well-appointed standard room with modern amenities. Ideal for budget-conscious travelers who don\'t want to compromise on comfort.',
    capacityAdults: 2,
    capacityChildren: 1,
    baseRate: 3500, // ฿3,500 per night
    amenities: [
      'Queen-size bed',
      'Private bathroom',
      'Air conditioning',
      'Wi-Fi',
      'Flat-screen TV',
      'Mini refrigerator',
      'Coffee/tea making facilities',
      'Safety box',
      'Balcony',
      'Daily housekeeping'
    ],
    imageUrl: 'https://example.com/standard-room.jpg',
    sizeSqm: 25,
    bedType: 'Queen bed',
    roomCount: 6 // 6 standard rooms
  }
];

async function seedRoomData() {
  console.log('🏨 Starting room data seeding...');
  
  try {
    // Clear existing data (optional - be careful in production!)
    console.log('🧹 Clearing existing room data...');
    await prisma.room.deleteMany();
    await prisma.roomType.deleteMany();
    
    // Create room types and rooms
    for (const roomTypeData of roomTypesData) {
      const { roomCount, ...roomTypeInfo } = roomTypeData;
      
      console.log(`📋 Creating room type: ${roomTypeInfo.name}`);
      
      // Create room type
      const roomType = await prisma.roomType.create({
        data: roomTypeInfo
      });
      
      // Create individual rooms for this room type
      console.log(`🏠 Creating ${roomCount} rooms for ${roomTypeInfo.name}`);
      
      for (let i = 1; i <= roomCount; i++) {
        const roomNumber = generateRoomNumber(roomTypeInfo.name, i);
        
        await prisma.room.create({
          data: {
            roomNumber,
            roomTypeId: roomType.id,
            status: 'Available',
            notes: `Room ${roomNumber} - ${roomTypeInfo.name}`
          }
        });
        
        console.log(`   ✅ Created room: ${roomNumber}`);
      }
    }
    
    // Summary
    console.log('\n📊 ROOM INVENTORY SUMMARY:');
    console.log('==========================');
    
    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true
      }
    });
    
    let totalRooms = 0;
    roomTypes.forEach(roomType => {
      console.log(`${roomType.name}: ${roomType.rooms.length} rooms (฿${roomType.baseRate.toLocaleString()}/night)`);
      totalRooms += roomType.rooms.length;
    });
    
    console.log(`\nTotal Rooms: ${totalRooms}`);
    console.log('🎉 Room data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding room data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
function generateRoomNumber(roomTypeName, index) {
  switch (roomTypeName) {
    case 'Private House':
      return 'PH001'; // Only one private house
    case 'Onsen Villa':
      return `ON${index.toString().padStart(3, '0')}`; // ON001, ON002, etc.
    case 'Standard Room':
      return `ST${index.toString().padStart(3, '0')}`; // ST001, ST002, etc.
    default:
      return `RM${index.toString().padStart(3, '0')}`;
  }
}

function getFloorNumber(roomTypeName, index) {
  switch (roomTypeName) {
    case 'Private House':
      return 1; // Ground floor villa
    case 'Onsen Villa':
      return 1; // All onsen villas on ground floor
    case 'Standard Room':
      return Math.ceil(index / 3); // 3 rooms per floor
    default:
      return 1;
  }
}

// Run the seeding
if (require.main === module) {
  seedRoomData()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedRoomData };
