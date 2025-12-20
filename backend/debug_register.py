import sys
import os
from flask import Flask, request

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

try:
    from app import app, register_public, data_manager
    print("Successfully imported app")
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

# Mock request context
print("Starting test...")
with app.test_request_context(
    '/api/auth/register-public',
    method='POST',
    json={
        "name":"Test User",
        "email":"debug_test@example.com",
        "password":"password123",
        "phone":"1234567890"
    }
):
    try:
        print("Calling register_public...")
        response = register_public()
        print("Response:", response)
    except Exception as e:
        import traceback
        print("\n!!! CAUGHT EXCEPTION !!!")
        traceback.print_exc()
        print(f"Exception message: {e}")
