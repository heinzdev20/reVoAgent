#!/usr/bin/env python3
"""
Test script to verify real agent integration in the backend API.
"""

import asyncio
import aiohttp
import json

async def test_agents_api():
    """Test the real agent integration."""
    base_url = "http://localhost:12000"
    
    async with aiohttp.ClientSession() as session:
        # Test 1: Get all agents
        print("🔍 Testing GET /api/agents...")
        async with session.get(f"{base_url}/api/agents") as response:
            if response.status == 200:
                agents = await response.json()
                print(f"✅ Agents API working: {len(agents.get('agents', {}))} agents available")
                for agent_name, agent_info in agents.get('agents', {}).items():
                    print(f"   - {agent_name}: {agent_info['status']}")
            else:
                print(f"❌ Agents API failed: {response.status}")
        
        # Test 2: Execute code generation task
        print("\n🤖 Testing real code generator agent...")
        code_task = {
            "description": "Create a simple Python function to calculate fibonacci numbers",
            "parameters": {
                "language": "python",
                "complexity": "simple"
            }
        }
        
        async with session.post(
            f"{base_url}/api/agents/code-generator/execute",
            json=code_task,
            headers={"Content-Type": "application/json"}
        ) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Code generation successful!")
                print(f"   Task ID: {result.get('task_id')}")
                print(f"   Status: {result.get('status')}")
                if 'result' in result:
                    print(f"   Generated code preview: {str(result['result'])[:100]}...")
            else:
                error_text = await response.text()
                print(f"❌ Code generation failed: {response.status}")
                print(f"   Error: {error_text}")
        
        # Test 3: Execute debugging task
        print("\n🐛 Testing real debugging agent...")
        debug_task = {
            "description": "Debug a Python function with IndexError",
            "parameters": {
                "code": "def get_item(lst, idx): return lst[idx]",
                "error": "IndexError: list index out of range"
            }
        }
        
        async with session.post(
            f"{base_url}/api/agents/debug-agent/execute",
            json=debug_task,
            headers={"Content-Type": "application/json"}
        ) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Debugging successful!")
                print(f"   Task ID: {result.get('task_id')}")
                print(f"   Status: {result.get('status')}")
            else:
                error_text = await response.text()
                print(f"❌ Debugging failed: {response.status}")
                print(f"   Error: {error_text}")
        
        # Test 4: Execute testing task
        print("\n🧪 Testing real testing agent...")
        test_task = {
            "description": "Generate unit tests for a Python function",
            "parameters": {
                "code": "def add_numbers(a, b): return a + b",
                "test_framework": "pytest"
            }
        }
        
        async with session.post(
            f"{base_url}/api/agents/testing-agent/execute",
            json=test_task,
            headers={"Content-Type": "application/json"}
        ) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Testing successful!")
                print(f"   Task ID: {result.get('task_id')}")
                print(f"   Status: {result.get('status')}")
            else:
                error_text = await response.text()
                print(f"❌ Testing failed: {response.status}")
                print(f"   Error: {error_text}")
        
        # Test 5: Execute documentation task
        print("\n📚 Testing real documentation agent...")
        doc_task = {
            "description": "Generate documentation for a Python class",
            "parameters": {
                "code": "class Calculator:\n    def add(self, a, b): return a + b",
                "format": "markdown"
            }
        }
        
        async with session.post(
            f"{base_url}/api/agents/documentation-agent/execute",
            json=doc_task,
            headers={"Content-Type": "application/json"}
        ) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Documentation successful!")
                print(f"   Task ID: {result.get('task_id')}")
                print(f"   Status: {result.get('status')}")
            else:
                error_text = await response.text()
                print(f"❌ Documentation failed: {response.status}")
                print(f"   Error: {error_text}")

if __name__ == "__main__":
    print("🚀 Testing reVoAgent Real Agent Integration")
    print("=" * 50)
    asyncio.run(test_agents_api())