#!/bin/bash

echo "🚀 Starting reVoAgent Enhanced System..."

# Activate virtual environment
source revoagent_env/bin/activate

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://revoagent:revoagent_pass@localhost:5432/revoagent"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="revoagent-secret-key-change-in-production"

# Start backend
echo "🖥️ Starting backend server..."
cd apps/backend
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend if available
if [ -d "../../frontend" ]; then
    echo "🌐 Starting frontend..."
    cd ../../frontend
    npm start &
    FRONTEND_PID=$!
fi

echo "✅ reVoAgent system started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Health check: curl http://localhost:8000/health"

# Wait for processes
wait $BACKEND_PID
