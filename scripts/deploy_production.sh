#!/bin/bash

# 🚀 Production Deployment Script for Three-Engine Architecture
# Deploys the revolutionary reVoAgent system with full monitoring and security

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_MODE=${1:-docker}  # docker, kubernetes, or local
ENVIRONMENT=${2:-production}
MONITORING=${3:-true}

echo -e "${CYAN}🎯 reVoAgent Three-Engine Architecture Deployment${NC}"
echo -e "${CYAN}=================================================${NC}"
echo -e "Deployment Mode: ${YELLOW}$DEPLOYMENT_MODE${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Monitoring: ${YELLOW}$MONITORING${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Build Docker images
build_images() {
    print_status "Building Docker images for Three-Engine Architecture..."
    
    # Build Perfect Recall Engine
    print_status "🧠 Building Perfect Recall Engine..."
    docker build -f docker/Dockerfile.perfect-recall -t revoagent/perfect-recall:latest .
    
    # Build Parallel Mind Engine
    print_status "⚡ Building Parallel Mind Engine..."
    docker build -f docker/Dockerfile.parallel-mind -t revoagent/parallel-mind:latest .
    
    # Build Creative Engine
    print_status "🎨 Building Creative Engine..."
    docker build -f docker/Dockerfile.creative-engine -t revoagent/creative-engine:latest .
    
    # Build Engine Coordinator
    print_status "🔄 Building Engine Coordinator..."
    docker build -f docker/Dockerfile.coordinator -t revoagent/coordinator:latest .
    
    print_success "All Docker images built successfully"
}

# Deploy with Docker Compose
deploy_docker() {
    print_status "Deploying with Docker Compose..."
    
    # Create necessary directories
    mkdir -p logs data/redis data/chromadb data/prometheus data/grafana
    
    # Set permissions
    chmod 755 logs data
    
    # Deploy infrastructure
    print_status "🏗️ Starting infrastructure services..."
    docker-compose -f docker/docker-compose.production.yml up -d redis-cluster-1 redis-cluster-2 redis-cluster-3 chromadb-cluster
    
    # Wait for infrastructure to be ready
    print_status "⏳ Waiting for infrastructure to be ready..."
    sleep 30
    
    # Deploy monitoring stack if enabled
    if [ "$MONITORING" = "true" ]; then
        print_status "📊 Starting monitoring stack..."
        docker-compose -f docker/docker-compose.production.yml up -d prometheus grafana
        sleep 10
    fi
    
    # Deploy Three-Engine Architecture
    print_status "🎯 Starting Three-Engine Architecture..."
    docker-compose -f docker/docker-compose.production.yml up -d perfect-recall-cluster parallel-mind-cluster creative-engine-cluster
    
    # Wait for engines to be ready
    print_status "⏳ Waiting for engines to initialize..."
    sleep 45
    
    # Deploy Engine Coordinator
    print_status "🔄 Starting Engine Coordinator..."
    docker-compose -f docker/docker-compose.production.yml up -d engine-coordinator
    
    # Deploy load balancer
    print_status "🌐 Starting load balancer..."
    docker-compose -f docker/docker-compose.production.yml up -d traefik
    
    print_success "Docker deployment completed successfully"
}

# Deploy with Kubernetes
deploy_kubernetes() {
    print_status "Deploying with Kubernetes..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    # Apply Kubernetes manifests
    print_status "🚀 Applying Kubernetes manifests..."
    kubectl apply -f k8s/three-engine-deployment.yaml
    
    # Wait for deployments to be ready
    print_status "⏳ Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/perfect-recall-engine -n revoagent
    kubectl wait --for=condition=available --timeout=300s deployment/parallel-mind-engine -n revoagent
    kubectl wait --for=condition=available --timeout=300s deployment/creative-engine -n revoagent
    kubectl wait --for=condition=available --timeout=300s deployment/engine-coordinator -n revoagent
    
    print_success "Kubernetes deployment completed successfully"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    local base_url="http://localhost"
    if [ "$DEPLOYMENT_MODE" = "kubernetes" ]; then
        base_url="http://$(kubectl get service coordinator-service -n revoagent -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
    fi
    
    # Check Perfect Recall Engine
    print_status "🧠 Checking Perfect Recall Engine..."
    if curl -f -s "$base_url:8001/health" > /dev/null; then
        print_success "Perfect Recall Engine is healthy"
    else
        print_warning "Perfect Recall Engine health check failed"
    fi
    
    # Check Parallel Mind Engine
    print_status "⚡ Checking Parallel Mind Engine..."
    if curl -f -s "$base_url:8002/health" > /dev/null; then
        print_success "Parallel Mind Engine is healthy"
    else
        print_warning "Parallel Mind Engine health check failed"
    fi
    
    # Check Creative Engine
    print_status "🎨 Checking Creative Engine..."
    if curl -f -s "$base_url:8003/health" > /dev/null; then
        print_success "Creative Engine is healthy"
    else
        print_warning "Creative Engine health check failed"
    fi
    
    # Check Engine Coordinator
    print_status "🔄 Checking Engine Coordinator..."
    if curl -f -s "$base_url:8000/health" > /dev/null; then
        print_success "Engine Coordinator is healthy"
    else
        print_warning "Engine Coordinator health check failed"
    fi
}

# Display deployment information
show_deployment_info() {
    echo ""
    echo -e "${CYAN}🎉 Three-Engine Architecture Deployment Complete!${NC}"
    echo -e "${CYAN}=================================================${NC}"
    echo ""
    echo -e "${GREEN}🧠 Perfect Recall Engine:${NC} http://localhost:8001"
    echo -e "${GREEN}⚡ Parallel Mind Engine:${NC} http://localhost:8002"
    echo -e "${GREEN}🎨 Creative Engine:${NC} http://localhost:8003"
    echo -e "${GREEN}🔄 Engine Coordinator:${NC} http://localhost:8000"
    echo ""
    
    if [ "$MONITORING" = "true" ]; then
        echo -e "${PURPLE}📊 Monitoring Dashboards:${NC}"
        echo -e "${PURPLE}  Grafana:${NC} http://localhost:3000 (admin/revoagent_admin)"
        echo -e "${PURPLE}  Prometheus:${NC} http://localhost:9090"
        echo -e "${PURPLE}  Traefik:${NC} http://localhost:8080"
        echo ""
    fi
    
    echo -e "${YELLOW}📋 Quick Commands:${NC}"
    echo -e "  View logs: ${CYAN}docker-compose -f docker/docker-compose.production.yml logs -f${NC}"
    echo -e "  Scale engines: ${CYAN}docker-compose -f docker/docker-compose.production.yml up -d --scale perfect-recall-cluster=5${NC}"
    echo -e "  Stop deployment: ${CYAN}docker-compose -f docker/docker-compose.production.yml down${NC}"
    echo ""
    
    echo -e "${GREEN}🚀 Revolutionary Three-Engine Architecture is now running!${NC}"
}

# Run benchmark
run_benchmark() {
    print_status "Running performance benchmark..."
    
    # Wait for system to stabilize
    sleep 30
    
    # Run benchmark script
    if [ -f "scripts/benchmarks/engine_performance_benchmark.py" ]; then
        python3 scripts/benchmarks/engine_performance_benchmark.py
        print_success "Benchmark completed"
    else
        print_warning "Benchmark script not found"
    fi
}

# Main deployment flow
main() {
    check_prerequisites
    
    case $DEPLOYMENT_MODE in
        "docker")
            build_images
            deploy_docker
            ;;
        "kubernetes")
            build_images
            deploy_kubernetes
            ;;
        "local")
            print_status "Local development deployment not implemented yet"
            exit 1
            ;;
        *)
            print_error "Unknown deployment mode: $DEPLOYMENT_MODE"
            print_error "Supported modes: docker, kubernetes, local"
            exit 1
            ;;
    esac
    
    # Wait for services to stabilize
    sleep 60
    
    # Perform health checks
    health_check
    
    # Show deployment information
    show_deployment_info
    
    # Run benchmark if requested
    if [ "${4:-false}" = "benchmark" ]; then
        run_benchmark
    fi
}

# Handle script interruption
cleanup() {
    print_warning "Deployment interrupted"
    if [ "$DEPLOYMENT_MODE" = "docker" ]; then
        docker-compose -f docker/docker-compose.production.yml down
    elif [ "$DEPLOYMENT_MODE" = "kubernetes" ]; then
        kubectl delete namespace revoagent
    fi
    exit 1
}

trap cleanup INT TERM

# Run main function
main "$@"