# ระบบ Audit Log & Booking History Design

## 🎯 1. ระบบ Audit Log

### Backend Architecture:

#### Database Schema:
```sql
-- Audit Logs Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL, -- 'CREATE_BOOKING', 'CANCEL_BOOKING', 'CHECKIN', 'CHECKOUT', etc.
  resource_type VARCHAR(50), -- 'BOOKING', 'ROOM', 'USER', etc.
  resource_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Additional context data
);

-- Report Subscribers Table
CREATE TABLE report_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  telegram_chat_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  report_types TEXT[] DEFAULT ARRAY['financial', 'audit', 'booking'],
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Reports Table
CREATE TABLE scheduled_reports (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(50), -- 'financial', 'audit', 'booking'
  month INTEGER,
  year INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_path VARCHAR(500),
  sent_to_emails TEXT[],
  sent_to_telegram TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

#### API Endpoints:
```
POST /api/v1/audit/logs - Create audit log
GET /api/v1/audit/logs - Get audit logs (with pagination, filters)
GET /api/v1/audit/logs/export - Export audit logs (CSV/PDF) - DEV only
GET /api/v1/audit/reports/subscribers - Get report subscribers - DEV only
POST /api/v1/audit/reports/subscribers - Add subscriber - DEV only
DELETE /api/v1/audit/reports/subscribers/:id - Remove subscriber - DEV only
POST /api/v1/audit/reports/generate - Generate report manually - DEV only
GET /api/v1/audit/reports/scheduled - Get scheduled reports - DEV only
```

#### Services:
- `AuditLogService` - จัดการ audit logs
- `ReportGenerationService` - สร้าง reports (PDF/CSV)
- `EmailService` - ส่ง email reports
- `TelegramService` - ส่ง Telegram reports
- `SchedulerService` - จัดการ scheduled reports (วันที่ 25 ของเดือน)

### Frontend Architecture:

#### Components:
- `AuditLogDashboard` - แสดง audit logs
- `ReportSubscribersPanel` - จัดการ subscribers (DEV only)
- `ReportGenerationPanel` - สร้าง reports manually (DEV only)
- `ScheduledReportsPanel` - ดู scheduled reports (DEV only)

#### Pages:
- `/audit-logs` - หน้า audit logs
- `/audit-reports` - หน้า reports management (DEV only)

---

## 🎯 2. ระบบ Booking History

### Backend Architecture:

#### Database Schema:
```sql
-- Booking History Table (Archive)
CREATE TABLE booking_history (
  id SERIAL PRIMARY KEY,
  original_booking_id INTEGER, -- Reference to original booking
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  room_type_id INTEGER,
  room_number VARCHAR(20),
  check_in_date DATE,
  check_out_date DATE,
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  due_amount DECIMAL(10,2),
  payment_status VARCHAR(50),
  booking_status VARCHAR(50), -- 'COMPLETED', 'CANCELLED', 'NO_SHOW'
  special_requests TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  archived_at TIMESTAMP DEFAULT NOW(),
  archive_reason VARCHAR(100) -- 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'MANUAL'
);

-- Booking Status Rules Table
CREATE TABLE booking_status_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(100),
  condition_type VARCHAR(50), -- 'DAYS_AFTER_CHECKOUT', 'DAYS_AFTER_CHECKIN', 'MANUAL'
  condition_value INTEGER, -- Number of days
  target_status VARCHAR(50), -- 'COMPLETED', 'CANCELLED', 'NO_SHOW'
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### API Endpoints:
```
GET /api/v1/bookings/history - Get booking history
POST /api/v1/bookings/archive - Archive bookings to history
GET /api/v1/bookings/archive/candidates - Get bookings ready for archiving
POST /api/v1/bookings/archive/bulk - Bulk archive bookings
GET /api/v1/bookings/history/export - Export booking history (CSV/PDF)
GET /api/v1/bookings/status-rules - Get status rules
POST /api/v1/bookings/status-rules - Create status rule - DEV only
PUT /api/v1/bookings/status-rules/:id - Update status rule - DEV only
DELETE /api/v1/bookings/status-rules/:id - Delete status rule - DEV only
```

#### Services:
- `BookingHistoryService` - จัดการ booking history
- `BookingArchiveService` - Archive bookings
- `BookingStatusService` - จัดการ booking status rules
- `BookingCleanupService` - Auto cleanup old bookings

### Frontend Architecture:

#### Components:
- `BookingHistoryDashboard` - แสดง booking history
- `BookingArchivePanel` - จัดการ archiving
- `BookingStatusRulesPanel` - จัดการ status rules (DEV only)
- `BookingCleanupPanel` - จัดการ auto cleanup (DEV only)

#### Pages:
- `/booking-history` - หน้า booking history
- `/booking-archive` - หน้า archive management
- `/booking-settings` - หน้า settings (DEV only)

---

## 🔄 3. System Flow

### Audit Log Flow:
1. User ทำ action → Middleware capture → Save to audit_logs
2. วันที่ 25 ของเดือน → Scheduler trigger → Generate reports → Send via Email/Telegram
3. DEV user สามารถ export logs และจัดการ subscribers ได้

### Booking History Flow:
1. System check bookings ทุกวัน → Identify candidates for archiving
2. Auto archive bookings ที่เลย checkout date ตาม rules
3. Manual archive สำหรับ cancelled/no-show bookings
4. Keep current bookings ใน booking list
5. Export booking history ได้

---

## 🛠️ 4. Implementation Plan

### Phase 1: Audit Log System
1. Create database tables
2. Implement AuditLogService
3. Create audit middleware
4. Build frontend components
5. Implement report generation

### Phase 2: Booking History System
1. Create booking history tables
2. Implement archive services
3. Create status rules system
4. Build frontend components
5. Implement auto cleanup

### Phase 3: Integration & Testing
1. Integrate both systems
2. Test report generation
3. Test auto archiving
4. Performance optimization

---

## 📊 5. Report Types

### Financial Report:
- Total revenue by month
- Payment status breakdown
- Room type performance
- Guest statistics

### Audit Report:
- User activity summary
- Action frequency
- Error logs
- Security events

### Booking Report:
- Booking volume
- Cancellation rates
- No-show statistics
- Room occupancy

---

## 🔐 6. Security & Permissions

### Role-based Access:
- **ADMIN**: Full access to all features
- **STAFF**: View audit logs, manage bookings
- **DEV**: Export data, manage subscribers, system settings
- **CUSTOMER**: No access to audit/history systems

### Data Privacy:
- Encrypt sensitive data in audit logs
- Anonymize guest data in reports
- Secure file storage for exports
- Audit trail for all admin actions

---

## 🔄 7. Architecture Improvements & Best Practices

### 7.1 Data Overlap Prevention
To avoid redundancy between Booking History and Audit Log systems:

```sql
-- Enhanced audit_logs with proper indexing
CREATE INDEX CONCURRENTLY idx_audit_logs_resource 
ON audit_logs(resource_type, resource_id, created_at);

-- booking_history with audit references
ALTER TABLE booking_history ADD COLUMN audit_log_ids INTEGER[];
ALTER TABLE booking_history ADD COLUMN data_hash VARCHAR(64); -- For integrity check
ALTER TABLE booking_history ADD COLUMN is_anonymized BOOLEAN DEFAULT false;
ALTER TABLE audit_logs ADD COLUMN data_retention_expires_at TIMESTAMP;
```

### 7.2 Performance Optimization
```sql
-- Partitioning for large audit tables
CREATE TABLE audit_logs_202509 PARTITION OF audit_logs
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

-- Optimized indexes for common queries
CREATE INDEX CONCURRENTLY idx_audit_logs_user_action 
ON audit_logs(user_id, action, created_at);

CREATE INDEX CONCURRENTLY idx_booking_history_archive_date 
ON booking_history(archived_at, archive_reason);
```

### 7.3 Background Processing Architecture
```javascript
// Queue-based processing for heavy operations
const auditQueue = new Queue('audit-processing', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: 'exponential'
  }
});

// Process audit jobs in batches
auditQueue.process('bulk-audit', 10, async (job) => {
  const { auditData } = job.data;
  return await bulkCreateAuditLogs(auditData);
});
```

### 7.4 Data Retention Policy
```javascript
const DATA_RETENTION_POLICY = {
  audit_logs: {
    critical: '7 years', // Legal requirement
    standard: '3 years', // Business requirement
    system: '1 year' // Technical logs
  },
  booking_history: '5 years', // Business requirement
  archive_logs: '1 year', // System logs
  scheduled_reports: '3 years', // Business reports
  sensitive_data: {
    anonymize_after: '2 years',
    delete_after: '7 years'
  }
};
```

### 7.5 Enhanced Security Features
```javascript
// Data encryption for sensitive information
const encryptSensitiveData = (data) => {
  const sensitiveFields = ['guest_phone', 'guest_email', 'payment_info'];
  const encrypted = { ...data };
  
  sensitiveFields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encrypt(encrypted[field]);
      encrypted[`${field}_encrypted`] = true;
    }
  });
  
  return encrypted;
};

// GDPR compliance functions
const anonymizeGuestData = async (bookingId) => {
  return await db.query(`
    UPDATE booking_history 
    SET 
      guest_name = 'Anonymous Guest',
      guest_email = CONCAT('guest', id, '@anonymized.local'),
      guest_phone = 'xxx-xxx-xxxx',
      is_anonymized = true
    WHERE original_booking_id = $1
  `, [bookingId]);
};
```

---

## 🎯 8. Implementation Roadmap (Revised)

### Phase 1: Foundation & Compliance (2 weeks)
1. **Audit Log Core System**
   - Implement audit_logs table with partitioning
   - Create audit middleware for all API endpoints
   - Implement data retention policies
   - Add GDPR compliance features

2. **Background Job System**
   - Setup Redis queue system
   - Implement batch processing
   - Add error handling and retry logic

### Phase 2: Advanced Features (2 weeks)
3. **Reporting & Analytics**
   - Implement scheduled report generation
   - Add multi-channel notifications (Email + Telegram)
   - Create export functionality (CSV/PDF)
   - Add report subscriber management

4. **Integration & Performance**
   - Integrate with existing booking cancellation system
   - Optimize database queries and indexes
   - Implement caching strategies

### Phase 3: Enterprise Features (1 week)
5. **Monitoring & Alerting**
   - Add system health monitoring
   - Implement anomaly detection
   - Create admin dashboards
   - Add automated alerting

6. **Security & Scalability**
   - Implement data encryption
   - Add audit trail for admin actions
   - Setup database replication
   - Add horizontal scaling capabilities

---

## 🚨 9. Monitoring & Alerting

### System Health Metrics
```javascript
const SYSTEM_ALERTS = {
  audit_log_volume: {
    threshold: 10000, // logs per hour
    severity: 'warning',
    action: 'check_performance'
  },
  failed_audit_writes: {
    threshold: 5, // percent failure rate
    severity: 'critical',
    action: 'notify_dev_team'
  },
  report_generation_time: {
    threshold: 300, // seconds
    severity: 'warning',
    action: 'optimize_queries'
  },
  data_retention_violations: {
    threshold: 1, // any violation
    severity: 'critical',
    action: 'immediate_cleanup'
  }
};
```

### Performance Monitoring
```javascript
// Monitor audit log write performance
const auditPerformanceMonitor = {
  async recordMetrics(operation, duration, success) {
    await metrics.record({
      operation,
      duration,
      success,
      timestamp: new Date()
    });
    
    if (duration > 1000) { // Alert if operation takes > 1 second
      await alertService.notify('slow_audit_operation', { operation, duration });
    }
  }
};
```

---

## 🔧 10. Troubleshooting Guide

### Common Issues & Solutions

1. **High Audit Log Volume**
   - Enable log level filtering
   - Implement sampling for high-frequency events
   - Use async processing for non-critical audits

2. **Report Generation Timeout**
   - Implement pagination for large datasets
   - Use background processing for heavy reports
   - Add caching for frequently requested reports

3. **Data Retention Compliance**
   - Run automated cleanup jobs
   - Monitor retention policy violations
   - Implement data anonymization workflows

4. **Performance Degradation**
   - Check database connection pools
   - Monitor queue processing rates
   - Optimize slow queries with EXPLAIN ANALYZE
