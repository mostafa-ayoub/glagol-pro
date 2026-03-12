#!/bin/bash

# Glagol Pro Deployment Script
# This script helps deploy the Glagol Pro system

set -e

echo "🚀 Glagol Pro Deployment Script"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads backups logs nginx/ssl

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 uploads backups logs

# Generate SSL certificate for HTTPS (self-signed for development)
if [ ! -f nginx/ssl/cert.pem ]; then
    echo "🔑 Generating SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=RU/ST=Moscow/L=Moscow/O=Glagol Pro/OU=IT/CN=localhost"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Glagol Pro Environment Configuration
NODE_ENV=production
PORT=3000
SERVER_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://admin:glagol123@mongodb:27017/glagol_pro?authSource=admin

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5500,http://localhost

# Backup Configuration
BACKUP_SCHEDULE=0 2 * * *
BACKUP_PATH=./backups
MAX_BACKUPS=30
EOF
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Seed the database
echo "🌱 Seeding database..."
docker-compose exec backend npm run seed

# Show service URLs
echo ""
echo "🎉 Deployment completed successfully!"
echo "================================"
echo "📊 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost/api"
echo "❤️  Health Check: http://localhost/health"
echo "📈 MongoDB: mongodb://localhost:27017"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Admin: admin123"
echo "   Reception: recep123"
echo "   Staff: staff123"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo ""

# Optional: Open browser
if command -v xdg-open &> /dev/null; then
    echo "🌐 Opening browser..."
    xdg-open http://localhost
elif command -v open &> /dev/null; then
    echo "🌐 Opening browser..."
    open http://localhost
fi

echo "✅ Glagol Pro is now running!"
