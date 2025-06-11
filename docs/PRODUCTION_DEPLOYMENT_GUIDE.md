# 🚀 reVoAgent Production Deployment Guide

**Version**: 1.0  
**Date**: June 11, 2025  
**Target**: Enterprise Production Environment

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Deployment](#quick-start-deployment)
3. [Detailed Deployment Steps](#detailed-deployment-steps)
4. [Configuration](#configuration)
5. [Monitoring Setup](#monitoring-setup)
6. [Security Hardening](#security-hardening)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## 🎯 Prerequisites

### System Requirements

**Minimum Requirements**:
- **CPU**: 4 cores (8 recommended)
- **RAM**: 16GB (32GB recommended for local AI models)
- **Storage**: 100GB SSD (500GB recommended)
- **Network**: 1Gbps connection

**Software Requirements**:
- **Docker**: 20.10+ with Docker Compose
- **Kubernetes**: 1.24+ (for production scaling)
- **kubectl**: Latest version
- **Git**: 2.30+

### Infrastructure Requirements

**Cloud Providers** (Choose one):
- **AWS**: EKS cluster with EC2 instances
- **Google Cloud**: GKE cluster with Compute Engine
- **Azure**: AKS cluster with Virtual Machines
- **On-Premise**: Kubernetes cluster with bare metal/VMs

**Storage Requirements**:
- **Persistent Volumes**: 100GB for AI models
- **Database Storage**: 50GB for application data
- **Backup Storage**: 200GB for backups and logs

---

## 🚀 Quick Start Deployment

### Option 1: Docker Compose (Development/Small Production)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/revoagent.git
cd revoagent

# 2. Configure environment
cp config/config.example.yaml config/production.yaml
# Edit config/production.yaml with your settings

# 3. Start the platform
docker-compose -f docker-compose.production.yml up -d

# 4. Verify deployment
curl http://localhost:8000/health
```

### Option 2: Kubernetes (Production)

```bash
# 1. Clone and configure
git clone https://github.com/your-org/revoagent.git
cd revoagent

# 2. Create namespace
kubectl create namespace revoagent

# 3. Configure secrets
kubectl create secret generic revoagent-secrets \
  --from-literal=JWT_SECRET=your-super-secret-jwt-key \
  --from-literal=OPENAI_API_KEY=sk-proj-your-openai-key \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-your-anthropic-key \
  --namespace=revoagent

# 4. Deploy to Kubernetes
kubectl apply -f k8s-deployment.yaml -n revoagent

# 5. Verify deployment
kubectl get pods -n revoagent
kubectl get services -n revoagent
```

---

## 📋 Detailed Deployment Steps

### Step 1: Environment Preparation

#### 1.1 Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install kubectl (for Kubernetes)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

#### 1.2 Firewall Configuration

```bash
# Allow required ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # API Server
sudo ufw allow 3000/tcp  # Grafana (if monitoring)
sudo ufw enable
```

### Step 2: Application Configuration

#### 2.1 Environment Variables

Create `config/production.yaml`:

```yaml
# reVoAgent Production Configuration

# API Server Configuration
api:
  host: "0.0.0.0"
  port: 8000
  workers: 4
  reload: false
  log_level: "info"

# Database Configuration
database:
  url: "sqlite:///data/revoagent.db"
  pool_size: 20
  max_overflow: 30
  echo: false

# AI Model Configuration
ai_models:
  force_local: true
  model_preference: "auto"
  cost_limit: 0.01
  fallback_allowed: true
  
  # Local Models (Priority 1-2)
  deepseek:
    enabled: true
    model_path: "/models/deepseek-r1"
    max_tokens: 32768
    temperature: 0.7
    
  llama:
    enabled: true
    model_path: "/models/llama-3.1-70b"
    max_tokens: 8192
    temperature: 0.7
    
  # Cloud Models (Fallback)
  openai:
    enabled: true
    api_key: "${OPENAI_API_KEY}"
    model: "gpt-4"
    max_tokens: 4096
    
  anthropic:
    enabled: true
    api_key: "${ANTHROPIC_API_KEY}"
    model: "claude-3-5-sonnet-20241022"
    max_tokens: 4096

# Security Configuration
security:
  jwt_secret: "${JWT_SECRET}"
  jwt_expiry_hours: 24
  max_login_attempts: 5
  lockout_duration: 1800
  cors_origins: ["https://yourdomain.com"]
  
# Real-time Communication
realtime:
  redis_url: "redis://redis:6379"
  max_connections: 1000
  heartbeat_interval: 30

# Monitoring
monitoring:
  enabled: true
  prometheus_port: 9090
  metrics_path: "/metrics"
  log_level: "info"

# Performance
performance:
  max_concurrent_requests: 100
  request_timeout: 300
  cache_ttl: 3600
```

#### 2.2 Secrets Management

```bash
# Generate secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Create secrets file (DO NOT COMMIT TO GIT)
cat > .env.production << EOF
JWT_SECRET=${JWT_SECRET}
OPENAI_API_KEY=sk-proj-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
DATABASE_URL=postgresql://user:pass@localhost:5432/revoagent
REDIS_URL=redis://localhost:6379
EOF

# Secure the secrets file
chmod 600 .env.production
```

### Step 3: Database Setup

#### 3.1 SQLite (Default)

```bash
# Create data directory
mkdir -p data
chmod 755 data

# Initialize database (automatic on first run)
# Database will be created at data/revoagent.db
```

#### 3.2 PostgreSQL (Recommended for Production)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE revoagent;
CREATE USER revoagent WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE revoagent TO revoagent;
\q
EOF

# Update configuration
# Change database.url in config/production.yaml to:
# postgresql://revoagent:secure_password@localhost:5432/revoagent
```

### Step 4: AI Models Setup

#### 4.1 Download Local Models

```bash
# Create models directory
mkdir -p models
cd models

# Download DeepSeek R1 (example - adjust for actual model)
# Note: Replace with actual download commands for your models
wget https://example.com/deepseek-r1-model.bin -O deepseek-r1/model.bin

# Download Llama 3.1 70B (example)
wget https://example.com/llama-3.1-70b.bin -O llama-3.1-70b/model.bin

# Set permissions
chmod -R 755 models/
```

#### 4.2 Model Configuration

```bash
# Test model loading
python -c "
from packages.ai.enhanced_model_manager import EnhancedModelManager
manager = EnhancedModelManager()
print('Models configured:', len(manager.models))
"
```

### Step 5: Production Deployment

#### 5.1 Docker Compose Deployment

```bash
# Build production image
docker build -t revoagent:latest .

# Start services
docker-compose -f docker-compose.production.yml up -d

# Verify services
docker-compose ps
docker-compose logs -f revoagent-api
```

#### 5.2 Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get deployments -n revoagent
kubectl get pods -n revoagent
kubectl get services -n revoagent

# Check logs
kubectl logs -f deployment/revoagent-api -n revoagent
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_HOST` | API server host | `0.0.0.0` | No |
| `API_PORT` | API server port | `8000` | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `OPENAI_API_KEY` | OpenAI API key | - | No* |
| `ANTHROPIC_API_KEY` | Anthropic API key | - | No* |
| `DATABASE_URL` | Database connection URL | SQLite | No |
| `REDIS_URL` | Redis connection URL | - | Yes |
| `FORCE_LOCAL_MODELS` | Force local model usage | `true` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

*Required only if using cloud model fallbacks

### Resource Allocation

#### Docker Compose

```yaml
# docker-compose.production.yml
services:
  revoagent-api:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G
```

#### Kubernetes

```yaml
# k8s-deployment.yaml
resources:
  requests:
    memory: "4Gi"
    cpu: "2000m"
  limits:
    memory: "8Gi"
    cpu: "4000m"
```

---

## 📊 Monitoring Setup

### Prometheus + Grafana

```bash
# Start monitoring stack
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
# URL: http://localhost:3000
# Username: admin
# Password: revoagent123

# Import dashboard
# Use grafana-dashboard.json for reVoAgent metrics
```

### Health Checks

```bash
# API Health
curl http://localhost:8000/health

# Metrics Endpoint
curl http://localhost:8000/metrics

# Database Health
curl http://localhost:8000/health/database

# AI Models Health
curl http://localhost:8000/health/models
```

---

## 🔒 Security Hardening

### SSL/TLS Setup

#### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Using Custom Certificate

```bash
# Place certificates
sudo mkdir -p /etc/ssl/revoagent
sudo cp your-cert.pem /etc/ssl/revoagent/
sudo cp your-key.pem /etc/ssl/revoagent/
sudo chmod 600 /etc/ssl/revoagent/*
```

### Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Security Headers

Add to Nginx configuration:

```nginx
# /etc/nginx/sites-available/revoagent
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'";
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. API Server Won't Start

```bash
# Check logs
docker-compose logs revoagent-api

# Common causes:
# - Port already in use
# - Missing environment variables
# - Database connection issues
# - Insufficient permissions

# Solutions:
sudo netstat -tulpn | grep :8000  # Check port usage
docker-compose down && docker-compose up -d  # Restart
```

#### 2. High Memory Usage

```bash
# Check memory usage
docker stats

# Optimize:
# - Reduce model size
# - Limit concurrent requests
# - Increase swap space
# - Scale horizontally
```

#### 3. Slow Response Times

```bash
# Check metrics
curl http://localhost:8000/metrics | grep response_time

# Optimize:
# - Enable local models
# - Increase worker count
# - Add caching
# - Check database performance
```

#### 4. Database Connection Issues

```bash
# Test database connection
python -c "
import sqlite3
conn = sqlite3.connect('data/revoagent.db')
print('Database connection successful')
conn.close()
"

# For PostgreSQL:
psql -h localhost -U revoagent -d revoagent -c "SELECT 1;"
```

### Log Analysis

```bash
# View application logs
docker-compose logs -f revoagent-api

# Search for errors
docker-compose logs revoagent-api | grep ERROR

# Monitor real-time logs
tail -f /var/log/revoagent/app.log
```

### Performance Monitoring

```bash
# CPU and Memory usage
htop

# Disk usage
df -h
du -sh data/

# Network connections
ss -tulpn | grep :8000
```

---

## 🔄 Maintenance

### Regular Tasks

#### Daily
- [ ] Check system health
- [ ] Monitor disk space
- [ ] Review error logs
- [ ] Verify backup completion

#### Weekly
- [ ] Update security patches
- [ ] Review performance metrics
- [ ] Clean old logs
- [ ] Test backup restoration

#### Monthly
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization
- [ ] Capacity planning review

### Backup Procedures

#### Database Backup

```bash
# SQLite backup
cp data/revoagent.db backups/revoagent-$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump -h localhost -U revoagent revoagent > backups/revoagent-$(date +%Y%m%d).sql
```

#### Full System Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup database
cp data/revoagent.db $BACKUP_DIR/

# Backup configuration
cp -r config/ $BACKUP_DIR/

# Backup models (if local)
cp -r models/ $BACKUP_DIR/

# Backup logs
cp -r logs/ $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR/
rm -rf $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR.tar.gz"
EOF

chmod +x backup.sh
```

### Updates and Upgrades

#### Application Updates

```bash
# Pull latest code
git pull origin main

# Rebuild image
docker build -t revoagent:latest .

# Rolling update (Kubernetes)
kubectl set image deployment/revoagent-api revoagent=revoagent:latest -n revoagent

# Update (Docker Compose)
docker-compose down
docker-compose up -d
```

#### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo apt install docker-ce docker-ce-cli containerd.io

# Update kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

---

## 📞 Support

### Getting Help

- **Documentation**: [docs/](../docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/revoagent/issues)
- **Community**: [Discord/Slack Channel]
- **Enterprise Support**: support@revoagent.com

### Emergency Contacts

- **Critical Issues**: +1-XXX-XXX-XXXX
- **Security Issues**: security@revoagent.com
- **Technical Support**: tech@revoagent.com

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] System requirements met
- [ ] Dependencies installed
- [ ] Configuration files created
- [ ] Secrets configured
- [ ] SSL certificates obtained
- [ ] Firewall configured
- [ ] Backup strategy planned

### Deployment
- [ ] Application deployed
- [ ] Database initialized
- [ ] AI models loaded
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] SSL/TLS working
- [ ] Performance tested

### Post-Deployment
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Monitoring alerts configured
- [ ] Backup tested
- [ ] Documentation updated
- [ ] Team trained
- [ ] Go-live approved

---

**🎉 Congratulations! Your reVoAgent production deployment is complete and ready to revolutionize AI-powered development with 95% cost savings!**