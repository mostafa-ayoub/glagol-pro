#!/bin/bash

# Glagol Pro Backup Script
# This script creates backups of the database and uploads

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="glagol_pro_backup_${DATE}"
MAX_BACKUPS=${MAX_BACKUPS:-30}

echo "💾 Glagol Pro Backup Script"
echo "=========================="

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup subdirectory
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

echo "📦 Creating backup: ${BACKUP_NAME}"

# Backup MongoDB database
echo "🗄️  Backing up MongoDB..."
if docker-compose ps | grep -q "mongodb.*Up"; then
    docker-compose exec -T mongodb mongodump \
        --host localhost \
        --db glagol_pro \
        --out /tmp/backup
    
    # Copy backup from container
    docker cp $(docker-compose ps -q mongodb):/tmp/backup "${BACKUP_DIR}/${BACKUP_NAME}/mongodb"
    
    # Clean up temporary backup
    docker-compose exec -T mongodb rm -rf /tmp/backup
    
    echo "✅ MongoDB backup completed"
else
    echo "⚠️  MongoDB is not running, skipping database backup"
fi

# Backup uploads directory
echo "📁 Backing up uploads..."
if [ -d "./uploads" ]; then
    cp -r ./uploads "${BACKUP_DIR}/${BACKUP_NAME}/"
    echo "✅ Uploads backup completed"
else
    echo "⚠️  Uploads directory not found, skipping"
fi

# Backup configuration files
echo "⚙️  Backing up configuration..."
cp .env "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || echo "⚠️  .env file not found"
cp package.json "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || echo "⚠️  package.json not found"
cp docker-compose.yml "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || echo "⚠️  docker-compose.yml not found"

# Create backup archive
echo "🗜️  Creating compressed archive..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
rm -rf "${BACKUP_NAME}"
cd ..

echo "✅ Backup archive created: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Clean up old backups
echo "🧹 Cleaning up old backups..."
cd "${BACKUP_DIR}"
ls -t *.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
cd ..

echo "✅ Backup completed successfully!"
echo "📊 Backup size: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)"
echo "📁 Backup location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Optional: Upload to cloud storage (uncomment and configure)
# echo "☁️  Uploading to cloud storage..."
# aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" s3://your-backup-bucket/glago-pro/

echo "🎉 Backup process completed!"
