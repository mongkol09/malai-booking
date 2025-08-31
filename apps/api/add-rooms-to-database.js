// สคริปต์เพิ่มข้อมูลห้องพักโดยตรงใน Database
// รันด้วย: node add-rooms-to-database.js

const { PrismaClient } = require('@prisma/client');

// ข้อมูลห้องพักของโรงแรม
const hotelRoomsData = [
  // 1. Private House (1 หลัง)
  {
    roomNumber: "P1",
    roomTypeId: null, // จะหาหรือสร้าง RoomType
    roomTypeName: "Private House",
    status: "Available",
    notes: "Luxury private house with 3 king-size bedrooms, perfect for families or groups seeking privacy and comfort. Features spacious living areas, private garden, and premium amenities.",
    // Room Type Details
    roomTypeData: {
      name: "Private House",
      description: "Luxury private house with 3 king-size bedrooms",
      capacity: 6,
      baseRate: 35000.00,
      sizeSqm: 200,
      bedType: "3 King Beds",
      amenities: [
        "3 King-size bedrooms",
        "Private garden", 
        "Spacious living areas",
        "Premium amenities",
        "Wi-Fi",
        "Air conditioning",
        "Private kitchen",
        "Parking"
      ]
    }
  },

  // 2. Onsen Rooms (5 ห้อง) - B1, B2, C1, C2, D1
  {
    roomNumber: "B1",
    roomTypeId: null,
    roomTypeName: "Onsen",
    status: "Available", 
    notes: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath",
    roomTypeData: {
      name: "Onsen",
      description: "Traditional Japanese-style onsen room with private hot spring bath",
      capacity: 2,
      baseRate: 18000.00,
      sizeSqm: 35,
      bedType: "King Bed",
      amenities: [
        "Private onsen (hot spring bath)",
        "King-size bed",
        "Traditional Japanese decor",
        "Wi-Fi",
        "Air conditioning",
        "Tea making facilities",
        "Yukata robes"
      ]
    }
  },
  {
    roomNumber: "B2",
    roomTypeId: null,
    roomTypeName: "Onsen",
    status: "Available",
    notes: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath"
  },
  {
    roomNumber: "C1", 
    roomTypeId: null,
    roomTypeName: "Onsen",
    status: "Available",
    notes: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath"
  },
  {
    roomNumber: "C2",
    roomTypeId: null,
    roomTypeName: "Onsen", 
    status: "Available",
    notes: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath"
  },
  {
    roomNumber: "D1",
    roomTypeId: null,
    roomTypeName: "Onsen",
    status: "Available",
    notes: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath"
  },

  // 3. Canopy Pool Villa (3 ห้อง) - E1, E2, E3
  {
    roomNumber: "E1",
    roomTypeId: null,
    roomTypeName: "Canopy Pool Villa",
    status: "Available",
    notes: "Modern pool villa with stunning canopy design and king-size bed. Pool access until 10 PM",
    roomTypeData: {
      name: "Canopy Pool Villa",
      description: "Modern pool villa with stunning canopy design and private pool access",
      capacity: 2,
      capacityAdults: 2,
      capacityChildren: 1,
      baseRate: 8000.00,
      extraBedCharge: 1000.00,
      sizeSqm: 45,
      bedType: "King Bed",
      amenities: [
        "Private pool access",
        "King-size bed", 
        "Extra bed available",
        "Canopy design",
        "Contemporary amenities",
        "Tropical garden views",
        "Wi-Fi",
        "Air conditioning",
        "Mini refrigerator"
      ]
    }
  },
  {
    roomNumber: "E2",
    roomTypeId: null,
    roomTypeName: "Canopy Pool Villa",
    status: "Available",
    notes: "Modern pool villa with stunning canopy design and king-size bed. Pool access until 10 PM"
  },
  {
    roomNumber: "E3",
    roomTypeId: null,
    roomTypeName: "Canopy Pool Villa", 
    status: "Available",
    notes: "Modern pool villa with stunning canopy design and king-size bed. Pool access until 10 PM"
  },

  // 4. Grand Serenity (3 ห้อง) - F1, F2, F3
  {
    roomNumber: "F1",
    roomTypeId: null,
    roomTypeName: "Grand Serenity",
    status: "Available",
    notes: "Elegant grand serenity suite with king-size bed and tranquil atmosphere. Quiet hours from 10 PM - 8 AM",
    roomTypeData: {
      name: "Grand Serenity",
      description: "Elegant grand serenity suite with tranquil atmosphere",
      capacity: 2,
      capacityAdults: 2,
      capacityChildren: 1, 
      baseRate: 8500.00,
      extraBedCharge: 1000.00,
      sizeSqm: 40,
      bedType: "King Bed",
      amenities: [
        "King-size bed",
        "Extra bed available", 
        "Premium furnishing",
        "Peaceful ambiance",
        "Luxurious amenities",
        "Wi-Fi",
        "Air conditioning",
        "Mini bar",
        "Balcony with garden view"
      ]
    }
  },
  {
    roomNumber: "F2",
    roomTypeId: null,
    roomTypeName: "Grand Serenity",
    status: "Available", 
    notes: "Elegant grand serenity suite with king-size bed and tranquil atmosphere. Quiet hours from 10 PM - 8 AM"
  },
  {
    roomNumber: "F3",
    roomTypeId: null,
    roomTypeName: "Grand Serenity",
    status: "Available",
    notes: "Elegant grand serenity suite with king-size bed and tranquil atmosphere. Quiet hours from 10 PM - 8 AM"
  }
];

async function addRoomsToDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🏨 เริ่มเพิ่มข้อมูลห้องพักเข้า Database...');
    console.log(`📊 จำนวนห้องที่จะเพิ่ม: ${hotelRoomsData.length} ห้อง`);
    console.log('');

    let successCount = 0;
    let failedCount = 0;
    const roomTypes = new Map(); // เก็บ RoomType ที่สร้างแล้ว

    for (let i = 0; i < hotelRoomsData.length; i++) {
      const roomData = hotelRoomsData[i];
      
      try {
        console.log(`📝 เพิ่มห้อง ${i + 1}/${hotelRoomsData.length}: ${roomData.roomNumber} (${roomData.roomTypeName})`);
        
        // 1. หาหรือสร้าง RoomType
        let roomType;
        if (roomTypes.has(roomData.roomTypeName)) {
          roomType = roomTypes.get(roomData.roomTypeName);
          console.log(`   🔍 ใช้ RoomType ที่มีอยู่: ${roomType.id}`);
        } else {
          // สร้าง RoomType ใหม่
          if (roomData.roomTypeData) {
            roomType = await prisma.roomType.create({
              data: {
                name: roomData.roomTypeData.name,
                description: roomData.roomTypeData.description,
                capacityAdults: roomData.roomTypeData.capacityAdults || roomData.roomTypeData.capacity,
                capacityChildren: roomData.roomTypeData.capacityChildren || 0,
                baseRate: roomData.roomTypeData.baseRate,
                sizeSqm: roomData.roomTypeData.sizeSqm || null,
                bedType: roomData.roomTypeData.bedType,
                amenities: roomData.roomTypeData.amenities,
                isActive: true
              }
            });
            roomTypes.set(roomData.roomTypeName, roomType);
            console.log(`   ✨ สร้าง RoomType ใหม่: ${roomType.id} (${roomType.name})`);
          } else {
            // ใช้ RoomType ที่มีอยู่แล้ว
            roomType = roomTypes.get(roomData.roomTypeName);
            if (!roomType) {
              throw new Error(`RoomType ${roomData.roomTypeName} not found and no roomTypeData provided`);
            }
          }
        }

        // 2. สร้าง Room
        const room = await prisma.room.create({
          data: {
            roomNumber: roomData.roomNumber,
            roomTypeId: roomType.id,
            status: roomData.status || 'Available',
            notes: roomData.notes || null
          }
        });

        console.log(`   ✅ เพิ่มห้อง ${roomData.roomNumber} สำเร็จ - ID: ${room.id}`);
        console.log(`   💰 ราคา: ฿${roomType.baseRate.toLocaleString()}/คืน | 👥 จำนวน: ${roomType.capacityAdults + roomType.capacityChildren} คน`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ เกิดข้อผิดพลาดในการเพิ่มห้อง ${roomData.roomNumber}:`, error.message);
        failedCount++;
      }
      
      console.log('');
    }

    // สรุปผล
    console.log('='.repeat(60));
    console.log('🎉 สรุปผลการเพิ่มห้องพัก:');
    console.log('='.repeat(60));
    console.log(`✅ สำเร็จ: ${successCount} ห้อง`);
    console.log(`❌ ไม่สำเร็จ: ${failedCount} ห้อง`);
    console.log(`📊 รวม: ${successCount + failedCount} ห้อง`);
    
    if (successCount > 0) {
      console.log('');
      console.log('📋 สรุปประเภทห้องที่สร้าง:');
      roomTypes.forEach((roomType, name) => {
        console.log(`   • ${name}: ฿${roomType.baseRate.toLocaleString()}/คืน (จำนวน: ${roomType.capacityAdults + roomType.capacityChildren} คน)`);
      });
      
      // แสดงรายได้เต็มที่
      const totalRooms = await prisma.room.count();
      const totalRevenue = Array.from(roomTypes.values()).reduce((sum, rt) => {
        const roomCount = hotelRoomsData.filter(r => r.roomTypeName === rt.name).length;
        return sum + (rt.baseRate * roomCount);
      }, 0);
      
      console.log('');
      console.log(`💼 รายได้เต็มที่ต่อคืน: ฿${totalRevenue.toLocaleString()}`);
      console.log(`💼 รายได้เต็มที่ต่อเดือน: ฿${(totalRevenue * 30).toLocaleString()}`);
      console.log(`🏨 ห้องพักทั้งหมดในระบบ: ${totalRooms} ห้อง`);
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ Database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันฟังก์ชัน
if (require.main === module) {
  addRoomsToDatabase()
    .then(() => {
      console.log('\n🎯 เสร็จสิ้นการเพิ่มข้อมูลห้องพัก!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 เกิดข้อผิดพลาด:', error);
      process.exit(1);
    });
}

module.exports = { addRoomsToDatabase, hotelRoomsData };
