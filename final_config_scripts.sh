# cognee-service/app.py
# Local Cognee service application for reVoAgent integration

import os
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cognee
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Cognee Local Service",
    description="Local Cognee memory service for reVoAgent integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class MemoryRequest(BaseModel):
    content: str
    dataset_name: str = "default"
    metadata: Optional[Dict[str, Any]] = {}

class SearchRequest(BaseModel):
    query: str
    query_type: str = "insights"
    limit: int = 10

class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    query: str
    total_results: int

# Global configuration
COGNEE_INITIALIZED = False

async def initialize_cognee():
    """Initialize Cognee with local configuration"""
    global COGNEE_INITIALIZED
    
    if COGNEE_INITIALIZED:
        return
    
    try:
        # Configure LLM to use local reVoAgent models
        cognee.config.set_llm_config({
            "provider": "openai",  # OpenAI-compatible interface
            "model": "local-deepseek-r1",
            "api_endpoint": os.getenv("LLM_ENDPOINT", "http://revoagent-backend:8000/v1/chat/completions"),
            "api_key": os.getenv("LLM_API_KEY", "local-key"),
            "max_tokens": 4096,
            "temperature": 0.7
        })
        
        # Configure vector database
        cognee.config.set_vector_db_config({
            "provider": os.getenv("VECTOR_DB_PROVIDER", "lancedb"),
            "path": os.getenv("VECTOR_DB_PATH", "/app/data/vectors"),
            "cache_size": int(os.getenv("VECTOR_CACHE_SIZE", "1000"))
        })
        
        # Configure graph database
        cognee.config.set_graph_db_config({
            "provider": os.getenv("GRAPH_DATABASE_PROVIDER", "networkx"),
            "path": os.getenv("GRAPH_DB_PATH", "/app/data/graphs")
        })
        
        # Configure relational database
        if os.getenv("DB_PROVIDER") == "postgres":
            cognee.config.set_db_config({
                "provider": "postgres",
                "host": os.getenv("DB_HOST", "postgres"),
                "port": int(os.getenv("DB_PORT", "5432")),
                "database": os.getenv("DB_NAME", "revoagent_memory"),
                "username": os.getenv("DB_USER", "revoagent"),
                "password": os.getenv("DB_PASSWORD", "password")
            })
        
        # Initialize Cognee
        await cognee.initialize()
        
        COGNEE_INITIALIZED = True
        logger.info("✅ Cognee initialized successfully with local configuration")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Cognee: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Initialize Cognee on startup"""
    await initialize_cognee()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "cognee_initialized": COGNEE_INITIALIZED,
        "service": "cognee-local"
    }

@app.post("/add")
async def add_to_memory(request: MemoryRequest):
    """Add content to Cognee memory"""
    try:
        if not COGNEE_INITIALIZED:
            await initialize_cognee()
        
        # Add content to cognee
        await cognee.add(
            data=request.content,
            dataset_name=request.dataset_name,
            metadata=request.metadata
        )
        
        # Update knowledge graph
        await cognee.cognify()
        
        return {
            "status": "success",
            "message": "Content added to memory",
            "dataset": request.dataset_name
        }
        
    except Exception as e:
        logger.error(f"Failed to add to memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=SearchResponse)
async def search_memory(request: SearchRequest):
    """Search Cognee memory"""
    try:
        if not COGNEE_INITIALIZED:
            await initialize_cognee()
        
        # Search cognee
        results = await cognee.search(
            query_text=request.query,
            query_type=request.query_type
        )
        
        # Limit results
        limited_results = results[:request.limit] if results else []
        
        return SearchResponse(
            results=limited_results,
            query=request.query,
            total_results=len(results) if results else 0
        )
        
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cognify")
async def cognify():
    """Update knowledge graph"""
    try:
        if not COGNEE_INITIALIZED:
            await initialize_cognee()
        
        await cognee.cognify()
        
        return {
            "status": "success",
            "message": "Knowledge graph updated"
        }
        
    except Exception as e:
        logger.error(f"Cognify failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get Cognee statistics"""
    try:
        # This would need to be implemented based on Cognee's API
        return {
            "initialized": COGNEE_INITIALIZED,
            "status": "operational"
        }
        
    except Exception as e:
        logger.error(f"Stats retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8001,
        log_level="info"
    )

---
# cognee-service/requirements.txt
# Requirements for Cognee local service

fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.0.0
python-multipart>=0.0.6

# Cognee and ML dependencies
cognee>=0.1.0
lancedb>=0.2.0
networkx>=3.0
sentence-transformers>=2.2.0
torch>=2.0.0
numpy>=1.24.0

# Database drivers
psycopg2-binary>=2.9.0
redis>=5.0.0

# Async support
aiofiles>=23.0.0
asyncpg>=0.28.0

---
# database/seed-memory-data.sql
-- Seed data for reVoAgent memory database

-- Insert default admin user
INSERT INTO users (id, email, username, password_hash, first_name, last_name, is_admin) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@revoagent.com',
    'admin',
    '$2b$12$LQv3c1yqBo4E0.5zJJ8iLOeJq3VXZmOg3KxV6Vq1QJ8Q8w0Q8w0Q8w',  -- password: admin
    'Admin',
    'User',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default agents
INSERT INTO agents (user_id, agent_name, agent_type, description, configuration, memory_enabled) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Code Analyst',
    'code_analyst',
    'Analyzes code quality, patterns, and provides improvement suggestions',
    '{"max_tokens": 4096, "temperature": 0.7, "memory_tags": ["code", "analysis", "patterns"]}',
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Debug Detective',
    'debug_detective',
    'Identifies and helps resolve coding issues and bugs',
    '{"max_tokens": 4096, "temperature": 0.7, "memory_tags": ["debug", "errors", "solutions"]}',
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Workflow Manager',
    'workflow_manager',
    'Manages and optimizes development workflows',
    '{"max_tokens": 4096, "temperature": 0.7, "memory_tags": ["workflow", "automation", "processes"]}',
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Knowledge Coordinator',
    'knowledge_coordinator',
    'Coordinates knowledge sharing between agents',
    '{"max_tokens": 4096, "temperature": 0.7, "memory_tags": ["coordination", "knowledge", "sharing"]}',
    true
) ON CONFLICT (user_id, agent_name) DO NOTHING;

-- Insert sample knowledge entities
INSERT INTO knowledge_entities (user_id, entity_type, entity_name, description, source_type, tags, metadata) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'code_pattern',
    'Repository Structure Pattern',
    'Standard repository structure for multi-agent platforms',
    'manual',
    ARRAY['code', 'structure', 'patterns'],
    '{"language": "general", "complexity": "medium"}'
),
(
    '00000000-0000-0000-0000-000000000001',
    'debugging_solution',
    'Memory Integration Debugging',
    'Common solutions for memory integration issues',
    'manual',
    ARRAY['debug', 'memory', 'integration'],
    '{"frequency": "high", "resolution_time": "medium"}'
),
(
    '00000000-0000-0000-0000-000000000001',
    'workflow_template',
    'CI/CD Memory Pipeline',
    'Template for CI/CD pipeline with memory testing',
    'manual',
    ARRAY['workflow', 'cicd', 'memory'],
    '{"automation_level": "high", "maintenance": "low"}'
) ON CONFLICT (user_id, entity_name) DO NOTHING;

-- Insert sample system metrics
INSERT INTO system_metrics (metric_type, metric_name, metric_value, tags) VALUES
('performance', 'memory_query_avg_time', 0.15, '{"unit": "seconds"}'),
('performance', 'memory_cache_hit_rate', 85.5, '{"unit": "percentage"}'),
('usage', 'total_memory_queries', 1000, '{"period": "daily"}'),
('usage', 'active_agents', 4, '{"type": "count"}'),
('cost', 'daily_cost_savings', 100.00, '{"currency": "USD"}');

-- Create initial API key for admin user (optional)
INSERT INTO api_keys (user_id, key_name, key_hash, permissions) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Admin API Key',
    '$2b$12$LQv3c1yqBo4E0.5zJJ8iLOeJq3VXZmOg3KxV6Vq1QJ8Q8w0Q8w0Q8w',  -- hash of 'admin-api-key'
    '{"read": true, "write": true, "admin": true}'
) ON CONFLICT (user_id, key_name) DO NOTHING;

---
# redis/redis.conf
# Redis configuration for reVoAgent memory integration

# Network and security
bind 0.0.0.0
port 6379
protected-mode no
timeout 300

# Memory management
maxmemory 512mb
maxmemory-policy allkeys-lru
maxmemory-samples 10

# Persistence
save 900 1
save 300 10
save 60 10000

dir /data
dbfilename revoagent-memory.rdb

# Performance
tcp-keepalive 300
tcp-backlog 511

# Logging
loglevel notice
logfile /data/redis.log

# Client management
maxclients 1000

---
# database/postgresql.conf
# PostgreSQL configuration optimized for reVoAgent memory operations

# Connection settings
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# Memory settings
work_mem = 4MB
huge_pages = try

# Write-ahead logging
wal_level = replica
max_wal_size = 1GB
min_wal_size = 80MB
wal_compression = on

# Query optimization
shared_preload_libraries = 'pg_stat_statements'
track_activity_query_size = 2048
pg_stat_statements.track = all

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'mod'
log_min_duration_statement = 1000

# Performance monitoring
track_io_timing = on
track_functions = all

---
# scripts/setup-local-development.sh
#!/bin/bash
# Setup script for local development with memory integration

set -e

echo "🚀 Setting up reVoAgent with Cognee memory integration for local development"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data/{models,cognee_memory,cognee_vectors,cognee_graphs}
mkdir -p logs/{backend,cognee,nginx}
mkdir -p ssl

# Generate self-signed SSL certificates for development
if [ ! -f ssl/revoagent.key ]; then
    echo "🔐 Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/revoagent.key \
        -out ssl/revoagent.crt \
        -subj "/C=US/ST=CA/L=SF/O=reVoAgent/CN=localhost"
fi

# Copy environment template
if [ ! -f .env.local ]; then
    echo "📝 Creating local environment file..."
    cat > .env.local << 'EOF'
# Database Configuration
DB_PASSWORD=revoagent_dev_password_2024
JWT_SECRET=your_jwt_secret_key_for_development
ENCRYPTION_KEY=your_32_character_encryption_key_dev

# External API Keys (optional for development)
GITHUB_TOKEN=your_github_token_here
SLACK_TOKEN=your_slack_bot_token_here
JIRA_URL=https://your-domain.atlassian.net
JIRA_TOKEN=your_jira_api_token_here

# Monitoring
GRAFANA_PASSWORD=grafana_admin_password
EOF
    echo "✏️  Please edit .env.local with your actual API keys"
fi

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose -f docker-compose.memory-production.yml --env-file .env.local up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.memory-production.yml exec revoagent-backend-memory python -m alembic upgrade head

# Initialize Cognee
echo "🧠 Initializing Cognee memory system..."
docker-compose -f docker-compose.memory-production.yml exec revoagent-backend-memory python -c "
import asyncio
from packages.ai.cognee_model_manager import create_memory_enabled_model_manager

async def init():
    config = {'memory_config': {'enable_memory': True}}
    manager = create_memory_enabled_model_manager(config)
    await manager.initialize()
    print('Cognee initialized successfully')

asyncio.run(init())
"

# Health checks
echo "🏥 Running health checks..."
sleep 10

# Check backend health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend service is healthy"
else
    echo "❌ Backend service health check failed"
fi

# Check memory service health
if curl -f http://localhost:8000/api/memory/health > /dev/null 2>&1; then
    echo "✅ Memory service is healthy"
else
    echo "❌ Memory service health check failed"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend service is healthy"
else
    echo "❌ Frontend service health check failed"
fi

echo ""
echo "🎉 reVoAgent with Memory Integration is ready!"
echo ""
echo "📍 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Memory API: http://localhost:8000/api/memory/"
echo "   Grafana: http://localhost:3001 (admin/grafana_admin_password)"
echo "   Prometheus: http://localhost:9090"
echo ""
echo "📚 Quick Start:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Create an account or login"
echo "   3. Start a memory-enabled chat with multiple agents"
echo "   4. Test external integrations (GitHub, Slack, JIRA)"
echo ""
echo "🔧 Development Commands:"
echo "   View logs: docker-compose -f docker-compose.memory-production.yml logs -f [service-name]"
echo "   Restart service: docker-compose -f docker-compose.memory-production.yml restart [service-name]"
echo "   Stop all: docker-compose -f docker-compose.memory-production.yml down"
echo ""

---
# scripts/production-deploy.sh
#!/bin/bash
# Production deployment script with health checks and rollback capability

set -e

# Configuration
ENVIRONMENT=${1:-production}
ROLLBACK=${2:-false}
BACKUP_DIR="/tmp/revoagent-backup-$(date +%Y%m%d-%H%M%S)"

echo "🚀 Starting production deployment for reVoAgent Memory Integration"
echo "Environment: $ENVIRONMENT"
echo "Rollback mode: $ROLLBACK"

# Load environment configuration
if [ -f ".env.$ENVIRONMENT" ]; then
    source ".env.$ENVIRONMENT"
    echo "✅ Loaded environment configuration"
else
    echo "❌ Environment file .env.$ENVIRONMENT not found"
    exit 1
fi

# Backup current state
if [ "$ROLLBACK" != "true" ]; then
    echo "💾 Creating backup..."
    mkdir -p $BACKUP_DIR
    
    # Backup database
    kubectl exec -n revoagent-memory deployment/postgres -- pg_dump -U revoagent revoagent_memory > $BACKUP_DIR/database.sql
    
    # Backup current manifests
    cp -r k8s/ $BACKUP_DIR/
    
    echo "✅ Backup created at $BACKUP_DIR"
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check cluster connectivity
kubectl cluster-info > /dev/null 2>&1 || { echo "❌ Cannot connect to Kubernetes cluster"; exit 1; }

# Check required secrets
kubectl get secret revoagent-secrets -n revoagent-memory > /dev/null 2>&1 || { echo "❌ Required secrets not found"; exit 1; }

# Check resource availability
AVAILABLE_CPU=$(kubectl top nodes | awk 'NR>1 {sum+=$3} END {print sum}' | sed 's/%//')
AVAILABLE_MEMORY=$(kubectl top nodes | awk 'NR>1 {sum+=$5} END {print sum}' | sed 's/%//')

if [ "$AVAILABLE_CPU" -gt 80 ]; then
    echo "⚠️ High CPU usage detected: ${AVAILABLE_CPU}%"
fi

if [ "$AVAILABLE_MEMORY" -gt 80 ]; then
    echo "⚠️ High memory usage detected: ${AVAILABLE_MEMORY}%"
fi

# Deploy or rollback
if [ "$ROLLBACK" = "true" ]; then
    echo "⏪ Rolling back to previous version..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -1t /tmp/revoagent-backup-* | head -1)
    if [ -z "$LATEST_BACKUP" ]; then
        echo "❌ No backup found for rollback"
        exit 1
    fi
    
    echo "📦 Rolling back using backup: $LATEST_BACKUP"
    
    # Restore from backup
    kubectl apply -f $LATEST_BACKUP/k8s/ -n revoagent-memory
    
    # Wait for rollback
    kubectl rollout undo deployment/revoagent-backend -n revoagent-memory
    kubectl rollout undo deployment/cognee-service -n revoagent-memory
    kubectl rollout undo deployment/revoagent-frontend -n revoagent-memory
    
else
    echo "⚡ Deploying new version..."
    
    # Apply configurations
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secrets.yaml
    
    # Deploy infrastructure services first
    kubectl apply -f k8s/postgres-deployment.yaml
    kubectl apply -f k8s/redis-deployment.yaml
    
    # Wait for infrastructure
    kubectl rollout status deployment/postgres -n revoagent-memory --timeout=300s
    kubectl rollout status deployment/redis -n revoagent-memory --timeout=300s
    
    # Deploy application services
    kubectl apply -f k8s/cognee-deployment.yaml
    kubectl apply -f k8s/revoagent-backend-deployment.yaml
    kubectl apply -f k8s/revoagent-frontend-deployment.yaml
    
    # Apply ingress and scaling
    kubectl apply -f k8s/ingress.yaml
    kubectl apply -f k8s/hpa.yaml
    
    # Wait for application deployments
    kubectl rollout status deployment/cognee-service -n revoagent-memory --timeout=600s
    kubectl rollout status deployment/revoagent-backend -n revoagent-memory --timeout=600s
    kubectl rollout status deployment/revoagent-frontend -n revoagent-memory --timeout=300s
fi

# Post-deployment verification
echo "🧪 Running post-deployment verification..."

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod -l app=revoagent-backend -n revoagent-memory --timeout=300s
kubectl wait --for=condition=ready pod -l app=cognee-service -n revoagent-memory --timeout=300s
kubectl wait --for=condition=ready pod -l app=revoagent-frontend -n revoagent-memory --timeout=300s

# Health checks
INGRESS_IP=$(kubectl get ingress revoagent-ingress -n revoagent-memory -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ ! -z "$INGRESS_IP" ]; then
    echo "🏥 Running health checks on $INGRESS_IP..."
    
    # Basic health check
    if curl -f "http://$INGRESS_IP/health" --max-time 30; then
        echo "✅ Basic health check passed"
    else
        echo "❌ Basic health check failed"
        exit 1
    fi
    
    # Memory service health check
    if curl -f "http://$INGRESS_IP/api/memory/health" --max-time 30; then
        echo "✅ Memory service health check passed"
    else
        echo "❌ Memory service health check failed"
        exit 1
    fi
    
    # API responsiveness test
    if curl -f "http://$INGRESS_IP/api/memory/stats" --max-time 30; then
        echo "✅ API responsiveness test passed"
    else
        echo "❌ API responsiveness test failed"
        exit 1
    fi
else
    echo "⚠️ No ingress IP found, skipping external health checks"
fi

# Performance verification
echo "📊 Running performance verification..."
kubectl top pods -n revoagent-memory

# Check for any crash loops or restarts
RESTART_COUNT=$(kubectl get pods -n revoagent-memory -o jsonpath='{range .items[*]}{.status.containerStatuses[*].restartCount}{"\n"}{end}' | awk '{sum+=$1} END {print sum}')
if [ "$RESTART_COUNT" -gt 0 ]; then
    echo "⚠️ Detected $RESTART_COUNT pod restarts"
    kubectl get pods -n revoagent-memory
fi

# Database connectivity test
echo "🗄️ Testing database connectivity..."
kubectl exec -n revoagent-memory deployment/postgres -- psql -U revoagent -d revoagent_memory -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connectivity test passed"
else
    echo "❌ Database connectivity test failed"
    exit 1
fi

# Memory integration test
echo "🧠 Testing memory integration..."
BACKEND_POD=$(kubectl get pods -n revoagent-memory -l app=revoagent-backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n revoagent-memory $BACKEND_POD -- python -c "
import asyncio
import sys
sys.path.append('/app')
from packages.ai.cognee_model_manager import create_memory_enabled_model_manager

async def test():
    try:
        config = {'memory_config': {'enable_memory': True}}
        manager = create_memory_enabled_model_manager(config)
        await manager.initialize()
        stats = manager.get_memory_statistics()
        print('Memory integration test passed:', stats['cognee_initialized'])
        return 0 if stats['cognee_initialized'] else 1
    except Exception as e:
        print('Memory integration test failed:', str(e))
        return 1

exit_code = asyncio.run(test())
exit(exit_code)
"

if [ $? -eq 0 ]; then
    echo "✅ Memory integration test passed"
else
    echo "❌ Memory integration test failed"
    exit 1
fi

# Final status
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
kubectl get all -n revoagent-memory
echo ""
echo "📍 Service Endpoints:"
echo "   Application: http://$INGRESS_IP"
echo "   API Documentation: http://$INGRESS_IP/docs"
echo "   Memory API: http://$INGRESS_IP/api/memory/"
echo ""
echo "📈 Monitoring:"
echo "   Grafana: http://$INGRESS_IP:3001"
echo "   Prometheus: http://$INGRESS_IP:9090"
echo ""
echo "💾 Backup Location: $BACKUP_DIR"
echo ""
echo "✅ reVoAgent Memory Integration is now live in production!"