import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, AlertOctagon, Terminal, Server, Wifi, Globe, Activity } from 'lucide-react';

const CyberDefense = () => {
    const [logs, setLogs] = useState([]);
    const [firewallStatus, setFirewallStatus] = useState(100);
    const [threatLevel, setThreatLevel] = useState('LOW');

    // Simulate logs
    useEffect(() => {
        const interval = setInterval(() => {
            const events = [
                { type: 'INFO', msg: 'Packet filtering active on Port 8080' },
                { type: 'WARN', msg: 'Unusual traffic detected from IP 192.168.X.X' },
                { type: 'SUCCESS', msg: 'Handshake completed with SatLink Alpha' },
                { type: 'BLOCK', msg: 'Inbound connection refused: Known malice' }
            ];
            const event = events[Math.floor(Math.random() * events.length)];
            const newLog = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                ...event
            };
            setLogs(prev => [newLog, ...prev].slice(0, 15));

            // Random threat fluctuation
            if (Math.random() > 0.8) {
                setFirewallStatus(prev => Math.max(90, prev - Math.floor(Math.random() * 5)));
            } else {
                setFirewallStatus(prev => Math.min(100, prev + 1));
            }
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full w-full p-6 space-y-6 overflow-y-auto custom-scrollbar animate-fade-in bg-slate-950">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-red-900/30 pb-4">
                <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-red-500 animate-pulse" />
                    <div>
                        <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
                            CYBER DEFENSE HUB
                        </h2>
                        <p className="text-xs font-mono text-red-400/60">SEATRACE SECURITY COMMAND</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-end">
                        <div className="text-xs text-slate-500 uppercase">Threat Level</div>
                        <div className={`font-bold font-orbitron text-lg ${threatLevel === 'LOW' ? 'text-green-500' : 'text-red-500'}`}>{threatLevel}</div>
                    </div>
                    <Activity className="w-12 h-6 text-red-500" />
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Firewall Monitor */}
                <div className="bg-slate-900/50 border border-red-500/20 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Lock className="w-24 h-24 text-red-500" />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-red-400 mb-4 flex items-center gap-2">
                        <Server className="w-4 h-4" /> FIREWALL INTEGRITY
                    </h3>

                    <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="#1e293b" strokeWidth="12" fill="none" />
                            <circle
                                cx="96" cy="96" r="88"
                                stroke={firewallStatus > 95 ? '#22c55e' : '#ef4444'}
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={552}
                                strokeDashoffset={552 - (552 * firewallStatus) / 100}
                                className="transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <div className="text-4xl font-bold text-white font-mono">{firewallStatus}%</div>
                            <div className="text-xs text-slate-400 uppercase">Operational</div>
                        </div>
                    </div>
                </div>

                {/* Intrusion Detection Log */}
                <div className="lg:col-span-2 bg-black border border-slate-700/50 rounded-xl p-4 font-mono text-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex flex-col h-[350px]">
                    <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2 mb-2">
                        <span className="flex items-center gap-2"><Terminal className="w-4 h-4" /> LIVE TRAFFIC LOGS</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-2">
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-3 text-xs opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-slate-600">[{log.timestamp}]</span>
                                <span className={`font-bold w-16 ${log.type === 'BLOCK' ? 'text-red-500' :
                                        log.type === 'WARN' ? 'text-yellow-500' :
                                            log.type === 'SUCCESS' ? 'text-green-500' : 'text-blue-500'
                                    }`}>{log.type}</span>
                                <span className="text-slate-300">{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Connections */}
                <div className="bg-slate-900/50 border border-cyan-500/20 p-6 rounded-xl">
                    <h3 className="text-lg font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> SECURE UPLINKS
                    </h3>
                    <div className="space-y-3">
                        {['SatLink-Alpha', 'SatLink-Beta', 'HQ-Mainframe', 'Field-Ops-Relay'].map((link, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-4 h-4 text-cyan-600" />
                                    <span className="text-slate-200 text-sm">{link}</span>
                                </div>
                                <span className="text-[10px] bg-green-900/20 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">
                                    ENCRYPTED
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Access Control */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-orange-500/20 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-mono font-bold text-orange-400 mb-1 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> BIOMETRIC OVERWATCH
                        </h3>
                        <p className="text-xs text-slate-400">Monitoring 42 active personnel sessions.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-4 border-r border-slate-700">
                            <div className="text-2xl font-bold text-white">0</div>
                            <div className="text-[10px] text-slate-500 uppercase">Flags</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-2xl font-bold text-white">100%</div>
                            <div className="text-[10px] text-slate-500 uppercase">Auth Rate</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CyberDefense;
