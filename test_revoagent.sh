#!/bin/bash

echo "🧪 Testing reVoAgent deployment..."

# Test backend health
echo "Testing backend health..."
curl -s http://localhost:8000/health | jq '.' || echo "❌ Backend health check failed"

# Test chat endpoint
echo "Testing chat endpoint..."
curl -s -X POST http://localhost:8000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"content": "Hello, test message"}' | jq '.' || echo "❌ Chat endpoint failed"

# Test models endpoint
echo "Testing models endpoint..."
curl -s http://localhost:8000/api/models | jq '.' || echo "❌ Models endpoint failed"

echo "✅ Testing complete!"
