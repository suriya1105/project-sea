#!/usr/bin/env python3
"""
SeaTrace Backend - Production Startup Script
"""
import os
from app import socketio, app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    print(f"Starting SeaTrace Backend on port {port}")
    socketio.run(app, debug=False, port=port, host='0.0.0.0')