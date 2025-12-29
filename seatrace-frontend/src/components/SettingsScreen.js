import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Moon, Bell, Shield, Activity, Power, EyeOff, Wifi, Map, AlertTriangle, RefreshCw, Smartphone, Monitor, Maximize, LogOut, Minimize } from 'lucide-react';

const SettingsScreen = ({
    soundManager,
    toggleTheme,
    currentTheme,
    audioEnabled,
    toggleAudio,
    notificationsEnabled,
    toggleNotifications,
    simParams,
    setSimParams,
    refreshRate,
    setRefreshRate,
    uiScale,
    setUiScale,
    mapStyle,
    setMapStyle,
    themeMode,
    setThemeMode,
    onLogout
}) => {

    const handleSimChange = (e) => {
        const { name, value } = e.target;
        setSimParams(prev => ({
            ...prev,
            [name]: parseInt(value)
        }));
    };

    const handleSoundToggle = () => {
        toggleAudio();
        soundManager.playClick();
    };

    return (
        <div className="space-y-6 animate-slide-in p-4 md:p-6 max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar padding-safe-bottom">
            <div className="flex items-center justify-between mb-8 border-b border-cyan-500/30 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold font-orbitron text-white flex items-center gap-3">
                    <Settings className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 animate-spin-slow" />
                    SYSTEM PREFERENCES
                </h2>
                <div className="hidden md:block text-sm font-mono text-cyan-600 bg-cyan-950/30 px-3 py-1 rounded border border-cyan-500/20 animate-pulse">
                    BUILD v2.6.0 (RESPONSIVE-CORE)
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                {/* --- Interface Scaling --- */}
                <div className="cyber-panel p-6 space-y-4 border-blue-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                            <Monitor className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-orbitron">DISPLAY MATRIX</h3>
                            <p className="text-xs text-slate-400">Scale interface for device comfort.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-1 rounded-lg border border-slate-700/50">
                        <button
                            onClick={() => {
                                if (setUiScale) {
                                    setUiScale('compact');
                                    soundManager.playClick();
                                }
                            }}
                            className={`p-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all ${uiScale === 'compact' ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'text-slate-400 hover:text-white'}`}
                        >
                            <MinimizeIcon className="w-4 h-4" /> Compact
                        </button>
                        <button
                            onClick={() => {
                                if (setUiScale) {
                                    setUiScale('touch');
                                    soundManager.playClick();
                                }
                            }}
                            className={`p-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all ${uiScale === 'touch' ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Smartphone className="w-4 h-4" /> Touch
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded bg-slate-900/40 border border-slate-700/30">
                        <span className="text-slate-300 text-sm">Base Map Layer</span>
                        <select
                            value={mapStyle || 'dark'}
                            onChange={(e) => setMapStyle && setMapStyle(e.target.value)}
                            className="bg-slate-800 text-white text-xs border border-slate-600 rounded px-2 py-1 focus:border-cyan-500 outline-none"
                        >
                            <option value="dark">Dark Matter</option>
                            <option value="satellite">Satellite</option>
                            <option value="ocean">Oceanography</option>
                        </select>
                    </div>
                </div>

                {/* --- Simulation & Data Controls --- */}
                <div className="cyber-panel p-6 space-y-4 border-yellow-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                            <Activity className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-orbitron">SIMULATION CORE</h3>
                            <p className="text-xs text-slate-400">Adjust predictive model parameters.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Wind Speed Slider */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300">Wind Speed</span>
                                <span className="text-yellow-400 font-mono">{simParams?.wind_speed || 15} kn</span>
                            </div>
                            <input
                                type="range"
                                name="wind_speed"
                                min="0" max="100"
                                value={simParams?.wind_speed || 15}
                                onChange={handleSimChange}
                                className="w-full accent-yellow-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Data Refresh Rate */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-300 text-sm font-mono">Data Refresh</span>
                            </div>
                            <select
                                value={refreshRate || 10000}
                                onChange={(e) => setRefreshRate && setRefreshRate(parseInt(e.target.value))}
                                className="bg-slate-800 text-yellow-400 text-xs font-mono border border-slate-600 rounded px-2 py-1 focus:border-yellow-500 outline-none"
                            >
                                <option value={1000}>REAL-TIME (1s)</option>
                                <option value={5000}>FAST (5s)</option>
                                <option value={10000}>NORMAL (10s)</option>
                                <option value={30000}>ECO (30s)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Audio Settings */}
                <div className="cyber-panel p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                            {audioEnabled ? <Volume2 className="w-6 h-6 text-cyan-400" /> : <VolumeX className="w-6 h-6 text-slate-500" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-orbitron">AUDIO INTERFACE</h3>
                            <p className="text-xs text-slate-400">Manage system sound effects and alerts.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded border border-slate-700">
                        <span className="text-slate-300 font-mono text-sm">UI Sound Effects</span>
                        <button
                            onClick={handleSoundToggle}
                            className={`w-14 h-7 rounded-full transition-colors relative ${audioEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${audioEnabled ? 'left-8' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Visual Settings */}
                <div className="cyber-panel p-6 space-y-4 border-purple-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                            <div className="text-purple-400">
                                <Maximize className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-orbitron">VISUAL MATRIX</h3>
                            <p className="text-xs text-slate-400">Customize interface color schemes.</p>
                        </div>
                    </div>

                    {/* THEME MODE TOGGLE */}
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-cyan-500/20 mb-4">
                        <div className="flex items-center gap-3">
                            {themeMode === 'light' ? <span className="text-yellow-400">☀️</span> : <span className="text-blue-400">🌙</span>}
                            <div>
                                <div className="text-sm font-bold text-cyan-100">Theme Mode</div>
                                <div className="text-xs text-cyan-600">Select interface brightness</div>
                            </div>
                        </div>
                        <div className="flex bg-black/40 rounded-lg p-1 border border-cyan-500/30">
                            <button
                                onClick={() => {
                                    soundManager.playClick();
                                    if (setThemeMode) setThemeMode('dark');
                                }}
                                className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${themeMode === 'dark' ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-500 hover:text-cyan-400'}`}
                            >
                                DARK
                            </button>
                            <button
                                onClick={() => {
                                    soundManager.playClick();
                                    if (setThemeMode) setThemeMode('light');
                                }}
                                className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${themeMode === 'light' ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-slate-500 hover:text-yellow-400'}`}
                            >
                                LIGHT
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => toggleTheme('#2563eb')}
                            className={`p-4 rounded border-2 transition-all text-center group ${currentTheme !== 'red' ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-700 bg-slate-900/40 hover:border-cyan-500/50'}`}
                        >
                            <div className="w-8 h-8 bg-cyan-500 rounded-full mx-auto mb-2 shadow-[0_0_15px_rgba(6,182,212,0.6)]"></div>
                            <div className="text-sm font-bold text-white mb-1">CYBER BLUE</div>
                            <div className="text-[10px] text-slate-400">Standard Operator</div>
                        </button>

                        <button
                            onClick={() => toggleTheme('#dc2626')}
                            className={`p-4 rounded border-2 transition-all text-center group ${currentTheme === 'red' ? 'border-red-500 bg-red-900/20' : 'border-slate-700 bg-slate-900/40 hover:border-red-500/50'}`}
                        >
                            <div className="w-8 h-8 bg-red-600 rounded-full mx-auto mb-2 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse"></div>
                            <div className="text-sm font-bold text-white mb-1">RED ALERT</div>
                            <div className="text-[10px] text-slate-400">Crisis Mode</div>
                        </button>
                    </div>
                </div>

                {/* Account Status */}
                <div className="cyber-panel p-6 space-y-4 border-orange-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
                            <Shield className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-orbitron">SECURITY CLEARANCE</h3>
                            <p className="text-xs text-slate-400">Current session status.</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/80 p-4 rounded border border-slate-700 text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Access Level</div>
                        <div className="text-xl font-bold text-white font-orbitron text-shadow-orange">COMMANDER</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="w-full py-3 bg-red-600/20 hover:bg-red-600/40 border border-red-500 text-red-100 text-sm font-bold uppercase rounded flex items-center justify-center gap-2 group transition-all animate-pulse">
                            <AlertTriangle className="w-5 h-5" /> SOS
                        </button>
                        <button
                            onClick={() => {
                                soundManager.playClick();
                                if (onLogout) onLogout();
                            }}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-sm font-bold uppercase rounded flex items-center justify-center gap-2 transition-all"
                        >
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper Icon for minimize (not imported by default usually)
const MinimizeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
);

export default SettingsScreen;
