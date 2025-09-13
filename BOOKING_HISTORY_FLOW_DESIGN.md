# ระบบ Booking History - Flow & Logic Design

## 🎯 1. ปัญหาปัจจุบัน

### สถานการณ์ปัจจุบัน:
- Booking list มีข้อมูลเยอะมาก (http://localhost:3000/room-booking-list)
- มี bookings ที่เลย checkout date แล้ว
- มี bookings ที่ cancelled แล้ว
- มี bookings ที่ no-show แล้ว
- ข้อมูลรก ใช้งานยาก

### ตัวอย่างจากภาพ:
- Test Guest: Check Out 2025-08-31 (เลยไปแล้ว)
- Pitchapa Eiamputtharak: Status = Cancelled
- Mongkol Suwannasri: Status = Cancelled
- Mongkol Suwannasri: Status = Pending (ยังไม่มา)

---

## 🔄 2. Booking Lifecycle Flow

```
[New Booking] → [Confirmed] → [Check-in] → [Check-out] → [Completed]
     ↓              ↓            ↓           ↓           ↓
[Cancelled]    [No-show]    [In-house]   [Completed]  [Archive]
     ↓              ↓            ↓           ↓           ↓
[Archive]      [Archive]    [Check-out]  [Archive]   [History]
```

### Booking States:
1. **PENDING** - รอการยืนยัน
2. **CONFIRMED** - ยืนยันแล้ว
3. **CHECKED_IN** - เช็คอินแล้ว
4. **CHECKED_OUT** - เช็คเอาท์แล้ว
5. **COMPLETED** - เสร็จสิ้น
6. **CANCELLED** - ยกเลิก
7. **NO_SHOW** - ไม่มา
8. **ARCHIVED** - เก็บใน history

---

## 🏗️ 3. Database Schema Design

### 3.1 Booking Status Rules Table
```sql
CREATE TABLE booking_status_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'AUTO_ARCHIVE', 'STATUS_UPDATE'
  condition_type VARCHAR(50) NOT NULL, -- 'DAYS_AFTER_CHECKOUT', 'DAYS_AFTER_CHECKIN', 'DAYS_AFTER_CANCELLED'
  condition_value INTEGER NOT NULL, -- Number of days
  target_status VARCHAR(50), -- 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'ARCHIVED'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- Higher number = higher priority
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default Rules
INSERT INTO booking_status_rules (rule_name, rule_type, condition_type, condition_value, target_status, priority) VALUES
('Auto Complete After Checkout', 'STATUS_UPDATE', 'DAYS_AFTER_CHECKOUT', 0, 'COMPLETED', 1),
('Archive Completed Bookings', 'AUTO_ARCHIVE', 'DAYS_AFTER_CHECKOUT', 7, 'ARCHIVED', 2),
('Archive Cancelled Bookings', 'AUTO_ARCHIVE', 'DAYS_AFTER_CANCELLED', 3, 'ARCHIVED', 3),
('Archive No-show Bookings', 'AUTO_ARCHIVE', 'DAYS_AFTER_CHECKIN', 1, 'ARCHIVED', 4);
```

### 3.2 Booking History Table
```sql
CREATE TABLE booking_history (
  id SERIAL PRIMARY KEY,
  original_booking_id INTEGER, -- Reference to original booking
  booking_reference VARCHAR(100), -- Original booking reference
  
  -- Guest Information
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  
  -- Room Information
  room_type_id INTEGER,
  room_type_name VARCHAR(100),
  room_number VARCHAR(20),
  
  -- Booking Dates
  check_in_date DATE,
  check_out_date DATE,
  booking_date TIMESTAMP,
  
  -- Financial Information
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  due_amount DECIMAL(10,2),
  payment_status VARCHAR(50),
  
  -- Status Information
  booking_status VARCHAR(50),
  archive_reason VARCHAR(100), -- 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'MANUAL'
  
  -- Additional Information
  special_requests TEXT,
  notes TEXT,
  
  -- Audit Information
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  archived_at TIMESTAMP DEFAULT NOW(),
  archived_by INTEGER REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_booking_history_guest_name ON booking_history(guest_name);
CREATE INDEX idx_booking_history_check_in_date ON booking_history(check_in_date);
CREATE INDEX idx_booking_history_check_out_date ON booking_history(check_out_date);
CREATE INDEX idx_booking_history_booking_status ON booking_history(booking_status);
CREATE INDEX idx_booking_history_archived_at ON booking_history(archived_at);
```

### 3.3 Booking Archive Log Table
```sql
CREATE TABLE booking_archive_logs (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER,
  booking_reference VARCHAR(100),
  archive_action VARCHAR(50), -- 'AUTO_ARCHIVE', 'MANUAL_ARCHIVE', 'BULK_ARCHIVE'
  archive_reason VARCHAR(100),
  archived_by INTEGER REFERENCES users(id),
  archived_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Additional context
);
```

---

## 🔄 4. System Flow Logic

### 4.1 Daily Cleanup Process
```javascript
// Daily cleanup job (run every day at 2 AM)
async function dailyBookingCleanup() {
  console.log('🧹 Starting daily booking cleanup...');
  
  // Step 1: Update booking statuses
  await updateBookingStatuses();
  
  // Step 2: Archive eligible bookings
  await archiveEligibleBookings();
  
  // Step 3: Clean up old archive logs
  await cleanupOldArchiveLogs();
  
  console.log('✅ Daily booking cleanup completed');
}

// Step 1: Update booking statuses
async function updateBookingStatuses() {
  const rules = await getActiveStatusRules('STATUS_UPDATE');
  
  for (const rule of rules) {
    const candidates = await getBookingsForStatusUpdate(rule);
    
    for (const booking of candidates) {
      await updateBookingStatus(booking.id, rule.target_status);
      await logArchiveAction(booking.id, 'STATUS_UPDATE', rule.rule_name);
    }
  }
}

// Step 2: Archive eligible bookings
async function archiveEligibleBookings() {
  const rules = await getActiveStatusRules('AUTO_ARCHIVE');
  
  for (const rule of rules) {
    const candidates = await getBookingsForArchive(rule);
    
    for (const booking of candidates) {
      await archiveBooking(booking.id, rule.target_status);
      await logArchiveAction(booking.id, 'AUTO_ARCHIVE', rule.rule_name);
    }
  }
}
```

### 4.2 Archive Process
```javascript
async function archiveBooking(bookingId, archiveReason) {
  const booking = await getBookingById(bookingId);
  
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }
  
  // Create history record
  const historyRecord = {
    original_booking_id: booking.id,
    booking_reference: booking.booking_reference,
    guest_name: booking.guest_name,
    guest_email: booking.guest_email,
    guest_phone: booking.guest_phone,
    room_type_id: booking.room_type_id,
    room_type_name: booking.room_type_name,
    room_number: booking.room_number,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    booking_date: booking.created_at,
    total_amount: booking.total_amount,
    paid_amount: booking.paid_amount,
    due_amount: booking.due_amount,
    payment_status: booking.payment_status,
    booking_status: booking.booking_status,
    archive_reason: archiveReason,
    special_requests: booking.special_requests,
    notes: booking.notes,
    created_by: booking.created_by,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    archived_at: new Date(),
    archived_by: getCurrentUserId()
  };
  
  // Insert into history
  await insertBookingHistory(historyRecord);
  
  // Delete from active bookings
  await deleteBooking(bookingId);
  
  // Log the action
  await logArchiveAction(bookingId, 'AUTO_ARCHIVE', archiveReason);
  
  console.log(`✅ Archived booking ${booking.booking_reference} (${archiveReason})`);
}
```

---

## 🎛️ 5. API Endpoints Design

### 5.1 Booking History APIs
```javascript
// Get booking history with filters
GET /api/v1/bookings/history
Query params:
- page: number
- limit: number
- guest_name: string
- check_in_date_from: date
- check_in_date_to: date
- booking_status: string
- archive_reason: string
- sort_by: string
- sort_order: 'asc' | 'desc'

// Get booking history by ID
GET /api/v1/bookings/history/:id

// Export booking history
GET /api/v1/bookings/history/export
Query params:
- format: 'csv' | 'pdf'
- date_from: date
- date_to: date
- filters: JSON string

// Get archive candidates
GET /api/v1/bookings/archive/candidates
Query params:
- rule_id: number (optional)

// Manual archive booking
POST /api/v1/bookings/archive/:bookingId
Body: {
  archive_reason: string,
  notes?: string
}

// Bulk archive bookings
POST /api/v1/bookings/archive/bulk
Body: {
  booking_ids: number[],
  archive_reason: string,
  notes?: string
}

// Restore booking from history
POST /api/v1/bookings/history/:id/restore
Body: {
  reason: string
}
```

### 5.2 Status Rules APIs
```javascript
// Get all status rules
GET /api/v1/bookings/status-rules

// Create status rule (DEV only)
POST /api/v1/bookings/status-rules
Body: {
  rule_name: string,
  rule_type: string,
  condition_type: string,
  condition_value: number,
  target_status: string,
  priority: number
}

// Update status rule (DEV only)
PUT /api/v1/bookings/status-rules/:id

// Delete status rule (DEV only)
DELETE /api/v1/bookings/status-rules/:id

// Test status rule
POST /api/v1/bookings/status-rules/:id/test
```

---

## 🖥️ 6. Frontend Components Design

### 6.1 Booking History Dashboard
```jsx
const BookingHistoryDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({
    guest_name: '',
    check_in_date_from: '',
    check_in_date_to: '',
    booking_status: '',
    archive_reason: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  return (
    <div className="booking-history-dashboard">
      <div className="dashboard-header">
        <h1>Booking History</h1>
        <div className="header-actions">
          <button onClick={exportHistory}>Export CSV</button>
          <button onClick={exportPDF}>Export PDF</button>
        </div>
      </div>
      
      <div className="filters-section">
        <input 
          placeholder="Search by guest name..."
          value={filters.guest_name}
          onChange={(e) => setFilters({...filters, guest_name: e.target.value})}
        />
        <select 
          value={filters.booking_status}
          onChange={(e) => setFilters({...filters, booking_status: e.target.value})}
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
        <select 
          value={filters.archive_reason}
          onChange={(e) => setFilters({...filters, archive_reason: e.target.value})}
        >
          <option value="">All Archive Reasons</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
          <option value="MANUAL">Manual</option>
        </select>
      </div>
      
      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Room Type</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Archive Reason</th>
              <th>Archived At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.guest_name}</td>
                <td>{booking.room_type_name}</td>
                <td>{booking.check_in_date}</td>
                <td>{booking.check_out_date}</td>
                <td>฿{booking.total_amount}</td>
                <td>
                  <span className={`status-badge ${booking.booking_status.toLowerCase()}`}>
                    {booking.booking_status}
                  </span>
                </td>
                <td>{booking.archive_reason}</td>
                <td>{booking.archived_at}</td>
                <td>
                  <button onClick={() => viewDetails(booking.id)}>View</button>
                  <button onClick={() => restoreBooking(booking.id)}>Restore</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button 
          disabled={pagination.page === 1}
          onClick={() => setPagination({...pagination, page: pagination.page - 1})}
        >
          Previous
        </button>
        <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
        <button 
          disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
          onClick={() => setPagination({...pagination, page: pagination.page + 1})}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### 6.2 Archive Management Panel
```jsx
const ArchiveManagementPanel = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [archiveReason, setArchiveReason] = useState('');

  return (
    <div className="archive-management-panel">
      <div className="panel-header">
        <h2>Archive Management</h2>
        <button onClick={refreshCandidates}>Refresh</button>
      </div>
      
      <div className="candidates-section">
        <h3>Bookings Ready for Archive</h3>
        <div className="candidates-list">
          {candidates.map(booking => (
            <div key={booking.id} className="candidate-item">
              <input 
                type="checkbox"
                checked={selectedBookings.includes(booking.id)}
                onChange={(e) => toggleSelection(booking.id, e.target.checked)}
              />
              <div className="booking-info">
                <span className="guest-name">{booking.guest_name}</span>
                <span className="room-type">{booking.room_type_name}</span>
                <span className="check-out">{booking.check_out_date}</span>
                <span className="status">{booking.booking_status}</span>
              </div>
              <div className="archive-reason">
                <span className="reason">{booking.suggested_reason}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="archive-actions">
        <select 
          value={archiveReason}
          onChange={(e) => setArchiveReason(e.target.value)}
        >
          <option value="">Select Archive Reason</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
          <option value="MANUAL">Manual</option>
        </select>
        <button 
          disabled={selectedBookings.length === 0 || !archiveReason}
          onClick={bulkArchive}
        >
          Archive Selected ({selectedBookings.length})
        </button>
      </div>
    </div>
  );
};
```

---

## ⚙️ 7. Configuration & Settings

### 7.1 Default Archive Rules
```javascript
const DEFAULT_ARCHIVE_RULES = [
  {
    rule_name: 'Auto Complete After Checkout',
    rule_type: 'STATUS_UPDATE',
    condition_type: 'DAYS_AFTER_CHECKOUT',
    condition_value: 0,
    target_status: 'COMPLETED',
    priority: 1
  },
  {
    rule_name: 'Archive Completed Bookings',
    rule_type: 'AUTO_ARCHIVE',
    condition_type: 'DAYS_AFTER_CHECKOUT',
    condition_value: 7,
    target_status: 'ARCHIVED',
    priority: 2
  },
  {
    rule_name: 'Archive Cancelled Bookings',
    rule_type: 'AUTO_ARCHIVE',
    condition_type: 'DAYS_AFTER_CANCELLED',
    condition_value: 3,
    target_status: 'ARCHIVED',
    priority: 3
  },
  {
    rule_name: 'Archive No-show Bookings',
    rule_type: 'AUTO_ARCHIVE',
    condition_type: 'DAYS_AFTER_CHECKIN',
    condition_value: 1,
    target_status: 'ARCHIVED',
    priority: 4
  }
];
```

### 7.2 Archive Reasons
```javascript
const ARCHIVE_REASONS = {
  COMPLETED: 'Booking completed successfully',
  CANCELLED: 'Booking was cancelled',
  NO_SHOW: 'Guest did not show up',
  MANUAL: 'Manually archived by admin',
  SYSTEM: 'Archived by system rules'
};
```

---

## 🔄 8. Implementation Steps

### Step 1: Database Setup
1. Create booking_history table
2. Create booking_status_rules table
3. Create booking_archive_logs table
4. Insert default rules

### Step 2: Backend Services
1. Create BookingHistoryService
2. Create BookingArchiveService
3. Create BookingStatusService
4. Create daily cleanup job

### Step 3: API Endpoints
1. Implement history APIs
2. Implement archive APIs
3. Implement status rules APIs
4. Add authentication & authorization

### Step 4: Frontend Components
1. Create BookingHistoryDashboard
2. Create ArchiveManagementPanel
3. Create StatusRulesPanel
4. Add navigation & routing

### Step 5: Testing & Optimization
1. Test archive process
2. Test daily cleanup
3. Performance optimization
4. Error handling

---

## 📊 9. Expected Results

### Before Implementation:
- Booking list มี 100+ records
- ข้อมูลรก ใช้งานยาก
- ไม่มี history tracking

### After Implementation:
- Booking list เหลือแค่ 20-30 records (ปัจจุบัน)
- History มี 70+ records (อดีต)
- ระบบ auto cleanup ทุกวัน
- Export history ได้
- Performance ดีขึ้น

---

## 🎯 10. Success Metrics

1. **Booking List Size**: ลดลง 70-80%
2. **Page Load Time**: เร็วขึ้น 50%
3. **User Experience**: ใช้งานง่ายขึ้น
4. **Data Integrity**: ไม่สูญหายข้อมูล
5. **System Performance**: ดีขึ้นโดยรวม

---

## 🔧 11. Enhanced Architecture & Improvements

### 11.1 Smart Archive Rules (Advanced)
```javascript
const ENHANCED_ARCHIVE_RULES = [
  {
    rule_name: 'Smart Archive Completed',
    rule_type: 'COMPOSITE_ARCHIVE',
    conditions: [
      { type: 'DAYS_AFTER_CHECKOUT', value: 7 },
      { type: 'PAYMENT_STATUS', value: 'COMPLETED' },
      { type: 'NO_DISPUTES', value: true },
      { type: 'GUEST_FEEDBACK_RECEIVED', value: true }
    ],
    target_status: 'ARCHIVED',
    priority: 1,
    batch_size: 50 // Process in batches
  },
  {
    rule_name: 'Quick Archive Cancelled',
    rule_type: 'COMPOSITE_ARCHIVE',
    conditions: [
      { type: 'DAYS_AFTER_CANCELLED', value: 1 },
      { type: 'REFUND_PROCESSED', value: true },
      { type: 'AUDIT_LOGGED', value: true }
    ],
    target_status: 'ARCHIVED',
    priority: 2,
    batch_size: 100
  },
  {
    rule_name: 'No-show Grace Period',
    rule_type: 'CONDITIONAL_ARCHIVE',
    conditions: [
      { type: 'DAYS_AFTER_CHECKIN', value: 2 },
      { type: 'STATUS', value: 'NO_SHOW' },
      { type: 'CONTACT_ATTEMPTS', min_value: 2 }
    ],
    target_status: 'ARCHIVED',
    priority: 3,
    batch_size: 25
  }
];
```

### 11.2 Performance Optimization
```sql
-- Enhanced indexing strategy
CREATE INDEX CONCURRENTLY idx_bookings_archive_candidates 
ON bookings(check_out_date, booking_status, payment_status) 
WHERE booking_status IN ('confirmed', 'completed', 'cancelled');

CREATE INDEX CONCURRENTLY idx_bookings_lifecycle 
ON bookings(created_at, updated_at, booking_status);

-- Partitioning for booking_history (by year)
CREATE TABLE booking_history_2025 PARTITION OF booking_history
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE booking_history_2024 PARTITION OF booking_history
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 11.3 Background Processing with Queue System
```javascript
const archiveQueue = new Queue('booking-archive', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: 'exponential',
    delay: 5000 // 5 second delay between jobs
  }
});

// Enhanced archive processor
archiveQueue.process('bulk-archive', 5, async (job) => {
  const { bookingIds, archiveReason, userId } = job.data;
  
  try {
    // Process in chunks to avoid memory issues
    const chunks = chunkArray(bookingIds, 10);
    const results = [];
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(id => archiveBookingWithValidation(id, archiveReason, userId))
      );
      results.push(...chunkResults);
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return {
      total: bookingIds.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      errors: results.filter(r => r.status === 'rejected').map(r => r.reason)
    };
    
  } catch (error) {
    console.error('Bulk archive job failed:', error);
    throw error;
  }
});
```

### 11.4 Data Integrity & Validation
```javascript
// Enhanced archive function with validation
async function archiveBookingWithValidation(bookingId, archiveReason, userId) {
  const transaction = await db.beginTransaction();
  
  try {
    // 1. Validate booking exists and is eligible
    const booking = await validateBookingForArchive(bookingId);
    if (!booking.eligible) {
      throw new Error(`Booking ${bookingId} not eligible: ${booking.reason}`);
    }
    
    // 2. Create audit log first
    const auditLogId = await auditLog.create({
      user_id: userId,
      action: 'ARCHIVE_BOOKING',
      resource_type: 'BOOKING',
      resource_id: bookingId,
      old_values: booking.data,
      new_values: { status: 'ARCHIVED', archive_reason: archiveReason },
      metadata: { 
        archive_timestamp: new Date(),
        validation_passed: true 
      }
    });
    
    // 3. Create history record with integrity hash
    const historyRecord = {
      ...createHistoryRecord(booking),
      archive_reason: archiveReason,
      audit_log_id: auditLogId,
      data_hash: generateDataHash(booking),
      archived_by: userId
    };
    
    const historyId = await insertBookingHistory(historyRecord);
    
    // 4. Soft delete from active bookings (keep for rollback)
    await markBookingAsArchived(bookingId, historyId);
    
    // 5. Update related records
    await updateRelatedRecords(bookingId, 'ARCHIVED');
    
    await transaction.commit();
    
    // 6. Trigger post-archive events
    await eventBus.emit('booking.archived', {
      bookingId,
      historyId,
      archiveReason,
      userId
    });
    
    return { bookingId, historyId, status: 'success' };
    
  } catch (error) {
    await transaction.rollback();
    
    // Log the failure
    await auditLog.create({
      user_id: userId,
      action: 'ARCHIVE_BOOKING_FAILED',
      resource_type: 'BOOKING',
      resource_id: bookingId,
      metadata: { 
        error: error.message,
        archive_reason: archiveReason 
      }
    });
    
    throw error;
  }
}
```

### 11.5 Integration with Existing Systems
```javascript
// Integration with cancellation notification system
eventBus.on('booking.archived', async (data) => {
  const { bookingId, archiveReason, userId } = data;
  
  // Send notification if archive reason is cancellation
  if (archiveReason === 'CANCELLED') {
    await notificationService.notifyBookingArchived({
      bookingId,
      archiveReason,
      userId,
      timestamp: new Date()
    });
  }
  
  // Update business metrics
  await businessMetricsService.updateArchiveStats({
    date: new Date(),
    archive_reason: archiveReason,
    count: 1
  });
});

// Integration with audit system
eventBus.on('booking.archived', async (data) => {
  await auditService.logArchiveActivity(data);
});
```

### 11.6 Monitoring & Health Checks
```javascript
const ARCHIVE_SYSTEM_ALERTS = {
  archive_failure_rate: {
    threshold: 5, // percent
    window: '1 hour',
    action: 'notify_dev_team',
    severity: 'warning'
  },
  large_batch_archive: {
    threshold: 100, // bookings
    action: 'require_approval',
    severity: 'info'
  },
  archive_processing_time: {
    threshold: 300, // seconds per batch
    action: 'optimize_performance',
    severity: 'warning'
  },
  data_integrity_failures: {
    threshold: 1, // any failure
    action: 'immediate_investigation',
    severity: 'critical'
  }
};

// Health check endpoint
app.get('/api/v1/archive/health', async (req, res) => {
  const health = {
    queue_status: await archiveQueue.getWaiting().length,
    active_jobs: await archiveQueue.getActive().length,
    failed_jobs: await archiveQueue.getFailed().length,
    last_archive_run: await getLastArchiveRunTime(),
    data_integrity: await checkDataIntegrity()
  };
  
  res.json({
    status: health.data_integrity ? 'healthy' : 'degraded',
    details: health
  });
});
```

---

## 📊 12. Analytics & Reporting

### Archive Analytics Dashboard
```javascript
const ArchiveAnalytics = {
  async getArchiveStats(startDate, endDate) {
    return await db.query(`
      SELECT 
        DATE(archived_at) as archive_date,
        archive_reason,
        COUNT(*) as count,
        AVG(total_amount) as avg_booking_value,
        SUM(total_amount) as total_value_archived
      FROM booking_history 
      WHERE archived_at BETWEEN $1 AND $2
      GROUP BY DATE(archived_at), archive_reason
      ORDER BY archive_date DESC
    `, [startDate, endDate]);
  },

  async getPerformanceMetrics() {
    return {
      active_bookings: await countActiveBookings(),
      archived_bookings: await countArchivedBookings(),
      archive_processing_time: await getAvgArchiveTime(),
      data_integrity_score: await calculateIntegrityScore()
    };
  }
};
```

---

## 🔄 13. Disaster Recovery & Backup

### Backup Strategy
```javascript
const BackupStrategy = {
  // Daily incremental backups
  daily: {
    tables: ['bookings', 'booking_history', 'audit_logs'],
    retention: '30 days',
    schedule: '02:00 UTC'
  },
  
  // Weekly full backups
  weekly: {
    full_database: true,
    retention: '12 weeks',
    schedule: 'Sunday 03:00 UTC'
  },
  
  // Monthly archive backups
  monthly: {
    archive_export: true,
    format: ['sql', 'csv'],
    retention: '5 years',
    schedule: '1st Sunday 04:00 UTC'
  }
};

// Archive restoration procedure
async function restoreBookingFromHistory(historyId, reason, userId) {
  const transaction = await db.beginTransaction();
  
  try {
    const historyRecord = await getBookingHistory(historyId);
    
    // Validate restoration is possible
    await validateRestoration(historyRecord);
    
    // Recreate booking record
    const newBookingId = await recreateBooking(historyRecord);
    
    // Log the restoration
    await auditLog.create({
      user_id: userId,
      action: 'RESTORE_BOOKING',
      resource_type: 'BOOKING_HISTORY',
      resource_id: historyId,
      new_values: { new_booking_id: newBookingId },
      metadata: { restore_reason: reason }
    });
    
    await transaction.commit();
    return newBookingId;
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```
