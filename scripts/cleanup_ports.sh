#!/bin/bash

echo "🧹 Cleaning up reVoAgent processes and ports..."

# Function to kill processes by pattern
kill_processes() {
    local pattern=$1
    local description=$2
    
    echo "🔍 Looking for $description processes..."
    pids=$(ps aux | grep "$pattern" | grep -v grep | awk '{print $2}')
    
    if [ -n "$pids" ]; then
        echo "🛑 Killing $description processes: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo "✅ No $description processes found"
    fi
}

# Kill backend processes
kill_processes "python.*apps/backend/main.py" "backend"
kill_processes "python.*main.py.*12001" "backend on port 12001"

# Kill frontend processes
kill_processes "npm.*dev" "npm dev"
kill_processes "vite.*--port.*12000" "vite frontend"
kill_processes "node.*vite.*12000" "vite node processes"

# Kill any processes using our target ports
for port in 12000 12001 12002 12003; do
    echo "🔍 Checking port $port..."
    if command -v fuser >/dev/null 2>&1; then
        fuser -k $port/tcp 2>/dev/null || true
    elif command -v lsof >/dev/null 2>&1; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    else
        # Fallback: find processes using netstat-like approach
        pid=$(python3 -c "
import socket
import os
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('localhost', $port))
    s.close()
    print('Port $port is free')
except OSError:
    print('Port $port is in use')
" 2>/dev/null)
    fi
done

echo "⏳ Waiting for processes to terminate..."
sleep 2

# Verify ports are free
echo "🔍 Verifying ports are free..."
python3 -c "
import socket

def check_port(port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(('localhost', port))
        sock.close()
        return True
    except OSError:
        return False

ports = [12000, 12001]
all_free = True

for port in ports:
    if check_port(port):
        print(f'✅ Port {port}: FREE')
    else:
        print(f'❌ Port {port}: STILL IN USE')
        all_free = False

if all_free:
    print('🎉 All ports are now free!')
else:
    print('⚠️  Some ports are still in use. You may need to restart your terminal.')
"

echo "✅ Cleanup complete!"