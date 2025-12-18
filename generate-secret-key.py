#!/usr/bin/env python3
"""
Generate a secure secret key for production deployment
"""
import secrets

if __name__ == '__main__':
    secret_key = secrets.token_hex(32)
    print("=" * 60)
    print("Generated SECRET_KEY for Render deployment:")
    print("=" * 60)
    print(secret_key)
    print("=" * 60)
    print("\nCopy this value and use it in Render environment variables:")
    print(f"SECRET_KEY={secret_key}")
    print("\n⚠️  Keep this secret! Don't commit it to Git!")

