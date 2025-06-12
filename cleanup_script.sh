#!/bin/bash

# reVoAgent Repository Cleanup Script
# This script removes unnecessary files and organizes the repository structure

echo "🧹 reVoAgent Repository Cleanup Script"
echo "========================================"
echo ""

# Create backup directory
echo "📦 Creating backup directory..."
mkdir -p cleanup_backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="cleanup_backup/$(date +%Y%m%d_%H%M%S)"

# Function to move file to backup and delete
backup_and_remove() {
    if [ -f "$1" ]; then
        echo "   Removing: $1"
        mv "$1" "$BACKUP_DIR/"
    fi
}

echo ""
echo "🗑️  Phase 1: Removing completion reports and analysis documents..."

# Delete completion reports
backup_and_remove "FINAL_100_PERCENT_COMPLETION.md"
backup_and_remove "FINAL_100_PERCENT_COMPLETION_REPORT.md"
backup_and_remove "FINAL_PHASE_1_2_COMPLETION_REPORT.md"
backup_and_remove "PHASE_1_2_100_PERCENT_COMPLETE.md"
backup_and_remove "PHASE_1_2_COMPLETION_PLAN.md"
backup_and_remove "PHASE_1_2_COMPLETION_RESULTS.json"
backup_and_remove "PHASE_1_2_COMPLETION_SUMMARY.md"
backup_and_remove "PHASE_1_2_COMPLETION_VALIDATION.py"
backup_and_remove "PHASE_1_COMPLETION_SUMMARY.md"
backup_and_remove "PHASE_2_COMPLETION_REPORT.md"
backup_and_remove "PHASE_2_TESTING_INFRASTRUCTURE_COMPLETE.md"
backup_and_remove "PHASE_2_WEEK_2_REAL_IMPLEMENTATION.md"
backup_and_remove "PHASE_3_100_PERCENT_COMPLETION_REPORT.md"
backup_and_remove "PHASE_3_4_100_PERCENT_COMPLETION_CHECKLIST.md"
backup_and_remove "PHASE_3_4_ACTION_PLAN.md"
backup_and_remove "PHASE_3_4_ASSESSMENT_RESULTS.json"
backup_and_remove "PHASE_3_4_COMPLETION_ACTION_PLAN.md"
backup_and_remove "PHASE_3_4_COMPLETION_CHECKLIST.md"
backup_and_remove "PHASE_3_4_COMPLETION_STATUS.md"
backup_and_remove "PHASE_3_4_FINAL_COMPLETION_PLAN.md"
backup_and_remove "PHASE_3_4_PRIORITIZED_COMPLETION_CHECKLIST.md"
backup_and_remove "PHASE_3_COMPLETION_FINAL_SUMMARY.md"
backup_and_remove "PHASE_3_COMPLETION_REPORT.md"
backup_and_remove "PHASE_3_COMPLETION_SUMMARY.md"
backup_and_remove "PHASE_3_DAY_42_COMPLETION_SUMMARY.md"
backup_and_remove "PHASE_3_ENTERPRISE_DEPLOYMENT.md"
backup_and_remove "PHASE_3_EXECUTION_READY.md"
backup_and_remove "PHASE_3_FINAL_COMPLETION_REPORT.md"
backup_and_remove "PHASE_3_FINAL_FIXES.md"
backup_and_remove "PHASE_3_FINAL_IMPLEMENTATION_PLAN.md"
backup_and_remove "PHASE_3_FRONTEND_INTEGRATION_PLAN.md"
backup_and_remove "PHASE_3_IMMEDIATE_ACTIONS_COMPLETE.md"
backup_and_remove "PHASE_3_MISSION_ACCOMPLISHED.md"
backup_and_remove "PHASE_4_COMPLETE_FINAL_SUMMARY.md"
backup_and_remove "PHASE_4_COMPLETION_REPORT.json"
backup_and_remove "PHASE_4_COMPLETION_SUMMARY.md"
backup_and_remove "PHASE_4_ENHANCED_AGENTS_COMPLETE.md"
backup_and_remove "PHASE_4_FINAL_COMPLETION_REPORT.md"
backup_and_remove "PHASE_4_MODIFIED_STRATEGY.md"
backup_and_remove "PHASE_5_AI_INTELLIGENCE_COMPLETE.md"
backup_and_remove "PHASE5_ENTERPRISE_ROADMAP.json"

echo ""
echo "🗑️  Phase 2: Removing analysis and consultation documents..."

# Delete analysis documents
backup_and_remove "CONSULTATION_ANALYSIS_COMPLETE.md"
backup_and_remove "CONSULTATION_ANALYSIS_RESPONSE.md"
backup_and_remove "CONSULTATION_COMPLIANCE_VERIFICATION.md"
backup_and_remove "CURRENT_SITUATION_ANALYSIS.md"
backup_and_remove "CURRENT_SITUATION_SUMMARY.md"
backup_and_remove "IMPLEMENTATION_PROGRESS_REPORT.md"
backup_and_remove "IMPLEMENTATION_STATUS_REPORT.md"
backup_and_remove "PRIORITY_ACTIONS_COMPLETED.md"
backup_and_remove "PRIORITY_ACTIONS_COMPLETE_SUMMARY.md"
backup_and_remove "PRIORITY_ACTION_PLAN_ANALYSIS.md"
backup_and_remove "PRIORITY_ACTION_PLAN_RECAP.md"
backup_and_remove "TRANSFORMATION_PROGRESS.md"
backup_and_remove "TRANSFORMATION_STATUS_REPORT.md"

echo ""
echo "🗑️  Phase 3: Removing enhancement and strategy documents..."

# Delete enhancement documents
backup_and_remove "ENHANCEMENT_IMPLEMENTATION_ROADMAP.md"
backup_and_remove "ENHANCEMENT_SYNTHESIS_SUMMARY.md"
backup_and_remove "STRATEGIC_REFACTORING_COMPLETE.md"
backup_and_remove "WEEK_1_REFACTORING_COMPLETE.md"
backup_and_remove "WEEK_2_IMPLEMENTATION_COMPLETE.md"
backup_and_remove "EMERGENCY_REFACTORING_COMPLETE.md"
backup_and_remove "CRITICAL_BLOCKER_RESOLVED.md"
backup_and_remove "CRITICAL_FIXES_IMPLEMENTATION_SUMMARY.md"
backup_and_remove "MINOR_GAPS_RESOLVED.md"
backup_and_remove "REAL_IMPLEMENTATION_COMPLETE.md"
backup_and_remove "REMAINING_ITEMS_IMPLEMENTATION_COMPLETE.md"

echo ""
echo "🗑️  Phase 4: Removing integration and deployment documents..."

# Delete integration documents
backup_and_remove "INTEGRATION_COMPLETE.md"
backup_and_remove "FRONTEND_INTEGRATION_COMPLETE.md"
backup_and_remove "MEMORY_INTEGRATION_COMPLETE.md"
backup_and_remove "THREE_ENGINE_INTEGRATION_COMPLETE.md"
backup_and_remove "REVO_CHAT_IMPLEMENTATION_COMPLETE.md"
backup_and_remove "UI_ENHANCEMENT_COMPLETION_SUMMARY.md"

echo ""
echo "🗑️  Phase 5: Removing test and validation files..."

# Delete testing and validation files
backup_and_remove "COMPREHENSIVE_TESTING_COMPLETE.md"
backup_and_remove "test_phase_completion_final.py"
backup_and_remove "end_to_end_workflow_test.py"
backup_and_remove "end_to_end_workflow_test_results.json"
backup_and_remove "assess_phase_3_4_completion.py"
backup_and_remove "comprehensive_enterprise_testing.py"
backup_and_remove "comprehensive_enterprise_test_results.json"
backup_and_remove "comprehensive_system_validation.py"
backup_and_remove "compliance_validation_results.json"
backup_and_remove "enterprise_load_test_results.json"

echo ""
echo "🗑️  Phase 6: Removing demo and development files..."

# Delete demo files
backup_and_remove "demo_enhanced_architecture.py"
backup_and_remove "demo_final_enhanced_system.py"
backup_and_remove "demo_integrated_system.py"
backup_and_remove "demo_refactored_api.py"
backup_and_remove "demo_results.json"
backup_and_remove "final_demo_results.json"

echo ""
echo "🗑️  Phase 7: Removing enterprise and production documents..."

# Delete enterprise documents
backup_and_remove "ENTERPRISE_BOOST_TO_100_PERCENT.py"
backup_and_remove "ENTERPRISE_DEPLOYMENT_GUIDE.md"
backup_and_remove "ENTERPRISE_READINESS_100_PERCENT.md"
backup_and_remove "PRODUCTION_DEPLOYMENT_CONFIG.md"
backup_and_remove "PRODUCTION_DEPLOYMENT_READY.md"
backup_and_remove "PRODUCTION_IMPLEMENTATION_GUIDE.md"
backup_and_remove "PRODUCTION_READINESS_ASSESSMENT.md"
backup_and_remove "PRODUCTION_READINESS_SUMMARY.md"
backup_and_remove "PRODUCTION_READY_COMPLETE.md"
backup_and_remove "MVP_DEPLOYMENT_READY.md"

echo ""
echo "🗑️  Phase 8: Removing duplicate documentation..."

# Delete duplicate documentation
backup_and_remove "README_COMPLETE.md"
backup_and_remove "README_OLD.md"
backup_and_remove "Read_Me-Strucutre_topsection.md"

echo ""
echo "🗑️  Phase 9: Removing miscellaneous analysis files..."

# Delete miscellaneous files
backup_and_remove "DEPENDENCY_UPDATE_REPORT.md"
backup_and_remove "DEPENDENCY_UPDATE_SUMMARY.md"
backup_and_remove "DEPLOYMENT_SUCCESS_SUMMARY.md"
backup_and_remove "GITHUB_PUSH_SUMMARY.md"
backup_and_remove "PUSH_SUMMARY.md"
backup_and_remove "MISSION_ACCOMPLISHED_SUMMARY.md"
backup_and_remove "NEXT_PHASE_ACTION_PLAN.md"
backup_and_remove "NEXT_PHASE_FRONTEND_PRODUCTION_PLAN.md"
backup_and_remove "NEXT_PHASE_IMPLEMENTATION_README.md"
backup_and_remove "NEXT_PHASE_IMPLEMENTATION_SUMMARY.md"
backup_and_remove "NEXT_PHASE_TECHNICAL_IMPLEMENTATION.md"
backup_and_remove "PHASE1_ENHANCED_DASHBOARD_IMPLEMENTATION.md"
backup_and_remove "complete_deployment_config.txt"
backup_and_remove "comprehensive_revoagent_strategy.md"

echo ""
echo "📁 Phase 10: Creating organized structure..."

# Create archive directory for moved files
if [ ! -d "archive" ]; then
    mkdir archive
    echo "   Created: archive/ directory"
fi

# Move frontend App variants to organized structure
if [ -d "frontend/src" ]; then
    if [ ! -d "frontend/src/apps" ]; then
        mkdir -p frontend/src/apps
        echo "   Created: frontend/src/apps/ directory"
    fi
    
    # Move alternative app files
    if [ -f "frontend/src/DebugApp.tsx" ]; then
        mv frontend/src/DebugApp.tsx frontend/src/apps/
        echo "   Moved: DebugApp.tsx to apps/"
    fi
    if [ -f "frontend/src/DemoLoginApp.tsx" ]; then
        mv frontend/src/DemoLoginApp.tsx frontend/src/apps/
        echo "   Moved: DemoLoginApp.tsx to apps/"
    fi
    if [ -f "frontend/src/EnterpriseApp.tsx" ]; then
        mv frontend/src/EnterpriseApp.tsx frontend/src/apps/
        echo "   Moved: EnterpriseApp.tsx to apps/"
    fi
    if [ -f "frontend/src/MinimalApp.tsx" ]; then
        mv frontend/src/MinimalApp.tsx frontend/src/apps/
        echo "   Moved: MinimalApp.tsx to apps/"
    fi
    if [ -f "frontend/src/SimpleApp.tsx" ]; then
        mv frontend/src/SimpleApp.tsx frontend/src/apps/
        echo "   Moved: SimpleApp.tsx to apps/"
    fi
    if [ -f "frontend/src/SimpleDebugApp.tsx" ]; then
        mv frontend/src/SimpleDebugApp.tsx frontend/src/apps/
        echo "   Moved: SimpleDebugApp.tsx to apps/"
    fi
    if [ -f "frontend/src/TestApp.tsx" ]; then
        mv frontend/src/TestApp.tsx frontend/src/apps/
        echo "   Moved: TestApp.tsx to apps/"
    fi
    if [ -f "frontend/src/UnifiedApp.tsx" ]; then
        mv frontend/src/UnifiedApp.tsx frontend/src/apps/
        echo "   Moved: UnifiedApp.tsx to apps/"
    fi
    if [ -f "frontend/src/WorkingApp.tsx" ]; then
        mv frontend/src/WorkingApp.tsx frontend/src/apps/
        echo "   Moved: WorkingApp.tsx to apps/"
    fi
fi

# Move backend variants to organized structure
if [ -d "apps/backend" ]; then
    if [ ! -d "apps/backend/variants" ]; then
        mkdir -p apps/backend/variants
        echo "   Created: apps/backend/variants/ directory"
    fi
    
    # Move alternative backend files
    if [ -f "apps/backend/enhanced_main.py" ]; then
        mv apps/backend/enhanced_main.py apps/backend/variants/
        echo "   Moved: enhanced_main.py to variants/"
    fi
    if [ -f "apps/backend/main_realtime.py" ]; then
        mv apps/backend/main_realtime.py apps/backend/variants/
        echo "   Moved: main_realtime.py to variants/"
    fi
    if [ -f "apps/backend/main_with_auth.py" ]; then
        mv apps/backend/main_with_auth.py apps/backend/variants/
        echo "   Moved: main_with_auth.py to variants/"
    fi
    if [ -f "apps/backend/unified_main.py" ]; then
        mv apps/backend/unified_main.py apps/backend/variants/
        echo "   Moved: unified_main.py to variants/"
    fi
fi

echo ""
echo "📄 Phase 11: Creating startup scripts..."

# Create root package.json for coordination
cat > package.json << 'EOF'
{
  "name": "revoagent",
  "version": "1.0.0",
  "description": "Revolutionary Agentic Coding Platform",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd apps/backend && python main.py",
    "build": "cd frontend && npm run build",
    "start": "npm run start:backend",
    "start:backend": "cd apps/backend && python main.py",
    "install:all": "cd frontend && npm install",
    "clean": "cd frontend && rm -rf dist node_modules && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF
echo "   Created: package.json with coordination scripts"

# Create development startup script
cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting reVoAgent Development Environment..."
echo "=============================================="

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Check if Python dependencies are installed
echo "🐍 Checking Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🔗 Starting services..."
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo ""

# Start backend in background
echo "🖥️  Starting backend server..."
cd apps/backend && python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend development server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop services
wait $BACKEND_PID $FRONTEND_PID
EOF
chmod +x start-dev.sh
echo "   Created: start-dev.sh development startup script"

# Create environment template
cat > .env.example << 'EOF'
# reVoAgent Environment Configuration

# Development Environment
NODE_ENV=development
REACT_APP_API_URL=http://localhost:8000

# Server Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Database Configuration
DATABASE_URL=sqlite:///./data/revoagent.db

# AI Model Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Security Configuration
JWT_SECRET=your_jwt_secret_here

# Integration APIs (Optional)
GITHUB_TOKEN=your_github_token_here
SLACK_TOKEN=your_slack_token_here
JIRA_URL=your_jira_instance_url
JIRA_TOKEN=your_jira_token_here
EOF
echo "   Created: .env.example environment template"

echo ""
echo "🎉 Cleanup Complete!"
echo "==================="
echo ""
echo "📊 Summary:"
echo "   ✅ Removed 65+ unnecessary documentation files"
echo "   ✅ Organized frontend App variants into apps/ folder"
echo "   ✅ Organized backend variants into variants/ folder"
echo "   ✅ Created coordination package.json"
echo "   ✅ Created development startup script"
echo "   ✅ Created environment template"
echo "   ✅ Backed up all removed files to: $BACKUP_DIR"
echo ""
echo "🚀 Next Steps:"
echo "   1. Run: npm install (to install concurrently)"
echo "   2. Copy .env.example to .env and configure"
echo "   3. Run: ./start-dev.sh (to start development environment)"
echo "   4. Or use: npm run dev (alternative startup)"
echo ""
echo "🌐 Development URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""