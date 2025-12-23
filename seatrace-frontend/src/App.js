/**
 * SeaTrace - Advanced Marine Intelligence & Real-Time Monitoring System
 * Copyright © 2025 by Suriya. All rights reserved.
 * 
 * Real-time vessel tracking, oil spill detection, and environmental monitoring
 * for maritime operations and ocean conservation.
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, Activity, Globe, Anchor, Shield, Lock, User, CheckCircle, Trash2, FileText, AlertTriangle, Download, Clipboard, Loader, UserPlus, Users } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, GeoJSON, Polyline } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import './App.css';
import 'leaflet/dist/leaflet.css';

// Trigger redeploy for build fix

import AuthPage from './components/AuthPage';
import VesselsPage from './components/VesselsPage';
import UsersPage from './components/UsersPage';
import AnalyticsPanel from './components/AnalyticsPanel';
import AIAnalysisPanel from './components/AIAnalysisPanel'; // Keep this import for now, as it's used in the new AnalyticsPanel
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
  console.log("SeaTrace API Target:", API_BASE_URL); // Debug connection
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

  // Real-time movement tracking state
  const [vesselMovementData, setVesselMovementData] = useState({});

  // AI Simulation Mode State
  const [predictionData, setPredictionData] = useState(null);
  const [predictionStats, setPredictionStats] = useState(null); // Stores costs/area
  const [simParams, setSimParams] = useState({
    wind_speed: 15,
    wind_direction: 45,
    current_speed: 2,
    current_direction: 90,
    hours: 24
  });
  const [selectedSpillId, setSelectedSpillId] = useState(null);

  const runSimulation = async (spillId) => {
    if (!spillId) return;
    setSelectedSpillId(spillId);

    try {
      const response = await axios.post(`${API_BASE_URL}/simulate/predict`, {
        spill_id: spillId,
        ...simParams
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPredictionData(response.data.prediction);
      setPredictionStats(response.data);
      // Show success toast or notification here
    } catch (error) {
      console.error("Simulation failed:", error);
    }
  };

  const [notifications, setNotifications] = useState([]);


  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = React.useRef(null);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    const newMessages = [...chatMessages, { text, isUser: true }];
    setChatMessages(newMessages);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, { message: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages([...newMessages, { text: response.data.response, isUser: false }]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      const statuses = { 404: "AI Service Offline (Backend not updated)", 401: "Authorization Failed", 500: "Internal System Error" };
      const msg = statuses[err.response?.status] || "Error connecting to AI Command.";
      setChatMessages([...newMessages, { text: `⚠️ ${msg}`, isUser: false }]);
    }
  };

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
    }, 10000); // Update every 10 seconds for real-time effect

    // Initial update
    updateMovementData();

    return () => clearInterval(updateInterval);
  }, [isLoggedIn, vessels]); // Removed oilSpills dependency to prevent constant resetting

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


  // Update movement data for all vessels
  const updateMovementData = () => {
    const newMovementData = {};
    vessels.forEach(vessel => {
      newMovementData[vessel.imo] = generateVesselMovementData(vessel);
    });
    setVesselMovementData(newMovementData);



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
      playAlertSound(); // Play sound on new alert
    }
  };

};

const playAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
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
          console.error("Login Handler Error:", error);
          // If we have a backend error message, use it. Otherwise use the error message (e.g. 'Network Error')
          const message = error.response?.data?.error || error.message || 'Login failed';
          throw new Error(message);
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
    <div className={`cyber-sidebar flex flex-col ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-20'} md:relative fixed inset-y-0 left-0 transition-all duration-300 z-50 h-full border-r border-cyan-500/30 bg-slate-900/95 md:bg-transparent`}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-cyan-500/20">
        <Zap className={`text-cyan-400 w-8 h-8 ${isMobileMenuOpen ? 'mr-2' : ''} animate-pulse`} />
        {isMobileMenuOpen && <span className="text-xl font-bold font-orbitron text-cyan-400 tracking-widest">SEATRACE</span>}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6 flex flex-col gap-2 px-2">
        {[
          { id: 'dashboard', icon: Activity, label: 'Live Ops' },
          { id: 'analytics', icon: BarChart2, label: 'AI Analytics' },
          { id: 'map', icon: Globe, label: 'Global Map' },
          { id: 'vessels', icon: Anchor, label: 'Vessels' },
          { id: 'spills', icon: Shield, label: 'Hazards' },
          { id: 'reports', icon: FileText, label: 'Reports' },
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
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-cyan-900 border border-cyan-500 text-cyan-400 rounded-full p-1 hover:scale-110 transition-transform hidden md:flex"
          title="Toggle Sidebar"
        >
          {isMobileMenuOpen ? <X size={12} /> : <Menu size={12} />}
        </button>
      </div>
    </div>

    {/* Mobile Sidebar Overlay */}
    {isMobileMenuOpen && (
      <div
        className="fixed inset-0 bg-slate-900/80 z-40 md:hidden"
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
    )}

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col relative z-10 overflow-hidden">

      {/* Top Status Bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-cyan-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-bold uppercase tracking-widest shadow-cyan-500/50 drop-shadow-sm">
            {activeTab === 'dashboard' ? 'Real-Time Operations' : activeTab.toUpperCase()}
          </h1>
          {activeTab === 'dashboard' && <span className="hidden md:flex items-center gap-2 text-xs font-mono text-cyan-500/70 border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-900/10"><span className="animate-ping w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> LIVE FEED</span>}
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

      {/* Scrollable Content - Reduced Padding for Mobile */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 relative custom-scrollbar">
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

            {/* NEW: Live Fleet Status Table */}
            <div className="cyber-panel overflow-hidden">
              <h3 className="text-cyan-400 font-orbitron mb-4 flex items-center gap-2 text-sm border-b border-cyan-500/30 pb-2">
                <Activity className="w-4 h-4" /> LIVE FLEET TELEMETRY
              </h3>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/50 text-cyan-500 uppercase">
                    <tr>
                      <th className="p-2">Timestamp</th>
                      <th className="p-2">Vessel Name</th>
                      <th className="p-2">Coordinates (Lat / Lon)</th>
                      <th className="p-2">Speed</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {vessels.slice(0, 5).map(v => (
                      <tr key={v.imo} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-2 text-slate-400 whitespace-nowrap">{new Date().toLocaleTimeString()}</td>
                        <td className="p-2 font-bold text-white">{v.name}</td>
                        <td className="p-2 text-cyan-300">
                          {v.lat.toFixed(4)}° / {v.lon.toFixed(4)}°
                        </td>
                        <td className="p-2 text-yellow-400">{v.speed.toFixed(1)} kts</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${v.status === 'Active' ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-slate-700 text-slate-400'
                            }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Graphs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="cyber-panel">
                <h3 className="text-cyan-400 font-orbitron mb-4 text-sm">REAL-TIME SPEED ANALYSIS</h3>
                <div className="h-64" style={{ minHeight: '250px' }}>
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
                <div className="h-64 flex items-center justify-center" style={{ minHeight: '250px' }}>
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

        {/* AI Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel token={token} userRole={userRole} />
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

              {/* Vessels with Unique Directional Icons */}
              {vessels.map(vessel => {
                // Custom Icon Logic
                const getIconColor = (type) => {
                  if (type.includes('Tanker')) return '#ef4444'; // Red
                  if (type.includes('Container')) return '#06b6d4'; // Cyan
                  if (type.includes('Fishing')) return '#22c55e'; // Green
                  return '#f59e0b'; // Amber default
                };

                const color = getIconColor(vessel.type);

                const customIcon = L.divIcon({
                  className: 'custom-vessel-icon',
                  html: `
                      <div style="transform: rotate(${vessel.course}deg); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1" width="24" height="24" style="filter: drop-shadow(0 0 4px ${color});">
                          ${vessel.type.includes('Tanker')
                      ? '<path d="M12 2L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V8L12 2Z" />' // Hull shape
                      : vessel.type.includes('Container')
                        ? '<path d="M4 6H20V20H4V6ZM12 2L20 6H4L12 2Z" />' // Boxy shape
                        : '<path d="M12 2L2 22L12 18L22 22L12 2Z" />' // Arrow shape
                    }
                        </svg>
                      </div>
                    `,
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                });

                return (
                  <div key={vessel.imo}>
                    <Marker position={[vessel.lat, vessel.lon]} icon={customIcon}>
                      <Popup className="cyber-popup">
                        <div className="p-2 bg-slate-900 text-cyan-400 border border-cyan-500/50 rounded text-xs font-mono">
                          <strong className="text-sm block mb-1 border-b border-cyan-500/30 pb-1">{vessel.name}</strong>
                          <div>TYPE: {vessel.type}</div>
                          <div>COURSE: {vessel.course.toFixed(0)}°</div>
                          <div>SPEED: {vessel.speed} kts</div>
                          <div className={`mt-1 font-bold ${vessel.risk_level === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                            RISK: {vessel.risk_level}
                          </div>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Vessel Historic Track (Breadcrumbs) */}
                    {vessel.history && vessel.history.length > 2 && (
                      <Polyline
                        positions={vessel.history.map(h => [h.lat, h.lon])}
                        pathOptions={{ color: color, weight: 2, opacity: 0.3, dashArray: '5, 10' }}
                      >
                        <Popup>Track History: {vessel.name}</Popup>
                      </Polyline>
                    )}
                  </div>
                );
              })}

              {/* Oil Spills */}
              {oilSpills.map(spill => (
                <div key={spill.spill_id}>
                  <Circle
                    center={[spill.lat, spill.lon]}
                    radius={(spill.size_tons || 100) * 50}// approximate radius from tons
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
                        <div>Size: {spill.size_tons}t</div>
                        {spill.vessel_name && (
                          <div className="mt-2 pt-2 border-t border-red-500/50 text-yellow-300 animate-pulse">
                            SOURCE CONFIRMED: <br />{spill.vessel_name}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Circle>

                  {/* Source Identification Link Line */}
                  {spill.vessel_name && vessels.find(v => v.name === spill.vessel_name) && (
                    <Polyline
                      positions={[
                        [spill.lat, spill.lon],
                        [vessels.find(v => v.name === spill.vessel_name).lat, vessels.find(v => v.name === spill.vessel_name).lon]
                      ]}
                      pathOptions={{ color: '#ef4444', weight: 2, dashArray: '10, 10', className: 'animate-pulse' }}
                    />
                  )}
                </div>
              ))}

              {/* Prediction Layer (AI Simulation) */}
              {predictionData && predictionData.map((point, i) => (
                <Circle
                  key={i}
                  center={[point.lat, point.lon]}
                  radius={point.radius * 111000} // deg to meters
                  pathOptions={{
                    color: '#a855f7', // Purple
                    fillColor: '#a855f7',
                    fillOpacity: 0.1 + (i / 24) * 0.2, // Fade in
                    weight: 1
                  }}
                />
              ))}
            </MapContainer>

            {/* Simulation Control Panel Overlay */}
            {activeTab === 'map' && (
              <div className="absolute bottom-4 left-4 z-[500] cyber-panel w-72 bg-slate-900/90 backdrop-blur">
                <h3 className="text-cyan-400 font-orbitron text-sm mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> AI SIMULATION MODE
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Wind Speed: {simParams?.wind_speed || 10} kts</label>
                    <input
                      type="range" min="0" max="50"
                      value={simParams?.wind_speed || 10}
                      onChange={(e) => {
                        setSimParams({ ...simParams, wind_speed: e.target.value });
                        if (selectedSpillId) runSimulation(selectedSpillId);
                      }}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Current Dir: {simParams?.current_direction || 90}°</label>
                    <input
                      type="range" min="0" max="360"
                      value={simParams?.current_direction || 90}
                      onChange={(e) => {
                        setSimParams({ ...simParams, current_direction: e.target.value });
                        if (selectedSpillId) runSimulation(selectedSpillId);
                      }}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <button
                    onClick={() => runSimulation(oilSpills[0]?.spill_id)}
                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded uppercase transition-colors"
                  >
                    {predictionData ? 'Update Prediction' : 'Run Scenario'}
                  </button>

                  {predictionStats && predictionStats.economic_impact && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50">
                      <h4 className="text-xs text-slate-400 font-bold mb-2">ECONOMIC IMPACT ESTIMATE</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-800/80 p-1.5 rounded border border-red-500/30">
                          <span className="block text-slate-500 text-[10px]">TOTAL LOSS</span>
                          <span className="text-red-400 font-mono font-bold">
                            ${(predictionStats.economic_impact.total_estimated_cost / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div className="bg-slate-800/80 p-1.5 rounded border border-cyan-500/30">
                          <span className="block text-slate-500 text-[10px]">CLEANUP</span>
                          <span className="text-cyan-400 font-mono font-bold">
                            ${(predictionStats.economic_impact.cleanup_cost / 1000000).toFixed(2)}M
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 italic text-center">
                        *Based on {predictionStats.final_area_km2.toFixed(1)} km² spread
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {
          activeTab === 'vessels' && (
            <VesselsPage vessels={vessels} />
          )
        }

        {/* Oil Spills Tab - Operator/Admin only */}
        {
          activeTab === 'spills' && userRole !== 'viewer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-500" />
                  INCIDENT RESPONSE LOG
                </h2>
                <div className="text-sm text-red-400/70 font-mono border border-red-500/30 px-3 py-1 rounded bg-slate-900/50">
                  ACTIVE HAZARDS: {oilSpills.length}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {oilSpills.map(spill => (
                  <div key={spill.spill_id} className="cyber-panel p-0 overflow-hidden group hover:border-red-500/50 transition-all duration-300">
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                      <img
                        src={spill.image || 'https://images.unsplash.com/photo-1628126233061-0b445853b02c?auto=format&fit=crop&q=80'}
                        alt={spill.spill_id}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1628126233061-0b445853b02c?auto=format&fit=crop&q=80' }}
                      />
                      <div className="absolute top-3 right-3 z-20">
                        <span className="px-3 py-1 rounded bg-slate-900/80 backdrop-blur border border-red-500/50 text-red-400 text-xs font-bold font-mono">
                          CONFIDENCE: {spill.confidence}%
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4 z-20">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${spill.severity === 'High' ? 'bg-red-600/80 text-white' :
                            spill.severity === 'Medium' ? 'bg-orange-500/80 text-white' :
                              'bg-yellow-500/80 text-white'
                            }`}>
                            {spill.severity} SEVERITY
                          </span>
                          <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-600">ID: {spill.spill_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4 bg-slate-900/40">
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                        <div className="col-span-2 border-b border-slate-700/50 pb-2 mb-1">
                          <span className="text-slate-500 text-xs uppercase block">Related Vessel</span>
                          <div className="text-white font-bold font-orbitron text-lg flex items-center gap-2">
                            <Anchor className="w-4 h-4 text-cyan-500" /> {spill.vessel_name}
                          </div>
                        </div>

                        <div className="col-span-1">
                          <span className="text-slate-500 text-xs uppercase block mb-0.5">Spill Size</span>
                          <span className="text-slate-300 font-medium">{spill.size_tons} tons</span>
                        </div>
                        <div className="col-span-1">
                          <span className="text-slate-500 text-xs uppercase block mb-0.5">Affected Area</span>
                          <span className="text-slate-300 font-medium">{spill.estimated_area_km2} km²</span>
                        </div>
                        <div className="col-span-1">
                          <span className="text-slate-500 text-xs uppercase block mb-0.5">Location</span>
                          <span className="text-cyan-400 font-mono text-xs">{spill.lat.toFixed(3)}°N, {spill.lon.toFixed(3)}°E</span>
                        </div>
                        <div className="col-span-1">
                          <span className="text-slate-500 text-xs uppercase block mb-0.5">Status</span>
                          <span className="text-slate-300 font-medium capitalize">{spill.status}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 text-xs uppercase block mb-0.5">Reported Time</span>
                          <span className="text-slate-400 text-xs font-mono">{spill.timestamp ? new Date(spill.timestamp).toLocaleString() : 'Timestamp unavailable'}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-700/50">
                        <button className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/60 text-red-400 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 group-hover:animate-pulse">
                          <Shield className="w-4 h-4" /> Initiate Cleanup Protocol
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* Reports Tab - Available to All Roles */}
        {
          activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-500" />
                  MISSION REPORTS GENERATOR
                </h2>
                <div className="text-sm text-cyan-400/70 font-mono border border-cyan-500/30 px-3 py-1 rounded bg-slate-900/50">
                  SECURE ARCHIVE ACCESS
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vessels Report Card */}
                <div className="cyber-panel group hover:border-cyan-400/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Anchor className="w-32 h-32 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 z-10">
                    <span className="bg-cyan-900/30 p-1.5 rounded text-cyan-400"><Clipboard className="w-5 h-5" /></span>
                    FLEET REGISTRY
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 flex-1 z-10">
                    Generate comprehensive manifest of all active vessels, including compliance ratings, risk assessments, and current operational status.
                  </p>
                  <button
                    className="w-full py-3 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] z-10"
                    onClick={() => generateReport('vessels')}
                    disabled={reportLoading}
                  >
                    {reportLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {reportLoading ? 'COMPILING DATA...' : 'EXPORT DOSSIER (PDF)'}
                  </button>
                </div>

                {/* Oil Spills Report Card */}
                <div className="cyber-panel group hover:border-red-500/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-32 h-32 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 z-10">
                    <span className="bg-red-900/30 p-1.5 rounded text-red-400"><AlertTriangle className="w-5 h-5" /></span>
                    INCIDENT LOGS
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 flex-1 z-10">
                    Retrieve detailed analysis of environmental hazards, oil spill tracking data, severity classifications, and cleanup protocol status.
                  </p>
                  <button
                    className="w-full py-3 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 hover:border-red-400 text-red-400 font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(248,113,113,0.2)] z-10"
                    onClick={() => generateReport('spills')}
                    disabled={reportLoading}
                  >
                    {reportLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {reportLoading ? 'COMPILING DATA...' : 'EXPORT INCIDENT REPORT (PDF)'}
                  </button>
                </div>

                {/* Comprehensive Report Card */}
                <div className="cyber-panel group hover:border-purple-500/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity className="w-32 h-32 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 z-10">
                    <span className="bg-purple-900/30 p-1.5 rounded text-purple-400"><FileText className="w-5 h-5" /></span>
                    FULL DISPOSAL
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 flex-1 z-10">
                    Complete strategic overview combining fleet telemetry, environmental hazards, and system analytics into a single command viewing document.
                  </p>
                  <button
                    className="w-full py-3 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 hover:border-purple-400 text-purple-400 font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(192,132,252,0.2)] z-10"
                    onClick={() => generateReport('comprehensive')}
                    disabled={reportLoading}
                  >
                    {reportLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {reportLoading ? 'COMPILING DATA...' : 'EXPORT FULL BRIEF (PDF)'}
                  </button>
                </div>
              </div>

              {/* Recent Generated Reports (Placeholder / Visual Filler) */}
              <div className="cyber-panel opacity-60 pointer-events-none">
                <h3 className="text-slate-500 font-bold mb-2 text-xs uppercase tracking-wider">ARCHIVED TRANSMISSIONS (ENCRYPTED)</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-2 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="text-xs text-slate-500 font-mono">SEATRACE_LOG_{20250000 + i}.enc</span>
                      </div>
                      <div className="text-[10px] text-slate-600">ARCHIVED</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        {/* Users Page - Admin Only */}
        {
          activeTab === 'users' && userRole === 'admin' && (
            <UsersPage />
          )
        }

        {/* Admin Panel - Admin Only */}
        {
          activeTab === 'admin' && userRole === 'admin' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-500" />
                  COMMAND CENTER STATUS: <span className="text-green-400">ONLINE</span>
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cyan-500/70 border border-cyan-500/20 px-2 py-1 rounded">SECURE CONNECTION</span>
                  {adminPanelMessage && (
                    <div className={`px-4 py-2 rounded border text-xs font-bold ${adminPanelMessage.includes('Error') ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-green-500/10 border-green-500 text-green-400'}`}>
                      {adminPanelMessage}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* User Access Management (Left Col) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Create User Panel */}
                  <div className="cyber-panel p-6 border-l-4 border-l-cyan-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <UserPlus className="w-24 h-24 text-cyan-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                      <UserPlus className="w-5 h-5 text-cyan-400" /> PROVISION NEW CREDENTIALS
                    </h3>

                    <form onSubmit={handleCreateUser} className="space-y-4 relative z-10">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-cyan-400 uppercase font-mono">Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Captain Sarah Lance"
                            value={newUserData.name}
                            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-600 transition-all hover:border-slate-500"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-cyan-400 uppercase font-mono">Email Identifier</label>
                          <input
                            type="email"
                            placeholder="user@seatrace.mil"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-600 transition-all hover:border-slate-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-cyan-400 uppercase font-mono">Access Key (Password)</label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-600 transition-all hover:border-slate-500"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-cyan-400 uppercase font-mono">Affiliation</label>
                          <input
                            type="text"
                            placeholder="e.g. Naval Command"
                            value={newUserData.company}
                            onChange={(e) => setNewUserData({ ...newUserData, company: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-600 transition-all hover:border-slate-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-1">
                          <label className="text-xs text-cyan-400 uppercase font-mono">Clearance Level</label>
                          <select
                            value={newUserData.role}
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 cursor-pointer hover:border-slate-500"
                          >
                            <option value="operator">Operator (Standard)</option>
                            <option value="viewer">Viewer (Read Only)</option>
                            <option value="admin">Administrator (Full)</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={adminPanelLoading}
                          className="w-full h-[42px] text-white bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 font-bold rounded text-sm px-5 transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          {adminPanelLoading ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Grant Access</>}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Users List */}
                  <div className="cyber-panel p-0 overflow-hidden flex flex-col h-[400px]">
                    <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center backdrop-blur">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" /> Active Personnel Registry
                      </h3>
                      <button
                        onClick={fetchAllUsers}
                        className="text-cyan-400 hover:text-white text-xs font-mono bg-cyan-900/30 hover:bg-cyan-800/50 px-3 py-1 rounded transition-all border border-cyan-500/20"
                        disabled={adminPanelLoading}
                      >
                        SYNCHRONIZE DB 🔄
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 sticky top-0 backdrop-blur z-10">
                          <tr>
                            <th className="px-6 py-3 font-mono">Personnel</th>
                            <th className="px-6 py-3 font-mono">Role</th>
                            <th className="px-6 py-3 font-mono text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {allUsers.map((user, idx) => (
                            <tr key={idx} className="bg-transparent hover:bg-slate-800/40 transition-colors group">
                              <td className="px-6 py-3">
                                <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{user.name}</div>
                                <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                                <div className="text-[10px] text-slate-600 uppercase tracking-wide">{user.company}</div>
                              </td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' :
                                  user.role === 'operator' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' :
                                    'bg-green-900/20 text-green-400 border-green-500/30'
                                  }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                {user.email !== email && (
                                  <button
                                    onClick={() => handleDeleteUser(user.email)}
                                    disabled={adminPanelLoading}
                                    className="text-red-500/70 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded transition-all"
                                    title="Revoke Access"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {allUsers.length === 0 && (
                            <tr>
                              <td colSpan="3" className="px-6 py-8 text-center text-slate-500 italic">No personnel records found in secure database.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Audit Logs (Right Col) */}
                <div className="lg:col-span-5 h-full">
                  <div className="cyber-panel flex flex-col h-full border-t-4 border-t-yellow-500/50">
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-800/50">
                      <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2 uppercase tracking-wider">
                        <Activity className="w-4 h-4" /> System Audit Stream
                      </h3>
                      <button
                        onClick={fetchAuditLogs}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        <span className="animate-pulse">●</span> LIVE
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-black/20 font-mono text-xs">
                      {auditLogs.length > 0 ? (
                        auditLogs.map((log, idx) => (
                          <div key={idx} className="p-2.5 rounded border-l-2 border-slate-700 bg-slate-900/40 hover:bg-slate-800 hover:border-cyan-500 transition-all group">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                              <span className={`font-bold px-1.5 rounded ${log.action.includes('DELETE') || log.action.includes('FAIL') ? 'bg-red-900/30 text-red-500' :
                                log.action.includes('CREATE') || log.action.includes('REGISTER') ? 'bg-green-900/30 text-green-500' :
                                  'bg-blue-900/30 text-blue-400'
                                }`}>{log.action}</span>
                            </div>
                            <div className="text-slate-300 group-hover:text-white transition-colors">{log.user_email}</div>
                            <div className="text-slate-600 truncate mt-0.5">{log.resource}</div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                          <FileText className="w-12 h-12 mb-2" />
                          <p>NO AUDIT TRAIL DATA</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        }

        {/* Real-Time Analysis - All Users */}
        {
          activeTab === 'realtime' && (
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
          )
        }

        {/* Map - All roles */}
        {
          activeTab === 'map' && (
            <div className="flex-1 flex flex-col h-full cyber-panel p-0 overflow-hidden relative" style={{ height: 'calc(100vh - 100px)' }}>
              <div className="absolute inset-0 z-0 map-radar-overlay"></div>

              {/* Map Controls Overlay */}
              <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 p-2 rounded text-cyan-400 text-xs font-mono">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    MEDITERRANEAN MONITOR
                  </div>
                  <div>LAT: 34.0000 | LON: 18.0000</div>
                </div>
              </div>

              {/* Mediterranean Heatmap Map */}
              <MapContainer
                center={[34.0, 18.0]}
                zoom={6}
                style={{ height: '100%', width: '100%', minHeight: '600px' }}
                className="z-0 bg-slate-900"
                key={activeTab} // Force re-render on tab switch
              >
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
                      attribution='Tiles &copy; Esri &mdash; Source: Esri'
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                {/* Heatmap Simulation (Mediterranean Density) */}
                {/* Blue Base (Low Density) */}
                <Circle center={[34.5, 18.5]} radius={400000} pathOptions={{ color: 'transparent', fillColor: '#0000FF', fillOpacity: 0.2 }} />
                <Circle center={[36.0, 15.0]} radius={350000} pathOptions={{ color: 'transparent', fillColor: '#0000FF', fillOpacity: 0.2 }} />

                {/* Cyan/Green (Medium Density) */}
                <Circle center={[34.5, 19.0]} radius={200000} pathOptions={{ color: 'transparent', fillColor: '#00FFFF', fillOpacity: 0.3 }} />
                <Circle center={[35.5, 16.0]} radius={180000} pathOptions={{ color: 'transparent', fillColor: '#00FF00', fillOpacity: 0.3 }} />

                {/* Yellow (High Density) */}
                <Circle center={[34.8, 19.5]} radius={100000} pathOptions={{ color: 'transparent', fillColor: '#FFFF00', fillOpacity: 0.4 }} />

                {/* Red (Critical Density - Simulated Hotspots) */}
                {[
                  [34.8, 19.5], [35.2, 16.5], [33.5, 20.0], [36.0, 14.5], [34.0, 18.0],
                  [35.8, 15.2], [33.2, 21.5], [34.5, 17.5], [35.0, 19.0], [33.8, 18.5]
                ].map((pos, i) => (
                  <Circle key={i} center={pos} radius={30000} pathOptions={{ color: 'transparent', fillColor: '#FF0000', fillOpacity: 0.5, className: 'animate-pulse' }} />
                ))}

                {/* Vessels */}
                {vessels.map(vessel => (
                  <div key={vessel.imo}>
                    <Marker position={[vessel.lat, vessel.lon]}>
                      {/* ... existing marker content ... keeping it simple for now or reusing existing logic if it was cleaner in previous code */}
                      <Popup className="cyber-popup">
                        {/* Simplified popup for now to ensure replacement works */}
                        <div className="p-2 bg-slate-900 text-cyan-400"><strong>{vessel.name}</strong></div>
                      </Popup>
                    </Marker>
                  </div>
                ))}

              </MapContainer>
            </div>
          )
        }
        {
          activeTab === 'mapAnalysis' && userRole === 'viewer' && (
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
          )
        }

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <p>&copy; 2025 SeaTrace Maritime Intelligence System. Developed by <strong>Suriya</strong>. All rights reserved.</p>
            <p style={{ fontSize: '12px', color: 'rgba(100,100,100,0.7)', marginTop: '4px' }}>Advanced Ocean Monitoring | Environmental Protection | Real-Time Analytics</p>
          </div>
        </footer>
      </main >
    </div >
    <button
      onClick={() => setIsChatOpen(!isChatOpen)}
      className="fixed bottom-6 right-6 z-[1000] p-4 bg-cyan-600 hover:bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/30 transition-all hover:scale-110"
    >
      <Zap className="w-6 h-6 text-white" fill="currentColor" />
    </button>

    {/* Chat Window */}
    {isChatOpen && (
      <div className="fixed bottom-24 right-6 z-[1000] w-80 h-96 cyber-panel bg-slate-900/95 backdrop-blur flex flex-col font-mono text-xs">
        <div className="p-3 border-b border-cyan-500/30 flex justify-between items-center bg-slate-800/50">
          <span className="font-bold text-cyan-400 flex items-center gap-2">
            <Activity className="w-3 h-3" /> ASK SEATRACE AI
          </span>
          <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="bg-slate-800 p-2 rounded rounded-tl-none border border-slate-700 max-w-[85%]">
            <p className="text-slate-300">System Online. Accessing Satellite Feeds... How can I assist you today?</p>
          </div>
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded max-w-[85%] ${msg.isUser ? 'bg-cyan-900/50 border border-cyan-500/30 rounded-tr-none text-cyan-100' : 'bg-slate-800 border border-slate-700 rounded-tl-none text-slate-300'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-cyan-500/30 bg-slate-800/50">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(e.target.chatInput.value);
            e.target.chatInput.value = '';
          }} className="flex gap-2">
            <input
              name="chatInput"
              type="text"
              placeholder="Query vessel status..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:border-cyan-500 outline-none"
            />
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-white">
              <Zap className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    )}
  </div >
);
}

export default App;
