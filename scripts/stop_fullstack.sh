#!/bin/bash

# reVoAgent Full Stack Stop Script

PROJECT_ROOT="/workspace/reVoAgent"
PID_DIR="$PROJECT_ROOT/logs"

echo "🛑 Stopping reVoAgent Full Stack..."
echo "=================================="

# Function to stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file="$PID_DIR/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        echo "🔍 Stopping $service_name (PID: $pid)..."
        
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            sleep 2
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo "⚠️  Force killing $service_name..."
                kill -9 "$pid" 2>/dev/null || true
            fi
            
            echo "✅ $service_name stopped"
        else
            echo "ℹ️  $service_name was not running"
        fi
        
        rm -f "$pid_file"
    else
        echo "ℹ️  No PID file found for $service_name"
    fi
}

# Stop services
stop_service "backend"
stop_service "frontend"

# Additional cleanup
echo "🧹 Additional cleanup..."
bash "$PROJECT_ROOT/scripts/cleanup_ports.sh"

echo "✅ Full stack stopped successfully!"
echo ""
echo "📁 Logs preserved in:"
echo "   Backend:  $PROJECT_ROOT/logs/backend.log"
echo "   Frontend: $PROJECT_ROOT/logs/frontend.log"