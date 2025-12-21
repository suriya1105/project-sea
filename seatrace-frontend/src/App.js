/**
 * SeaTrace - Advanced Marine Intelligence & Real-Time Monitoring System
 * Copyright © 2025 by Suriya. All rights reserved.
 * 
 * Real-time vessel tracking, oil spill detection, and environmental monitoring
 * for maritime operations and ocean conservation.
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, Activity, Globe, Anchor, Shield, Lock, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, GeoJSON, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import './App.css';
import SignUpForm from './components/auth/SignUpForm';
import LoginForm from './components/auth/LoginForm';
import AuthPage from './components/AuthPage';
import UsersPage from './components/UsersPage';
import { API_BASE_URL, SOCKET_URL } from './config';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  // eslint-disable-next-line no-unused-vars
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Auth UI state
  const [showSignUp, setShowSignUp] = useState(false);

  // Real-time movement tracking state
  const [vesselMovementData, setVesselMovementData] = useState({});
  const [oilSpillProgression, setOilSpillProgression] = useState({});
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time movement data updates
  useEffect(() => {
    if (!isLoggedIn || vessels.length === 0) return;

    const updateInterval = setInterval(() => {
      updateMovementData();
    }, 300000); // Update every 5 minutes

    return () => clearInterval(updateInterval);
  }, [isLoggedIn, vessels, oilSpills]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }

  const handleAuthSuccess = (data) => {
    const { token: newToken, user } = data;
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
      await axios.post(
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
      <AuthPage
        onLogin={async (email, password) => {
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            handleAuthSuccess(response.data);
          } catch (error) {
            throw new Error(error.response?.data?.error || 'Login failed');
          }
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="app flex h-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1518544806352-a22c09fb110e?auto=format&fit=crop&q=80')] bg-cover bg-center">
      {/* Cyber Overlay */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-0"></div>
      <div className="grid-overlay"></div>

      {/* Cyber Sidebar */}
      <div className={`cyber-sidebar flex flex-col ${isMobileMenuOpen ? 'w-64' : 'w-20'} transition-all duration-300 relative z-50 h-full border-r border-cyan-500/30`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-cyan-500/20">
          <Zap className={`text-cyan-400 w-8 h-8 ${isMobileMenuOpen ? 'mr-2' : ''} animate-pulse`} />
          {isMobileMenuOpen && <span className="text-xl font-bold font-orbitron text-cyan-400 tracking-widest">SEATRACE</span>}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 flex flex-col gap-2 px-2">
          {[
            { id: 'dashboard', icon: Activity, label: 'Live Ops' },
            { id: 'map', icon: Globe, label: 'Global Map' },
            { id: 'vessels', icon: Anchor, label: 'Vessels' },
            { id: 'spills', icon: Shield, label: 'Hazards' },
            ...(userRole === 'admin' ? [{ id: 'admin', icon: Lock, label: 'Command' }] : [])
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item p-3 rounded-lg flex items-center justify-center md:justify-start gap-4 ${activeTab === item.id ? 'active' : ''}`}
              title={item.label}
            >
              <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]' : ''}`} />
              {isMobileMenuOpen && <span className="font-rajdhani font-semibold tracking-wider text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* User Info & Toggle */}
        <div className="p-4 border-t border-cyan-500/20 flex flex-col items-center gap-4">
          {isMobileMenuOpen && (
            <div className="text-center w-full bg-cyan-900/20 p-2 rounded border border-cyan-500/10">
              <div className="text-cyan-300 font-bold text-sm truncate">{userName}</div>
              <div className="text-xs text-cyan-600 uppercase">{userRole}</div>
            </div>
          )}
          <button onClick={handleLogout} className="p-2 hover:bg-red-500/20 rounded-full transition-colors group">
            <User className="w-5 h-5 text-red-400 group-hover:text-red-200" />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-cyan-900 border border-cyan-500 text-cyan-400 rounded-full p-1 hover:scale-110 transition-transform md:flex hidden"
          >
            {isMobileMenuOpen ? <X size={12} /> : <Menu size={12} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">

        {/* Top Status Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-bold uppercase tracking-widest shadow-cyan-500/50 drop-shadow-sm">
              {activeTab === 'dashboard' ? 'Real-Time Operations' : activeTab.toUpperCase()}
            </h1>
            {activeTab === 'dashboard' && <span className="flex items-center gap-2 text-xs font-mono text-cyan-500/70 border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-900/10"><span className="animate-ping w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> LIVE FEED</span>}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm font-rajdhani text-cyan-300/80">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse box-shadow-[0_0_10px_#22c55e]"></span>
              SYSTEM ONLINE
            </div>
            <div className="text-xs font-mono text-cyan-600 hidden md:block">
              {new Date().toLocaleTimeString()} :: {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative custom-scrollbar">
          {connectionStatus !== 'connected' && (
            <div className="mb-4 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-2 rounded flex items-center gap-2 animate-pulse">
              <Activity className="w-4 h-4" />
              <span>SIGNAL LOST: Reconnecting to satellite uplink...</span>
            </div>
          )}


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
            <div className="space-y-6">
              {/* Stats Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="cyber-panel flex items-center justify-between group hover:border-cyan-400 transition-colors">
                  <div>
                    <div className="text-cyan-500/70 text-sm font-bold tracking-wider mb-1">TOTAL VESSELS</div>
                    <div className="text-4xl font-rajdhani font-bold text-white group-hover:text-cyan-400 transition-colors">{vessels.length}</div>
                  </div>
                  <Anchor className="w-10 h-10 text-cyan-500/20 group-hover:text-cyan-400/50 transition-colors" />
                </div>

                <div className="cyber-panel flex items-center justify-between group hover:border-red-400 transition-colors">
                  <div>
                    <div className="text-red-500/70 text-sm font-bold tracking-wider mb-1">ACTIVE ALERTS</div>
                    <div className="text-4xl font-rajdhani font-bold text-white group-hover:text-red-400 transition-colors">{oilSpills.length}</div>
                  </div>
                  <Shield className="w-10 h-10 text-red-500/20 group-hover:text-red-400/50 transition-colors" />
                </div>

                <div className="cyber-panel flex items-center justify-between group hover:border-green-400 transition-colors">
                  <div>
                    <div className="text-green-500/70 text-sm font-bold tracking-wider mb-1">SYSTEM STATUS</div>
                    <div className="text-2xl font-rajdhani font-bold text-green-400">OPERATIONAL</div>
                  </div>
                  <Activity className="w-10 h-10 text-green-500/20 group-hover:text-green-400/50 transition-colors" />
                </div>

                <div className="cyber-panel flex items-center justify-between group hover:border-purple-400 transition-colors">
                  <div>
                    <div className="text-purple-500/70 text-sm font-bold tracking-wider mb-1">OCEAN TEMP</div>
                    <div className="text-4xl font-rajdhani font-bold text-white">{weatherData?.temp_c || '27.5'}°C</div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-purple-500/30 flex items-center justify-center animate-spin-slow">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Satellite Map Preview */}
                <div className="lg:col-span-2 h-[400px] cyber-panel p-0 relative group">
                  <div className="absolute top-4 left-4 z-[400] bg-slate-900/80 border border-cyan-500/30 px-3 py-1 rounded text-xs text-cyan-400 font-mono">
                    LIVE SATELLITE TRACKING PREVIEW
                  </div>
                  <MapContainer center={[20, 80]} zoom={4} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} doubleClickZoom={false} scrollWheelZoom={false} className="z-0 bg-slate-900">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <div className="absolute inset-0 z-[300] bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>
                    {vessels.slice(0, 10).map(v => <Circle key={v.imo} center={[v.lat, v.lon]} radius={30000} pathOptions={{ color: '#00f3ff', fillColor: '#00f3ff', fillOpacity: 0.6 }} />)}
                  </MapContainer>
                  <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none group-hover:bg-transparent transition-colors z-[400]"></div>
                  <button onClick={() => setActiveTab('map')} className="absolute bottom-4 right-4 z-[500] cyber-btn text-xs py-2 px-4 bg-slate-900/80">EXPAND MAP</button>
                </div>

                {/* Fleet Status List */}
                <div className="cyber-panel overflow-hidden flex flex-col">
                  <h3 className="text-cyan-400 font-orbitron mb-4 flex items-center gap-2 text-sm border-b border-cyan-500/30 pb-2">
                    <Activity className="w-4 h-4" /> RECENT ACTIVITY
                  </h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className="p-3 bg-slate-900/50 border border-cyan-500/10 rounded">
                        <div className="text-xs text-cyan-500 font-mono mb-1">{new Date(n.timestamp).toLocaleTimeString()}</div>
                        <div className="text-sm text-gray-300 font-bold">{n.title}</div>
                        <div className="text-xs text-gray-500">{n.message}</div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-500 py-10 italic">No recent alerts</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Graphs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="cyber-panel">
                  <h3 className="text-cyan-400 font-orbitron mb-4 text-sm">REAL-TIME SPEED ANALYSIS</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={Object.values(vesselMovementData)[0] || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 243, 255, 0.1)" />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#4b5563" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f3ff', color: '#fff' }} />
                        <Line type="monotone" dataKey="speed" stroke="#00f3ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00f3ff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="cyber-panel">
                  <h3 className="text-cyan-400 font-orbitron mb-4 text-sm">FLEET COMPLIANCE</h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'High Risk', value: vessels.filter(v => v.risk_level === 'High').length, fill: '#ef4444' },
                            { name: 'Medium', value: vessels.filter(v => v.risk_level === 'Medium').length, fill: '#f59e0b' },
                            { name: 'Low Risk', value: vessels.filter(v => v.risk_level === 'Low').length, fill: '#10b981' }
                          ]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#ef4444" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#10b981" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f3ff', color: '#fff' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Map - All roles */}
          {activeTab === 'map' && (
            <div className="flex-1 flex flex-col h-full cyber-panel p-0 overflow-hidden relative" style={{ minHeight: '80vh' }}>
              <div className="absolute inset-0 z-0 map-radar-overlay"></div>

              {/* Map Controls Overlay */}
              <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 p-2 rounded text-cyan-400 text-xs font-mono">
                  <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> LIVE SAT FEED</div>
                  <div>LAT: {vessels[0]?.lat.toFixed(4) || '00.000'} | LON: {vessels[0]?.lon.toFixed(4) || '00.000'}</div>
                </div>
              </div>

              <MapContainer center={[20, 80]} zoom={5} style={{ height: '100%', width: '100%' }} className="z-0 bg-slate-900">
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Deep Ocean (Dark)">
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satellite Mode">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                {/* GeoJSON Boundaries */}
                {Object.values(countryBoundaries).map((country, index) => (
                  <GeoJSON
                    key={index}
                    data={country}
                    style={{
                      color: '#00f3ff',
                      weight: 1,
                      fillColor: '#00f3ff',
                      fillOpacity: 0.05,
                      dashArray: '5, 5'
                    }}
                  />
                ))}

                {/* Vessels */}
                {vessels.map(vessel => (
                  <div key={vessel.imo}>
                    <Marker position={[vessel.lat, vessel.lon]}>
                      <Popup className="cyber-popup">
                        <div className="p-2 bg-slate-900 text-cyan-400 border border-cyan-500/50 rounded text-xs font-mono">
                          <strong className="text-sm block mb-1 border-b border-cyan-500/30 pb-1">{vessel.name}</strong>
                          <div>IMO: {vessel.imo}</div>
                          <div>Type: {vessel.type}</div>
                          <div>Speed: {vessel.speed} kts</div>
                          <div className="text-green-400 mt-1">STATUS: ACTIVE</div>
                        </div>
                      </Popup>
                    </Marker>
                    {/* Vessel Trail */}
                    {vesselMovementData[vessel.imo] && (
                      <Polyline
                        positions={vesselMovementData[vessel.imo].map(d => [d.lat, d.lon])}
                        pathOptions={{ color: '#00f3ff', weight: 1, opacity: 0.4 }}
                      />
                    )}
                  </div>
                ))}

                {/* Oil Spills */}
                {oilSpills.map(spill => (
                  <div key={spill.spill_id}>
                    <Circle
                      center={[spill.lat, spill.lon]}
                      radius={spill.radius * 2 || 5000}
                      pathOptions={{
                        color: '#ef4444',
                        fillColor: '#ef4444',
                        fillOpacity: 0.3,
                        className: 'animate-pulse'
                      }}
                    >
                      <Popup>
                        <div className="p-2 bg-red-900/90 text-red-100 border border-red-500 rounded text-xs font-mono">
                          <strong className="text-sm block mb-1">⚠️ SPILL DETECTED</strong>
                          <div>ID: {spill.spill_id}</div>
                          <div>Severtiy: {spill.severity}</div>
                          <div>Area: {spill.estimated_area_km2} km²</div>
                        </div>
                      </Popup>
                    </Circle>
                  </div>
                ))}
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

          {/* Users Page - Admin Only */}
          {activeTab === 'users' && userRole === 'admin' && (
            <UsersPage />
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
                          onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Full Name:</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={newUserData.name}
                          onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Password:</label>
                        <input
                          type="password"
                          placeholder="Secure password"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Company:</label>
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={newUserData.company}
                          onChange={(e) => setNewUserData({ ...newUserData, company: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Role:</label>
                        <select
                          value={newUserData.role}
                          onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
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
              <MapContainer center={[20, 78]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                  </LayersControl.BaseLayer>

                  <LayersControl.BaseLayer name="Satellite (Esri)">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                  </LayersControl.BaseLayer>

                  <LayersControl.BaseLayer name="Dark Matter">
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
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
        </main>
      </div >
    </div >
  );
}

export default App;
