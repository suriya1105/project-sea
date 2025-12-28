import React from 'react';
import { Settings, Volume2, VolumeX, Moon, Sun, Bell, Shield, Activity, Power, EyeOff, Wifi, Map, AlertTriangle } from 'lucide-react';

const SettingsPage = ({
    soundManager,
    toggleTheme,
    currentTheme,
    audioEnabled,
    toggleAudio,
    notificationsEnabled,
    toggleNotifications
}) => {

    const handleSoundToggle = () => {
        toggleAudio();
        // Feedback sound only if we just turned it ON or if it WAS on? 
        // If we toggle, the prop isn't updated instantly in this closure usually? 
        // But assuming optimistic update or just play click regardless (soundManager checks state).
        soundManager.playClick();
    };

    return (
        <div className="space-y-6 animate-slide-in p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8 border-b border-cyan-500/30 pb-4">
                <h2 className="text-3xl font-bold font-orbitron text-white flex items-center gap-3">
                    <Settings className="w-8 h-8 text-cyan-400 animate-spin-slow" />
                    SYSTEM PREFERENCES
                </h2>
                <div className="text-sm font-mono text-cyan-600 bg-cyan-950/30 px-3 py-1 rounded border border-cyan-500/20 animate-pulse">
                    BUILD v2.5.0 (CYBER-HUD)
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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
                    <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded border border-slate-700">
                        <span className="text-slate-300 font-mono text-sm">Critical Alert Voice</span>
                        <div className="flex gap-2">
                            <span className="text-xs text-cyan-400 font-bold bg-cyan-900/40 px-2 py-1 rounded border border-cyan-500/30">AI FEMALE</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded border border-slate-700 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4 text-purple-400" />
                            <span className="text-slate-300 font-mono text-sm">Stealth Mode (No Anim)</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative bg-slate-600`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all left-1`}></div>
                        </div>
                    </div>
                </div>

                {/* Visual Settings */}
                <div className="cyber-panel p-6 space-y-4 border-purple-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                            {currentTheme === 'red' ? <Activity className="w-6 h-6 text-red-500" /> : <Moon className="w-6 h-6 text-purple-400" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-orbitron">VISUAL MATRIX</h3>
                            <p className="text-xs text-slate-400">Customize interface color schemes.</p>
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



                {/* Operations Settings */}
                <div className="cyber-panel p-6 space-y-4 border-yellow-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                            <Wifi className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-orbitron">DATA OPERATIONS</h3>
                            <p className="text-xs text-slate-400">Bandwidth and Mapping controls.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                            <div className="flex items-center gap-2">
                                <Wifi className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-300 text-sm">Data Saver Mode</span>
                            </div>
                            <span className="text-xs text-cyan-500 uppercase font-bold tracking-wider">OFF</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                            <div className="flex items-center gap-2">
                                <Map className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-300 text-sm">Satellite Imagery</span>
                            </div>
                            <span className="text-xs text-green-500 uppercase font-bold tracking-wider">LIVE</span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="cyber-panel p-6 space-y-4 border-green-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                            <Bell className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-orbitron">COMMS LINK</h3>
                            <p className="text-xs text-slate-400">Manage incoming signal alerts.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded hover:bg-white/5 transition-colors">
                            <span className="text-slate-300 text-sm">Hazard Detection</span>
                            <div onClick={toggleNotifications} className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative ${notificationsEnabled ? 'bg-green-600' : 'bg-slate-600'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded hover:bg-white/5 transition-colors">
                            <span className="text-slate-300 text-sm">Vessel Status Changes</span>
                            <div className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative bg-green-600`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all left-6`}></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded hover:bg-white/5 transition-colors">
                            <span className="text-slate-300 text-sm">System Updates</span>
                            <div className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative bg-slate-600`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all left-1`}></div>
                            </div>
                        </div>
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

                    <button className="w-full py-3 bg-red-600/20 hover:bg-red-600/40 border border-red-500 text-red-100 text-sm font-bold uppercase rounded flex items-center justify-center gap-2 group transition-all animate-pulse">
                        <AlertTriangle className="w-5 h-5" /> EMERGENCY SOS BEACON
                    </button>
                    <button className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-500 text-sm font-bold uppercase rounded flex items-center justify-center gap-2 group transition-all">
                        <Power className="w-4 h-4 group-hover:scale-110 transition-transform" /> Terminate Session
                    </button>
                </div>

            </div>
        </div >
    );
};

export default SettingsPage;
