#!/usr/bin/env python3
"""
Pearl E-commerce Backend API Test Suite
Tests all backend functionality including Pearl Management, Authentication, and Shopping Cart APIs
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://pearl-treasure.preview.emergentagent.com/api"

class PearlEcommerceAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        self.test_user_data = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_backend_connectivity(self):
        """Test basic backend connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/pearls")
            if response.status_code == 200:
                self.log_test("Backend Connectivity", True, "Backend is accessible")
                return True
            else:
                self.log_test("Backend Connectivity", False, f"Backend returned status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Backend Connectivity", False, "Cannot connect to backend", str(e))
            return False
    
    def test_pearl_management_apis(self):
        """Test Pearl Management CRUD operations"""
        print("\n=== Testing Pearl Management APIs ===")
        
        # Test GET /api/pearls (list all pearls)
        try:
            response = self.session.get(f"{self.base_url}/pearls")
            if response.status_code == 200:
                pearls = response.json()
                if isinstance(pearls, list) and len(pearls) > 0:
                    self.log_test("GET /api/pearls", True, f"Retrieved {len(pearls)} pearls")
                    # Store first pearl for later tests
                    self.test_pearl_id = pearls[0]["id"]
                else:
                    self.log_test("GET /api/pearls", False, "No pearls returned")
            else:
                self.log_test("GET /api/pearls", False, f"Status {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /api/pearls", False, "Request failed", str(e))
        
        # Test GET /api/pearls/{id} (get specific pearl)
        if hasattr(self, 'test_pearl_id'):
            try:
                response = self.session.get(f"{self.base_url}/pearls/{self.test_pearl_id}")
                if response.status_code == 200:
                    pearl = response.json()
                    if pearl.get("id") == self.test_pearl_id:
                        self.log_test("GET /api/pearls/{id}", True, "Retrieved specific pearl successfully")
                    else:
                        self.log_test("GET /api/pearls/{id}", False, "Pearl ID mismatch")
                else:
                    self.log_test("GET /api/pearls/{id}", False, f"Status {response.status_code}", response.text)
            except Exception as e:
                self.log_test("GET /api/pearls/{id}", False, "Request failed", str(e))
        
        # Test filtering by category
        try:
            response = self.session.get(f"{self.base_url}/pearls?category=akoya")
            if response.status_code == 200:
                pearls = response.json()
                if isinstance(pearls, list):
                    akoya_pearls = [p for p in pearls if p.get("category") == "akoya"]
                    if len(akoya_pearls) > 0:
                        self.log_test("Pearl Category Filter", True, f"Found {len(akoya_pearls)} Akoya pearls")
                    else:
                        self.log_test("Pearl Category Filter", True, "No Akoya pearls found (valid result)")
                else:
                    self.log_test("Pearl Category Filter", False, "Invalid response format")
            else:
                self.log_test("Pearl Category Filter", False, f"Status {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Pearl Category Filter", False, "Request failed", str(e))
        
        # Test search functionality
        try:
            response = self.session.get(f"{self.base_url}/pearls?search=pearl")
            if response.status_code == 200:
                pearls = response.json()
                if isinstance(pearls, list):
                    self.log_test("Pearl Search", True, f"Search returned {len(pearls)} results")
                else:
                    self.log_test("Pearl Search", False, "Invalid response format")
            else:
                self.log_test("Pearl Search", False, f"Status {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Pearl Search", False, "Request failed", str(e))
    
    def test_authentication_flow(self):
        """Test Authentication APIs (Note: Emergent auth requires external session)"""
        print("\n=== Testing Authentication Flow ===")
        
        # Test GET /api/auth/me without authentication
        try:
            response = self.session.get(f"{self.base_url}/auth/me")
            if response.status_code == 401:
                self.log_test("GET /api/auth/me (unauthenticated)", True, "Correctly returns 401 for unauthenticated request")
            else:
                self.log_test("GET /api/auth/me (unauthenticated)", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/auth/me (unauthenticated)", False, "Request failed", str(e))
        
        # Test POST /api/auth/process-session with invalid session
        try:
            response = self.session.post(f"{self.base_url}/auth/process-session", params={"session_id": "invalid_session"})
            if response.status_code == 400:
                self.log_test("POST /api/auth/process-session (invalid)", True, "Correctly rejects invalid session")
            else:
                self.log_test("POST /api/auth/process-session (invalid)", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/auth/process-session (invalid)", False, "Request failed", str(e))
        
        # Test POST /api/auth/logout without authentication
        try:
            response = self.session.post(f"{self.base_url}/auth/logout")
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    self.log_test("POST /api/auth/logout (unauthenticated)", True, "Logout works even without authentication")
                else:
                    self.log_test("POST /api/auth/logout (unauthenticated)", False, "Logout returned success=false")
            else:
                self.log_test("POST /api/auth/logout (unauthenticated)", False, f"Status {response.status_code}", response.text)
        except Exception as e:
            self.log_test("POST /api/auth/logout (unauthenticated)", False, "Request failed", str(e))
    
    def test_shopping_cart_apis(self):
        """Test Shopping Cart APIs (requires authentication)"""
        print("\n=== Testing Shopping Cart APIs ===")
        
        # Test GET /api/cart without authentication
        try:
            response = self.session.get(f"{self.base_url}/cart")
            if response.status_code == 401:
                self.log_test("GET /api/cart (unauthenticated)", True, "Correctly requires authentication")
            else:
                self.log_test("GET /api/cart (unauthenticated)", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/cart (unauthenticated)", False, "Request failed", str(e))
        
        # Test POST /api/cart/add without authentication
        if hasattr(self, 'test_pearl_id'):
            try:
                cart_item = {"pearl_id": self.test_pearl_id, "quantity": 1}
                response = self.session.post(f"{self.base_url}/cart/add", json=cart_item)
                if response.status_code == 401:
                    self.log_test("POST /api/cart/add (unauthenticated)", True, "Correctly requires authentication")
                else:
                    self.log_test("POST /api/cart/add (unauthenticated)", False, f"Expected 401, got {response.status_code}")
            except Exception as e:
                self.log_test("POST /api/cart/add (unauthenticated)", False, "Request failed", str(e))
        
        # Test DELETE /api/cart/{item_id} without authentication
        try:
            response = self.session.delete(f"{self.base_url}/cart/test_item_id")
            if response.status_code == 401:
                self.log_test("DELETE /api/cart/{item_id} (unauthenticated)", True, "Correctly requires authentication")
            else:
                self.log_test("DELETE /api/cart/{item_id} (unauthenticated)", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("DELETE /api/cart/{item_id} (unauthenticated)", False, "Request failed", str(e))
        
        # Test PUT /api/cart/{item_id} without authentication
        try:
            response = self.session.put(f"{self.base_url}/cart/test_item_id", params={"quantity": 2})
            if response.status_code == 401:
                self.log_test("PUT /api/cart/{item_id} (unauthenticated)", True, "Correctly requires authentication")
            else:
                self.log_test("PUT /api/cart/{item_id} (unauthenticated)", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("PUT /api/cart/{item_id} (unauthenticated)", False, "Request failed", str(e))
    
    def test_database_verification(self):
        """Test database connectivity and sample data"""
        print("\n=== Testing Database Verification ===")
        
        # Verify sample pearl data exists
        try:
            response = self.session.get(f"{self.base_url}/pearls")
            if response.status_code == 200:
                pearls = response.json()
                if len(pearls) >= 4:
                    self.log_test("Sample Pearl Data", True, f"Found {len(pearls)} pearls (expected 4+)")
                    
                    # Check for specific categories
                    categories = set(pearl.get("category") for pearl in pearls)
                    expected_categories = {"akoya", "tahitian", "south-sea", "freshwater"}
                    if expected_categories.issubset(categories):
                        self.log_test("Pearl Categories", True, "All expected categories present")
                    else:
                        missing = expected_categories - categories
                        self.log_test("Pearl Categories", False, f"Missing categories: {missing}")
                    
                    # Check for base64 image data
                    images_valid = all(pearl.get("image", "").startswith("data:image/") for pearl in pearls)
                    if images_valid:
                        self.log_test("Pearl Images", True, "All pearls have valid base64 image data")
                    else:
                        self.log_test("Pearl Images", False, "Some pearls missing valid image data")
                        
                else:
                    self.log_test("Sample Pearl Data", False, f"Only found {len(pearls)} pearls, expected 4+")
            else:
                self.log_test("Sample Pearl Data", False, f"Cannot retrieve pearls: {response.status_code}")
        except Exception as e:
            self.log_test("Sample Pearl Data", False, "Request failed", str(e))
    
    def test_api_response_validation(self):
        """Test API response formats and error handling"""
        print("\n=== Testing API Response Validation ===")
        
        # Test CORS headers with GET request (more reliable than OPTIONS)
        try:
            headers = {'Origin': 'https://example.com'}
            response = self.session.get(f"{self.base_url}/pearls", headers=headers)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            }
            if cors_headers['Access-Control-Allow-Origin']:
                self.log_test("CORS Headers", True, f"CORS headers present: {cors_headers}")
            else:
                self.log_test("CORS Headers", False, "CORS headers missing")
        except Exception as e:
            self.log_test("CORS Headers", False, "Request failed", str(e))
        
        # Test JSON response format
        try:
            response = self.session.get(f"{self.base_url}/pearls")
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'application/json' in content_type:
                    self.log_test("JSON Response Format", True, "Correct content-type header")
                    
                    # Validate JSON structure
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test("JSON Structure", True, "Valid JSON array structure")
                    else:
                        self.log_test("JSON Structure", False, "Expected JSON array")
                else:
                    self.log_test("JSON Response Format", False, f"Wrong content-type: {content_type}")
            else:
                self.log_test("JSON Response Format", False, f"Cannot test - status {response.status_code}")
        except Exception as e:
            self.log_test("JSON Response Format", False, "Request failed", str(e))
        
        # Test 404 error handling
        try:
            response = self.session.get(f"{self.base_url}/pearls/nonexistent_id")
            if response.status_code == 404:
                self.log_test("404 Error Handling", True, "Correctly returns 404 for nonexistent pearl")
            else:
                self.log_test("404 Error Handling", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("404 Error Handling", False, "Request failed", str(e))
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🧪 Starting Pearl E-commerce Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test backend connectivity first
        if not self.test_backend_connectivity():
            print("\n❌ Backend connectivity failed. Stopping tests.")
            return False
        
        # Run all test suites
        self.test_pearl_management_apis()
        self.test_authentication_flow()
        self.test_shopping_cart_apis()
        self.test_database_verification()
        self.test_api_response_validation()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
                    if result.get("details"):
                        print(f"    Details: {result['details']}")
        
        return failed == 0

if __name__ == "__main__":
    tester = PearlEcommerceAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)