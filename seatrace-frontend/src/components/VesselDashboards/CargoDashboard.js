import React from 'react';
import { Package, Truck, Clock, Navigation, Zap, Battery } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CargoDashboard = ({ vessel }) => {
    const efficiencyData = [
        { time: '00:00', efficiency: 92 },
        { time: '04:00', efficiency: 88 },
        { time: '08:00', efficiency: 95 },
        { time: '12:00', efficiency: 90 },
        { time: '16:00', efficiency: 85 },
        { time: '20:00', efficiency: 91 },
    ];

    return (
        <div className="space-y-6 animate-slide-in">
            {/* Cargo Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 p-6 rounded-xl border border-cyan-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={64} className="text-cyan-500" />
                    </div>
                    <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Container Load</p>
                    <h3 className="text-3xl font-bold text-white font-orbitron">12,450 <span className="text-sm font-sans text-gray-400">TEU</span></h3>
                    <div className="w-full bg-slate-700 h-2 mt-4 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-1">92% Capacity</p>
                </div>

                <div className="bg-slate-800/80 p-6 rounded-xl border border-cyan-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={64} className="text-purple-500" />
                    </div>
                    <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">ETA Destination</p>
                    <h3 className="text-3xl font-bold text-white font-orbitron">14h 30m</h3>
                    <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                        <Navigation size={14} className="text-purple-400" /> Port of Singapore
                    </p>
                </div>

                <div className="bg-slate-800/80 p-6 rounded-xl border border-cyan-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={64} className="text-yellow-500" />
                    </div>
                    <p className="text-yellow-400 text-xs uppercase tracking-wider mb-1">Fuel Efficiency</p>
                    <h3 className="text-3xl font-bold text-white font-orbitron">Good</h3>
                    <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                        <Battery size={14} className="text-yellow-400" /> Optimization Active
                    </p>
                </div>
            </div>

            {/* Route & Efficiency Graph */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-cyan-100 font-rajdhani font-bold flex items-center gap-2">
                        <Truck size={18} className="text-cyan-400" /> Engine Performance Log
                    </h4>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">Stable</span>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={efficiencyData}>
                            <defs>
                                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff' }} />
                            <Area type="monotone" dataKey="efficiency" stroke="#06b6d4" fillOpacity={1} fill="url(#colorEff)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default CargoDashboard;
