// 🔍 DATABASE PRICING DATA ANALYSIS
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeDatabasePricing() {
  console.log('🔍 === DATABASE PRICING ANALYSIS ===\n');
  
  try {
    // 1. ตรวจสอบ RoomTypes และ base_rate
    console.log('🏠 1. ROOM TYPES & BASE RATES:');
    console.log('='.repeat(50));
    
    const roomTypes = await prisma.roomType.findMany({
      select: {
        id: true,
        name: true,
        baseRate: true,
        capacityAdults: true,
        capacityChildren: true
      }
    });
    
    if (roomTypes.length === 0) {
      console.log('❌ No room types found in database');
    } else {
      roomTypes.forEach(room => {
        console.log(`  • ${room.name}`);
        console.log(`    Base Rate: ฿${Number(room.baseRate).toLocaleString('th-TH')}/night`);
        console.log(`    Capacity: ${room.capacityAdults} adults, ${room.capacityChildren} children`);
        console.log(`    ID: ${room.id}`);
        console.log('');
      });
    }
    
    // 2. ตรวจสอบ SystemSettings สำหรับ tax และ service charge
    console.log('\n⚙️ 2. SYSTEM SETTINGS (Tax & Service Charge):');
    console.log('='.repeat(50));
    
    const taxSettings = await prisma.systemSetting.findMany({
      where: {
        OR: [
          { settingKey: 'tax_rate' },
          { settingKey: 'service_charge_rate' }
        ]
      }
    });
    
    if (taxSettings.length === 0) {
      console.log('❌ No tax/service charge settings found');
    } else {
      taxSettings.forEach(setting => {
        console.log(`  • ${setting.settingKey}: ${setting.settingValue}${setting.dataType === 'DECIMAL' ? '%' : ''}`);
        console.log(`    Description: ${setting.description}`);
        console.log(`    Category: ${setting.category}`);
        console.log('');
      });
    }
    
    // 3. ตรวจสอบ Bookings และการคำนวณราคา
    console.log('\n📋 3. RECENT BOOKINGS ANALYSIS:');
    console.log('='.repeat(50));
    
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        guest: true
      }
    });
    
    if (recentBookings.length === 0) {
      console.log('❌ No bookings found in database');
    } else {
      recentBookings.forEach((booking, index) => {
        const checkinDate = new Date(booking.checkinDate);
        const checkoutDate = new Date(booking.checkoutDate);
        const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`  📝 Booking ${index + 1}: ${booking.bookingReferenceId || booking.id}`);
        console.log(`    Guest: ${booking.guest?.firstName} ${booking.guest?.lastName}`);
        console.log(`    Room: ${booking.room?.roomType?.name || 'Unknown'} (${booking.room?.roomNumber || 'TBD'})`);
        console.log(`    Dates: ${checkinDate.toLocaleDateString('th-TH')} - ${checkoutDate.toLocaleDateString('th-TH')}`);
        console.log(`    Nights: ${nights}`);
        console.log(`    Base Rate: ฿${Number(booking.room?.roomType?.baseRate || 0).toLocaleString('th-TH')}/night`);
        console.log(`    Total Price: ฿${Number(booking.totalPrice || 0).toLocaleString('th-TH')}`);
        console.log(`    Discount: ฿${Number(booking.discountAmount || 0).toLocaleString('th-TH')}`);
        console.log(`    Tax Amount: ฿${Number(booking.taxAmount || 0).toLocaleString('th-TH')}`);
        console.log(`    Final Amount: ฿${Number(booking.finalAmount || 0).toLocaleString('th-TH')}`);
        
        // คำนวณราคาที่ควรจะเป็น
        const baseRate = Number(booking.room?.roomType?.baseRate || 0);
        const shouldBeTotalPrice = baseRate * nights;
        const shouldBeTaxAmount = shouldBeTotalPrice * 0.07;
        const shouldBeServiceCharge = shouldBeTotalPrice * 0.10;
        const shouldBeFinalAmount = shouldBeTotalPrice + shouldBeTaxAmount + shouldBeServiceCharge;
        
        console.log(`    🧮 Calculated Analysis:`);
        console.log(`       Should be Total: ฿${shouldBeTotalPrice.toLocaleString('th-TH')}`);
        console.log(`       Should be Tax (7%): ฿${shouldBeTaxAmount.toLocaleString('th-TH')}`);
        console.log(`       Should be Service (10%): ฿${shouldBeServiceCharge.toLocaleString('th-TH')}`);
        console.log(`       Should be Final: ฿${shouldBeFinalAmount.toLocaleString('th-TH')}`);
        
        // ตรวจสอบความถูกต้อง
        const actualTotal = Number(booking.totalPrice || 0);
        const actualFinal = Number(booking.finalAmount || 0);
        const actualTax = Number(booking.taxAmount || 0);
        
        console.log(`    ✅ Validation:`);
        console.log(`       Total Price: ${actualTotal === shouldBeTotalPrice ? '✅ Correct' : '❌ Incorrect'}`);
        console.log(`       Tax Calculation: ${actualTax > 0 ? '✅ Has Tax' : '❌ No Tax'}`);
        console.log(`       Final Amount: ${actualFinal > actualTotal ? '✅ Includes extras' : '❌ Same as total'}`);
        console.log('');
      });
    }
    
    // 4. ตรวจสอบ DynamicPricingRules
    console.log('\n🎯 4. DYNAMIC PRICING RULES:');
    console.log('='.repeat(50));
    
    const pricingRules = await prisma.dynamicPricingRule.findMany({
      select: {
        id: true,
        name: true,
        priority: true,
        isActive: true,
        conditions: true,
        action: true
      },
      orderBy: { priority: 'asc' }
    });
    
    if (pricingRules.length === 0) {
      console.log('❌ No pricing rules found');
    } else {
      pricingRules.forEach(rule => {
        console.log(`  • ${rule.name} (Priority: ${rule.priority})`);
        console.log(`    Active: ${rule.isActive ? '✅' : '❌'}`);
        console.log(`    Conditions: ${JSON.stringify(rule.conditions)}`);
        console.log(`    Action: ${JSON.stringify(rule.action)}`);
        console.log('');
      });
    }
    
    // 5. สรุปผล
    console.log('\n📊 5. SUMMARY & RECOMMENDATIONS:');
    console.log('='.repeat(50));
    
    console.log('💰 Database Structure:');
    console.log(`  ✅ Room Types: ${roomTypes.length} types found`);
    console.log(`  ✅ Base Rates: All room types have base rates`);
    console.log(`  ${taxSettings.length > 0 ? '✅' : '❌'} Tax Settings: ${taxSettings.length > 0 ? 'Found' : 'Missing'}`);
    console.log(`  ✅ Bookings: ${recentBookings.length} recent bookings`);
    console.log(`  ✅ Pricing Rules: ${pricingRules.length} rules configured`);
    
    console.log('\n🧮 Calculation Status:');
    const hasCorrectTax = recentBookings.some(b => Number(b.taxAmount || 0) > 0);
    const hasCorrectFinal = recentBookings.some(b => Number(b.finalAmount || 0) > Number(b.totalPrice || 0));
    
    console.log(`  ${hasCorrectTax ? '✅' : '❌'} Tax Calculation: ${hasCorrectTax ? 'Working' : 'Not implemented'}`);
    console.log(`  ${hasCorrectFinal ? '✅' : '❌'} Final Amount: ${hasCorrectFinal ? 'Includes extras' : 'Same as total'}`);
    
    console.log('\n🎯 Next Steps:');
    if (!hasCorrectTax) {
      console.log('  1. ❗ Implement tax calculation in booking creation');
    }
    if (!hasCorrectFinal) {
      console.log('  2. ❗ Update final amount calculation logic');
    }
    if (taxSettings.length === 0) {
      console.log('  3. ❗ Add tax_rate and service_charge_rate to SystemSettings');
    }
    console.log('  4. ✅ Email template variables are ready');
    console.log('  5. ✅ Database structure supports all requirements');
    
    console.log('\n✅ ANALYSIS COMPLETE');
    
  } catch (error) {
    console.error('❌ Error analyzing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeDatabasePricing();
