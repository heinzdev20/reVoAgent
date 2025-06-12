#!/usr/bin/env python3
"""
Test script for reVoAgent deployment
"""

import requests
import json
import time

BASE_URL = "https://work-1-lkaruorwyrduwqrb.prod-runtime.all-hands.dev"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Health check passed: {data['status']}")
        print(f"   AI Models: {data['services']['ai_models']}")
        print(f"   Available providers: {data.get('ai_providers', [])}")
        return True
    else:
        print(f"❌ Health check failed: {response.status_code}")
        return False

def test_models():
    """Test models endpoint"""
    print("\n🤖 Testing models endpoint...")
    response = requests.get(f"{BASE_URL}/api/models")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Models endpoint passed: {data['status']}")
        print(f"   Available models: {data['models']}")
        return True
    else:
        print(f"❌ Models endpoint failed: {response.status_code}")
        return False

def test_chat():
    """Test chat endpoint"""
    print("\n💬 Testing chat endpoint...")
    
    test_message = {
        "content": "Hello! Can you tell me about yourself?",
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    response = requests.post(
        f"{BASE_URL}/api/chat",
        json=test_message,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Chat endpoint passed")
        print(f"   Provider: {data['provider']}")
        print(f"   Response: {data['content'][:100]}...")
        print(f"   Tokens used: {data['tokens_used']}")
        return True
    else:
        print(f"❌ Chat endpoint failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_memory_stats():
    """Test memory stats endpoint"""
    print("\n🧠 Testing memory stats endpoint...")
    response = requests.get(f"{BASE_URL}/api/memory/stats")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Memory stats endpoint passed: {data['status']}")
        return True
    else:
        print(f"❌ Memory stats endpoint failed: {response.status_code}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting reVoAgent deployment tests...\n")
    
    tests = [
        test_health,
        test_models,
        test_chat,
        test_memory_stats
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! reVoAgent deployment is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    return passed == total

if __name__ == "__main__":
    main()