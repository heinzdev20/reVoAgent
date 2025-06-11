#!/usr/bin/env python3
"""
Quick Start Script for Refactored reVoAgent Backend
Tests the new modular architecture
"""

import asyncio
import sys
import logging
from pathlib import Path

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_refactored_backend():
    """Test the refactored backend services"""
    
    print("🚀 Testing reVoAgent Refactored Backend")
    print("=" * 50)
    
    try:
        # Test 1: Import and initialize AI Service
        print("🤖 Testing AI Service...")
        from apps.backend.services.ai_service import create_production_ai_service
        ai_service = await create_production_ai_service()
        print("✅ AI Service initialized successfully")
        
        # Test 2: Test Cost Optimizer
        print("💰 Testing Cost Optimizer...")
        from apps.backend.services.cost_optimizer import CostOptimizedRouter, calculate_expected_savings
        cost_optimizer = CostOptimizedRouter()
        expected_savings = calculate_expected_savings()
        print(f"✅ Cost Optimizer initialized - Expected savings: {expected_savings['savings_percentage']:.1%}")
        
        # Test 3: Test Quality Gates
        print("🛡️ Testing Quality Gates...")
        from apps.backend.services.quality_gates import QualityGates
        quality_gates = QualityGates()
        print("✅ Quality Gates initialized successfully")
        
        # Test 4: Test Team Coordinator
        print("👥 Testing Team Coordinator...")
        from apps.backend.services.ai_team_coordinator import AITeamCoordinator
        team_coordinator = AITeamCoordinator(ai_service)
        await team_coordinator.start_coordination()
        team_status = team_coordinator.get_team_status()
        print(f"✅ Team Coordinator initialized - {team_status['team_metrics']['total_agents']} agents ready")
        
        # Test 5: Test Monitoring
        print("📊 Testing Monitoring System...")
        from apps.backend.services.ai_team_monitoring import AITeamMonitoring
        monitoring = AITeamMonitoring(team_coordinator, cost_optimizer, quality_gates)
        await monitoring.start_monitoring()
        print("✅ Monitoring system initialized successfully")
        
        # Test 6: Test API Generation
        print("🔬 Testing AI Generation...")
        from apps.backend.services.ai_service import GenerationRequest
        
        test_request = GenerationRequest(
            prompt="Generate a simple Python function to calculate factorial",
            max_tokens=500,
            temperature=0.3,
            force_local=True
        )
        
        response = await ai_service.generate_with_cost_optimization(test_request)
        print(f"✅ AI Generation test - Model: {response.model_used}, Cost: ${response.cost:.4f}")
        
        # Test 7: Test Quality Validation
        print("🔍 Testing Quality Validation...")
        test_code = '''
def factorial(n):
    """Calculate factorial of n"""
    if n <= 1:
        return 1
    return n * factorial(n - 1)
'''
        
        validation_report = await quality_gates.validate_generated_code(test_code, "test-agent", "code")
        print(f"✅ Quality validation - Score: {validation_report.quality_metrics.overall_score:.1f}%")
        
        # Test 8: Get Dashboard Data
        print("📈 Testing Dashboard...")
        dashboard_data = await monitoring.get_real_time_dashboard()
        print(f"✅ Dashboard data retrieved - {len(dashboard_data)} metrics available")
        
        print("\n" + "=" * 50)
        print("🎉 ALL TESTS PASSED!")
        print("🚀 Refactored Backend is Ready for Production!")
        print("\n📊 Summary:")
        print(f"   - AI Service: ✅ Operational")
        print(f"   - Cost Optimizer: ✅ {expected_savings['savings_percentage']:.1%} savings expected")
        print(f"   - Quality Gates: ✅ Operational")
        print(f"   - Team Coordinator: ✅ {team_status['team_metrics']['total_agents']} agents")
        print(f"   - Monitoring: ✅ Real-time dashboard ready")
        
        # Cleanup
        await monitoring.shutdown()
        await team_coordinator.shutdown()
        await ai_service.shutdown()
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        logger.error(f"Backend test error: {e}", exc_info=True)
        return False

async def main():
    """Main test function"""
    success = await test_refactored_backend()
    
    if success:
        print("\n🎯 Next Steps:")
        print("1. Run: python main.py")
        print("2. Open: http://localhost:8000/docs")
        print("3. Test API endpoints")
        print("4. Monitor dashboard at: http://localhost:8000/api/v1/monitoring/dashboard")
    else:
        print("\n🔧 Fix the issues above and try again")
    
    return success

if __name__ == "__main__":
    asyncio.run(main())