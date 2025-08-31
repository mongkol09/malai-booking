// สคริปต์สำหรับรันใน Browser Console ที่หน้า Room Management
// เปิด http://localhost:3000 → ไปที่ Room Management → เปิด Console (F12) → Paste สคริปต์นี้

console.log('🏨 Hotel Room Bulk Add Script');
console.log('===============================');

// ข้อมูลห้องพักของโรงแรม
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

  // 2. Onsen Rooms (5 ห้อง) - B1, B2, C1, C2, D1
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

  // 3. Canopy Pool Villa (3 ห้อง) - E1, E2, E3
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

  // 4. Grand Serenity (3 ห้อง) - F1, F2, F3
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

// ฟังก์ชันสำหรับเพิ่มห้องพักด้วย roomService
async function addHotelRooms() {
  console.log('🏨 เริ่มเพิ่มข้อมูลห้องพักของโรงแรม...');
  console.log(`📊 จำนวนห้องที่จะเพิ่ม: ${hotelRoomsData.length} ห้อง`);
  
  // ตรวจสอบว่า roomService พร้อมใช้งาน
  if (typeof window === 'undefined' || !window.roomService) {
    console.error('❌ ไม่พบ roomService - กรุณาตรวจสอบว่าอยู่ในหน้า Room Management');
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < hotelRoomsData.length; i++) {
    const roomData = hotelRoomsData[i];
    
    try {
      console.log(`\n📝 เพิ่มห้อง ${i + 1}/${hotelRoomsData.length}: ${roomData.number} (${roomData.type})`);
      console.log(`💰 ราคา: ฿${roomData.price.toLocaleString()} | 👥 จำนวน: ${roomData.capacity} คน`);
      
      // เรียกใช้ roomService เพื่อเพิ่มห้อง
      const response = await window.roomService.createRoom(roomData);
      
      if (response && response.success) {
        console.log(`✅ เพิ่มห้อง ${roomData.number} สำเร็จ - ID: ${response.data.id}`);
        successCount++;
      } else {
        const errorMsg = response?.message || response?.error || 'Unknown error';
        console.error(`❌ เพิ่มห้อง ${roomData.number} ไม่สำเร็จ: ${errorMsg}`);
        errors.push(`${roomData.number}: ${errorMsg}`);
        errorCount++;
      }
      
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการเพิ่มห้อง ${roomData.number}:`, error.message);
      errors.push(`${roomData.number}: ${error.message}`);
      errorCount++;
    }
    
    // รอเล็กน้อยระหว่างการเพิ่มแต่ละห้อง
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  // สรุปผล
  console.log('\n' + '='.repeat(50));
  console.log('🎉 สรุปผลการเพิ่มห้องพัก:');
  console.log('='.repeat(50));
  console.log(`✅ สำเร็จ: ${successCount} ห้อง`);
  console.log(`❌ ไม่สำเร็จ: ${errorCount} ห้อง`);
  console.log(`📊 รวม: ${successCount + errorCount} ห้อง`);
  
  if (errors.length > 0) {
    console.log('\n❌ รายการข้อผิดพลาด:');
    errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (successCount > 0) {
    console.log('\n🔄 กำลัง refresh หน้า Room List...');
    // ตรวจสอบว่ามี roomListTableRef หรือไม่
    if (window.roomListTableRef && window.roomListTableRef.current && window.roomListTableRef.current.refreshData) {
      window.roomListTableRef.current.refreshData();
    } else {
      // หากไม่มี ref ให้ reload หน้า
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }
  
  return {
    success: successCount,
    failed: errorCount,
    total: successCount + errorCount,
    errors: errors
  };
}

// ฟังก์ชันสำหรับแสดงสรุปห้องพัก
function showRoomSummary() {
  console.log('\n🏨 สรุปข้อมูลห้องพักที่จะเพิ่ม:');
  console.log('=======================================');
  
  const roomTypes = {};
  let totalValue = 0;
  
  hotelRoomsData.forEach(room => {
    if (!roomTypes[room.type]) {
      roomTypes[room.type] = {
        count: 0,
        price: room.price,
        rooms: [],
        totalCapacity: 0
      };
    }
    roomTypes[room.type].count++;
    roomTypes[room.type].rooms.push(room.number);
    roomTypes[room.type].totalCapacity += room.capacity;
    totalValue += room.price;
  });
  
  Object.entries(roomTypes).forEach(([type, info]) => {
    console.log(`📍 ${type}:`);
    console.log(`   • จำนวน: ${info.count} ห้อง`);
    console.log(`   • ราคา: ฿${info.price.toLocaleString()}/คืน`);
    console.log(`   • ห้อง: ${info.rooms.join(', ')}`);
    console.log(`   • รวมที่พัก: ${info.totalCapacity} คน`);
    console.log('');
  });
  
  console.log('=======================================');
  console.log(`📊 สรุปรวม:`);
  console.log(`   • ห้องทั้งหมด: ${hotelRoomsData.length} ห้อง`);
  console.log(`   • รายได้เต็มที่ต่อคืน: ฿${totalValue.toLocaleString()}`);
  console.log(`   • รายได้เต็มที่ต่อเดือน: ฿${(totalValue * 30).toLocaleString()}`);
  console.log('=======================================');
}

// ฟังก์ชันสำหรับตรวจสอบระบบก่อนรัน
function checkSystem() {
  console.log('🔍 ตรวจสอบระบบ...');
  
  const checks = [
    { name: 'Window object', check: () => typeof window !== 'undefined' },
    { name: 'roomService available', check: () => window.roomService !== undefined },
    { name: 'roomService.createRoom method', check: () => typeof window.roomService?.createRoom === 'function' },
    { name: 'Current page is admin', check: () => window.location.href.includes('localhost:3000') }
  ];
  
  let allPassed = true;
  
  checks.forEach(({ name, check }) => {
    const passed = check();
    console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'OK' : 'FAILED'}`);
    if (!passed) allPassed = false;
  });
  
  if (allPassed) {
    console.log('\n🎯 ระบบพร้อมใช้งาน! ใช้คำสั่ง addHotelRooms() เพื่อเริ่มเพิ่มห้อง');
  } else {
    console.log('\n⚠️  กรุณาตรวจสอบ:');
    console.log('   1. อยู่ในหน้า Room Management (http://localhost:3000)');
    console.log('   2. roomService ถูก load แล้ว');
    console.log('   3. ไม่มี error ใน console');
  }
  
  return allPassed;
}

// Export ฟังก์ชันเพื่อใช้งาน
window.hotelRoomsData = hotelRoomsData;
window.addHotelRooms = addHotelRooms;
window.showRoomSummary = showRoomSummary;
window.checkSystem = checkSystem;

// แสดงคำแนะนำการใช้งาน
console.log('\n📋 สคริปต์เพิ่มข้อมูลห้องพักพร้อมใช้งาน!');
console.log('🔧 คำสั่งที่ใช้ได้:');
console.log('   • checkSystem()    - ตรวจสอบระบบก่อนใช้งาน');
console.log('   • showRoomSummary() - แสดงสรุปข้อมูลห้อง');
console.log('   • addHotelRooms()   - เพิ่มห้องพักทั้งหมด (12 ห้อง)');
console.log('\n🚀 เริ่มต้นด้วย: checkSystem()');
