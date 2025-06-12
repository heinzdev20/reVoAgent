#!/bin/bash

# reVoAgent Production Startup Script
# Quick start for production environment using Docker

set -e

echo "🚀 Starting reVoAgent Production Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker to run in production mode."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Determine Docker Compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

print_status "Using Docker Compose: $DOCKER_COMPOSE"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p data/cognee_memory logs temp models config/environments

# Create production environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    print_status "Creating production environment file..."
    cat > .env.production << EOF
# reVoAgent Production Environment
REVOAGENT_ENV=production
REVOAGENT_MODE=production
PYTHONPATH=/app/src

# API Configuration
BACKEND_PORT=12001
FRONTEND_PORT=12000

# Database Configuration
REDIS_URL=redis://redis:6379

# Security
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# Production flags
REVOAGENT_DEBUG=false
REVOAGENT_RELOAD=false
EOF
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
$DOCKER_COMPOSE down --remove-orphans

# Build and start services
print_status "Building and starting production services..."
$DOCKER_COMPOSE --env-file .env.production up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check backend health
if curl -f http://localhost:12001/health &> /dev/null; then
    print_status "✅ Backend is healthy"
else
    print_warning "⚠️ Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:12000 &> /dev/null; then
    print_status "✅ Frontend is accessible"
else
    print_warning "⚠️ Frontend accessibility check failed"
fi

# Check Redis
if $DOCKER_COMPOSE exec redis redis-cli ping &> /dev/null; then
    print_status "✅ Redis is running"
else
    print_warning "⚠️ Redis connection failed"
fi

print_status "✅ reVoAgent Production Environment is running!"
echo ""
echo "🌐 Frontend: http://localhost:12000"
echo "🔧 Backend API: http://localhost:12001"
echo "📚 API Docs: http://localhost:12001/docs"
echo "🔍 Health Check: http://localhost:12001/health"
echo ""
echo "📊 To view logs: $DOCKER_COMPOSE logs -f"
echo "🛑 To stop: $DOCKER_COMPOSE down"
echo "🔄 To restart: $DOCKER_COMPOSE restart"
echo ""

# Show container status
print_status "Container Status:"
$DOCKER_COMPOSE ps