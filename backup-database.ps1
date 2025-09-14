# 🗄️ Database Backup Script for Malai Booking System
# วันที่: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ระบบ: PostgreSQL Hotel Booking Database

Write-Host "🗄️ Starting Database Backup Process..." -ForegroundColor Green
Write-Host "📅 Backup Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Database Configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "hotel_booking"
$DB_USER = "postgres"
$DB_PASSWORD = "Aa123456"

# Backup Configuration
$BACKUP_DIR = "D:\Hotel_Version\hotel_v2\database_backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\hotel_booking_backup_$TIMESTAMP.sql"
$COMPRESSED_FILE = "$BACKUP_DIR\hotel_booking_backup_$TIMESTAMP.zip"

# Create backup directory if it doesn't exist
Write-Host "📁 Creating backup directory..." -ForegroundColor Cyan
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -Path $BACKUP_DIR -ItemType Directory -Force
    Write-Host "✅ Created backup directory: $BACKUP_DIR" -ForegroundColor Green
} else {
    Write-Host "✅ Backup directory exists: $BACKUP_DIR" -ForegroundColor Green
}

# Set PostgreSQL password environment variable
$env:PGPASSWORD = $DB_PASSWORD

Write-Host "🔄 Starting database dump..." -ForegroundColor Cyan
Write-Host "📊 Database: $DB_NAME" -ForegroundColor White
Write-Host "🖥️ Host: ${DB_HOST}:${DB_PORT}" -ForegroundColor White
Write-Host "📁 Output: $BACKUP_FILE" -ForegroundColor White

try {
    # Run pg_dump command
    $pg_dump_cmd = "pg_dump"
    $pg_dump_args = @(
        "--host=$DB_HOST",
        "--port=$DB_PORT", 
        "--username=$DB_USER",
        "--format=custom",
        "--verbose",
        "--file=$BACKUP_FILE",
        $DB_NAME
    )
    
    Write-Host "🚀 Executing: $pg_dump_cmd $($pg_dump_args -join ' ')" -ForegroundColor Yellow
    
    & $pg_dump_cmd @pg_dump_args
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database backup completed successfully!" -ForegroundColor Green
        
        # Get file size
        $fileSize = (Get-Item $BACKUP_FILE).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        Write-Host "📏 Backup file size: $fileSizeMB MB" -ForegroundColor Green
        
        # Compress backup file
        Write-Host "🗜️ Compressing backup file..." -ForegroundColor Cyan
        Compress-Archive -Path $BACKUP_FILE -DestinationPath $COMPRESSED_FILE -Force
        
        if (Test-Path $COMPRESSED_FILE) {
            $compressedSize = (Get-Item $COMPRESSED_FILE).Length
            $compressedSizeMB = [math]::Round($compressedSize / 1MB, 2)
            Write-Host "✅ Compressed backup created: $compressedSizeMB MB" -ForegroundColor Green
            
            # Remove original SQL file to save space
            Remove-Item $BACKUP_FILE -Force
            Write-Host "🗑️ Original SQL file removed to save space" -ForegroundColor Yellow
        }
        
        Write-Host "`n🎉 Backup Process Summary:" -ForegroundColor Green
        Write-Host "  📁 Backup Location: $COMPRESSED_FILE" -ForegroundColor White
        Write-Host "  📏 Compressed Size: $compressedSizeMB MB" -ForegroundColor White
        Write-Host "  📅 Backup Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
        
    } else {
        throw "pg_dump failed with exit code: $LASTEXITCODE"
    }
    
} catch {
    Write-Host "❌ Backup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "  1. Check if PostgreSQL client tools are installed" -ForegroundColor White
    Write-Host "  2. Verify database connection settings" -ForegroundColor White
    Write-Host "  3. Ensure database is running and accessible" -ForegroundColor White
    Write-Host "  4. Check user permissions" -ForegroundColor White
    exit 1
} finally {
    # Clear password environment variable
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n✅ Database backup process completed!" -ForegroundColor Green