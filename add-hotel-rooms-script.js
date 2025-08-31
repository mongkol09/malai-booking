// Script สำหรับเพิ่มข้อมูลห้องพักจริงของโรงแรม
// ใช้งานบน Browser Console ที่หน้า Room Management

const hotelRoomsData = [
  // 1. Private House (1 หลัง)
  {
    number: "P1",
    type: "Private House", 
    price: 35000,
    capacity: 6,
    extraCapability: 0,
    bedCharge: 0,
    size: "Presidential",
    bedCount: 3,
    bedType: "King Bed",
    description: "Luxury private house with 3 king-size bedrooms, perfect for families or groups seeking privacy and comfort. Features spacious living areas, private garden, and premium amenities.",
    condition: "Advance booking required. Check-in after 3 PM, Check-out before 12 PM"
  },

  // 2. Onsen Rooms (5 ห้อง)
  {
    number: "B1",
    type: "Onsen",
    price: 18000,
    capacity: 2, 
    extraCapability: 0,
    bedCharge: 0,
    size: "King",
    bedCount: 1,
    bedType: "King Bed",
    description: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath. Experience authentic Japanese hospitality and relaxation.",
    condition: "Onsen usage rules apply. No outside food or drinks in onsen area"
  },
  {
    number: "B2", 
    type: "Onsen",
    price: 18000,
    capacity: 2,
    extraCapability: 0,
    bedCharge: 0,
    size: "King",
    bedCount: 1,
    bedType: "King Bed", 
    description: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath. Experience authentic Japanese hospitality and relaxation.",
    condition: "Onsen usage rules apply. No outside food or drinks in onsen area"
  },
  {
    number: "C1",
    type: "Onsen", 
    price: 18000,
    capacity: 2,
    extraCapability: 0,
    bedCharge: 0,
    size: "King",
    bedCount: 1,
    bedType: "King Bed",
    description: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath. Experience authentic Japanese hospitality and relaxation.",
    condition: "Onsen usage rules apply. No outside food or drinks in onsen area"
  },
  {
    number: "C2",
    type: "Onsen",
    price: 18000,
    capacity: 2,
    extraCapability: 0,
    bedCharge: 0,
    size: "King", 
    bedCount: 1,
    bedType: "King Bed",
    description: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath. Experience authentic Japanese hospitality and relaxation.",
    condition: "Onsen usage rules apply. No outside food or drinks in onsen area"
  },
  {
    number: "D1",
    type: "Onsen",
    price: 18000,
    capacity: 2,
    extraCapability: 0,
    bedCharge: 0,
    size: "King",
    bedCount: 1,
    bedType: "King Bed",
    description: "Traditional Japanese-style onsen room with king-size bed and private hot spring bath. Experience authentic Japanese hospitality and relaxation.",
    condition: "Onsen usage rules apply. No outside food or drinks in onsen area"
  },

  // 3. Canopy Pool Villa (3 ห้อง)
  {
    number: "E1",
    type: "Canopy Pool Villa",
    price: 8000,
    capacity: 2,
    extraCapability: 1,
    bedCharge: 1000,
    size: "King",
    bedCount: 1,
    bedType: "King Bed",
    description: "Modern pool villa with stunning canopy design and king-size bed. Features private pool access, contemporary amenities, and tropical garden views.",
    condition: "Pool access until 10 PM. Extra bed charge ฿1,000 per night"
  },
  {
    number: "E2", 
    type: "Canopy Pool Villa",
    price: 8000,
    capacity: 2,
    extraCapability: 1,
    bedCharge: 1000,
    size: "King",
    bedCount: 1,
    bedType: "King Bed",
    description: "Modern pool villa with stunning canopy design and king-size bed. Features private pool access, contemporary amenities, and tropical garden views.",
    condition: "Pool access until 10 PM. Extra bed charge ฿1,000 per night"
  },
  {
    number: "E3",
    type: "Canopy Pool Villa", 
    price: 8000,
    capacity: 2,
    extraCapability: 1,
    bedCharge: 1000,
    size: "King",
    bedCount: 1,
    bedType: "King Bed",
    description: "Modern pool villa with stunning canopy design and king-size bed. Features private pool access, contemporary amenities, and tropical garden views.",
    condition: "Pool access until 10 PM. Extra bed charge ฿1,000 per night"
  },

  // 4. Grand Serenity (3 ห้อง) 
  {
    number: "F1",
    type: "Grand Serenity",
    price: 8500,
    capacity: 2,
    extraCapability: 1,
    bedCharge: 1000,
    size: "King", 
    bedCount: 1,
    bedType: "King Bed",
    description: "Elegant grand serenity suite with king-size bed and tranquil atmosphere. Features premium furnishing, peaceful ambiance, and luxurious amenities.",
    condition: "Quiet hours from 10 PM - 8 AM. Extra bed charge ฿1,000 per night"
  },
  {
    number: "F2",
    type: "Grand Serenity",
    price: 8500,
    capacity: 2,
    extraCapability: 1,
    bedCharge: 1000,
    size: "King",
    bedCount: 1,
    bedType: "King Bed", 
    description: "Elegant grand serenity suite with king-size bed and tranquil atmosphere. Features premium furnishing, peaceful ambiance, and luxurious amenities.",
    condition: "Quiet hours from 10 PM - 8 AM. Extra bed charge ฿1,000 per night"
  },
  {
    number: "F3",
    type: "Grand Serenity",
    price: 8500,
    capacity: 2,
    extraCapability: 1,
    bedCharge: 1000,
    size: "King",
    bedCount: 1,
    bedType: "King Bed",
    description: "Elegant grand serenity suite with king-size bed and tranquil atmosphere. Features premium furnishing, peaceful ambiance, and luxurious amenities.",
    condition: "Quiet hours from 10 PM - 8 AM. Extra bed charge ฿1,000 per night"
  }
];

// ฟังก์ชันสำหรับเพิ่มห้องพักแบบ automated
async function addHotelRooms() {
  console.log('🏨 เริ่มเพิ่มข้อมูลห้องพักของโรงแรม...');
  console.log(`📊 จำนวนห้องที่จะเพิ่ม: ${hotelRoomsData.length} ห้อง`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < hotelRoomsData.length; i++) {
    const roomData = hotelRoomsData[i];
    
    try {
      console.log(`\n📝 เพิ่มห้อง ${i + 1}/${hotelRoomsData.length}: ${roomData.number} (${roomData.type})`);
      
      // เรียกใช้ roomService เพื่อเพิ่มห้อง
      if (window.roomService && window.roomService.createRoom) {
        const response = await window.roomService.createRoom(roomData);
        
        if (response && response.success) {
          console.log(`✅ เพิ่มห้อง ${roomData.number} สำเร็จ`);
          successCount++;
        } else {
          console.error(`❌ เพิ่มห้อง ${roomData.number} ไม่สำเร็จ:`, response);
          errorCount++;
        }
      } else {
        console.error('❌ roomService ไม่พร้อมใช้งาน');
        errorCount++;
      }
      
      // รอเล็กน้อยระหว่างการเพิ่มแต่ละห้อง
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการเพิ่มห้อง ${roomData.number}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n🎉 สรุปผลการเพิ่มห้องพัก:');
  console.log(`✅ สำเร็จ: ${successCount} ห้อง`);
  console.log(`❌ ไม่สำเร็จ: ${errorCount} ห้อง`);
  console.log(`📊 รวม: ${successCount + errorCount} ห้อง`);
  
  if (successCount > 0) {
    console.log('\n🔄 กำลัง refresh หน้า Room List...');
    // Refresh หน้าเพื่อแสดงข้อมูลใหม่
    if (window.location.pathname.includes('room')) {
      window.location.reload();
    }
  }
}

// ฟังก์ชันสำหรับแสดงสรุปห้องพัก
function showRoomSummary() {
  console.log('\n🏨 สรุปข้อมูลห้องพักที่จะเพิ่ม:');
  console.log('=======================================');
  
  const roomTypes = {};
  hotelRoomsData.forEach(room => {
    if (!roomTypes[room.type]) {
      roomTypes[room.type] = {
        count: 0,
        price: room.price,
        rooms: []
      };
    }
    roomTypes[room.type].count++;
    roomTypes[room.type].rooms.push(room.number);
  });
  
  Object.entries(roomTypes).forEach(([type, info]) => {
    console.log(`${type}: ${info.count} ห้อง (฿${info.price.toLocaleString()}/คืน)`);
    console.log(`   ห้อง: ${info.rooms.join(', ')}`);
  });
  
  console.log('=======================================');
  console.log(`รวมทั้งหมด: ${hotelRoomsData.length} ห้อง`);
}

// Export ข้อมูลเพื่อใช้งาน
window.hotelRoomsData = hotelRoomsData;
window.addHotelRooms = addHotelRooms;
window.showRoomSummary = showRoomSummary;

console.log('📋 สคริปต์เพิ่มข้อมูลห้องพักพร้อมใช้งาน!');
console.log('🔧 วิธีใช้งาน:');
console.log('   1. showRoomSummary() - แสดงสรุปข้อมูลห้อง');
console.log('   2. addHotelRooms() - เพิ่มห้องพักทั้งหมด');
