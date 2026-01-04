/**
 * SeaTrace - Advanced Marine Intelligence & Real-Time Monitoring System
 * Copyright © 2025 by Suriya. All rights reserved.
 *
 * Real-time vessel tracking, oil spill detection, and environmental monitoring
 * for maritime operations and ocean conservation.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Globe, BarChart2, Anchor, FileText, Settings, LogOut, ChevronDown, ChevronRight, Target, Users, Scan, Video, Radio, Lock, Menu, X, Shield, AlertTriangle, ArrowRight, UserPlus, Loader, CheckCircle, Trash2, Zap, Leaf, CloudLightning } from 'lucide-react';
import AddVesselModal from './components/AddVesselModal';
import LiveMap from './components/LiveMap';
import RadarPage from './components/RadarPage';
import ScannerPage from './components/ScannerPage';
import EcoScanner from './components/EcoScanner';
import CrewPage from './components/CrewPage';
// import CommsPage from './components/CommsPage'; // Removed
import CyberDefense from './components/CyberDefense';
import StormWatch from './components/StormWatch';
import io from 'socket.io-client';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import './App.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// import cyberVesselImg from './assets/cyber_vessel.png';
import oilSpillImg from './assets/oil_spill_analysis.png';

// Trigger redeploy for build fix - 11:15 AM

import AuthPage from './components/AuthPage';
import VesselsPage from './components/VesselsPage';
import UsersPage from './components/UsersPage';
import AnalyticsPanel from './components/AnalyticsPanel';
// import AIAnalysisPanel from './components/AIAnalysisPanel'; // Keep this import for now
import AvatarAssistant from './components/AvatarAssistant';
import FishingDashboard from './components/VesselDashboards/FishingDashboard';
import CargoDashboard from './components/VesselDashboards/CargoDashboard';
import TankerDashboard from './components/VesselDashboards/TankerDashboard';
import NavyDashboard from './components/VesselDashboards/NavyDashboard';
import SpillsPage from './components/SpillsPage';
import SettingsScreen from './components/SettingsScreen';
import RadarWidget from './components/RadarWidget';
import ReportsPage from './components/ReportsPage';
import AdminOperationsPanel from './components/AdminOperationsPanel';
import EmergencyOverlay from './components/EmergencyOverlay';
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
  const [activeTab, setActiveTab] = useState('map');
  const [isTransitioning, setIsTransitioning] = useState(false); // Transition state
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reportLoading, setReportLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [marineStrikes, setMarineStrikes] = useState([]); // New state for marine strikes
  // Settings & Persistence
  const [audioEnabled, setAudioEnabled] = useState(() => JSON.parse(localStorage.getItem('seatrace_audio') ?? 'true'));
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => JSON.parse(localStorage.getItem('seatrace_notifications') ?? 'true'));
  const [refreshRate, setRefreshRate] = useState(() => JSON.parse(localStorage.getItem('seatrace_refresh_rate') ?? '10000'));
  const [uiScale, setUiScale] = useState(() => localStorage.getItem('seatrace_ui_scale') || 'touch');
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem('seatrace_map_style') || 'dark');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('seatrace_theme_mode') || 'dark');
  const [themeColors, setThemeColors] = useState(() => {
    const saved = localStorage.getItem('seatrace_theme');
    return saved ? JSON.parse(saved) : {
      primary: '#2563eb',
      secondary: '#0f766e',
      accent: '#f59e0b',
      danger: '#dc2626'
    };
  });

  // Apply Theme & UI Scale Effect
  useEffect(() => {
    // Mode
    if (themeMode === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }

    document.body.className = `${themeColors.primary === '#dc2626' ? 'theme-red' : ''} ${themeMode === 'light' ? 'light-mode' : ''}`;
    // Apply Scale Class to Root
    const root = document.getElementById('root');
    if (root) {
      root.className = uiScale === 'compact' ? 'scale-compact' : 'scale-touch';
    }

    localStorage.setItem('seatrace_theme', JSON.stringify(themeColors));
    localStorage.setItem('seatrace_audio', JSON.stringify(audioEnabled));
    localStorage.setItem('seatrace_notifications', JSON.stringify(notificationsEnabled));
    localStorage.setItem('seatrace_refresh_rate', JSON.stringify(refreshRate));
    localStorage.setItem('seatrace_ui_scale', uiScale);
    localStorage.setItem('seatrace_map_style', mapStyle);
    localStorage.setItem('seatrace_theme_mode', themeMode);
  }, [themeColors, audioEnabled, notificationsEnabled, refreshRate, uiScale, mapStyle, themeMode]);


  // Sound Manager (Aware of audioEnabled)
  // We use a ref to access the latest state inside the immutable function, or just rely on re-renders
  // Add Vessel Modal State
  const [isAddVesselModalOpen, setIsAddVesselModalOpen] = useState(false);
  const [isRedAlert, setIsRedAlert] = useState(false);

  // Toggle Red Alert Mode
  const toggleRedAlert = () => setIsRedAlert(prev => !prev);

  const handleAddVessel = (newVessel) => {
    setVessels(prev => [newVessel, ...prev]);
    soundManager.playSuccess();
    // Simulate API capability (local update for now)
  };

  const soundManager = useMemo(() => ({
    playTone: (freq, type, duration) => {
      if (!audioEnabled) return;
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = freq;
        osc.type = type;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) { console.error("Sound error", e); }
    },
    playLogin: () => soundManager.playTone(600, 'sine', 0.5),
    playNav: () => soundManager.playTone(300, 'triangle', 0.1),
    playHover: () => soundManager.playTone(800, 'sine', 0.05),
    playClick: () => soundManager.playTone(400, 'square', 0.1),
    playSuccess: () => soundManager.playTone(750, 'sine', 0.2), // New success sound
  }), [audioEnabled]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
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

  // New Features State
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(null);

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
  // Chat logic removed in favor of Unified Avatar Assistant

  // Country boundaries for India region (simplified)
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

  // Check for vessel movement alerts
  const checkMovementAlerts = React.useCallback((newMovementData) => {
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
  }, [vessels]); // Added dependency

  // Update movement data for all vessels
  const updateMovementData = React.useCallback(() => {
    const newMovementData = {};
    vessels.forEach(vessel => {
      newMovementData[vessel.imo] = generateVesselMovementData(vessel);
    });
    setVesselMovementData(newMovementData);

    // Check for movement alerts
    checkMovementAlerts(newMovementData);
  }, [vessels, checkMovementAlerts]); // Added dependencies

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
      fetchMarineStrikes(savedToken); // Fetch strikes
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
  }, [isLoggedIn, vessels, updateMovementData]); // Added updateMovementData dependency

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
      console.error('Error fetching vessels - Using Fallback Mock Data:', error);
      // Fallback Mock Data
      // Fallback Mock Data - Expanded for "Alive" feel
      const mockVessels = Array.from({ length: 50 }, (_, i) => {
        const lat = 5.0 + (Math.random() * 20);
        const lon = 80.0 + (Math.random() * 20);
        const course = Math.floor(Math.random() * 360);

        // Generate mock history (trail) behind the vessel
        const history = [];
        let hLat = lat;
        let hLon = lon;
        for (let j = 0; j < 10; j++) {
          hLat -= 0.05 * Math.cos(course * Math.PI / 180);
          hLon -= 0.05 * Math.sin(course * Math.PI / 180);
          history.push({ lat: hLat, lon: hLon });
        }

        return {
          imo: (9000000 + i).toString(),
          name: ['COSMIC', 'OCEAN', 'TITAN', 'STAR', 'WAVE', 'DEEP', 'BLUE', 'RED', 'GALAXY'][i % 9] + ' ' + ['VOYAGER', 'GUARDIAN', 'SPIRIT', 'PIONEER', 'RANGER', 'SCOUT'][i % 6] + ' ' + (i + 1),
          type: ['Cargo', 'Tanker', 'Fishing', 'Navy', 'Research', 'Submarine'][i % 6],
          lat: lat,
          lon: lon,
          speed: 5 + Math.random() * 25,
          course: course,
          destination: ['Singapore', 'Chennai', 'Colombo', 'Mumbai', 'Suez', 'Rotterdam'][Math.floor(Math.random() * 6)],
          status: 'Active',
          risk_level: Math.random() > 0.8 ? 'High' : (Math.random() > 0.5 ? 'Medium' : 'Low'),
          history: history // Added mock history
        };
      });
      setVessels(mockVessels);
      setTimeout(() => updateMovementData(), 100);
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
      console.error('Error fetching oil spills - Using Enhanced Simulation Data:', error);
      // Fallback/Demo Data with Diverse Images per user request
      setOilSpills([
        {
          spill_id: 'SPILL-2025-001',
          lat: 12.5,
          lon: 80.2,
          severity: 'High',
          size_tons: 150.5,
          estimated_area_km2: 2.3,
          vessel_name: 'KMTC NEW YORK',
          status: 'Active',
          image: 'https://images.unsplash.com/photo-1611273426761-53c8577a20fa?q=80&w=600&auto=format&fit=crop', // Smokestack/Pollution
          description: 'Significant discharge detected near harbor entrance.'
        },
        {
          spill_id: 'SPILL-2025-002',
          lat: 5.8,
          lon: 95.3,
          severity: 'Medium',
          size_tons: 75.2,
          estimated_area_km2: 1.1,
          vessel_name: 'MSC ARIANE',
          status: 'Contained',
          image: 'https://images.unsplash.com/photo-1596792556778-3c4ffdf392be?q=80&w=600&auto=format&fit=crop', // Oil sheen on water
          description: 'Contained leakage from fuel transfer operation.'
        },
        {
          spill_id: 'SPILL-2025-003',
          lat: -5.2,
          lon: 105.1,
          severity: 'Low',
          size_tons: 25.8,
          estimated_area_km2: 0.4,
          vessel_name: 'EVER GREEN',
          status: 'Cleaned',
          image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=600&auto=format&fit=crop', // Dark water texture
          description: 'Minor residual sheen post-cleanup.'
        }
      ]);
      setTimeout(() => updateMovementData(), 100);
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
      console.error('Error fetching dashboard data - Using Fallback:', error);
      setDashboardData({
        totalVessels: 125,
        activeAlerts: 4,
        threatLevel: 'Medium',
        systemStatus: 'Optimal'
      });
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

  // New: Fetch Marine Strike Data
  const fetchMarineStrikes = async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/marine-strikes`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setMarineStrikes(response.data);
    } catch (error) {
      console.error('Error fetching marine strikes - Using Fallback:', error);
      // Fallback Mock Data for Marine Strikes
      setMarineStrikes([
        { id: 1, lat: 9.5, lon: 84.0, species: 'Blue Whale', vessel_type: 'Cargo', outcome: 'Avoided', date: '2025-12-30' },
        { id: 2, lat: 11.0, lon: 81.5, species: 'Dolphin Pod', vessel_type: 'Fishing', outcome: 'Warned', date: '2025-12-31' }
      ]);
    }
  };

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
    fetchMarineStrikes(newToken); // Fetch strikes
    initializeSocket(newToken);
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
            soundManager.playLogin();
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
    <div className="app flex md:h-screen h-[100dvh] overflow-hidden bg-[url('https://images.unsplash.com/photo-1518544806352-a22c09fb110e?auto=format&fit=crop&q=80')] bg-cover bg-center">
      {/* Cyber Overlay */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-0"></div>
      <div className="grid-overlay"></div>

      {/* Cyber Background (Static) */}
      <div className="ocean-bg"></div>
      <div className="grid-overlay"></div>
      <div className="marine-waves">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      {/* Map is now ONLY rendered when tab is active for performance and theme */}
      {activeTab === 'map' && (
        <div className="absolute inset-0 z-0 animation-fade-in">
          <LiveMap
            vessels={vessels}
            oilSpills={oilSpills}
            countryBoundaries={countryBoundaries}
            predictionData={predictionData}
            simParams={simParams}
            setSimParams={setSimParams}
            runSimulation={runSimulation}
            selectedSpillId={selectedSpillId}
            predictionStats={predictionStats}
            vesselMovementData={vesselMovementData}
            marineStrikes={marineStrikes}
          />
        </div>
      )}

      {/* Cyber Sidebar - HIDDEN ON MAP VIEW */}
      {activeTab !== 'map' && (
        <div className={`cyber-sidebar flex flex-col fixed md:relative inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${isSidebarExpanded ? 'md:w-64' : 'md:w-16'} bg-slate-900/95 md:bg-transparent border-r border-cyan-500/30 overflow-hidden`}>

          {/* Mobile Header with Close Button */}
          <div className="flex md:hidden items-center justify-between p-4 border-b border-cyan-500/20 bg-slate-900">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-6 h-6" />
              <span className="font-orbitron font-bold text-cyan-400">SEATRACE</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Toggle Handle (Desktop Only) */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden md:flex absolute -right-3 top-10 bg-cyan-900 border border-cyan-500 text-cyan-400 rounded-full p-1 hover:scale-110 transition-transform z-50 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            title={isSidebarExpanded ? "Collapse" : "Expand"}
          >
            {isSidebarExpanded ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Desktop Logo Area */}
          <div className={`hidden md:flex h-16 items-center ${isSidebarExpanded ? 'justify-start px-4' : 'justify-center'} border-b border-cyan-500/20 shrink-0 mb-2 transition-all`}>
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-cyan-500/30 blur-sm rounded-lg animate-pulse group-hover:bg-cyan-400/50 transition-all"></div>
              <img src="/logo.png" alt="SeaTrace" className={`relative z-10 w-8 h-8 rounded-lg object-contain shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-transform group-hover:scale-110`} />
            </div>
            {isSidebarExpanded && (
              <div className="ml-3 font-orbitron font-bold text-cyan-400 tracking-wider whitespace-nowrap overflow-hidden animate-fade-in">
                SEATRACE
              </div>
            )}
          </div>

          {/* Navigation Items - Vertical Scroll */}
          <div className="flex-1 py-2 flex flex-col gap-1 px-2 overflow-y-auto custom-scrollbar">
            {[
              { id: 'dashboard', icon: Activity, label: 'Ops Dashboard' },
              { id: 'map', icon: Globe, label: 'Live Map' },
              { id: 'analytics', icon: BarChart2, label: 'AI Analytics' },
              { id: 'radar', icon: Target, label: 'Radar System' },
              { id: 'scanner', icon: Scan, label: 'X-Ray Scanner' },
              { id: 'eco', icon: Leaf, label: 'Eco-Scanner' },
              { id: 'crew', icon: Users, label: 'Crew Manifest' },

              { id: 'vessels', icon: Anchor, label: 'Vessel Registry' },
              { id: 'reports', icon: FileText, label: 'Reports' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (activeTab !== item.id) {
                    soundManager.playNav();
                    setIsTransitioning(true);
                    if (window.innerWidth >= 768) {
                      setIsMobileMenuOpen(false);
                    }
                    setTimeout(() => {
                      setActiveTab(item.id);
                      setIsTransitioning(false);
                    }, 150);
                  }
                }}
                className={`sidebar-item p-3 md:p-2 rounded-md flex items-center ${isSidebarExpanded ? 'justify-start' : 'md:justify-center justify-start'} gap-3 flex-shrink-0 relative group transition-all ${activeTab === item.id ? 'active bg-cyan-900/30 text-cyan-400' : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/10'}`}
                title={isSidebarExpanded ? '' : item.label}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-all ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]' : 'group-hover:scale-110'}`} />

                {/* Label - Always visible on Mobile, conditional on Desktop */}
                <span className={`${isSidebarExpanded ? 'block' : 'block md:hidden'} font-rajdhani font-semibold tracking-wider text-sm whitespace-nowrap overflow-hidden animate-fade-in text-left flex-1`}>
                  {item.label}
                </span>

                {/* Desktop Tooltip (Collapsed) */}
                {!isSidebarExpanded && (
                  <span className="hidden md:group-hover:block absolute left-full ml-2 bg-slate-900 border border-cyan-500/50 text-cyan-400 text-xs px-2 py-1 rounded z-50 whitespace-nowrap pointer-events-none fade-in">
                    {item.label}
                  </span>
                )}
              </button>
            ))}

            {/* Admin / Extra Tools */}
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsMobileMenuOpen(false);
                }}
                className={`sidebar-item p-3 md:p-2 rounded-md flex items-center ${isSidebarExpanded ? 'justify-start' : 'md:justify-center justify-start'} gap-3 flex-shrink-0 ${activeTab === 'admin' ? 'active bg-red-900/30 text-red-400' : 'text-slate-400 hover:text-red-300'}`}
              >
                <Lock className="w-5 h-5 flex-shrink-0" />
                <span className={`${isSidebarExpanded ? 'block' : 'block md:hidden'} font-rajdhani font-semibold tracking-wider text-sm whitespace-nowrap overflow-hidden animate-fade-in text-left flex-1`}>
                  Command
                </span>
              </button>
            )}
          </div>

          {/* User Info - Visible on Mobile too now */}
          <div className={`flex p-4 md:p-2 border-t border-cyan-500/20 flex-col ${isSidebarExpanded ? 'items-start md:px-4' : 'md:items-center items-start'} gap-2 shrink-0 transition-all bg-slate-900/50 md:bg-transparent`}>
            <div className={`${isSidebarExpanded ? 'block' : 'block md:hidden'} w-full mb-2`}>
              <div className="text-sm font-bold text-cyan-300 truncate">{userName}</div>
              <div className="text-xs text-slate-500 uppercase">{userRole}</div>
            </div>
            <button onClick={handleLogout} className={`p-2 hover:bg-red-500/20 rounded-full transition-colors group flex items-center gap-3 ${isSidebarExpanded ? 'w-full justify-start md:px-3' : 'w-full md:w-auto justify-start md:justify-center'}`} title="Logout">
              <LogOut className="w-5 h-5 md:w-4 md:h-4 text-cyan-600 group-hover:text-red-400" />
              <span className={`${isSidebarExpanded ? 'block' : 'block md:hidden'} text-sm md:text-xs font-bold text-slate-400 group-hover:text-red-400 uppercase tracking-widest`}>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* FLOATING EXIT MAP BUTTON - Visible ONLY on Map */}
      {activeTab === 'map' && (
        <button
          onClick={() => setActiveTab('dashboard')}
          className="fixed top-4 left-4 z-[100] bg-slate-900/80 backdrop-blur border border-cyan-500 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500/20 flex items-center gap-2 font-bold shadow-[0_0_15px_rgba(0,243,255,0.3)] pointer-events-auto"
        >
          <span className="text-lg">←</span> EXIT MAP
        </button>
      )
      }

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden pointer-events-none">

        {/* Top Status Bar - HIDDEN ON MAP */}
        {activeTab !== 'map' && (
          <header className="h-16 flex items-center justify-between px-6 border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-md pointer-events-auto">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-cyan-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <h1 className="text-xl md:text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-bold uppercase tracking-widest shadow-cyan-500/50 drop-shadow-sm truncate max-w-[200px] md:max-w-none">
                {activeTab === 'dashboard' ? 'Real-Time Ops' : activeTab.toUpperCase()}
              </h1>
              {activeTab === 'dashboard' && <span className="hidden md:flex items-center gap-2 text-xs font-mono text-cyan-500/70 border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-900/10"><span className="animate-ping w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> LIVE FEED</span>}
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 text-sm font-rajdhani text-cyan-300/80">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse box-shadow-[0_0_10px_#22c55e]"></span>
                ONLINE
              </div>
              <div className="text-xs font-mono text-cyan-600 hidden md:block">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </header>
        )}

        {/* Scrollable Content - Reduced Padding for Mobile */}
        <div className={`${activeTab === 'map' ? 'p-0' : 'p-2 md:p-6'} flex-1 overflow-hidden flex flex-col ${isTransitioning ? 'opacity-50 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'} transition-all duration-300 ease-in-out`}>
          <main className={`flex-1 ${activeTab === 'map' ? 'overflow-hidden' : 'overflow-y-auto'} overflow-x-hidden relative custom-scrollbar animate-slide-in ${activeTab === 'map' ? '' : 'pointer-events-auto'}`}>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
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
                  {/* Map Preview Removed - Use Live Map Tab */}

                  {/* Fleet Status List / Radar Widget */}
                  <RadarWidget />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Red Alert Control */}
                  <div className="cyber-panel border-red-500/50">
                    <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> EMERGENCY OVERRIDE
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Trigger global "Red Alert" protocol. This will override all user interfaces with emergency visuals.
                    </p>
                    <button
                      onClick={toggleRedAlert}
                      className={`w-full py-3 font-bold uppercase tracking-widest rounded border transition-all ${isRedAlert
                        ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_#dc2626] animate-pulse'
                        : 'bg-slate-900 text-red-500 border-red-900 hover:bg-red-900/20 hover:border-red-500'
                        }`}
                    >
                      {isRedAlert ? 'DEACTIVATE ALERT' : 'INITIATE RED ALERT'}
                    </button>
                  </div>

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



            {
              activeTab === 'vessels' && (
                selectedVessel ? (
                  <div className="space-y-4 animate-slide-in">
                    <button
                      onClick={() => setSelectedVessel(null)}
                      className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors mb-4 group"
                    >
                      <ArrowRight className="rotate-180 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Fleet Registry
                    </button>

                    {/* Header for specialized view */}
                    <div className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-lg border border-cyan-500/20 mb-6 backdrop-blur-sm">
                      <div className="w-20 h-20 bg-slate-800 rounded-lg overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <img src="https://images.unsplash.com/photo-1542350719-7517c919d650?q=80&w=200" alt={selectedVessel.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white font-orbitron tracking-wide">{selectedVessel.name}</h2>
                        <div className="flex gap-4 text-sm text-cyan-400 font-mono mt-1">
                          <span className="px-2 py-0.5 bg-cyan-900/40 rounded border border-cyan-500/20">IMO: {selectedVessel.imo}</span>
                          <span className="px-2 py-0.5 bg-cyan-900/40 rounded border border-cyan-500/20">TYPE: {selectedVessel.type}</span>
                          <span className={`px-2 py-0.5 rounded border ${selectedVessel.status === 'Active' ? 'bg-green-900/40 border-green-500/20 text-green-400' : 'bg-slate-700 border-slate-600 text-gray-400'}`}>STATUS: {selectedVessel.status || 'Active'}</span>
                        </div>
                      </div>
                    </div>

                    {(selectedVessel.type.includes('Fishing')) && <FishingDashboard vessel={selectedVessel} />}
                    {(selectedVessel.type.includes('Cargo') || selectedVessel.type.includes('Container')) && <CargoDashboard vessel={selectedVessel} />}
                    {(selectedVessel.type.includes('Tanker')) && <TankerDashboard vessel={selectedVessel} />}
                    {(selectedVessel.type.includes('Navy') || selectedVessel.type.includes('Gov') || selectedVessel.type.includes('Military')) && <NavyDashboard vessel={selectedVessel} />}

                    {/* Emergency Overlay */}
                    {isRedAlert && <EmergencyOverlay />}

                    {/* Sidebar */}
                    {!selectedVessel.type.includes('Fishing') &&
                      !selectedVessel.type.includes('Cargo') && !selectedVessel.type.includes('Container') &&
                      !selectedVessel.type.includes('Tanker') &&
                      !selectedVessel.type.includes('Navy') && !selectedVessel.type.includes('Gov') && !selectedVessel.type.includes('Military') && (
                        <CargoDashboard vessel={selectedVessel} />
                      )}
                  </div>
                ) : (
                  <VesselsPage vessels={vessels} onVesselSelect={setSelectedVessel} onAddClick={() => setIsAddVesselModalOpen(true)} />
                )
              )
            }

            {/* Oil Spills Tab - Operator/Admin only */}
            {
              activeTab === 'spills' && (
                <SpillsPage oilSpills={oilSpills} userRole={userRole} />
              )
            }

            {/* Reports Tab - Available to All Roles */}
            {
              activeTab === 'reports' && (
                <ReportsPage userRole={userRole} />
              )
            }

            {/* Radar Tab */}
            {
              activeTab === 'radar' && (
                <RadarPage vessels={vessels} />
              )
            }

            {/* Scanner Tab */}
            {
              activeTab === 'scanner' && (
                <ScannerPage vessels={vessels} />
              )
            }

            {/* Eco-Scanner Tab */}
            {
              activeTab === 'eco' && (
                <EcoScanner />
              )
            }

            {/* Crew Tab */}
            {
              activeTab === 'crew' && (
                <CrewPage vessels={vessels} />
              )
            }


            {/* Users Page - Admin Only */}
            {
              activeTab === 'users' && userRole === 'admin' && (
                <UsersPage />
              )
            }

            {activeTab === 'admin' && userRole === 'admin' && (
              <div className="relative h-full flex flex-col overflow-hidden">
                {/* Background Live Map for Admin Command Center - REMOVED (Global map used) */}
                <div className="absolute inset-0 z-0 opacity-50 bg-slate-900/50">
                  {/* Background dimming only */}
                </div>

                {/* Overlay Admin Interface */}
                <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
                  <AdminOperationsPanel
                    adminPanelMessage={adminPanelMessage}
                    handleCreateUser={handleCreateUser}
                    newUserData={newUserData}
                    setNewUserData={setNewUserData}
                    adminPanelLoading={adminPanelLoading}
                    fetchAllUsers={fetchAllUsers}
                    allUsers={allUsers}
                    handleDeleteUser={handleDeleteUser}
                    email={email}
                    fetchAuditLogs={fetchAuditLogs}
                    auditLogs={auditLogs}
                  />
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
                  <div className={`realtime-status-card ${connectionStatus}`}>
                    <div className="status-indicator"></div>
                    <div>
                      <strong>{connectionStatus === 'connected' ? 'Systems Online' : 'Network Offline'}</strong>
                      <p>
                        {connectionStatus === 'connected' ? 'Receiving live satellite telemetry' : 'Attempting to re-establish link...'}
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

            {/* Reports Tab Removed - Duplicate Consolidated */}

            {/* Spills Tab - SpillsPage */}
            {/* Spills/Hazards Tab removed - Consolidated into Live Map */}

            {/* Settings Page */}
            {
              activeTab === 'settings' && (
                <div className="flex-1 h-full flex flex-col">
                  {activeTab === 'settings' && (
                    <div className="flex-1 overflow-auto bg-slate-900/90 relative">
                      <SettingsScreen
                        onLogout={handleLogout}
                        soundManager={soundManager}
                        toggleTheme={(color) => setThemeColors(prev => ({ ...prev, primary: color }))}
                        currentTheme={themeColors.primary === '#dc2626' ? 'red' : 'blue'}
                        audioEnabled={audioEnabled}
                        toggleAudio={() => setAudioEnabled(!audioEnabled)}
                        notificationsEnabled={notificationsEnabled}
                        toggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
                        // Enhanced Props
                        simParams={simParams}
                        setSimParams={setSimParams}
                        refreshRate={refreshRate}
                        setRefreshRate={setRefreshRate}
                        uiScale={uiScale}
                        setUiScale={setUiScale}
                        mapStyle={mapStyle}
                        setMapStyle={setMapStyle}
                        themeMode={themeMode}
                        setThemeMode={setThemeMode}
                      />
                    </div>
                  )}
                </div>
              )
            }


            {/* Legacy Map Analysis removed in favor of Live Map */}

            {/* Footer - HIDDEN ON MAP */}
            {activeTab !== 'map' && (
              <footer className="app-footer">
                <div className="footer-content">
                  <p>&copy; 2025 SeaTrace Maritime Intelligence System. Developed by <strong>Suriya</strong>. All rights reserved.</p>
                  <p style={{ fontSize: '12px', color: 'rgba(100,100,100,0.7)', marginTop: '4px' }}>Advanced Ocean Monitoring | Environmental Protection | Real-Time Analytics</p>
                </div>
              </footer>
            )}
          </main >
        </div >
        {/* Avatar Assistant - Unified AI Interface */}
        <AvatarAssistant
          isOpen={isAvatarOpen}
          onClose={() => setIsAvatarOpen(false)}
          context={{ vessels, oilSpills, setActiveTab }}
          token={token}
        />

        {/* Avatar Toggle Button (FAB) */}
        {!isAvatarOpen && (
          <button
            onClick={() => {
              soundManager.playNav();
              setIsAvatarOpen(true);
            }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center transition-all z-[90] group animate-slide-up"
            title="Open AI Assistant"
          >
            <Zap className="w-8 h-8 text-black fill-current" />
          </button>
        )}

      </div>
      <AddVesselModal
        isOpen={isAddVesselModalOpen}
        onClose={() => setIsAddVesselModalOpen(false)}
        onAdd={handleAddVessel}
      />
    </div>
  );
}

export default App;

