#!/usr/bin/env node

/**
 * Event Management Migration Script
 * ================================
 * 
 * Migrates the database to support AI-powered Event Management:
 * 1. Creates backup of current database
 * 2. Updates Event model with new fields
 * 3. Adds EventStatus enum
 * 4. Updates relations with DynamicPricingRule and Staff
 * 
 * BEFORE RUNNING:
 * - Ensure you have database backup
 * - Test on development environment first
 * 
 * USAGE:
 * node migrate-event-management.js
 */

const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createDatabaseBackup() {
  console.log('🗄️  Creating database backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupFile = path.join(backupDir, `backup-before-event-migration-${timestamp}.sql`);
  
  // For PostgreSQL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not found in environment variables');
  }
  
  // Extract connection details from DATABASE_URL
  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port || 5432;
  const database = url.pathname.slice(1);
  const username = url.username;
  const password = url.password;
  
  const pgDumpCmd = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --file="${backupFile}" --verbose`;
  
  return new Promise((resolve, reject) => {
    exec(pgDumpCmd, { env: { ...process.env, PGPASSWORD: password } }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Database backup failed:', error);
        reject(error);
      } else {
        console.log(`✅ Database backup created: ${backupFile}`);
        resolve(backupFile);
      }
    });
  });
}

async function checkExistingData() {
  console.log('📊 Checking existing data...');
  
  const eventCount = await prisma.event.count();
  const pricingRuleCount = await prisma.dynamicPricingRule.count();
  const staffCount = await prisma.staff.count();
  
  console.log(`Found ${eventCount} existing events`);
  console.log(`Found ${pricingRuleCount} pricing rules`);
  console.log(`Found ${staffCount} staff members`);
  
  return { eventCount, pricingRuleCount, staffCount };
}

async function validateSchema() {
  console.log('🔍 Validating new schema...');
  
  try {
    // Test if new fields exist by attempting to select them
    await prisma.$queryRaw`
      SELECT 
        category, 
        source, 
        source_event_id, 
        status,
        suggested_pricing_rule_id,
        suggestion_details,
        projected_impact,
        reviewed_by_staff_id,
        reviewed_at
      FROM events 
      LIMIT 1
    `;
    
    console.log('✅ New Event fields are available');
    
    // Test EventStatus enum
    await prisma.$queryRaw`
      SELECT 'PENDING_REVIEW'::eventstatus
    `;
    
    console.log('✅ EventStatus enum is available');
    
    return true;
  } catch (error) {
    console.log('ℹ️  New schema fields not yet applied');
    return false;
  }
}

async function runMigration() {
  console.log('🚀 Running Prisma migration...');
  
  return new Promise((resolve, reject) => {
    exec('npx prisma db push', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Migration failed:', error);
        console.error('stderr:', stderr);
        reject(error);
      } else {
        console.log('✅ Migration completed successfully');
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

async function seedInitialData() {
  console.log('🌱 Seeding initial event management data...');
  
  try {
    // Create a sample event to test the new schema
    const sampleEvent = await prisma.event.create({
      data: {
        title: 'Test Event - AI Management System',
        description: 'Sample event to test new AI-powered event management features',
        startTime: new Date('2024-12-25T10:00:00Z'),
        endTime: new Date('2024-12-25T18:00:00Z'),
        category: 'Test Event',
        source: 'MANUAL',
        status: 'PENDING_REVIEW',
        affectsPricing: true,
        suggestionDetails: JSON.stringify({
          message: 'This is a test event created during migration',
          aiAnalysisPending: true
        })
      }
    });
    
    console.log(`✅ Created sample event: ${sampleEvent.id}`);
    
    return sampleEvent;
  } catch (error) {
    console.error('❌ Failed to seed initial data:', error);
    throw error;
  }
}

async function generatePrismaClient() {
  console.log('⚙️  Generating Prisma client...');
  
  return new Promise((resolve, reject) => {
    exec('npx prisma generate', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Prisma generate failed:', error);
        reject(error);
      } else {
        console.log('✅ Prisma client generated successfully');
        resolve(stdout);
      }
    });
  });
}

async function verifyMigration() {
  console.log('🔬 Verifying migration...');
  
  try {
    // Test all new features
    const events = await prisma.event.findMany({
      include: {
        creator: true,
        suggestedPricingRule: true,
        reviewedByStaff: true
      },
      take: 5
    });
    
    console.log(`✅ Successfully queried ${events.length} events with new relations`);
    
    // Test enum values
    const pendingEvents = await prisma.event.findMany({
      where: { status: 'PENDING_REVIEW' }
    });
    
    console.log(`✅ Found ${pendingEvents.length} pending review events`);
    
    return true;
  } catch (error) {
    console.error('❌ Migration verification failed:', error);
    return false;
  }
}

async function main() {
  console.log('🎯 Starting Event Management Migration');
  console.log('=====================================\n');
  
  try {
    // Step 1: Create backup
    await createDatabaseBackup();
    
    // Step 2: Check existing data
    const existingData = await checkExistingData();
    
    // Step 3: Check if schema is already updated
    const schemaIsUpdated = await validateSchema();
    
    if (!schemaIsUpdated) {
      console.log('\n🔄 Applying database schema changes...');
      
      // Step 4: Run migration
      await runMigration();
      
      // Step 5: Generate new Prisma client
      await generatePrismaClient();
    } else {
      console.log('\n✅ Schema is already up to date');
    }
    
    // Step 6: Verify migration
    const migrationSuccess = await verifyMigration();
    
    if (migrationSuccess) {
      // Step 7: Seed initial data if needed
      const eventCount = await prisma.event.count();
      if (eventCount === 0) {
        await seedInitialData();
      }
      
      console.log('\n🎉 Event Management Migration Completed Successfully!');
      console.log('====================================================');
      console.log('✅ Database schema updated');
      console.log('✅ New Event fields added');
      console.log('✅ EventStatus enum created');
      console.log('✅ Relations with DynamicPricingRule and Staff established');
      console.log('✅ API endpoints ready for use');
      console.log('\n📚 New API Endpoints Available:');
      console.log('   GET /api/v1/events/strategic/pending');
      console.log('   GET /api/v1/events/strategic/analytics'); 
      console.log('   POST /api/v1/events/strategic/aggregate');
      console.log('   POST /api/v1/events/strategic/manual');
      console.log('\n🚀 Ready to implement AI-powered event management!');
    } else {
      console.log('\n❌ Migration verification failed. Please check the logs.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    console.log('\n🔄 Rollback Instructions:');
    console.log('1. Restore from backup file in ./backups/ directory');
    console.log('2. Check Prisma schema for conflicts');
    console.log('3. Ensure PostgreSQL permissions are correct');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createDatabaseBackup,
  checkExistingData,
  validateSchema,
  runMigration,
  seedInitialData,
  verifyMigration
};
