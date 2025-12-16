import React, { useState, useEffect } from 'react';
import { AlertCircle, Droplet, Ship, Satellite, MapPin, TrendingUp, Users, FileText, Bell, Settings, Search, Filter, Download, Eye, LogOut, Calendar, Clock, Loader } from 'lucide-react';

const SeaTraceApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [spillData, setSpillData] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [vesselPositions, setVesselPositions] = useState([]);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await window.storage.get('auth_token');
        if (token && token.value) {
          const userData = JSON.parse(token.value);
          setIsAuthenticated(true);
          setUserName(userData.name);
          setUserRole(userData.role);
          setUserId(userData.id);
        }
      } catch (error) {
        console.log('No existing session');
      }
    };
    checkAuth();
  }, []);

  // AIS Vessel Data Simulation
  const aisVessels = [
    { mmsi: '367123456', name: 'OCEAN PRIDE', lat: 25.2048, lon: 55.2708, type: 'Tanker', speed: 12.5, course: 045 },
    { mmsi: '235987654', name: 'SEA NAVIGATOR', lat: 1.3521, lon: 103.8198, type: 'Cargo', speed: 8.3, course: 180 },
    { mmsi: '477456789', name: 'MARINE STAR', lat: 51.5074, lon: -0.1278, type: 'Tanker', speed: 15.2, course: 270 },
    { mmsi: '412789456', name: 'ATLANTIC WAVE', lat: 40.7128, lon: -74.0060, type: 'Container', speed: 18.5, course: 090 },
    { mmsi: '563214789', name: 'PACIFIC GLORY', lat: 35.6762, lon: 139.6503, type: 'Tanker', speed: 10.8, course: 135 }
  ];

  // Simulate real-time vessel movement
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMonitoring && isAuthenticated) {
        setVesselPositions(prev => {
          return aisVessels.map(vessel => ({
            ...vessel,
            lat: vessel.lat + (Math.random() - 0.5) * 0.01,
            lon: vessel.lon + (Math.random() - 0.5) * 0.01
          }));
        });
        
        // Simulate new spill detection
        if (Math.random() > 0.8) {
          const randomVessel = aisVessels[Math.floor(Math.random() * aisVessels.length)];
          const newSpill = {
            id: Date.now(),
            location: `${randomVessel.lat.toFixed(4)}°N, ${randomVessel.lon.toFixed(4)}°E`,
            lat: randomVessel.lat,
            lon: randomVessel.lon,
            severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
            size: `${(Math.random() * 50 + 10).toFixed(2)} km²`,
            vessel: randomVessel.name,
            mmsi: randomVessel.mmsi,
            vesselType: randomVessel.type,
            confidence: `${(Math.random() * 30 + 70).toFixed(1)}%`,
            timestamp: new Date().toLocaleTimeString(),
            weather: ['Clear', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
            windSpeed: `${(Math.random() * 20 + 5).toFixed(1)} knots`,
            waveHeight: `${(Math.random() * 3 + 0.5).toFixed(1)} m`
          };
          setSpillData(prev => [newSpill, ...prev.slice(0, 19)]);
          setAlerts(prev => [{
            id: Date.now(),
            message: `${newSpill.severity} severity spill detected near ${newSpill.vessel}`,
            time: newSpill.timestamp,
            severity: newSpill.severity
          }, ...prev.slice(0, 9)]);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isMonitoring, isAuthenticated]);

  // Initialize with sample data
  useEffect(() => {
    if (isAuthenticated) {
      setVesselPositions(aisVessels);
      setSpillData([
        { 
          id: 1, 
          location: '25.2048°N, 55.2708°E', 
          lat: 25.2048, 
          lon: 55.2708,
          severity: 'High', 
          size: '45.3 km²', 
          vessel: 'OCEAN PRIDE',
          mmsi: '367123456',
          vesselType: 'Tanker',
          confidence: '89.5%', 
          timestamp: '10:45:23',
          weather: 'Clear',
          windSpeed: '12.3 knots',
          waveHeight: '1.8 m'
        }
      ]);
    }
  }, [isAuthenticated]);

  const LoginPage = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '', name: '' });
    const [isSignup, setIsSignup] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setAuthError('');
      setAuthLoading(true);

      try {
        if (isSignup) {
          // Sign Up Flow
          // Check if user already exists
          try {
            const existingUser = await window.storage.get(`user_${loginData.email}`);
            if (existingUser) {
              setAuthError('User already exists. Please login instead.');
              setAuthLoading(false);
              return;
            }
          } catch (error) {
            // User doesn't exist, proceed with signup
          }

          // Create new user
          const newUser = {
            id: `user_${Date.now()}`,
            email: loginData.email,
            name: loginData.name || loginData.email.split('@')[0],
            password: loginData.password, // In production, hash this!
            role: 'user',
            createdAt: new Date().toISOString()
          };

          // Store user data
          await window.storage.set(`user_${loginData.email}`, JSON.stringify(newUser));
          
          // Create auth token
          const authToken = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            loginTime: new Date().toISOString()
          };
          
          await window.storage.set('auth_token', JSON.stringify(authToken));
          
          setUserName(newUser.name);
          setUserRole(newUser.role);
          setUserId(newUser.id);
          setIsAuthenticated(true);
          
        } else {
          // Login Flow
          try {
            const userResult = await window.storage.get(`user_${loginData.email}`);
            
            if (!userResult) {
              setAuthError('User not found. Please sign up first.');
              setAuthLoading(false);
              return;
            }

            const user = JSON.parse(userResult.value);
            
            // Verify password
            if (user.password !== loginData.password) {
              setAuthError('Invalid password. Please try again.');
              setAuthLoading(false);
              return;
            }

            // Create auth token
            const authToken = {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              loginTime: new Date().toISOString()
            };
            
            await window.storage.set('auth_token', JSON.stringify(authToken));
            
            setUserName(user.name);
            setUserRole(user.role);
            setUserId(user.id);
            setIsAuthenticated(true);
            
          } catch (error) {
            setAuthError('User not found. Please sign up first.');
            setAuthLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setAuthError('Authentication failed. Please try again.');
      }
      
      setAuthLoading(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-teal-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-full shadow-2xl">
                <Droplet className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">SeaTrace</h1>
            <p className="text-blue-100">Marine Oil Spill Monitoring System</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={loginData.name}
                    onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="John Doe"
                    required={isSignup}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="user@seatrace.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isSignup && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</a>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {authLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    {isSignup ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignup ? 'Sign Up' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setAuthError('');
                }}
                className="text-sm text-gray-600 hover:text-blue-600 transition"
              >
                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-white text-sm bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
            <p className="font-semibold mb-2">🌊 Real-time AIS Monitoring</p>
            <p className="text-xs">AI-powered satellite detection • Live vessel tracking</p>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('auth_token');
      setIsAuthenticated(false);
      setUserName('');
      setUserRole('');
      setUserId('');
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {userName}! 👋</h2>
        <p className="text-blue-100">Here's what's happening with marine oil spill detection today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Active Spills</p>
              <p className="text-3xl font-bold mt-1">{spillData.length}</p>
            </div>
            <AlertCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">AIS Vessels Tracked</p>
              <p className="text-3xl font-bold mt-1">{vesselPositions.length}</p>
            </div>
            <Ship className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Satellites Active</p>
              <p className="text-3xl font-bold mt-1">8</p>
            </div>
            <Satellite className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Detection Rate</p>
              <p className="text-3xl font-bold mt-1">94.2%</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* AIS Map with Vessels and Spills */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            AIS Vessel Tracking & Spill Locations
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="text-sm text-gray-600">{isMonitoring ? 'Live AIS Data' : 'Paused'}</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-lg h-96 relative overflow-hidden">
          {/* Grid lines for map effect */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(10)].map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full border-t border-blue-300" style={{ top: `${i * 10}%` }}></div>
            ))}
            {[...Array(10)].map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full border-l border-blue-300" style={{ left: `${i * 10}%` }}></div>
            ))}
          </div>

          {/* Vessel Markers */}
          {vesselPositions.map((vessel, idx) => (
            <div
              key={vessel.mmsi}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${((vessel.lon + 180) / 360) * 100}%`,
                top: `${((90 - vessel.lat) / 180) * 100}%`
              }}
            >
              <Ship className="w-6 h-6 text-green-400 animate-pulse" />
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                <div className="font-semibold">{vessel.name}</div>
                <div>MMSI: {vessel.mmsi}</div>
                <div>Type: {vessel.type}</div>
                <div>Speed: {vessel.speed} kts</div>
              </div>
            </div>
          ))}

          {/* Spill Markers */}
          {spillData.map((spill) => (
            <div
              key={spill.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${((spill.lon + 180) / 360) * 100}%`,
                top: `${((90 - spill.lat) / 180) * 100}%`
              }}
            >
              <div className={`w-8 h-8 rounded-full animate-ping absolute ${
                spill.severity === 'Critical' ? 'bg-red-600' :
                spill.severity === 'High' ? 'bg-orange-500' :
                spill.severity === 'Medium' ? 'bg-yellow-500' :
                'bg-green-500'
              } opacity-75`}></div>
              <Droplet className={`w-6 h-6 relative z-10 ${
                spill.severity === 'Critical' ? 'text-red-500' :
                spill.severity === 'High' ? 'text-orange-500' :
                spill.severity === 'Medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">
                <div className="font-semibold">{spill.severity} Severity</div>
                <div>Vessel: {spill.vessel}</div>
                <div>Size: {spill.size}</div>
                <div>Confidence: {spill.confidence}</div>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs">
            <div className="font-semibold mb-2">Legend</div>
            <div className="flex items-center space-x-2 mb-1">
              <Ship className="w-4 h-4 text-green-400" />
              <span>AIS Vessel</span>
            </div>
            <div className="flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-red-500" />
              <span>Oil Spill</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts & AIS Data */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-orange-600" />
            Recent Alerts
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.slice(0, 8).map(alert => (
              <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${
                alert.severity === 'Critical' ? 'bg-red-50 border-red-200' :
                alert.severity === 'High' ? 'bg-orange-50 border-orange-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  alert.severity === 'Critical' ? 'text-red-600' :
                  alert.severity === 'High' ? 'text-orange-600' :
                  'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No recent alerts</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Ship className="w-5 h-5 mr-2 text-blue-600" />
            Active AIS Vessels
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {vesselPositions.map((vessel) => (
              <div key={vessel.mmsi} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{vessel.name}</p>
                  <p className="text-xs text-gray-600">MMSI: {vessel.mmsi} | {vessel.type}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {vessel.lat.toFixed(4)}°N, {vessel.lon.toFixed(4)}°E
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">{vessel.speed} kts</p>
                  <p className="text-xs text-gray-500">Course: {vessel.course}°</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ReportsView = () => {
    const [reportType, setReportType] = useState('spill-analysis');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const generateReport = async () => {
      setReportGenerating(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportContent = {
        title: `SeaTrace ${reportType.replace('-', ' ').toUpperCase()} Report`,
        generatedAt: new Date().toLocaleString(),
        generatedBy: userName,
        userId: userId,
        data: {
          totalSpills: spillData.length,
          criticalSpills: spillData.filter(s => s.severity === 'Critical').length,
          highSpills: spillData.filter(s => s.severity === 'High').length,
          vesselsTracked: vesselPositions.length,
          detectionRate: '94.2%',
          averageConfidence: '85.3%'
        }
      };

      const reportText = `
${reportContent.title}
Generated: ${reportContent.generatedAt}
Generated By: ${reportContent.generatedBy}
User ID: ${reportContent.userId}
=====================================

SUMMARY STATISTICS:
- Total Spills Detected: ${reportContent.data.totalSpills}
- Critical Severity: ${reportContent.data.criticalSpills}
- High Severity: ${reportContent.data.highSpills}
- Vessels Tracked: ${reportContent.data.vesselsTracked}
- ML Detection Rate: ${reportContent.data.detectionRate}
- Average Confidence: ${reportContent.data.averageConfidence}

DETAILED SPILL DATA:
${spillData.map((spill, idx) => `
${idx + 1}. ${spill.vessel} (MMSI: ${spill.mmsi})
   Location: ${spill.location}
   Severity: ${spill.severity}
   Size: ${spill.size}
   Confidence: ${spill.confidence}
   Vessel Type: ${spill.vesselType}
   Weather: ${spill.weather}
   Wind Speed: ${spill.windSpeed}
   Wave Height: ${spill.waveHeight}
   Detected: ${spill.timestamp}
`).join('\n')}

AIS VESSEL DATA:
${vesselPositions.map((vessel, idx) => `
${idx + 1}. ${vessel.name}
   MMSI: ${vessel.mmsi}
   Type: ${vessel.type}
   Position: ${vessel.lat.toFixed(4)}°N, ${vessel.lon.toFixed(4)}°E
   Speed: ${vessel.speed} knots
   Course: ${vessel.course}°
`).join('\n')}

=====================================
Report generated by SeaTrace System
AI-Powered Marine Oil Spill Detection
      `.trim();

      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seatrace-${reportType}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setReportGenerating(false);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Generate Custom Report
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="spill-analysis">Spill Analysis Report</option>
                <option value="vessel-tracking">Vessel Tracking Report</option>
                <option value="ais-data">AIS Data Export</option>
                <option value="ml-performance">ML Model Performance</option>
                <option value="weather-impact">Weather Impact Analysis</option>
                <option value="compliance">Compliance Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={reportGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reportGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Generate & Download Report</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Report Preview</h3>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">
                    {reportType.replace('-', ' ').toUpperCase()} Report
                  </h4>
                  <p className="text-sm text-gray-600">Generated by: {userName}</p>
                  <p className="text-xs text-gray-500">User ID: {userId}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600">Total Spills</p>
                  <p className="text-2xl font-bold text-gray-800">{spillData.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600">Critical Cases</p>
                  <p className="text-2xl font-bold text-red-600">
                    {spillData.filter(s => s.severity === 'Critical').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600">Vessels Tracked</p>
                  <p className="text-2xl font-bold text-blue-600">{vesselPositions.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600">Detection Rate</p>
                  <p className="text-2xl font-bold text-green-600">94.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MonitoringView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Active Spill Detections with AIS Data</h2>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              <span>{isMonitoring ? 'Pause' : 'Resume'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vessel / MMSI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Weather</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {spillData.map((spill) => (
                <tr key={spill.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-800">{spill.vessel}</div>
                    <div className="text-xs text-gray-500">MMSI: {spill.mmsi}</div>
                    <div className="text-xs text-gray-500">{spill.vesselType}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{spill.location}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      spill.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                      spill.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                      spill.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {spill.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{spill.size}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800">{spill.weather}</div>
                    <div className="text-xs text-gray-500">Wind: {spill.windSpeed}</div>
                    <div className="text-xs text-gray-500">Wave: {spill.waveHeight}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{spill.confidence}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{spill.timestamp}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 transition">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Droplet className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">SeaTrace</h1>
                <p className="text-sm text-blue-100">Marine Oil Spill Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 cursor-pointer hover:text-blue-200 transition" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <div className="text-right">
                  <div className="text-sm font-medium">{userName}</div>
                  <div className="text-xs text-blue-200">{userRole}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 hover:text-blue-200 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'monitoring', label: 'Live Monitoring', icon: Satellite },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'monitoring' && <MonitoringView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings</h2>
            <p className="text-gray-600 mb-4">Configure system parameters and preferences</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-sm text-gray-700"><strong>User:</strong> {userName}</p>
              <p className="text-sm text-gray-700"><strong>Role:</strong> {userRole}</p>
              <p className="text-sm text-gray-700"><strong>User ID:</strong> {userId}</p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            © 2024 SeaTrace - AI-Powered Marine Oil Spill Detection System
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Powered by AIS Data, Satellite Imagery Analysis & Machine Learning
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SeaTraceApp;