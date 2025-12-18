/**
 * SeaTrace - Advanced Marine Intelligence & Real-Time Monitoring System
 * Copyright © 2025 by Suriya. All rights reserved.
 * 
 * Real-time vessel tracking, oil spill detection, and environmental monitoring
 * for maritime operations and ocean conservation.
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import './App.css';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('viewer');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [vessels, setVessels] = useState([]);
  const [oilSpills, setOilSpills] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reportLoading, setReportLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [themeColors, setThemeColors] = useState({
    primary: '#2563eb',
    secondary: '#0f766e',
    accent: '#f59e0b',
    danger: '#dc2626'
  });
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  
  // Admin panel state
  const [allUsers, setAllUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [newUserData, setNewUserData] = useState({
    email: '',
    name: '',
    password: '',
    company: '',
    role: 'operator'
  });
  const [adminPanelLoading, setAdminPanelLoading] = useState(false);
  const [adminPanelMessage, setAdminPanelMessage] = useState('');
  
  // Real-time movement tracking state
  const [vesselMovementData, setVesselMovementData] = useState({});
  const [oilSpillProgression, setOilSpillProgression] = useState({});
  const [movementHistory, setMovementHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Country boundaries for India region (simplified)
  const countryBoundaries = {
    "India": {
      "type": "Feature",
      "properties": { "name": "India" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [68.1766451354, 7.96553477623],
          [97.4025614766, 7.96553477623],
          [97.4025614766, 35.4940095078],
          [68.1766451354, 35.4940095078],
          [68.1766451354, 7.96553477623]
        ]]
      }
    },
    "Sri Lanka": {
      "type": "Feature", 
      "properties": { "name": "Sri Lanka" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [79.6951668639, 5.96836985923],
          [81.7879590183, 5.96836985923],
          [81.7879590183, 9.82407766361],
          [79.6951668639, 9.82407766361],
          [79.6951668639, 5.96836985923]
        ]]
      }
    },
    "Bangladesh": {
      "type": "Feature",
      "properties": { "name": "Bangladesh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [88.0844222351, 20.670883287],
          [92.6727209818, 20.670883287],
          [92.6727209818, 26.4465255803],
          [88.0844222351, 26.4465255803],
          [88.0844222351, 20.670883287]
        ]]
      }
    }
  };

  const applyThemeColors = (colors) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
  };

  // Check auth on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTheme = localStorage.getItem('themeColors');
    
    if (savedTheme) {
      const colors = JSON.parse(savedTheme);
      setThemeColors(colors);
      applyThemeColors(colors);
    }
    
    if (savedToken && savedUser) {
      const user = JSON.parse(savedUser);
      setToken(savedToken);
      setIsLoggedIn(true);
      setUserName(user.name);
      setUserRole(user.role);
      fetchVessels(savedToken);
      fetchDashboardData(savedToken);
      if (user.role !== 'viewer') {
        fetchOilSpills(savedToken);
      }
      initializeSocket(savedToken);
    }
  }, []);

  // Real-time movement data updates
  useEffect(() => {
    if (!isLoggedIn || vessels.length === 0) return;

    const updateInterval = setInterval(() => {
      updateMovementData();
    }, 300000); // Update every 5 minutes

    return () => clearInterval(updateInterval);
  }, [isLoggedIn, vessels, oilSpills]);

  // Initialize WebSocket connection
  const initializeSocket = (authToken) => {
    const newSocket = io(SOCKET_URL, {
      query: { token: authToken },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      newSocket.emit('subscribe_vessels');
      newSocket.emit('subscribe_alerts');
      newSocket.emit('subscribe_spills');
      newSocket.emit('subscribe_realtime_analysis');
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    newSocket.on('vessel_update', (data) => {
      setVessels(prev => {
        const updated = [...prev];
        const index = updated.findIndex(v => v.imo === data.imo);
        if (index >= 0) {
          updated[index] = { ...updated[index], ...data.data };
        }
        return updated;
      });
    });

    newSocket.on('realtime_analysis_update', (data) => {
      // Update vessels and oil spills from real-time analysis
      if (data.vessels) {
        setVessels(data.vessels);
      }
      if (data.oil_spills) {
        setOilSpills(data.oil_spills);
      }
    });

    setSocket(newSocket);
    return newSocket;
  };

  const fetchVessels = async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vessels`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setVessels(response.data);
      // Generate movement data after vessels are loaded
      setTimeout(() => updateMovementData(), 100);
    } catch (error) {
      console.error('Error fetching vessels:', error);
    }
  };

  const fetchOilSpills = async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/oil-spills`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setOilSpills(response.data);
      // Generate spill progression data after spills are loaded
      setTimeout(() => updateMovementData(), 100);
    } catch (error) {
      console.error('Error fetching oil spills:', error);
    }
  };

  const fetchDashboardData = async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard-data`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setDashboardData(response.data);
      
      // Fetch weather for first vessel if available
      if (vessels.length > 0) {
        fetchWeather(vessels[0].lat, vessels[0].lon, authToken);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchWeather = async (lat, lon, authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather/${lat}/${lon}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const testEmails = ['admin@seatrace.com', 'operator@seatrace.com', 'viewer@seatrace.com'];
      const loginData = { email };
      
      // Only send password if it's not a test email or if password is provided
      if (!testEmails.includes(email) && password) {
        loginData.password = password;
      }
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      
      const { token: newToken, user } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(newToken);
      setUserName(user.name);
      setUserRole(user.role);
      setIsLoggedIn(true);
      
      fetchVessels(newToken);
      fetchDashboardData(newToken);
      if (user.role !== 'viewer') {
        fetchOilSpills(newToken);
      }
      initializeSocket(newToken);
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || error.message));
    }
  };

  // Generate simulated vessel movement data
  const generateVesselMovementData = (vessel) => {
    const movementData = [];
    const baseLat = vessel.lat;
    const baseLon = vessel.lon;
    const now = new Date();
    
    // Generate 24 hours of movement data (every 2 hours)
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000));
      const latOffset = (Math.random() - 0.5) * 0.1; // Small random movement
      const lonOffset = (Math.random() - 0.5) * 0.1;
      
      movementData.push({
        time: timestamp.toLocaleTimeString(),
        lat: baseLat + latOffset,
        lon: baseLon + lonOffset,
        speed: vessel.speed + (Math.random() - 0.5) * 2,
        course: vessel.course + (Math.random() - 0.5) * 10
      });
    }
    
    return movementData;
  };

  // Generate oil spill progression data
  const generateOilSpillProgression = (spill) => {
    const progressionData = [];
    const now = new Date();
    
    // Generate progression over time
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Every hour
      const baseSize = spill.size_tons;
      const baseArea = spill.estimated_area_km2;
      
      // Oil spreads over time
      const timeFactor = (24 - i) / 24; // 0 to 1 over 24 hours
      const sizeIncrease = baseSize * timeFactor * 0.1; // 10% increase over time
      const areaIncrease = baseArea * timeFactor * 0.2; // 20% area increase
      
      progressionData.push({
        time: timestamp.toLocaleTimeString(),
        size_tons: baseSize + sizeIncrease,
        area_km2: baseArea + areaIncrease,
        confidence: Math.min(95, spill.confidence + timeFactor * 5)
      });
    }
    
    return progressionData;
  };

  // Update movement data for all vessels
  const updateMovementData = () => {
    const newMovementData = {};
    vessels.forEach(vessel => {
      newMovementData[vessel.imo] = generateVesselMovementData(vessel);
    });
    setVesselMovementData(newMovementData);

    const newSpillProgression = {};
    oilSpills.forEach(spill => {
      newSpillProgression[spill.spill_id] = generateOilSpillProgression(spill);
    });
    setOilSpillProgression(newSpillProgression);
    
    // Check for movement alerts
    checkMovementAlerts(newMovementData);
  };

  // Check for vessel movement alerts
  const checkMovementAlerts = (newMovementData) => {
    const alerts = [];
    
    Object.entries(newMovementData).forEach(([imo, movementData]) => {
      const vessel = vessels.find(v => v.imo === imo);
      if (!vessel || movementData.length < 2) return;
      
      const currentPos = movementData[movementData.length - 1];
      const previousPos = movementData[movementData.length - 2];
      
      // Check for high speed
      if (currentPos.speed > 25) {
        alerts.push({
          id: `speed-${imo}-${Date.now()}`,
          type: 'warning',
          title: 'High Speed Alert',
          message: `${vessel.name} is traveling at ${currentPos.speed} knots`,
          vessel: vessel.name,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check for course changes (potential maneuvering)
      const courseChange = Math.abs(currentPos.course - previousPos.course);
      if (courseChange > 45) {
        alerts.push({
          id: `course-${imo}-${Date.now()}`,
          type: 'info',
          title: 'Course Change',
          message: `${vessel.name} changed course by ${courseChange.toFixed(1)}°`,
          vessel: vessel.name,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check if vessel is near restricted areas (simplified check)
      if (currentPos.lat > 20 && currentPos.lat < 25 && currentPos.lon > 85 && currentPos.lon < 95) {
        alerts.push({
          id: `restricted-${imo}-${Date.now()}`,
          type: 'danger',
          title: 'Restricted Area Alert',
          message: `${vessel.name} is approaching restricted waters`,
          vessel: vessel.name,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    if (alerts.length > 0) {
      setNotifications(prev => [...alerts, ...prev].slice(0, 10)); // Keep last 10 notifications
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setToken('');
    setVessels([]);
    setOilSpills([]);
    if (socket) socket.disconnect();
  };

  // Admin panel functions
  const fetchAllUsers = async () => {
    if (userRole !== 'admin') return;
    setAdminPanelLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAdminPanelMessage('Error fetching users');
    } finally {
      setAdminPanelLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (userRole !== 'admin') return;
    setAdminPanelLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/audit-logs?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAdminPanelMessage('Error fetching audit logs');
    } finally {
      setAdminPanelLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.name || !newUserData.password || !newUserData.company) {
      setAdminPanelMessage('All fields are required');
      return;
    }

    setAdminPanelLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/users/register`,
        newUserData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setAdminPanelMessage(`User ${newUserData.email} created successfully!`);
      setNewUserData({ email: '', name: '', password: '', company: '', role: 'operator' });
      fetchAllUsers();
      setTimeout(() => setAdminPanelMessage(''), 3000);
    } catch (error) {
      setAdminPanelMessage(error.response?.data?.error || 'Error creating user');
    } finally {
      setAdminPanelLoading(false);
    }
  };

  const handleDeleteUser = async (userEmail) => {
    if (!window.confirm(`Are you sure you want to delete ${userEmail}?`)) return;
    
    setAdminPanelLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${userEmail}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAdminPanelMessage(`User ${userEmail} deleted successfully`);
      fetchAllUsers();
      setTimeout(() => setAdminPanelMessage(''), 3000);
    } catch (error) {
      setAdminPanelMessage(error.response?.data?.error || 'Error deleting user');
    } finally {
      setAdminPanelLoading(false);
    }
  };

  const generateReport = async (type) => {
    setReportLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reports/generate`,
        { type },
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `seatrace_report_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (error) {
      alert('Report generation failed: ' + error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444',
      'Critical': '#7c2d12'
    };
    return colors[riskLevel] || '#6b7280';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444'
    };
    return colors[severity] || '#6b7280';
  };

  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="login-container" style={{
          backgroundImage: 'linear-gradient(135deg, rgba(38, 99, 235, 0.9), rgba(118, 75, 162, 0.9)), url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 1200 600%27%3E%3Cpath d=%27M0,300 Q300,200 600,300 T1200,300%27 fill=%27%23667eea%27 opacity=%270.3%27/%3E%3Cpath d=%27M0,400 Q300,250 600,400 T1200,400%27 fill=%27%23764ba2%27 opacity=%270.2%27/%3E%3Ccircle cx=%27100%27 cy=%27100%27 r=%2750%27 fill=%27%23f59e0b%27 opacity=%270.2%27/%3E%3Ccircle cx=%271100%27 cy=%27500%27 r=%2760%27 fill=%27%2310b981%27 opacity=%270.15%27/%3E%3C/svg%3E")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}>
          <div className="login-card">
            <div className="login-header">
              <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>⚓ SeaTrace</h1>
              <p className="subtitle" style={{ fontSize: '18px', color: '#667eea', marginBottom: '10px', fontWeight: '600', letterSpacing: '2px' }}>MARITIME INTELLIGENCE</p>
              <p className="tagline" style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Advanced Ocean Monitoring & Environmental Protection</p>
              
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '16px' }}>🎉 Welcome to SeaTrace!</h3>
                <p style={{ color: '#666', margin: '0', fontSize: '13px', lineHeight: '1.4' }}>
                  Real-time vessel tracking, oil spill monitoring, and maritime analytics.<br/>
                  <strong>Click any demo account below for instant access!</strong>
                </p>
              </div>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>
                  📧 Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ fontSize: '15px' }}
                />
              </div>

              {(!email || !['admin@seatrace.com', 'operator@seatrace.com', 'viewer@seatrace.com'].includes(email)) && (
                <div className="form-group">
                  <label style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>
                    🔐 Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!['admin@seatrace.com', 'operator@seatrace.com', 'viewer@seatrace.com'].includes(email)}
                    style={{ fontSize: '15px' }}
                  />
                </div>
              )}
              
              <button type="submit" className="login-btn" style={{ 
                fontSize: '16px', 
                fontWeight: '700',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                paddingTop: '14px',
                paddingBottom: '14px'
              }}>
                ⛵ Access System
              </button>
            </form>

            <div className="demo-accounts" style={{ marginTop: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', fontWeight: '600' }}>🚀 Quick Access Demo Accounts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <button 
                  onClick={() => setEmail('admin@seatrace.com')} 
                  type="button"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    border: 'none', 
                    color: '#fff', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  👑 Admin Access<br/>
                  <small style={{ fontSize: '12px', opacity: '0.9' }}>Full System Control</small>
                </button>
                <button 
                  onClick={() => setEmail('operator@seatrace.com')} 
                  type="button"
                  style={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                    border: 'none', 
                    color: '#fff', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ⚙️ Operator Access<br/>
                  <small style={{ fontSize: '12px', opacity: '0.9' }}>Reporting & Monitoring</small>
                </button>
                <button 
                  onClick={() => setEmail('viewer@seatrace.com')} 
                  type="button"
                  style={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                    border: 'none', 
                    color: '#fff', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  👁️ Viewer Access<br/>
                  <small style={{ fontSize: '12px', opacity: '0.9' }}>Read-Only Dashboard</small>
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '15px', lineHeight: '1.4' }}>
                <strong>No passwords required!</strong> Just click any account above to explore SeaTrace's features.<br/>
                Experience real-time maritime intelligence and environmental monitoring.
              </p>
            </div>

          </div>
          <div className="login-footer">
            <p>&copy; 2025 SeaTrace. Developed by <strong>Suriya</strong>. All rights reserved.</p>
            <p style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(255,255,255,0.7)' }}>Advanced Maritime Intelligence & Environmental Protection System</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* AI-Generated Maritime Background Pattern */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 25% 25%, rgba(30, 136, 229, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.04) 0%, transparent 50%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><defs><pattern id="waves" x="0" y="0" width="200" height="100" patternUnits="userSpaceOnUse"><path d="M0,50 Q50,30 100,50 T200,50" stroke="%2342a5f5" stroke-width="1" fill="none" opacity="0.1"/><path d="M0,60 Q50,40 100,60 T200,60" stroke="%2300897b" stroke-width="1" fill="none" opacity="0.08"/><circle cx="50" cy="30" r="3" fill="%23f59e0b" opacity="0.1"/><circle cx="150" cy="70" r="2" fill="%2310b981" opacity="0.15"/><text x="80" y="45" font-family="Arial" font-size="8" fill="%23667eea" opacity="0.1">⚓</text><text x="120" y="55" font-family="Arial" font-size="6" fill="%23ef4444" opacity="0.08">🛢️</text></svg>')
        `,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>
      
      <nav className="navbar">
        <div className="navbar-left">
          <h1>⚓ SeaTrace</h1>
        </div>
        <div className="navbar-center">
          <div className="connection-status">
            <span className={`status-dot ${connectionStatus}`}></span>
            Real-time: {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
        <div className="navbar-right">
          {/* Notifications for Admin/Operator */}
          {(userRole === 'admin' || userRole === 'operator') && (
            <div className="notification-container">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-bell"
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '8px',
                  marginRight: '12px',
                  borderRadius: '50%',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                🔔
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-panel" style={{
                  position: 'absolute',
                  top: '60px',
                  right: '20px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  width: '350px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    Movement Alerts ({notifications.length})
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px', color: '#6b7280', textAlign: 'center' }}>
                      No alerts at this time
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: 
                          notification.type === 'danger' ? '#fef2f2' :
                          notification.type === 'warning' ? '#fefce8' : '#f0f9ff'
                      }}>
                        <div style={{
                          fontWeight: 'bold',
                          color: 
                            notification.type === 'danger' ? '#dc2626' :
                            notification.type === 'warning' ? '#d97706' : '#2563eb',
                          fontSize: '14px'
                        }}>
                          {notification.title}
                        </div>
                        <div style={{ color: '#374151', fontSize: '13px', marginTop: '4px' }}>
                          {notification.message}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="user-info">
            <span>{userName}</span>
            <span className="role-badge">{userRole.toUpperCase()}</span>
          </div>
          {userRole === 'admin' && (
            <button 
              onClick={() => setShowThemeEditor(!showThemeEditor)} 
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
                transition: 'all 0.3s',
                marginRight: '12px'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🎨 Customize
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="main-container">
        {/* Tabs - All users can see Dashboard, Map, and Real-time Analysis */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Map
          </button>

          <button
            className={`tab-btn ${activeTab === 'realtime' ? 'active' : ''}`}
            onClick={() => setActiveTab('realtime')}
          >
            📡 Real-Time Analysis
          </button>
          
          {userRole !== 'viewer' && (
            <>
              <button
                className={`tab-btn ${activeTab === 'vessels' ? 'active' : ''}`}
                onClick={() => setActiveTab('vessels')}
              >
                📋 Vessels ({vessels.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'spills' ? 'active' : ''}`}
                onClick={() => setActiveTab('spills')}
              >
                ⚠️ Oil Spills ({oilSpills.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                📄 Reports
              </button>
            </>
          )}
          
          {userRole === 'admin' && (
            <button
              className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              ⚙️ Admin Panel
            </button>
          )}
        </div>

        {/* Theme Editor - Admin Only */}
        {showThemeEditor && userRole === 'admin' && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '700' }}>🎨 Theme Customizer</h3>
              <button onClick={() => setShowThemeEditor(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>Primary Color</label>
                <input
                  type="color"
                  value={themeColors.primary}
                  onChange={(e) => {
                    const newColors = { ...themeColors, primary: e.target.value };
                    setThemeColors(newColors);
                    localStorage.setItem('themeColors', JSON.stringify(newColors));
                  }}
                  style={{ width: '100%', height: '45px', border: '2px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>Secondary Color</label>
                <input
                  type="color"
                  value={themeColors.secondary}
                  onChange={(e) => {
                    const newColors = { ...themeColors, secondary: e.target.value };
                    setThemeColors(newColors);
                    localStorage.setItem('themeColors', JSON.stringify(newColors));
                  }}
                  style={{ width: '100%', height: '45px', border: '2px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>Accent Color</label>
                <input
                  type="color"
                  value={themeColors.accent}
                  onChange={(e) => {
                    const newColors = { ...themeColors, accent: e.target.value };
                    setThemeColors(newColors);
                    localStorage.setItem('themeColors', JSON.stringify(newColors));
                  }}
                  style={{ width: '100%', height: '45px', border: '2px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
              <button
                onClick={() => {
                  setThemeColors({
                    primary: '#2563eb',
                    secondary: '#0f766e',
                    accent: '#f59e0b',
                    danger: '#dc2626'
                  });
                  localStorage.removeItem('themeColors');
                }}
                style={{
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                ↺ Reset to Default
              </button>
            </div>
          </div>
        )}

        {/* Dashboard - Visible to all roles */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="dashboard-container">
            <h2>Dashboard Overview</h2>
            
            {/* System Status Indicator */}
            <div className="system-status-section" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '32px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
                  animation: 'pulse 2s infinite'
                }}></span>
                System Status: {connectionStatus === 'connected' ? '🟢 All Systems Operational' : '🔴 System Issues Detected'}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="status-item" style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>🛰️</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#059669' }}>Real-time Tracking</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Active & Running</div>
                  </div>
                </div>
                
                <div className="status-item" style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>📊</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2563eb' }}>Data Analytics</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Processing Live Data</div>
                  </div>
                </div>
                
                <div className="status-item" style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>🚨</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#d97706' }}>Alert System</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Monitoring Active</div>
                  </div>
                </div>
                
                <div className="status-item" style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>🛢️</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>Spill Detection</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>AI Models Running</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weather Widget */}
            {weatherData && (
              <div className="charts-section" style={{ marginBottom: '40px' }}>
                <h3>🌍 Current Weather Conditions (First Vessel Location)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="stat-card">
                    <h3>Temperature</h3>
                    <p className="stat-value">{weatherData.temperature}°C</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Feels: {weatherData.feels_like}°C</p>
                  </div>
                  <div className="stat-card">
                    <h3>Wind Speed</h3>
                    <p className="stat-value">{weatherData.wind_speed} m/s</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Gust: {weatherData.wind_gust} m/s</p>
                  </div>
                  <div className="stat-card">
                    <h3>Humidity</h3>
                    <p className="stat-value">{weatherData.humidity}%</p>
                  </div>
                  <div className="stat-card">
                    <h3>Pressure</h3>
                    <p className="stat-value">{weatherData.pressure} mb</p>
                  </div>
                  <div className="stat-card">
                    <h3>Visibility</h3>
                    <p className="stat-value">{weatherData.visibility} km</p>
                  </div>
                  <div className="stat-card">
                    <h3>Sea State</h3>
                    <p className="stat-value" style={{ fontSize: '20px' }}>{weatherData.sea_state}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Wave: {weatherData.wave_height}m</p>
                  </div>
                  <div className="stat-card">
                    <h3>Conditions</h3>
                    <p className="stat-value" style={{ fontSize: '20px' }}>{weatherData.conditions}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Rain: {weatherData.precipitation}mm</p>
                  </div>
                  <div className="stat-card">
                    <h3>UV Index</h3>
                    <p className="stat-value">{weatherData.uv_index}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Vessels</h3>
                <p className="stat-value">{dashboardData.total_vessels}</p>
              </div>
              <div className="stat-card">
                <h3>Active Vessels</h3>
                <p className="stat-value">{dashboardData.active_vessels}</p>
              </div>
              <div className="stat-card">
                <h3>High Risk Vessels</h3>
                <p className="stat-value" style={{ color: '#ef4444' }}>
                  {dashboardData.high_risk_vessels}
                </p>
              </div>
              <div className="stat-card">
                <h3>Avg Compliance Rating</h3>
                <p className="stat-value">{dashboardData.avg_compliance}/10</p>
              </div>
            </div>

            {/* Oil spill stats - operator/admin only */}
            {dashboardData.oil_spills && (
              <>
                <div className="spill-stats">
                  <h3>Oil Spill Incidents</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h3>Total Spills</h3>
                      <p className="stat-value">{dashboardData.oil_spills.total}</p>
                    </div>
                    <div className="stat-card">
                      <h3>High Severity</h3>
                      <p className="stat-value" style={{ color: '#ef4444' }}>
                        {dashboardData.oil_spills.by_severity.High}
                      </p>
                    </div>
                    <div className="stat-card">
                      <h3>Medium Severity</h3>
                      <p className="stat-value" style={{ color: '#f59e0b' }}>
                        {dashboardData.oil_spills.by_severity.Medium}
                      </p>
                    </div>
                    <div className="stat-card">
                      <h3>Low Severity</h3>
                      <p className="stat-value" style={{ color: '#10b981' }}>
                        {dashboardData.oil_spills.by_severity.Low}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="charts-section">
                  <h3>Oil Spill & Vessel Analytics</h3>
                  <div className="charts-grid">
                    <div className="chart-container">
                      <p className="chart-title">Oil Spill Severity Distribution</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'High', value: dashboardData.oil_spills.by_severity.High },
                              { name: 'Medium', value: dashboardData.oil_spills.by_severity.Medium },
                              { name: 'Low', value: dashboardData.oil_spills.by_severity.Low }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#ef4444" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#10b981" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                      <p className="chart-title">Vessel Risk Level Distribution</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={vessels.length > 0 ? [
                              { name: 'Low', value: vessels.filter(v => v.risk_level === 'Low').length },
                              { name: 'Medium', value: vessels.filter(v => v.risk_level === 'Medium').length },
                              { name: 'High', value: vessels.filter(v => v.risk_level === 'High').length }
                            ] : []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                      <p className="chart-title">Vessel Type Distribution</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={vessels.length > 0 ? [
                              { name: 'Container Ship', value: vessels.filter(v => v.type === 'Container Ship').length },
                              { name: 'Bulk Carrier', value: vessels.filter(v => v.type === 'Bulk Carrier').length },
                              { name: 'Tanker', value: vessels.filter(v => v.type === 'Tanker').length }
                            ] : []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#2563eb" />
                            <Cell fill="#0f766e" />
                            <Cell fill="#7c3aed" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                      <p className="chart-title">Compliance Rating Bands</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={vessels.length > 0 ? [
                              { name: '0-3', value: vessels.filter(v => v.compliance_rating < 3).length },
                              { name: '3-5', value: vessels.filter(v => v.compliance_rating >= 3 && v.compliance_rating < 5).length },
                              { name: '5-7', value: vessels.filter(v => v.compliance_rating >= 5 && v.compliance_rating < 7).length },
                              { name: '7-10', value: vessels.filter(v => v.compliance_rating >= 7).length }
                            ] : []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#ef4444" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#10b981" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Real-Time Movement Graphs */}
                <div className="charts-section">
                  <h3>🚢 Real-Time Vessel Movement Tracking</h3>
                  <div className="charts-grid">
                    {vessels.slice(0, 2).map(vessel => (
                      <div key={vessel.imo} className="chart-container">
                        <p className="chart-title">{vessel.name} - Speed Over Time</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={vesselMovementData[vessel.imo] || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="speed" 
                              stroke="#2563eb" 
                              strokeWidth={2}
                              name="Speed (knots)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Oil Spill Progression Graphs */}
                <div className="charts-section">
                  <h3>🛢️ Oil Spill Progression Monitoring</h3>
                  <div className="charts-grid">
                    {oilSpills.slice(0, 2).map(spill => (
                      <div key={spill.spill_id} className="chart-container">
                        <p className="chart-title">{spill.spill_id} - Spill Size Over Time</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={oilSpillProgression[spill.spill_id] || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="size_tons" 
                              stroke="#ef4444" 
                              strokeWidth={2}
                              name="Size (tons)"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="area_km2" 
                              stroke="#f59e0b" 
                              strokeWidth={2}
                              name="Area (km²)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recent-spills">
                  <h3>Recent Incidents</h3>
                  <div className="spills-list">
                    {dashboardData.oil_spills.incidents.slice(0, 5).map(spill => (
                      <div key={spill.spill_id} className="spill-item">
                        <div className="spill-header">
                          <h4>{spill.spill_id}</h4>
                          <span className="spill-badge" style={{ backgroundColor: getSeverityColor(spill.severity) }}>
                            {spill.severity}
                          </span>
                        </div>
                        <p><strong>Vessel:</strong> {spill.vessel_name}</p>
                        <p><strong>Location:</strong> {spill.lat.toFixed(2)}°, {spill.lon.toFixed(2)}°</p>
                        <p><strong>Size:</strong> {spill.size_tons} tons</p>
                        <p><strong>Status:</strong> {spill.status}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ship Showcase Section */}
                <div className="ship-showcase">
                  <h3>⚓ Fleet Overview</h3>
                  <div className="ships-grid">
                    {vessels.slice(0, 6).map((vessel) => (
                      <div key={vessel.imo} className="ship-showcase-card">
                        <div className="ship-image-container">
                          <img src={vessel.image} alt={vessel.name} className="ship-showcase-image" />
                          <div className="ship-overlay">
                            <p className="ship-type">{vessel.type}</p>
                          </div>
                        </div>
                        <div className="ship-info">
                          <h4>{vessel.name}</h4>
                          <div className="ship-details">
                            <span className="detail">🚩 {vessel.flag}</span>
                            <span className="detail">⚡ {vessel.speed} knots</span>
                          </div>
                          <div className="ship-rating">
                            <div className="rating-bar-small">
                              <div 
                                className="rating-fill-small"
                                style={{
                                  width: `${vessel.compliance_rating * 10}%`,
                                  backgroundColor: vessel.compliance_rating > 7 ? '#10b981' : vessel.compliance_rating > 5 ? '#f59e0b' : '#ef4444'
                                }}
                              ></div>
                            </div>
                            <span className="rating-label">{vessel.compliance_rating}/10</span>
                          </div>
                          <div className="risk-badge" style={{ backgroundColor: getRiskColor(vessel.risk_level), color: 'white' }}>
                            {vessel.risk_level} Risk
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Map - All roles */}
        {activeTab === 'map' && (
          <div className="map-container">
            <h2>Real-Time Monitoring - India Region</h2>
            <MapContainer center={[11, 77]} zoom={5} className="map">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
              
              {/* Country Boundaries */}
              {Object.entries(countryBoundaries).map(([countryName, geoJson]) => (
                <GeoJSON
                  key={countryName}
                  data={geoJson}
                  style={{
                    color: '#ffffff',
                    weight: 2,
                    opacity: 0.8,
                    fillColor: '#2563eb',
                    fillOpacity: 0.1
                  }}
                />
              ))}

              {/* Vessels with Ship Icons */}
              {vessels.map(vessel => {
                const shipIcon = L.divIcon({
                  html: `<div style="background: linear-gradient(135deg, #2563eb, #764ba2); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);" title="${vessel.name}">⚓</div>`,
                  iconSize: [40, 40],
                  className: 'ship-icon'
                });
                
                return (
                  <Marker
                    key={vessel.imo}
                    position={[vessel.lat, vessel.lon]}
                    icon={shipIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <img src={vessel.image} alt={vessel.name} style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }} />
                        <h4>{vessel.name}</h4>
                        <p><strong>Type:</strong> {vessel.type}</p>
                        <p><strong>Flag:</strong> {vessel.flag}</p>
                        <p><strong>Speed:</strong> {vessel.speed} knots</p>
                        <p><strong>Destination:</strong> {vessel.destination}</p>
                        <p><strong>Rating:</strong> {vessel.compliance_rating}/10</p>
                        <p style={{ color: getRiskColor(vessel.risk_level) }}>
                          <strong>Risk:</strong> {vessel.risk_level}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Vessel Movement Trails */}
              {Object.entries(vesselMovementData).map(([imo, movementData]) => {
                const vessel = vessels.find(v => v.imo === imo);
                if (!vessel || movementData.length < 2) return null;
                
                const trailPositions = movementData.map(point => [point.lat, point.lon]);
                
                return (
                  <Polyline
                    key={`trail-${imo}`}
                    positions={trailPositions}
                    color="#2563eb"
                    weight={2}
                    opacity={0.7}
                    dashArray="5, 10"
                  />
                );
              })}

              {/* Oil Spills */}
              {oilSpills.map(spill => {
                const spillIcon = L.divIcon({
                  html: `<div style="background: ${getSeverityColor(spill.severity)}; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); border: 2px solid white;" title="${spill.spill_id}">🛢️</div>`,
                  iconSize: [36, 36],
                  className: 'oil-spill-icon'
                });

                return (
                  <Marker
                    key={spill.spill_id}
                    position={[spill.lat, spill.lon]}
                    icon={spillIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <img src={spill.image} alt={spill.spill_id} style={{ width: '100%', marginBottom: '12px', borderRadius: '6px', maxHeight: '180px', objectFit: 'cover' }} />
                        <h4 style={{ marginBottom: '8px', color: '#1f2937' }}>🛢️ {spill.spill_id}</h4>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Vessel:</strong> {spill.vessel_name}</p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Severity:</strong> <span style={{ 
                          backgroundColor: getSeverityColor(spill.severity), 
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}>{spill.severity}</span></p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Size:</strong> {spill.size_tons} tons</p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Area:</strong> {spill.estimated_area_km2} km²</p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Status:</strong> {spill.status}</p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Confidence:</strong> {spill.confidence}%</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Oil Spill Progression Trails */}
              {Object.entries(oilSpillProgression).map(([spillId, progressionData]) => {
                const spill = oilSpills.find(s => s.spill_id === spillId);
                if (!spill || progressionData.length < 2) return null;
                
                // Create expanding circles for spill progression
                return progressionData.map((point, index) => (
                  <Circle
                    key={`spill-${spillId}-${index}`}
                    center={[spill.lat, spill.lon]}
                    radius={Math.sqrt(point.area_km2) * 1000} // Convert km² to approximate meters for radius
                    color={getSeverityColor(spill.severity)}
                    fillColor={getSeverityColor(spill.severity)}
                    fillOpacity={0.1 - (index * 0.02)} // Fade older circles
                    weight={1}
                    opacity={0.3}
                  />
                ));
              })}
            </MapContainer>
          </div>
        )}

        {/* Vessels Tab - Operator/Admin only */}
        {activeTab === 'vessels' && userRole !== 'viewer' && (
          <div className="vessels-container">
            <h2>Vessel Details</h2>
            <div className="vessels-grid">
              {vessels.map(vessel => (
                <div key={vessel.imo} className="vessel-card">
                  <img src={vessel.image} alt={vessel.name} className="vessel-image" />
                  
                  <div className="card-header">
                    <h3>{vessel.name}</h3>
                    <div 
                      className="risk-indicator"
                      style={{ backgroundColor: getRiskColor(vessel.risk_level) }}
                    >
                      {vessel.risk_level[0]}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">IMO:</span>
                      <span className="value">{vessel.imo}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">MMSI:</span>
                      <span className="value">{vessel.mmsi}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Type:</span>
                      <span className="value">{vessel.type}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Flag:</span>
                      <span className="value">{vessel.flag}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">DWT:</span>
                      <span className="value">{vessel.dwt}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Destination:</span>
                      <span className="value">{vessel.destination}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">ETA:</span>
                      <span className="value">{vessel.eta}</span>
                    </div>

                    <div className="rating-section">
                      <div className="rating-item">
                        <label>Compliance Rating</label>
                        <div className="rating-bar">
                          <div
                            className="rating-fill"
                            style={{
                              width: `${vessel.compliance_rating * 10}%`,
                              backgroundColor: vessel.compliance_rating > 7 ? '#10b981' : vessel.compliance_rating > 5 ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                        </div>
                        <span className="rating-text">{vessel.compliance_rating}/10</span>
                      </div>
                    </div>

                    <div className="inspection-info">
                      <p><strong>Last Inspection:</strong> {vessel.last_inspection}</p>
                      <p><strong>Violations:</strong> {vessel.violations}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Oil Spills Tab - Operator/Admin only */}
        {activeTab === 'spills' && userRole !== 'viewer' && (
          <div className="spills-container">
            <h2>Oil Spill Incidents</h2>
            <div className="spills-grid">
              {oilSpills.map(spill => (
                <div key={spill.spill_id} className="spill-card">
                  <img src={spill.image} alt={spill.spill_id} className="spill-image" />
                  
                  <div className="card-header">
                    <h3>{spill.spill_id}</h3>
                    <div 
                      className="severity-indicator"
                      style={{ backgroundColor: getSeverityColor(spill.severity) }}
                    >
                      {spill.severity[0]}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Vessel:</span>
                      <span className="value">{spill.vessel_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Location:</span>
                      <span className="value">{spill.lat.toFixed(2)}°, {spill.lon.toFixed(2)}°</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Time:</span>
                      <span className="value">{new Date(spill.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Size:</span>
                      <span className="value">{spill.size_tons} tons</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Area:</span>
                      <span className="value">{spill.estimated_area_km2} km²</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Confidence:</span>
                      <span className="value">{spill.confidence}%</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Status:</span>
                      <span className="value">{spill.status}</span>
                    </div>
                    <p className="description">{spill.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab - Operator/Admin only */}
        {activeTab === 'reports' && userRole !== 'viewer' && (
          <div className="reports-container">
            <h2>Report Generator</h2>
            <div className="reports-grid">
              <div className="report-card">
                <h3>📋 Vessels Report</h3>
                <p>Download comprehensive report of all vessels, their compliance ratings, and risk assessments.</p>
                <button 
                  className="download-btn" 
                  onClick={() => generateReport('vessels')}
                  disabled={reportLoading}
                >
                  {reportLoading ? '⏳ Generating...' : '⬇️ Download PDF'}
                </button>
              </div>

              <div className="report-card">
                <h3>⚠️ Oil Spills Report</h3>
                <p>Download detailed report of all oil spill incidents, locations, and status updates.</p>
                <button 
                  className="download-btn" 
                  onClick={() => generateReport('spills')}
                  disabled={reportLoading}
                >
                  {reportLoading ? '⏳ Generating...' : '⬇️ Download PDF'}
                </button>
              </div>

              <div className="report-card">
                <h3>📊 Comprehensive Report</h3>
                <p>Download complete marine monitoring report with vessels, spills, and all analytics.</p>
                <button 
                  className="download-btn" 
                  onClick={() => generateReport('comprehensive')}
                  disabled={reportLoading}
                >
                  {reportLoading ? '⏳ Generating...' : '⬇️ Download PDF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel - Admin Only */}
        {activeTab === 'admin' && userRole === 'admin' && (
          <div className="admin-panel-container">
            <h2>⚙️ Admin Control Panel</h2>
            
            {adminPanelMessage && (
              <div className={`admin-message ${adminPanelMessage.includes('Error') ? 'error' : 'success'}`}>
                {adminPanelMessage}
              </div>
            )}

            <div className="admin-tabs">
              <div className="admin-section">
                <h3>👥 User Management</h3>
                
                {/* Create New User Form */}
                <div className="user-form-card">
                  <h4>Create New Company User</h4>
                  <form onSubmit={handleCreateUser}>
                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        placeholder="user@company.com"
                        value={newUserData.email}
                        onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Full Name:</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={newUserData.name}
                        onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password:</label>
                      <input
                        type="password"
                        placeholder="Secure password"
                        value={newUserData.password}
                        onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company:</label>
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={newUserData.company}
                        onChange={(e) => setNewUserData({...newUserData, company: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Role:</label>
                      <select
                        value={newUserData.role}
                        onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                      >
                        <option value="operator">Operator</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <button type="submit" className="admin-btn" disabled={adminPanelLoading}>
                      {adminPanelLoading ? 'Creating...' : '✅ Create User'}
                    </button>
                  </form>
                </div>

                {/* Users List */}
                <div className="users-list-card">
                  <div className="list-header">
                    <h4>All System Users</h4>
                    <button className="admin-btn-small" onClick={fetchAllUsers} disabled={adminPanelLoading}>
                      🔄 Refresh
                    </button>
                  </div>
                  
                  {allUsers.length > 0 ? (
                    <div className="users-table">
                      {allUsers.map((user, idx) => (
                        <div key={idx} className="user-row">
                          <div className="user-info">
                            <div className="user-email">{user.email}</div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-company">{user.company}</div>
                            <span className={`role-badge role-${user.role}`}>{user.role}</span>
                          </div>
                          {user.email !== email && (
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDeleteUser(user.email)}
                              disabled={adminPanelLoading}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-message">No users found. Create one above.</p>
                  )}
                </div>
              </div>

              {/* Audit Logs */}
              <div className="admin-section">
                <h3>📋 Audit Logs</h3>
                <div className="audit-logs-card">
                  <div className="list-header">
                    <h4>System Access & Activity Log</h4>
                    <button className="admin-btn-small" onClick={fetchAuditLogs} disabled={adminPanelLoading}>
                      🔄 Refresh
                    </button>
                  </div>
                  
                  {auditLogs.length > 0 ? (
                    <div className="audit-table">
                      {auditLogs.map((log, idx) => (
                        <div key={idx} className="audit-row">
                          <div className="audit-timestamp">{new Date(log.timestamp).toLocaleString()}</div>
                          <div className="audit-user">{log.user_email}</div>
                          <div className="audit-action">
                            <span className={`action-badge action-${log.action}`}>{log.action}</span>
                          </div>
                          <div className="audit-resource">{log.resource}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-message">No audit logs found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Analysis - All Users */}
        {activeTab === 'realtime' && (
          <div className="realtime-analysis-container">
            <h2>📡 Real-Time Marine Monitoring Analysis</h2>
            
            {/* Real-time Status */}
            <div style={{ 
              backgroundColor: connectionStatus === 'connected' ? '#d1fae5' : '#fecaca',
              border: `2px solid ${connectionStatus === 'connected' ? '#10b981' : '#ef4444'}`,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
                animation: 'pulse 2s infinite'
              }}></div>
              <div>
                <strong>{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</strong>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  {connectionStatus === 'connected' ? 'Receiving live updates' : 'Attempting to reconnect...'}
                </p>
              </div>
            </div>

            <div className="realtime-grid">
              {/* Vessels Tracking Section */}
              <div className="realtime-section">
                <h3>⚓ Vessel Locations & Movement</h3>
                <div className="tracking-list">
                  {vessels.map((vessel) => (
                    <div key={vessel.imo} className="tracking-item">
                      <div className="tracking-header">
                        <h4>{vessel.name}</h4>
                        <span className="risk-badge" style={{ backgroundColor: getRiskColor(vessel.risk_level) }}>
                          {vessel.risk_level}
                        </span>
                      </div>
                      <div className="tracking-data">
                        <div className="data-row">
                          <span className="data-label">📍 Location</span>
                          <span className="data-value">{vessel.lat.toFixed(4)}° N, {vessel.lon.toFixed(4)}° E</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">⚡ Speed</span>
                          <span className="data-value">{vessel.speed} knots</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">🧭 Course</span>
                          <span className="data-value">{vessel.course}°</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">🎯 Destination</span>
                          <span className="data-value">{vessel.destination}</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">⭐ Compliance</span>
                          <span className="data-value">{vessel.compliance_rating}/10</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Oil Spills Monitoring Section */}
              <div className="realtime-section">
                <h3>🛢️ Oil Spill Incidents & Status</h3>
                <div className="tracking-list">
                  {oilSpills.length > 0 ? (
                    oilSpills.map((spill) => (
                      <div key={spill.spill_id} className="tracking-item spill-item">
                        <div className="tracking-header">
                          <h4>{spill.spill_id}</h4>
                          <span className="severity-badge" style={{ backgroundColor: getSeverityColor(spill.severity) }}>
                            {spill.severity}
                          </span>
                        </div>
                        <div className="tracking-data">
                          <div className="data-row">
                            <span className="data-label">📍 Location</span>
                            <span className="data-value">{spill.lat.toFixed(4)}° N, {spill.lon.toFixed(4)}° E</span>
                          </div>
                          <div className="data-row">
                            <span className="data-label">🚢 Vessel</span>
                            <span className="data-value">{spill.vessel_name}</span>
                          </div>
                          <div className="data-row">
                            <span className="data-label">📏 Size</span>
                            <span className="data-value">{spill.size_tons} tons</span>
                          </div>
                          <div className="data-row">
                            <span className="data-label">📐 Area</span>
                            <span className="data-value">{spill.estimated_area_km2} km²</span>
                          </div>
                          <div className="data-row">
                            <span className="data-label">🎯 Confidence</span>
                            <span className="data-value">{spill.confidence}%</span>
                          </div>
                          <div className="data-row">
                            <span className="data-label">📊 Status</span>
                            <span className="data-value">{spill.status}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      padding: '24px', 
                      textAlign: 'center', 
                      color: '#10b981',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <p>✓ No oil spill incidents detected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Real-Time Analysis Report */}
            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '16px' }}>📥 Export Real-Time Analysis</h3>
              <button 
                className="download-btn" 
                onClick={() => generateReport('realtime')}
                disabled={reportLoading}
                style={{ width: '100%' }}
              >
                {reportLoading ? '⏳ Generating PDF Report...' : '📄 Download Real-Time Analysis Report'}
              </button>
            </div>
          </div>
        )}

        {/* Map Analysis - Viewer Only */}
        {activeTab === 'mapAnalysis' && userRole === 'viewer' && (
          <div className="map-container">
            <h2>🗺️ Map Analysis - Vessel Locations & Status</h2>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>View real-time vessel locations and maritime activity in the Indian Ocean region. Download vessel images for analysis.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                {vessels.slice(0, 5).map(vessel => (
                  <div key={vessel.imo} style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '15px', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ 
                      backgroundImage: `url('${vessel.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: '120px',
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}></div>
                    <h4 style={{ marginBottom: '5px', color: '#1f2937' }}>{vessel.name}</h4>
                    <p style={{ fontSize: '12px', color: '#666', margin: '3px 0' }}>Type: {vessel.type}</p>
                    <p style={{ fontSize: '12px', color: '#666', margin: '3px 0' }}>Location: {vessel.lat.toFixed(2)}°N, {vessel.lon.toFixed(2)}°E</p>
                    <p style={{ fontSize: '12px', color: '#666', margin: '3px 0' }}>Speed: {vessel.speed} knots</p>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = vessel.image;
                        link.download = `${vessel.name}-vessel-image.jpg`;
                        link.click();
                      }}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'background 0.3s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#1e40af'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                    >
                      📥 Download Image
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Read-only Map for Viewers */}
            <MapContainer center={[11, 77]} zoom={5} className="map" style={{ marginBottom: '20px' }}>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
              {vessels.map(vessel => {
                const shipIcon = L.divIcon({
                  html: `<div style="background: linear-gradient(135deg, #2563eb, #764ba2); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);" title="${vessel.name}">⚓</div>`,
                  iconSize: [40, 40],
                  className: 'ship-icon'
                });
                
                return (
                  <Marker
                    key={vessel.imo}
                    position={[vessel.lat, vessel.lon]}
                    icon={shipIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <img src={vessel.image} alt={vessel.name} style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }} />
                        <h4>{vessel.name}</h4>
                        <p><strong>Type:</strong> {vessel.type}</p>
                        <p><strong>Location:</strong> {vessel.lat.toFixed(2)}°N, {vessel.lon.toFixed(2)}°E</p>
                        <p><strong>Speed:</strong> {vessel.speed} knots</p>
                        <p><strong>Destination:</strong> {vessel.destination}</p>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = vessel.image;
                            link.download = `${vessel.name}-vessel-image.jpg`;
                            link.click();
                          }}
                          style={{
                            width: '100%',
                            marginTop: '10px',
                            padding: '8px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          📥 Download Image
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Oil Spills for Viewers - Read Only */}
              {oilSpills.map(spill => {
                const spillIcon = L.divIcon({
                  html: `<div style="background: ${getSeverityColor(spill.severity)}; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); border: 2px solid white;" title="${spill.spill_id}">🛢️</div>`,
                  iconSize: [36, 36],
                  className: 'oil-spill-icon'
                });

                return (
                  <Marker
                    key={spill.spill_id}
                    position={[spill.lat, spill.lon]}
                    icon={spillIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <img src={spill.image} alt={spill.spill_id} style={{ width: '100%', marginBottom: '12px', borderRadius: '6px', maxHeight: '150px', objectFit: 'cover' }} />
                        <h4 style={{ marginBottom: '8px', color: '#1f2937' }}>🛢️ {spill.spill_id}</h4>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Vessel:</strong> {spill.vessel_name}</p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Severity:</strong> <span style={{ 
                          backgroundColor: getSeverityColor(spill.severity), 
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}>{spill.severity}</span></p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Size:</strong> {spill.size_tons} tons</p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>Area:</strong> {spill.estimated_area_km2} km²</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h3>📊 Vessel Analysis Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                  <p style={{ color: '#666', fontSize: '12px', margin: '0 0 5px 0' }}>Total Vessels Tracked</p>
                  <h3 style={{ color: '#2563eb', margin: '0', fontSize: '24px' }}>{vessels.length}</h3>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <p style={{ color: '#666', fontSize: '12px', margin: '0 0 5px 0' }}>Active Vessels</p>
                  <h3 style={{ color: '#10b981', margin: '0', fontSize: '24px' }}>{vessels.filter(v => v.status === 'Active').length}</h3>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <p style={{ color: '#666', fontSize: '12px', margin: '0 0 5px 0' }}>Average Speed (knots)</p>
                  <h3 style={{ color: '#f59e0b', margin: '0', fontSize: '24px' }}>{(vessels.reduce((sum, v) => sum + v.speed, 0) / vessels.length).toFixed(1)}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <p>&copy; 2025 SeaTrace Maritime Intelligence System. Developed by <strong>Suriya</strong>. All rights reserved.</p>
            <p style={{ fontSize: '12px', color: 'rgba(100,100,100,0.7)', marginTop: '4px' }}>Advanced Ocean Monitoring | Environmental Protection | Real-Time Analytics</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
