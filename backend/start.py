#!/usr/bin/env python3
"""
SeaTrace Backend - Development Startup Script
"""
import os

from app import socketio, app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    print(f"Starting SeaTrace Backend on port {port}")
    print(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
    
    # Use SocketIO with threading (more compatible)
    socketio.run(
        app, 
        debug=True, 
        port=port, 
        host='0.0.0.0',
        use_reloader=False,
        log_output=True
    )