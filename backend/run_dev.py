#!/usr/bin/env python3
"""
SeaTrace Backend - Development Startup Script
Runs on port 5000 with debug mode enabled
"""
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import eventlet
    eventlet.monkey_patch()
    USE_EVENTLET = True
except ImportError:
    USE_EVENTLET = False
    print("Warning: eventlet not installed, using default SocketIO transport")

from app import socketio, app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') != 'production'
    
    print("=" * 60)
    print("SeaTrace Backend - Development Server")
    print("=" * 60)
    print(f"Starting on: http://localhost:{port}")
    print(f"API Health: http://localhost:{port}/api/health")
    print(f"Debug Mode: {debug}")
    print(f"Eventlet: {USE_EVENTLET}")
    print("=" * 60)
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        if USE_EVENTLET:
            socketio.run(
                app,
                debug=debug,
                port=port,
                host='127.0.0.1',
                use_reloader=debug,
                log_output=True
            )
        else:
            # Fallback without eventlet
            socketio.run(
                app,
                debug=debug,
                port=port,
                host='127.0.0.1',
                allow_unsafe_werkzeug=True
            )
    except KeyboardInterrupt:
        print("\n\nShutting down server...")
    except Exception as e:
        print(f"\n\nError starting server: {e}")
        import traceback
        traceback.print_exc()

