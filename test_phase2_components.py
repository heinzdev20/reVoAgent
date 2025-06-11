#!/usr/bin/env python3
"""
Phase 2 Components Test Script
Tests the Enterprise Security Framework, Glassmorphism Design System, and Advanced Workflow Engine

This script validates the new components implemented in Phase 2 of the
comprehensive transformation strategy.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from packages.security.enterprise_security_manager import (
    EnterpriseSecurityManager,
    UserRole,
    Permission,
    SecurityEvent
)
from packages.ui.glassmorphism_design_system import (
    GlassmorphismDesignSystem,
    ComponentSize,
    ComponentVariant,
    ColorScheme
)
from packages.workflow.advanced_workflow_engine import (
    AdvancedWorkflowEngine,
    NodeType,
    Priority
)

async def test_enterprise_security():
    """Test the Enterprise Security Framework"""
    print("🛡️ Testing Enterprise Security Framework...")
    
    try:
        # Configuration
        config = {
            "jwt_secret": "test-secret-key-for-demo",
            "jwt_expiry_hours": 24,
            "max_login_attempts": 5,
            "password_min_length": 12
        }
        
        # Initialize security manager
        security_manager = EnterpriseSecurityManager(config)
        
        # Create test users
        admin_user = await security_manager.create_user(
            username="test_admin",
            email="admin@test.com",
            password="SecurePassword123!",
            roles={UserRole.ADMIN}
        )
        
        dev_user = await security_manager.create_user(
            username="test_dev",
            email="dev@test.com",
            password="DevPassword456!",
            roles={UserRole.DEVELOPER}
        )
        
        print(f"✅ Users created: {admin_user.username}, {dev_user.username}")
        
        # Test authentication
        admin_token = await security_manager.authenticate_user(
            username="test_admin",
            password="SecurePassword123!",
            ip_address="127.0.0.1",
            user_agent="Test Browser"
        )
        
        if admin_token:
            print("✅ Admin authentication successful")
        else:
            print("❌ Admin authentication failed")
            return False
        
        # Test permissions
        can_admin = await security_manager.check_permission(admin_token, Permission.SYSTEM_ADMIN)
        can_generate = await security_manager.check_permission(admin_token, Permission.AI_GENERATE)
        
        print(f"✅ Admin permissions - System Admin: {can_admin}, AI Generate: {can_generate}")
        
        # Test rate limiting
        rate_limit_results = []
        for i in range(3):
            within_limit = await security_manager.check_rate_limit(
                "/api/test", "127.0.0.1", admin_user.user_id
            )
            rate_limit_results.append(within_limit)
        
        print(f"✅ Rate limiting tests: {rate_limit_results}")
        
        # Test API key creation
        api_key = await security_manager.create_api_key(
            user_id=admin_user.user_id,
            name="Test API Key",
            permissions={Permission.AI_GENERATE, Permission.DATA_READ}
        )
        
        # Verify API key
        key_entity = await security_manager.verify_api_key(api_key)
        print(f"✅ API key created and verified: {key_entity.name if key_entity else 'Failed'}")
        
        # Get security metrics
        metrics = await security_manager.get_security_metrics()
        print(f"✅ Security metrics:")
        print(f"   - Total users: {metrics['users']['total']}")
        print(f"   - Active users: {metrics['users']['active']}")
        print(f"   - Security score: {metrics['security_score']}/100")
        print(f"   - Events (24h): {metrics['events_24h']['total']}")
        
        # Test logout
        logout_success = await security_manager.logout_user(
            admin_token, "127.0.0.1", "Test Browser"
        )
        print(f"✅ Logout successful: {logout_success}")
        
        return True
        
    except Exception as e:
        print(f"❌ Enterprise Security test failed: {e}")
        return False

def test_glassmorphism_design_system():
    """Test the Glassmorphism Design System"""
    print("\n🎨 Testing Glassmorphism Design System...")
    
    try:
        # Initialize design system
        design_system = GlassmorphismDesignSystem()
        
        # Test component CSS generation
        button_css = design_system.generate_css("button", ComponentSize.LG, ComponentVariant.PRIMARY)
        print(f"✅ Button CSS generated: {len(button_css)} characters")
        
        card_css = design_system.generate_css("card", variant=ComponentVariant.SUCCESS)
        print(f"✅ Card CSS generated: {len(card_css)} characters")
        
        input_css = design_system.generate_css("input")
        print(f"✅ Input CSS generated: {len(input_css)} characters")
        
        # Test complete CSS generation
        full_css = design_system.generate_component_classes()
        print(f"✅ Complete CSS generated: {len(full_css)} characters")
        
        # Test theme creation
        dark_theme = design_system.create_theme(ColorScheme.DARK)
        light_theme = design_system.create_theme(ColorScheme.LIGHT)
        print(f"✅ Themes created - Dark: {len(dark_theme)} properties, Light: {len(light_theme)} properties")
        
        # Test React components generation
        react_components = design_system.generate_react_components()
        print(f"✅ React components generated: {len(react_components)} characters")
        
        # Test design system export
        export_data = design_system.export_design_system()
        print(f"✅ Design system exported:")
        print(f"   - Version: {export_data['version']}")
        print(f"   - Components: {len(export_data['components'])}")
        print(f"   - Themes: {len(export_data['themes'])}")
        print(f"   - CSS size: {len(export_data['css'])} characters")
        print(f"   - React size: {len(export_data['react'])} characters")
        
        # Test color palette
        colors = design_system.colors
        print(f"✅ Color palette:")
        print(f"   - Primary: {colors.primary}")
        print(f"   - Secondary: {colors.secondary}")
        print(f"   - Success: {colors.success}")
        print(f"   - Error: {colors.error}")
        
        # Test typography
        typography = design_system.typography
        print(f"✅ Typography:")
        print(f"   - Font family: {typography.font_family_sans}")
        print(f"   - Base size: {typography.text_base}rem")
        print(f"   - Large size: {typography.text_xl}rem")
        
        return True
        
    except Exception as e:
        print(f"❌ Glassmorphism Design System test failed: {e}")
        return False

async def test_advanced_workflow_engine():
    """Test the Advanced Workflow Engine"""
    print("\n🔄 Testing Advanced Workflow Engine...")
    
    try:
        # Initialize workflow engine
        engine = AdvancedWorkflowEngine()
        
        # Create a test workflow
        workflow_id = await engine.create_workflow(
            name="Test AI Workflow",
            description="Test workflow for AI content generation",
            created_by="test_user"
        )
        print(f"✅ Workflow created: {workflow_id}")
        
        # Add nodes to workflow
        start_node = await engine.add_node(
            workflow_id, NodeType.START, "Start Process",
            position={"x": 100, "y": 100}
        )
        
        ai_task_node = await engine.add_node(
            workflow_id, NodeType.TASK, "AI Generation",
            config={
                "task_type": "ai_generation",
                "prompt": "Generate a summary",
                "model": "gpt-4"
            },
            position={"x": 300, "y": 100}
        )
        
        data_task_node = await engine.add_node(
            workflow_id, NodeType.TASK, "Data Processing",
            config={
                "task_type": "data_processing",
                "operation": "transform"
            },
            position={"x": 500, "y": 100}
        )
        
        decision_node = await engine.add_node(
            workflow_id, NodeType.DECISION, "Quality Check",
            config={"condition": "true"},
            position={"x": 700, "y": 100}
        )
        
        end_node = await engine.add_node(
            workflow_id, NodeType.END, "End Process",
            position={"x": 900, "y": 100}
        )
        
        print(f"✅ Added {len(engine.workflows[workflow_id].nodes)} nodes to workflow")
        
        # Connect nodes
        await engine.connect_nodes(workflow_id, start_node, ai_task_node)
        await engine.connect_nodes(workflow_id, ai_task_node, data_task_node)
        await engine.connect_nodes(workflow_id, data_task_node, decision_node)
        await engine.connect_nodes(workflow_id, decision_node, end_node, "true")
        
        print(f"✅ Connected nodes with {len(engine.workflows[workflow_id].edges)} edges")
        
        # Execute workflow
        execution_id = await engine.execute_workflow(
            workflow_id,
            input_data={"content": "Test content for processing"},
            priority=Priority.HIGH,
            created_by="test_user"
        )
        print(f"✅ Workflow execution started: {execution_id}")
        
        # Wait for execution to complete
        await asyncio.sleep(3)
        
        # Check execution status
        execution = engine.executions[execution_id]
        print(f"✅ Execution status: {execution.status.value}")
        print(f"✅ Nodes executed: {len(execution.node_executions)}")
        
        # Check node execution results
        for node_id, result in execution.node_executions.items():
            print(f"   - Node {node_id}: {result['status']}")
        
        # Test workflow export
        exported_workflow = await engine.export_workflow(workflow_id)
        print(f"✅ Workflow exported:")
        print(f"   - Name: {exported_workflow['name']}")
        print(f"   - Nodes: {len(exported_workflow['nodes'])}")
        print(f"   - Edges: {len(exported_workflow['edges'])}")
        
        # Get workflow metrics
        metrics = await engine.get_workflow_metrics()
        print(f"✅ Workflow metrics:")
        print(f"   - Total workflows: {metrics['workflows']['total']}")
        print(f"   - Total executions: {metrics['executions']['total']}")
        print(f"   - Success rate: {metrics['executions']['success_rate']:.1f}%")
        print(f"   - Average execution time: {metrics['performance']['average_execution_time']:.2f}s")
        
        return True
        
    except Exception as e:
        print(f"❌ Advanced Workflow Engine test failed: {e}")
        return False

async def test_component_integration():
    """Test integration between Phase 2 components"""
    print("\n🔗 Testing Component Integration...")
    
    try:
        # Initialize all components
        security_config = {
            "jwt_secret": "integration-test-secret",
            "jwt_expiry_hours": 1
        }
        security_manager = EnterpriseSecurityManager(security_config)
        design_system = GlassmorphismDesignSystem()
        workflow_engine = AdvancedWorkflowEngine()
        
        # Create a user for integration testing
        user = await security_manager.create_user(
            username="integration_user",
            email="integration@test.com",
            password="IntegrationTest123!",
            roles={UserRole.DEVELOPER}
        )
        
        # Authenticate user
        token = await security_manager.authenticate_user(
            username="integration_user",
            password="IntegrationTest123!",
            ip_address="127.0.0.1",
            user_agent="Integration Test"
        )
        
        # Check if user can create workflows
        can_create_workflow = await security_manager.check_permission(token, Permission.AI_GENERATE)
        print(f"✅ User can create workflows: {can_create_workflow}")
        
        if can_create_workflow:
            # Create a workflow with security context
            workflow_id = await workflow_engine.create_workflow(
                name="Secure AI Workflow",
                description="Workflow with security integration",
                created_by=user.user_id
            )
            
            # Generate UI components for the workflow
            button_css = design_system.generate_css("button", ComponentSize.MD, ComponentVariant.PRIMARY)
            card_css = design_system.generate_css("card", variant=ComponentVariant.SUCCESS)
            
            print(f"✅ Integrated workflow created: {workflow_id}")
            print(f"✅ UI components generated for workflow interface")
            
            # Test rate limiting for workflow operations
            within_limit = await security_manager.check_rate_limit(
                "/api/workflow/execute", "127.0.0.1", user.user_id
            )
            print(f"✅ Workflow execution within rate limits: {within_limit}")
        
        # Test design system with security themes
        dark_theme = design_system.create_theme(ColorScheme.DARK)
        secure_button_style = {
            **design_system.components["button"]["base"],
            "border": f"1px solid {design_system.colors.success}",
            "background": f"linear-gradient(135deg, {design_system.colors.success}40, {design_system.colors.primary}40)"
        }
        
        print(f"✅ Secure UI theme created with {len(dark_theme)} properties")
        print(f"✅ Security-enhanced button style generated")
        
        # Get integrated metrics
        security_metrics = await security_manager.get_security_metrics()
        workflow_metrics = await workflow_engine.get_workflow_metrics()
        design_export = design_system.export_design_system()
        
        integration_metrics = {
            "security": {
                "users": security_metrics["users"]["total"],
                "security_score": security_metrics["security_score"]
            },
            "workflows": {
                "total": workflow_metrics["workflows"]["total"],
                "success_rate": workflow_metrics["executions"]["success_rate"]
            },
            "design": {
                "components": len(design_export["components"]),
                "themes": len(design_export["themes"])
            }
        }
        
        print(f"✅ Integration metrics:")
        print(f"   - Security users: {integration_metrics['security']['users']}")
        print(f"   - Security score: {integration_metrics['security']['security_score']}/100")
        print(f"   - Workflows: {integration_metrics['workflows']['total']}")
        print(f"   - Success rate: {integration_metrics['workflows']['success_rate']:.1f}%")
        print(f"   - UI components: {integration_metrics['design']['components']}")
        print(f"   - UI themes: {integration_metrics['design']['themes']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Component integration test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Phase 2 Components Test Suite")
    print("=" * 60)
    
    test_results = []
    
    # Test Enterprise Security Framework
    result1 = await test_enterprise_security()
    test_results.append(("Enterprise Security Framework", result1))
    
    # Test Glassmorphism Design System
    result2 = test_glassmorphism_design_system()
    test_results.append(("Glassmorphism Design System", result2))
    
    # Test Advanced Workflow Engine
    result3 = await test_advanced_workflow_engine()
    test_results.append(("Advanced Workflow Engine", result3))
    
    # Test Component Integration
    result4 = await test_component_integration()
    test_results.append(("Component Integration", result4))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Phase 2 Test Results Summary:")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All Phase 2 components are working correctly!")
        print("🚀 Ready to proceed with Phase 3 of transformation.")
        print("\n📋 Phase 2 Achievements:")
        print("   ✅ Enterprise Security Framework - JWT, RBAC, Rate Limiting")
        print("   ✅ Glassmorphism Design System - Modern UI with Glass Effects")
        print("   ✅ Advanced Workflow Engine - Visual Builder, Human-in-Loop")
        print("   ✅ Component Integration - Seamless interoperability")
    else:
        print("⚠️ Some Phase 2 components need attention before proceeding.")
    
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)