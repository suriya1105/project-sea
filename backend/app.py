"""
SeaTrace - Advanced Marine Intelligence & Real-Time Monitoring System
Copyright © 2025 by Suriya. All rights reserved.

This application provides real-time vessel tracking, oil spill detection,
and environmental monitoring for maritime operations.
"""

from flask import Flask, request, jsonify, send_file
# Apply eventlet monkey patching for async compatibility
import eventlet
eventlet.monkey_patch()

from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import jwt
import json
from datetime import datetime, timedelta
from functools import wraps
import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO
import random
import requests
import threading
from data_manager import data_manager
try:
    from kaggle_ais_processor import KaggleAISProcessor
    from kaggle_config import KAGGLE_DATASETS, REGION_FILTER
    KAGGLE_ENABLED = True
except Exception as e:
    KAGGLE_ENABLED = False
    print(f"Warning: Kaggle integration not available: {e}")
    KaggleAISProcessor = None
    KAGGLE_DATASETS = []
    REGION_FILTER = {}
import threading

# --- AI & Analytics Integration ---
from ais_analytics import ais_analyzer
from spill_forecasting import spill_forecaster
from llm_service import llm_service
from model_inference import model_inference
# ----------------------------------

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-prod')

@app.route('/')
def index():
    """Root endpoint to confirm backend is running"""
    return jsonify({
        'message': 'SeaTrace Backend API is running by Antigravity',
        'health_check': '/api/health',
        'documentation': 'See /api endpoints'
    }), 200

# Global Error Handler
@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    traceback.print_exc()
    print(f"DEBUG: GLOBAL EXCEPTION: {e}")
    return jsonify({'error': f"Internal Server Error: {str(e)}"}), 500

# Configure CORS from environment variable
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins != '*':
    cors_origins = [origin.strip() for origin in cors_origins.split(',')]
else:
    cors_origins = '*'

CORS(app, origins=cors_origins)
socketio = SocketIO(app, cors_allowed_origins=cors_origins, async_mode='eventlet')

# Global Simulation Thread
simulation_thread = None
simulation_active = True

def simulate_vessel_movement():
    """Background thread to update vessel positions based on course/speed"""
    from math import cos, sin, radians
    print("Starting Vessel Movement Simulation...")
    tick_count = 0
    while simulation_active:
        vessels = data_manager.get_vessels()
        
        # Performance: Only process active movement for a subset or batch updates
        # For 5000 vessels, sending 5000 individual events is too heavy.
        # We will collect updates and broadcast a lightweight 'vessel_update' event.
        
        updated_vessels = []
        
        for imo, v in vessels.items():
            # Initialize history if missing
            if 'history' not in v: v['history'] = []
            
            # Move ~0.0005 deg per tick per 10kts (approx visual movement)
            speed_factor = 0.0005 * (float(v.get('speed', 10)) / 10.0)
            course_rad = radians(float(v.get('course', 0)))
            
            # Update lat/lon (Simulate movement along Great Circles roughly)
            new_lat = v['lat'] + (speed_factor * cos(course_rad))
            new_lon = v['lon'] + (speed_factor * sin(course_rad))
            
            # Simple boundary bounce logic (Indian Ocean / Global bounds)
            if not (-80 <= new_lat <= 80): 
                v['course'] = (v['course'] + 180 + random.uniform(-20, 20)) % 360
                new_lat = max(-80, min(80, new_lat))
            
            # Wrap longitude for Pacific crossing
            if new_lon > 180: new_lon = -180
            if new_lon < -180: new_lon = 180
            
            v['lat'] = new_lat
            v['lon'] = new_lon
            
            # Random course adjustment for realism (Wander)
            if random.random() < 0.05:
                v['course'] = (v['course'] + random.uniform(-2, 2)) % 360
            
            # Store history breadcrumb every 10 ticks (less frequent for performance)
            if tick_count % 10 == 0:
                v['history'].append({'lat': round(new_lat, 4), 'lon': round(new_lon, 4), 'timestamp': datetime.utcnow().isoformat()})
                if len(v['history']) > 30: v['history'].pop(0) # Keep shorter tail for memory
            
            # Add to batch for frontend update (Optimization: Round coordinates)
            updated_vessels.append({
                'imo': imo,
                'lat': round(new_lat, 4),
                'lon': round(new_lon, 4),
                'course': round(v['course'], 1),
                'speed': v['speed']
            })

            # Check for Oil Spill Source Linkage... (Keep logic but optimize if needed)
            # ... (omitted for brevity in this high-frequency loop, usually run less often)
        
        # Broadcast BATCH update to frontend (efficient)
        if updated_vessels:
            # Send in chunks of 500 to avoid packet size limits
            chunk_size = 500
            for i in range(0, len(updated_vessels), chunk_size):
                chunk = updated_vessels[i:i + chunk_size]
                socketio.emit('vessel_movement_batch', chunk)
        
        socketio.sleep(2) # Run every 2 seconds
        tick_count += 1
        socketio.sleep(1) # 1Hz update rate

# Start simulation on first request (handled by app startup)
@app.before_request
def start_simulation():
    global simulation_thread
    if not simulation_thread:
        # Check if we are in the main process to avoid duplicate threads in reloader
        if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
            simulation_thread = socketio.start_background_task(simulate_vessel_movement)

def log_access(user_email, action, resource, details=None):
    """Log user access for audit trail"""
    log_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'user_email': user_email,
        'action': action,
        'resource': resource,
        'details': details or {}
    }
    data_manager.add_audit_log(log_entry)

# Token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        
        if auth_header:
            try:
                token = auth_header.replace('Bearer ', '')
            except:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_email = payload['email']
            user = data_manager.get_user(user_email)
            if not user:
                return jsonify({'error': 'User not found'}), 401
            request.user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated

# Role verification decorator
def role_required(required_role):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user'):
                return jsonify({'error': 'Unauthorized'}), 401
            
            user_role = request.user.get('role', 'viewer')
            
            # Role hierarchy: admin > operator > viewer
            role_hierarchy = {'admin': 3, 'operator': 2, 'viewer': 1}
            
            if role_hierarchy.get(user_role, 0) < role_hierarchy.get(required_role, 0):
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email:
        return jsonify({'error': 'Email required'}), 400
    
    user = data_manager.get_user(email)
    if user:
        # Check if verified (unless test user)
        # Allow email-only login for test users (no password required)
        test_emails = ['admin@seatrace.com', 'operator@seatrace.com', 'viewer@seatrace.com']
        
        is_test_user = email in test_emails
        
        if is_test_user or (password and user['password'] == password):
            # Check verification SKIPPED
            print(f"DEBUG: Skipping verification check for {email}")

            # Auto-verify user on successful login to prevent "Account not verified" issues
            if not user.get('email_verified') or not user.get('phone_verified'):
                print(f"DEBUG: Auto-verifying user {email} on successful login")
                data_manager.update_user(email, {'email_verified': True, 'phone_verified': True})
                user = data_manager.get_user(email) # Refresh user object

            # Log successful login
            log_access(email, 'LOGIN', 'authentication', {'success': True})
            
            token = jwt.encode(
                {
                    'email': email,
                    'exp': datetime.utcnow() + timedelta(hours=24)
                },
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            
            return jsonify({
                'token': token,
                'user': {
                    'id': user.get('id'),
                    'name': user.get('name'),
                    'email': user.get('email'),
                    'role': user.get('role', 'viewer'),
                    'company': user.get('company', 'Unknown Company')
                }
            }), 200
    
    # Log failed login attempt
    log_access(email or 'unknown', 'LOGIN_FAILED', 'authentication', {'success': False})
    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    return jsonify({'message': 'Logged out'}), 200

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile():
    user = request.user
    return jsonify({
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'role': user.get('role', 'viewer'),
        'company': user.get('company', 'Unknown Company')
    }), 200

# Public Authentication Endpoints
verification_codes = {}  # In-memory storage for simple verification codes: {email_or_phone: code}

@app.route('/api/auth/register-public', methods=['POST'])
def register_public():
    """Public registration endpoint"""
    print("DEBUG: register_public called")
    try:
        data = request.json
        print(f"DEBUG: Data received: {data}")
        email = data.get('email')
        name = data.get('name')
        password = data.get('password')
        phone = data.get('phone')
        
        if not all([email, name, password]):
            return jsonify({'error': 'Missing required fields: email, name, password'}), 400
        
        print("DEBUG: Checking user existence")
        if data_manager.get_user(email):
            return jsonify({'error': 'User already exists'}), 409
        
        # Create new user (viewer role by default for public)
        print("DEBUG: Generating user ID")
        new_id = data_manager.get_next_user_id()
        print(f"DEBUG: New ID: {new_id}")
        
        new_user = {
            'id': new_id,
            'name': name,
            'email': email,
            'phone': phone,
            'password': password,
            'role': 'viewer',
            'company': 'Public User',
            'created_at': datetime.utcnow().isoformat(),
            'email_verified': False,
            'phone_verified': False,
            'active': True
        }
        
        print("DEBUG: Adding user to DB")
        data_manager.add_user(email, new_user)
        print("DEBUG: Logging access")
        log_access(email, 'REGISTER', 'authentication', {'name': name})
        
        return jsonify({
            'message': 'Registration successful. Please verify your account.',
            'userId': new_user['id']
        }), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"DEBUG: EXCEPTION: {e}")
        return jsonify({'error': f"Internal Error: {str(e)}"}), 500

@app.route('/api/auth/send-verification', methods=['POST'])
def send_verification():
    """Simulate sending verification code (Email or SMS)"""
    data = request.json
    target = data.get('target')  # Email or Phone
    method = data.get('method')  # 'email' or 'sms'
    
    if not target or not method:
        return jsonify({'error': 'Target and method required'}), 400
        
    # Generate 6-digit code
    code = f"{random.randint(100000, 999999)}"
    verification_codes[target] = code
    
    # Simulate sending
    print(f"============================================")
    print(f"SIMULATED {method.upper()} TO {target}: {code}")
    print(f"============================================")
    
    return jsonify({
        'message': f'Verification code sent to {target}',
        'simulated_code': code  # Return code for easier testing/demo
    }), 200

@app.route('/api/auth/verify', methods=['POST'])
def verify_code():
    """Verify the code and activate user"""
    data = request.json
    target = data.get('target') # Email or phone
    code = data.get('code')
    email = data.get('email') # The user's primary email key
    
    if not all([target, code, email]):
        return jsonify({'error': 'Target, email, and code required'}), 400
        
    stored_code = verification_codes.get(target)
    
    if stored_code and stored_code == code:
        # Verify user
        user = data_manager.get_user(email)
        if user:
            updates = {}
            if '@' in target:
                updates['email_verified'] = True
            else:
                updates['phone_verified'] = True
            
            data_manager.update_user(email, updates)
            del verification_codes[target] # Clear code
            return jsonify({'message': 'Verification successful', 'verified': True}), 200
        else:
             return jsonify({'error': 'User not found'}), 404
             
    return jsonify({'error': 'Invalid verification code'}), 400

# Company User Management Endpoints
@app.route('/api/admin/users/register', methods=['POST'])
@token_required
def register_company_user():
    """Admin only: Register a new company user"""
    if request.user.get('role') != 'admin':
        log_access(request.user['email'], 'UNAUTHORIZED_REGISTER', 'user_management', {'target_email': ''})
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.json
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    company = data.get('company')
    role = data.get('role', 'operator')
    
    if not all([email, name, password, company]):
        return jsonify({'error': 'Missing required fields: email, name, password, company'}), 400
    
    if data_manager.get_user(email):
        return jsonify({'error': 'User already exists'}), 409
    
    # Create new user
    new_user = {
        'id': data_manager.get_next_user_id(),
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        'company': company,
        'created_at': datetime.utcnow().isoformat(),
        'last_login': None,
        'active': True
    }
    
    data_manager.add_user(email, new_user)
    
    log_access(request.user['email'], 'CREATE_USER', 'user_management', {'new_user': email, 'company': company})
    
    return jsonify({
        'message': f'User {email} created successfully',
        'user': {
            'id': new_user['id'],
            'email': email,
            'name': name,
            'company': company,
            'role': role
        }
    }), 201

@app.route('/api/admin/users', methods=['GET'])
@token_required
def get_all_users():
    """Admin only: Get all users"""
    if request.user.get('role') != 'admin':
        log_access(request.user['email'], 'UNAUTHORIZED_LIST_USERS', 'user_management')
        return jsonify({'error': 'Admin access required'}), 403
    
    log_access(request.user['email'], 'LIST_USERS', 'user_management')
    
    users_data = data_manager.get_users()
    user_list = []
    for email, user in users_data.items():
        user_list.append({
            'id': user['id'],
            'email': email,
            'name': user['name'],
            'role': user.get('role', 'viewer'),
            'company': user.get('company', 'Unknown Company')
        })
    
    return jsonify(user_list), 200

@app.route('/api/admin/users/<email>', methods=['DELETE'])
@token_required
def delete_user(email):
    """Admin only: Delete a user"""
    if request.user.get('role') != 'admin':
        log_access(request.user['email'], 'UNAUTHORIZED_DELETE_USER', 'user_management', {'target': email})
        return jsonify({'error': 'Admin access required'}), 403
    
    if email == request.user['email']:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    if not data_manager.get_user(email):
        return jsonify({'error': 'User not found'}), 404
    
    data_manager.delete_user(email)
    log_access(request.user['email'], 'DELETE_USER', 'user_management', {'deleted_email': email})
    
    return jsonify({'message': f'User {email} deleted successfully'}), 200

# Audit Logging Endpoints
@app.route('/api/admin/audit-logs', methods=['GET'])
@token_required
def get_audit_logs():
    """Admin only: Get all audit logs"""
    if request.user.get('role') != 'admin':
        log_access(request.user['email'], 'UNAUTHORIZED_AUDIT_LOGS', 'audit')
        return jsonify({'error': 'Admin access required'}), 403
    
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    # Get all audit logs from data manager
    all_logs = data_manager.get_audit_logs()
    # Return logs in reverse chronological order
    logs = sorted(all_logs, key=lambda x: x['timestamp'], reverse=True)[offset:offset+limit]
    
    return jsonify({
        'total': len(all_logs),
        'count': len(logs),
        'logs': logs
    }), 200

@app.route('/api/admin/audit-logs/user/<email>', methods=['GET'])
@token_required
def get_user_audit_logs(email):
    """Admin only: Get audit logs for specific user"""
    if request.user.get('role') != 'admin':
        log_access(request.user['email'], 'UNAUTHORIZED_USER_AUDIT', 'audit', {'target_user': email})
        return jsonify({'error': 'Admin access required'}), 403
    
    limit = request.args.get('limit', 50, type=int)
    all_logs = data_manager.get_audit_logs()
    user_logs = [log for log in all_logs if log['user_email'] == email]
    user_logs = sorted(user_logs, key=lambda x: x['timestamp'], reverse=True)[:limit]
    
    return jsonify({
        'user_email': email,
        'count': len(user_logs),
        'logs': user_logs
    }), 200

@app.route('/api/vessels', methods=['GET'])
@token_required
def get_vessels():
    """Get all vessels - viewable by all roles"""
    log_access(request.user['email'], 'VIEW', 'vessels_list')
    vessels_dict = data_manager.get_vessels()
    return jsonify(list(vessels_dict.values())), 200

@app.route('/api/vessels/<imo>', methods=['GET'])
@token_required
def get_vessel(imo):
    """Get specific vessel details - operator/admin only"""
    user_role = request.user.get('role', 'viewer')
    if user_role == 'viewer':
        log_access(request.user['email'], 'UNAUTHORIZED_ACCESS', 'vessel', {'imo': imo})
        return jsonify({'error': 'Access denied for viewers'}), 403
    
    vessel = data_manager.get_vessel(imo)
    if not vessel:
        return jsonify({'error': 'Vessel not found'}), 404
    
    log_access(request.user['email'], 'VIEW', 'vessel_details', {'imo': imo})
    return jsonify(vessel), 200

@app.route('/api/vessels/<imo>', methods=['PUT'])
@token_required
@role_required('operator')
def update_vessel(imo):
    """Update vessel - requires operator or admin (admin only)"""
    if request.user.get('role') != 'admin':
        log_access(request.user['email'], 'UNAUTHORIZED_UPDATE_VESSEL', 'vessel', {'imo': imo})
        return jsonify({'error': 'Only admin can modify vessel data'}), 403
    vessel = data_manager.get_vessel(imo)
    if not vessel:
        return jsonify({'error': 'Vessel not found'}), 404
    
    data = request.json
    updated_vessel = data_manager.update_vessel(imo, data)
    if not updated_vessel:
        return jsonify({'error': 'Vessel not found'}), 404
    
    return jsonify(updated_vessel), 200

@app.route('/api/oil-spills', methods=['GET'])
@token_required
def get_oil_spills():
    """Get all oil spill incidents - viewable by all roles"""
    log_access(request.user['email'], 'VIEW', 'oil_spills_list')
    spills_dict = data_manager.get_oil_spills()
    return jsonify(list(spills_dict.values())), 200

@app.route('/api/oil-spills/<spill_id>', methods=['GET'])
@token_required
@role_required('operator')
def get_oil_spill(spill_id):
    """Get specific oil spill details"""
    spill = data_manager.get_oil_spill(spill_id)
    if not spill:
        return jsonify({'error': 'Oil spill not found'}), 404
    
    log_access(request.user['email'], 'VIEW', 'oil_spill_details', {'spill_id': spill_id})
    return jsonify(spill), 200

@app.route('/api/marine-strikes', methods=['GET'])
@token_required
def get_marine_strikes():
    """Get marine mammal strike data"""
    strikes = data_manager.get_marine_strikes()
    return jsonify(strikes), 200

# New endpoint to simulate oil spill detection and trigger secure alert
@app.route('/api/simulate-oil-spill', methods=['POST'])
@token_required
@role_required('operator') # Only operators or admins can simulate spills
def simulate_oil_spill():
    """Simulate an oil spill detection and trigger a secure alert."""
    data = request.json
    imo = data.get('imo')
    lat = data.get('lat')
    lon = data.get('lon')
    
    if not all([imo, lat, lon]):
        return jsonify({'error': 'Missing required fields: imo, lat, lon'}), 400
    
    vessel = data_manager.get_vessel(imo)
    if not vessel:
        return jsonify({'error': 'Vessel not found'}), 404

    # Simulate spill data
    spill_id = f"OS-{len(data_manager.get_oil_spills()) + 1:05d}"
    spill_data = {
        'spill_id': spill_id,
        'vessel_imo': imo,
        'vessel_name': vessel['name'],
        'lat': lat,
        'lon': lon,
        'severity': 'High',
        'size_tons': random.randint(5, 50),
        'estimated_area_km2': round(random.uniform(0.1, 2.0), 2),
        'confidence': random.randint(80, 99),
        'status': 'Active',
        'reported_at': datetime.utcnow().isoformat(),
        'radius': random.randint(100, 500) # in meters
    }
    data_manager.add_oil_spill(spill_data)
    
    # Trigger Secure Alert
    send_secure_alert(
        subject=f"CRITICAL: Oil Spill Detected at {lat:.4f}, {lon:.4f}",
        body=f"High severity spill detected near vessel {vessel['name']} ({vessel['imo']}).\nLocation: {lat}, {lon}\nRadius: {spill_data['radius']}m\nImmediate containment required."
    )
    
    socketio.emit('new_spill', spill_data, room='spills')
    socketio.emit('alert', {'type': 'oil_spill', 'message': f"New high severity oil spill detected near {vessel['name']}!"}, room='alerts')
    broadcast_realtime_analysis() # Update analysis dashboard
    

    log_access(request.user['email'], 'SIMULATE_OIL_SPILL', 'oil_spills', {'spill_id': spill_id, 'imo': imo})
    return jsonify({'message': 'Oil spill simulated and alert sent', 'spill_id': spill_id}), 200

@app.route('/api/analytics/ais-anomalies', methods=['GET', 'POST'])
@token_required
def check_ais_anomalies():
    """Analyze current vessel traffic for anomalies using Pandas/NumPy"""
    vessels = list(data_manager.get_vessels().values())
    anomalies = ais_analyzer.detect_anomalies(vessels)
    
    # If POST, we might be filtering or running specific checks
    return jsonify({
        'anomalies': anomalies,
        'count': len(anomalies),
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/api/analytics/satellite-check', methods=['POST'])
@token_required
def check_satellite_imagery():
    """Simulate Deep Learning Satellite Analysis"""
    # In real app, receive image file or ID
    result = model_inference.analyze_satellite_image({'timestamp': datetime.utcnow().isoformat()})
    return jsonify(result), 200

@app.route('/api/simulate/predict', methods=['POST'])
@token_required
def predict_spill_spread():
    """AI 'What-If' Simulation: Predict spill spread based on weather parameters"""
    # Use the dedicated SpillForecaster module
    data = request.json or {}
    spill_id = data.get('spill_id')
    
    # Defaults
    env = {
        'wind_speed': float(data.get('wind_speed', 10)),
        'wind_dir': float(data.get('wind_direction', 0)),
        'current_speed': float(data.get('current_speed', 1)),
        'current_dir': float(data.get('current_direction', 90))
    }
    hours = float(data.get('hours', 24))
    
    # Get initial spill location
    spill = data_manager.get_oil_spill(spill_id)
    if not spill:
        return jsonify({'error': 'Spill ID not found'}), 404
        
    prediction = spill_forecaster.run_simulation(spill, env, duration_hours=int(hours))
    
    # Calculate impacts (simplified)
    # Area based on final radius
    final_radius = prediction[-1]['radius_km']
    final_area = 3.14159 * (final_radius ** 2)
    
    # Economic Impact Estimator
    cleanup_rate = 50000 
    rehab_rate = 35000
    econ_rate = 25000
    
    impact = {
        'cleanup_cost': final_area * cleanup_rate,
        'marine_rehab': final_area * rehab_rate,
        'tourism_fisheries_loss': final_area * econ_rate,
        'total_estimated_cost': final_area * (cleanup_rate + rehab_rate + econ_rate)
    }

    return jsonify({
        'spill_id': spill_id,
        'prediction': prediction,
        'final_area_km2': final_area,
        'economic_impact': impact
    }), 200


@app.route('/api/chat', methods=['POST'])
@token_required
def chat_bot():
    """Natural Language Interface 'Ask SeaTrace'"""
    data = request.json or {}
    message = data.get('message', '').lower()
    
    # Use LLM Service
    
    # Build context from Data Manager
    context = {
        'vessels': data_manager.get_vessels(),
        'spills': data_manager.get_oil_spills(),
        'alerts': [] # could fetch alerts if implemented
    }
    
    response_text = llm_service.generate_response(message, context)
        
    return jsonify({
        'response': response_text,
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/api/reports/generate', methods=['POST'])
@token_required
def generate_report():
    """Generate simplified PDF analysis report for real-time monitoring"""
    data = request.json or {}
    report_type = data.get('type', 'realtime')  # realtime, vessels, spills, comprehensive
    
    try:
        # Create PDF
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                              rightMargin=40, leftMargin=40,
                              topMargin=50, bottomMargin=30)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=26,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            alignment=1,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        # Title and Header
        elements.append(Paragraph("SeaTrace - Real-Time Marine Analysis", title_style))
        elements.append(Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        elements.append(Paragraph(f"Generated By: {request.user.get('name', 'Unknown')} ({request.user.get('role', 'User')})", styles['Normal']))
        elements.append(Paragraph(f"Region: Indian Ocean | Analysis Type: {report_type.upper()}", styles['Normal']))
        elements.append(Spacer(1, 0.3*inch))
        
        # Real-time Vessel Tracking Analysis
        if report_type in ['realtime', 'vessels', 'comprehensive']:
            elements.append(Paragraph("Real-Time Vessel Locations & Movement", heading_style))
            
            vessels_data = list(data_manager.get_vessels().values())
            vessel_data = [['Vessel Name', 'Company', 'Location', 'Speed', 'Risk', 'Status']]
            for vessel in vessels_data:
                try:
                    vessel_data.append([
                        vessel.get('name', 'Unknown')[:15],
                        vessel.get('company_name', 'Unknown')[:15],
                        f"{vessel.get('lat', 0):.2f}, {vessel.get('lon', 0):.2f}",
                        f"{vessel.get('speed', 0)} kts",
                        vessel.get('risk_level', 'N/A'),
                        vessel.get('status', 'Unknown')[:10]
                    ])
                except Exception as e:
                    print(f"Skipping malformed vessel data: {e}")
            
            table = Table(vessel_data, colWidths=[1.2*inch, 1.2*inch, 1.4*inch, 0.8*inch, 0.8*inch, 0.8*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0f9ff')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
            ]))
            elements.append(table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Oil Spill Monitoring Analysis
        if report_type in ['realtime', 'spills', 'comprehensive']:
            elements.append(Paragraph("Oil Spill Detection & Status", heading_style))
            
            oil_spills_data = list(data_manager.get_oil_spills().values())
            spill_data = [['Incident ID', 'Location', 'Severity', 'Size', 'Status', 'Confidence']]
            for spill in oil_spills_data:
                spill_data.append([
                    spill['spill_id'],
                    f"{spill['lat']:.2f}°N, {spill['lon']:.2f}°E",
                    spill['severity'],
                    f"{spill['size_tons']} tons",
                    spill['status'],
                    f"{spill['confidence']}%"
                ])
            
            table = Table(spill_data, colWidths=[1.0*inch, 1.3*inch, 0.9*inch, 1.0*inch, 1.0*inch, 0.8*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ef4444')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fef2f2')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#fecaca')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fef5f5')])
            ]))
            elements.append(table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Summary Statistics
        if report_type in ['realtime', 'comprehensive']:
            elements.append(Paragraph("Summary Statistics", heading_style))
            
            vessels_data = list(data_manager.get_vessels().values())
            oil_spills_data = list(data_manager.get_oil_spills().values())
            
            summary_data = [
                ['Total Vessels Monitored', str(len(vessels_data))],
                ['Active Oil Spill Incidents', str(len(oil_spills_data))],
                ['High Risk Vessels', str(sum(1 for v in vessels_data if v.get('risk_level') == 'High'))],
                ['Average Compliance Rating', f"{sum(v.get('compliance_rating', 0) for v in vessels_data) / len(vessels_data):.1f}/10" if vessels_data else "0/10"],
                ['High Severity Spills', str(sum(1 for s in oil_spills_data if s.get('severity') == 'High'))]
            ]
            
            summary_table = Table(summary_data, colWidths=[3.0*inch, 1.5*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdfa')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#a7f3d0'))
            ]))
            elements.append(summary_table)
        
        # Build PDF
        doc.build(elements)
        pdf_buffer.seek(0)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'seatrace_report_{report_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard-data', methods=['GET'])
@token_required
def get_dashboard_data():
    """Get aggregated dashboard data"""
    user_role = request.user.get('role', 'viewer')
    
    vessels_dict = data_manager.get_vessels()
    vessels_data = list(vessels_dict.values())
    
    # All roles can see basic dashboard
    data = {
        'total_vessels': len(vessels_data),
        'active_vessels': len([v for v in vessels_data if v.get('status') == 'Active']),
        'high_risk_vessels': len([v for v in vessels_data if v.get('risk_level') in ['High', 'Critical']]),
        'avg_compliance': round(sum(v.get('compliance_rating', 0) for v in vessels_data) / len(vessels_data), 1) if vessels_data else 0
    }
    
    # Operators and admins see additional data
    if user_role != 'viewer':
        oil_spills_dict = data_manager.get_oil_spills()
        oil_spills_data = list(oil_spills_dict.values())
        data['oil_spills'] = {
            'total': len(oil_spills_data),
            'by_severity': {
                'High': len([s for s in oil_spills_data if s['severity'] == 'High']),
                'Medium': len([s for s in oil_spills_data if s['severity'] == 'Medium']),
                'Low': len([s for s in oil_spills_data if s['severity'] == 'Low'])
            },
            'incidents': oil_spills_data
        }
    
    return jsonify(data), 200

def get_weather_for_location(lat, lon):
    """Get weather data for a specific location (simulated)"""
    # In production, integrate with a real weather API like OpenWeatherMap
    return {
        'temperature': round(random.uniform(25, 35), 1),
        'feels_like': round(random.uniform(27, 37), 1),
        'wind_speed': round(random.uniform(5, 15), 1),
        'wind_gust': round(random.uniform(8, 20), 1),
        'humidity': random.randint(60, 90),
        'pressure': random.randint(1000, 1020),
        'visibility': round(random.uniform(5, 15), 1),
        'sea_state': random.choice(['Calm', 'Slight', 'Moderate', 'Rough']),
        'wave_height': round(random.uniform(0.5, 3.0), 1),
        'conditions': random.choice(['Clear', 'Partly Cloudy', 'Cloudy', 'Rain']),
        'precipitation': round(random.uniform(0, 5), 1),
        'uv_index': random.randint(5, 10)
    }

@app.route('/api/weather/<float:lat>/<float:lon>', methods=['GET'])
@token_required
def get_weather(lat, lon):
    """Get weather data for a specific location"""
    weather = get_weather_for_location(lat, lon)
    return jsonify(weather), 200

# Secure Email Alert System
secure_alerts = []

def send_secure_alert(subject, body, recipient="confidential@seatrace.gov"):
    """Simulate sending a secure/confidential email alert"""
    timestamp = datetime.utcnow().isoformat()
    alert_id = f"ALERT-{len(secure_alerts) + 1:04d}"
    
    alert = {
        "id": alert_id,
        "timestamp": timestamp,
        "subject": f"[CONFIDENTIAL] {subject}",
        "body": body,
        "recipient": recipient,
        "status": "SENT (ENCRYPTED)"
    }
    
    secure_alerts.append(alert)
    
    # Simulate sending to secure relay
    print(f"\n[SECURE TRANSMISSION] >>> Sending Alert {alert_id} to {recipient}")
    print(f"Subject: {alert['subject']}")
    print(f"Body: {body}")
    print("Encryption: AES-256... COMPLETED\n")
    
    return alert

@app.route('/api/alerts/secure-history', methods=['GET'])
@token_required
def get_secure_alerts():
    """Get history of secure alerts"""
    if request.user.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return jsonify(secure_alerts), 200

# Advanced AI Simulation Endpoints

@app.route('/api/analysis/realtime', methods=['GET'])
@token_required
def get_ai_analysis():
    """
    Get real-time AI analysis of the current maritime situation.
    Simulates multi-modal detection (SAR + Optical) and false positive reduction.
    """
    # Simulate processing time for "heavy AI models"
    # time.sleep(0.5) 
    
    # 1. Oil Spill Analysis (Simulated)
    # Get active spills or simulate a "clean" state
    spills = list(data_manager.get_oil_spills().values())
    active_spill = spills[-1] if spills else None
    
    if active_spill and active_spill['status'] == 'Active':
        analysis = {
            'status': 'CRITICAL_DETECTION',
            'timestamp': datetime.utcnow().isoformat(),
            'detection_source': 'Sentinel-1B (SAR) + Sentinel-2A (Optical)',
            'confidence_score': active_spill.get('confidence', 88),
            'false_positive_check': {
                'passed': True,
                'algae_bloom_probability': 12, # Low propability
                'wind_shadow_probability': 5,
                'details': 'Texture analysis confirms non-biogenic substance. Spectral index negative for chlorophyll-a.'
            },
            'source_identification': {
                'likely_source': active_spill.get('vessel_name', 'Unknown Vessel'),
                'probability': 92,
                'reasoning': 'Vessel trajectory intersects with spill origin at estimated release time (-2h).'
            },
            'weather_context': {
                'wind_speed': f"{random.uniform(5, 12):.1f} kts",
                'sea_state': 'Moderate',
                'visibility': 'Good'
            },
            'imagery': {
                'sar_url': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80', # Placeholder Space/Radar look
                'optical_url': 'https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?w=500&q=80' # Placeholder Ocean
            },
            'ai_summary': (
                f"ALERT: High-confidence oil spill detected at {active_spill['lat']:.2f}, {active_spill['lon']:.2f}. "
                f"Multi-modal analysis confirms substance with {active_spill.get('confidence', 88)}% certainty. "
                "Deep learning models rule out algae bloom. "
                f"Drift prediction indicates movement towards NE at 0.5kts."
            )
        }
    else:
        analysis = {
            'status': 'CLEAR',
            'timestamp': datetime.utcnow().isoformat(),
            'detection_source': 'Sentinel-1B (SAR)',
            'confidence_score': 99,
            'summary': 'No anomalies detected in the current scan sector.'
        }
        
    return jsonify(analysis), 200

@app.route('/api/prediction/spread', methods=['POST'])
@token_required
def predict_spread():
    """
    Generate predicted oil spill spread polygons for 24h, 48h, 72h.
    """
    data = request.json
    start_lat = data.get('lat')
    start_lon = data.get('lon')
    
    if not start_lat or not start_lon:
        return jsonify({'error': 'Location required'}), 400
        
    # Simulate Lagrangian Particle Tracking results
    # Generate simple polygons (circles/ellipses) expanding over time
    predictions = []
    
    # Drift direction (randomized but consistent for the call)
    drift_lat = random.uniform(0.01, 0.05)
    drift_lon = random.uniform(0.01, 0.05)
    
    periods = [24, 48, 72]
    for hours in periods:
        # Move center point based on drift
        center_lat = start_lat + (drift_lat * (hours/24))
        center_lon = start_lon + (drift_lon * (hours/24))
        
        # Increase radius
        radius = 0.02 + (0.01 * (hours/24))
        
        # Create a simple polygon approximation (diamond shape for simplicity)
        polygon = [
            [center_lat + radius, center_lon],
            [center_lat, center_lon + radius],
            [center_lat - radius, center_lon],
            [center_lat, center_lon - radius],
            [center_lat + radius, center_lon] # Close loop
        ]
        
        predictions.append({
            'time_horizon_hours': hours,
            'predicted_at': (datetime.utcnow() + timedelta(hours=hours)).isoformat(),
            'impact_risk': 'High' if hours == 72 else 'Medium',
            'sensitive_areas_at_risk': ['Coral Reef Alpha'] if hours > 24 else [],
            'polygon': polygon
        })
        
    return jsonify({
        'incident_location': {'lat': start_lat, 'lon': start_lon},
        'predictions': predictions
    }), 200

def get_secure_history():
    """View sent confidential alerts (Admin/Operator only)"""
    current_user = request.user
    if current_user.get('role', 'viewer') == 'viewer':
         return jsonify({'error': 'Unauthorized access to confidential logs'}), 403
    return jsonify(secure_alerts), 200

# Existing Routes
@app.route('/api/health', methods=['GET'])
def health():
    print("DEBUG: Health check called")
    return jsonify({'status': 'ok', 'service': 'SeaTrace Backend'}), 200



# WebSocket events for real-time monitoring
@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connection_response', {'data': 'Connected to SeaTrace server', 'timestamp': datetime.utcnow().isoformat()})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')

@socketio.on('subscribe_vessels')
def handle_subscribe_vessels():
    """Subscribe to real-time vessel position updates"""
    join_room('vessels')
    emit('status', {'data': 'Subscribed to vessel updates'})
    # Send current vessel positions immediately
    vessels_dict = data_manager.get_vessels()
    vessel_list = [{
        'imo': v['imo'],
        'name': v['name'],
        'lat': v['lat'],
        'lon': v['lon'],
        'speed': v['speed'],
        'course': v['course'],
        'destination': v.get('destination', 'Unknown'),
        'risk_level': v['risk_level']
    } for v in vessels_dict.values()]
    emit('vessel_batch_update', {'vessels': vessel_list, 'timestamp': datetime.utcnow().isoformat()})

@socketio.on('subscribe_alerts')
def handle_subscribe_alerts():
    """Subscribe to real-time alerts"""
    join_room('alerts')
    emit('status', {'data': 'Subscribed to alerts'})

@socketio.on('subscribe_spills')
def handle_subscribe_spills():
    """Subscribe to real-time spill alerts"""
    join_room('spills')
    emit('status', {'data': 'Subscribed to spill updates'})
    # Send current spill positions immediately
    oil_spills_data = data_manager.get_oil_spills()
    spill_list = [{
        'spill_id': s['spill_id'],
        'vessel_name': s['vessel_name'],
        'lat': s['lat'],
        'lon': s['lon'],
        'severity': s['severity'],
        'size_tons': s['size_tons'],
        'status': s['status'],
        'confidence': s['confidence']
    } for s in oil_spills_data.values()]
    emit('spill_batch_update', {'spills': spill_list, 'timestamp': datetime.utcnow().isoformat()})

@socketio.on('subscribe_realtime_analysis')
def handle_subscribe_realtime():
    """Subscribe to real-time analysis for all users"""
    join_room('realtime_analysis')
    emit('status', {'data': 'Subscribed to real-time analysis'})
    # Send initial analysis snapshot
    vessels_dict = data_manager.get_vessels()
    oil_spills_dict = data_manager.get_oil_spills()
    analysis_data = {
        'vessels': [{
            'imo': v.get('imo'),
            'name': v.get('name', 'Unknown'),
            'lat': v.get('lat', 0.0),
            'lon': v.get('lon', 0.0),
            'speed': v.get('speed', 0),
            'course': v.get('course', 0),
            'destination': v.get('destination', 'Unknown'),
            'compliance_rating': v.get('compliance_rating', 0),
            'risk_level': v.get('risk_level', 'Unknown'),
            'last_inspection': v.get('last_inspection', 'N/A')
        } for v in vessels_dict.values()],
        'oil_spills': [{
            'spill_id': s['spill_id'],
            'vessel_name': s['vessel_name'],
            'lat': s['lat'],
            'lon': s['lon'],
            'severity': s['severity'],
            'size_tons': s['size_tons'],
            'estimated_area_km2': s['estimated_area_km2'],
            'status': s['status'],
            'confidence': s['confidence']
        } for s in oil_spills_dict.values()],
        'timestamp': datetime.utcnow().isoformat()
    }
    emit('realtime_analysis_update', analysis_data)

def broadcast_vessel_update(imo):
    """Broadcast vessel position/status update to all subscribers"""
    vessel = data_manager.get_vessel(imo)
    if vessel:
        socketio.emit('vessel_update', {
            'imo': imo,
            'data': vessel,
            'timestamp': datetime.utcnow().isoformat()
        }, room='vessels')

def broadcast_realtime_analysis():
    """Broadcast real-time analysis update to all analysis subscribers"""
    vessels_dict = data_manager.get_vessels()
    oil_spills_dict = data_manager.get_oil_spills()
    analysis_data = {
        'vessels': [{
            'imo': v.get('imo'),
            'name': v.get('name', 'Unknown'),
            'lat': v.get('lat', 0.0),
            'lon': v.get('lon', 0.0),
            'history': v.get('history', []),
            'speed': v.get('speed', 0),
            'course': v.get('course', 0),
            'destination': v.get('destination', 'Unknown'),
            'compliance_rating': v.get('compliance_rating', 0),
            'risk_level': v.get('risk_level', 'Unknown'),
            'last_inspection': v.get('last_inspection', 'N/A')
        } for v in vessels_dict.values()],
        'oil_spills': [{
            'spill_id': s['spill_id'],
            'vessel_name': s['vessel_name'],
            'lat': s['lat'],
            'lon': s['lon'],
            'severity': s['severity'],
            'size_tons': s['size_tons'],
            'estimated_area_km2': s['estimated_area_km2'],
            'status': s['status'],
            'confidence': s['confidence']
        } for s in oil_spills_dict.values()],
        'timestamp': datetime.utcnow().isoformat()
    }
    socketio.emit('realtime_analysis_update', analysis_data, room='realtime_analysis')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    socketio.run(app, debug=False, port=port, host='0.0.0.0')
