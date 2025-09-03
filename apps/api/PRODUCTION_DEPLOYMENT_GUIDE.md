# 🚀 MALAI RESORT - PRODUCTION DEPLOYMENT GUIDE V1.0.0

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Build Process](#build-process)
6. [Deployment](#deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Security Checklist](#security-checklist)

---

## 🎯 Overview

This guide covers the complete production deployment process for **Malai Resort Hotel Management System V1.0.0**.

### **System Architecture**
- **Backend API**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Email Service**: MailerSend (Primary) + Resend (Fallback)
- **Notifications**: Telegram Bot Integration
- **Payment**: Omise Payment Gateway
- **Process Manager**: PM2

### **Key Features**
- ✅ Room Booking Management
- ✅ Customer Management
- ✅ Email Notifications
- ✅ Telegram Notifications
- ✅ Payment Processing
- ✅ Admin Dashboard
- ✅ Room Availability System
- ✅ Booking Cancellation System

---

## 🔧 Prerequisites

### **System Requirements**
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **PostgreSQL**: Version 13.0 or higher
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 10GB free space

### **Required Software**
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2 globally
npm install -g pm2

# Install nginx (for reverse proxy)
sudo apt-get install nginx
```

---

## 🌍 Environment Setup

### **1. Create Production Environment File**
```bash
# Copy the production environment template
cp production.env .env

# Edit the .env file with your production values
nano .env
```

### **2. Required Environment Variables**
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV=production
PORT=3001

# JWT Secrets (Generate secure random strings)
JWT_SECRET=your-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-secure-refresh-secret-here

# Email Configuration
MAILERSEND_API_TOKEN=your-mailersend-token
FROM_EMAIL=your-verified-email@domain.com
FROM_NAME=Malai Resort

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Payment Gateway
OMISE_PUBLIC_KEY=your-omise-public-key
OMISE_SECRET_KEY=your-omise-secret-key
```

### **3. Generate Secure Secrets**
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Database Setup

### **1. Create Production Database**
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database and user
CREATE DATABASE malai_resort_production;
CREATE USER malai_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE malai_resort_production TO malai_user;
ALTER USER malai_user CREATEDB;

-- Exit PostgreSQL
\q
```

### **2. Run Database Migrations**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify database connection
npx prisma db seed
```

### **3. Database Backup Strategy**
```bash
# Create backup script
cat > backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/malai_resort"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="malai_resort_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U malai_user -d malai_resort_production > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE.gz"
EOF

chmod +x backup-database.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /path/to/backup-database.sh" | crontab -
```

---

## 🔨 Build Process

### **1. Automated Build (Recommended)**
```bash
# For Linux/Mac
chmod +x build-production.sh
./build-production.sh

# For Windows
build-production.bat
```

### **2. Manual Build Process**
```bash
# Clean previous builds
rm -rf dist/ node_modules/ logs/
rm -f package-lock.json

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Create production files
mkdir -p logs
cp production.env .env
```

### **3. Verify Build**
```bash
# Check build artifacts
ls -la dist/

# Test production build
NODE_ENV=production node dist/index.js
```

---

## 🚀 Deployment

### **1. PM2 Process Manager (Recommended)**
```bash
# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

# Monitor application
pm2 monit
```

### **2. Manual Deployment**
```bash
# Start production server
chmod +x start-production.sh
./start-production.sh
```

### **3. Nginx Reverse Proxy Setup**
```nginx
# /etc/nginx/sites-available/malai-resort
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files (if serving frontend)
    location / {
        root /var/www/malai-resort-frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

### **4. SSL Certificate Setup**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoring & Maintenance

### **1. PM2 Monitoring**
```bash
# View application status
pm2 status

# View logs
pm2 logs malai-resort-api

# Monitor resources
pm2 monit

# Restart application
pm2 restart malai-resort-api
```

### **2. System Monitoring**
```bash
# Install monitoring tools
sudo apt-get install htop iotop nethogs

# Monitor system resources
htop
iotop
nethogs
```

### **3. Log Management**
```bash
# View application logs
tail -f logs/combined.log
tail -f logs/err.log
tail -f logs/out.log

# Log rotation
sudo nano /etc/logrotate.d/malai-resort
```

### **4. Health Checks**
```bash
# API health check
curl -f http://localhost:3001/api/v1/health

# Database health check
npx prisma db execute --stdin <<< "SELECT 1;"
```

---

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **1. Application Won't Start**
```bash
# Check logs
pm2 logs malai-resort-api

# Check environment variables
echo $NODE_ENV
echo $PORT

# Check port availability
netstat -tulpn | grep :3001
```

#### **2. Database Connection Issues**
```bash
# Test database connection
npx prisma db execute --stdin <<< "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### **3. Email Service Issues**
```bash
# Test MailerSend connection
curl -X GET "https://api.mailersend.com/v1/domains" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Check email logs
grep -i "email\|mail" logs/combined.log
```

#### **4. Memory Issues**
```bash
# Check memory usage
free -h
pm2 monit

# Restart with memory limit
pm2 restart malai-resort-api --max-memory-restart 1G
```

---

## 🔒 Security Checklist

### **Pre-Deployment Security**
- [ ] Environment variables are secure and not committed to git
- [ ] JWT secrets are cryptographically secure
- [ ] Database passwords are strong
- [ ] API keys are valid and restricted
- [ ] SSL certificates are properly configured

### **Runtime Security**
- [ ] Application runs as non-root user
- [ ] Firewall rules are configured
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Input validation is implemented

### **Ongoing Security**
- [ ] Regular security updates
- [ ] Database backups are encrypted
- [ ] Access logs are monitored
- [ ] Failed login attempts are tracked
- [ ] API endpoints are rate-limited

---

## 📚 Additional Resources

### **Documentation**
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

### **Support**
- **Technical Issues**: Check logs and troubleshooting section
- **Feature Requests**: Contact development team
- **Emergency**: Use PM2 restart or system reboot

### **Maintenance Schedule**
- **Daily**: Check application status and logs
- **Weekly**: Review performance metrics and logs
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Full system audit and backup verification

---

## 🎉 Deployment Complete!

Your **Malai Resort Hotel Management System** is now running in production!

### **Next Steps**
1. ✅ Configure monitoring and alerting
2. ✅ Set up automated backups
3. ✅ Configure SSL certificates
4. ✅ Test all functionality
5. ✅ Train staff on system usage
6. ✅ Document operational procedures

### **System Status**
- **API**: Running on port 3001
- **Database**: PostgreSQL connected
- **Email**: MailerSend configured
- **Notifications**: Telegram bot active
- **Process Manager**: PM2 monitoring

---

**🎊 Welcome to Production V1.0.0! 🎊**

For any questions or issues, refer to this guide or contact the development team.
