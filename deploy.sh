#!/bin/bash

# LGIA Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting LGIA Production Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your production settings!"
    exit 1
fi

# Pull latest code (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || git pull origin master || true
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose --profile prod down

# Build and start containers
echo "🔨 Building and starting containers..."
docker compose --profile prod up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "✅ Checking service status..."
docker compose --profile prod ps

echo ""
echo "🎉 Deployment complete!"
echo "📍 Application is running on port 3000"
echo "🌐 Access via: http://wiangyonghub-lgia.com"
echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker compose --profile prod logs -f"
echo "   Stop:          docker compose --profile prod down"
echo "   Restart:       docker compose --profile prod restart"
