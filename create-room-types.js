// ============================================
// CREATE ROOM TYPES SCRIPT
// ============================================

const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function createRoomTypes() {
  console.log('🏠 Creating room types...\n');

  try {
    // Room types to create based on your specifications
    const roomTypesToCreate = [
      {
        name: 'Cinnamon Room',
        typeCode: 'C1',
        description: 'Premium room with cinnamon-inspired décor and modern amenities',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 35,
        bedType: 'King Bed',
        amenities: [
          'Air Conditioning',
          'Free WiFi',
          'Smart TV',
          'Mini Bar',
          'Safe Box',
          'Balcony',
          'Premium Bathroom'
        ]
      },
      {
        name: 'Basil Room',
        typeCode: 'B1',
        description: 'Elegant room with basil-themed design and garden view',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 32,
        bedType: 'Queen Bed',
        amenities: [
          'Air Conditioning',
          'Free WiFi',
          'Smart TV',
          'Mini Fridge',
          'Safe Box',
          'Garden View',
          'Premium Bathroom'
        ]
      },
      {
        name: 'Jasmine Room',
        typeCode: 'C2',
        description: 'Romantic room with jasmine fragrance and luxurious comfort',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 34,
        bedType: 'King Bed',
        amenities: [
          'Air Conditioning',
          'Free WiFi',
          'Smart TV',
          'Mini Bar',
          'Safe Box',
          'Aromatherapy',
          'Luxury Bathroom'
        ]
      },
      {
        name: 'Rose Room',
        typeCode: 'D1',
        description: 'Beautiful room with rose-inspired décor and romantic ambiance',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 36,
        bedType: 'King Bed',
        amenities: [
          'Air Conditioning',
          'Free WiFi',
          'Smart TV',
          'Mini Bar',
          'Safe Box',
          'Rose Garden View',
          'Romantic Lighting'
        ]
      },
      {
        name: 'Bergamot Room',
        typeCode: 'B2',
        description: 'Refreshing room with bergamot essence and citrus-themed décor',
        baseRate: 15000,
        capacityAdults: 2,
        capacityChildren: 1,
        sizeSqm: 33,
        bedType: 'Queen Bed',
        amenities: [
          'Air Conditioning',
          'Free WiFi',
          'Smart TV',
          'Mini Fridge',
          'Safe Box',
          'Citrus Aromatherapy',
          'Modern Bathroom'
        ]
      },
      {
        name: 'Ginger Room',
        typeCode: 'E',
        description: 'Cozy room with ginger-themed décor, perfect for budget travelers',
        baseRate: 7000,
        capacityAdults: 2,
        capacityChildren: 0,
        sizeSqm: 25,
        bedType: 'Double Bed',
        amenities: [
          'Air Conditioning',
          'Free WiFi',
          'TV',
          'Mini Fridge',
          'Safe Box',
          'Standard Bathroom'
        ]
      },
      {
        name: 'Lemongrass Room',
        typeCode: 'F',
        description: 'Fresh and vibrant room with lemongrass essence and natural lighting',
        baseRate: 7000,
        capacityAdults: 2,
        capacityChildren: 0,
        sizeSqm: 24,
        bedType: 'Double Bed',
        amenities: [
          'Air Conditioning',
          'Free WiFi',
          'TV',
          'Mini Fridge',
          'Safe Box',
          'Natural Lighting'
        ]
      }
    ];

    console.log('🔧 Creating room types...');
    
    for (const roomTypeData of roomTypesToCreate) {
      try {
        // Check if room type already exists
        const existingRoomType = await prisma.roomType.findFirst({
          where: { 
            OR: [
              { name: roomTypeData.name },
              { description: { contains: roomTypeData.typeCode } }
            ]
          }
        });

        if (existingRoomType) {
          console.log(`⚠️  Room type ${roomTypeData.name} (${roomTypeData.typeCode}) already exists, skipping...`);
          continue;
        }

        // Create room type
        const newRoomType = await prisma.roomType.create({
          data: {
            name: roomTypeData.name,
            description: `${roomTypeData.description} (Type: ${roomTypeData.typeCode})`,
            baseRate: roomTypeData.baseRate,
            capacityAdults: roomTypeData.capacityAdults,
            capacityChildren: roomTypeData.capacityChildren,
            sizeSqm: roomTypeData.sizeSqm,
            bedType: roomTypeData.bedType,
            amenities: roomTypeData.amenities,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`✅ Created room type: ${roomTypeData.name} (${roomTypeData.typeCode})`);
        console.log(`   - ID: ${newRoomType.id}`);
        console.log(`   - Base Rate: ฿${roomTypeData.baseRate}`);
        console.log(`   - Capacity: ${roomTypeData.capacityAdults} adults + ${roomTypeData.capacityChildren} children`);
        console.log(`   - Size: ${roomTypeData.sizeSqm} sqm`);
        console.log(`   - Bed: ${roomTypeData.bedType}`);
        console.log('');

      } catch (roomTypeError) {
        console.error(`❌ Failed to create room type ${roomTypeData.name}:`, roomTypeError.message);
      }
    }

    // Display all room types
    console.log('\n📋 All room types in database:');
    const allRoomTypes = await prisma.roomType.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        baseRate: true,
        capacityAdults: true,
        capacityChildren: true,
        sizeSqm: true,
        bedType: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        baseRate: 'desc'
      }
    });

    if (allRoomTypes.length === 0) {
      console.log('   No room types found');
    } else {
      allRoomTypes.forEach((roomType, index) => {
        const typeCode = roomType.description?.match(/\(Type: ([^)]+)\)/)?.[1] || 'N/A';
        console.log(`   ${index + 1}. ${roomType.name} (${typeCode})`);
        console.log(`      ID: ${roomType.id}`);
        console.log(`      Rate: ฿${roomType.baseRate}`);
        console.log(`      Capacity: ${roomType.capacityAdults} adults + ${roomType.capacityChildren} children`);
        console.log(`      Size: ${roomType.sizeSqm} sqm`);
        console.log(`      Bed: ${roomType.bedType}`);
        console.log(`      Active: ${roomType.isActive}`);
        console.log(`      Created: ${roomType.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    console.log('🎉 Room type creation completed!');

  } catch (error) {
    console.error('❌ Room type creation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
module.exports = {
  createRoomTypes
};

// Run if called directly
if (require.main === module) {
  createRoomTypes()
    .then(() => {
      console.log('\n✅ Room types setup completed!');
      console.log('💡 Next step: Create individual rooms for each room type');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Room types setup failed:', error.message);
      process.exit(1);
    });
}
