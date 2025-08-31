/**
 * Seed Payment Methods for Testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const paymentMethods = [
  {
    name: 'Credit Card',
    code: 'CC',
    isActive: true,
    processingFeePercent: 3.0 // 3% fee
  },
  {
    name: 'Bank Transfer',
    code: 'BT',
    isActive: true,
    processingFeePercent: 0.0 // No fee
  },
  {
    name: 'Cash',
    code: 'CASH',
    isActive: true,
    processingFeePercent: 0.0 // No fee
  }
];

async function seedPaymentMethods() {
  console.log('💳 Seeding payment methods...');
  
  try {
    // Clear existing payment methods
    await prisma.paymentMethod.deleteMany();
    
    const createdMethods = [];
    
    // Create payment methods
    for (const method of paymentMethods) {
      const created = await prisma.paymentMethod.create({
        data: method
      });
      createdMethods.push(created);
      console.log(`✅ Created payment method: ${method.name} (ID: ${created.id})`);
    }
    
    console.log('🎉 Payment methods seeded successfully!');
    console.log(`📋 Use these IDs for testing: ${createdMethods.map(m => m.id).join(', ')}`);
    
    return createdMethods;
    
  } catch (error) {
    console.error('❌ Error seeding payment methods:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedPaymentMethods()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedPaymentMethods };
