import React from 'react';
import { Droplets, AlertTriangle, ShieldCheck, Thermometer, Wind } from 'lucide-react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const TankerDashboard = ({ vessel }) => {
    // Mock Pressure Data
    const tankData = [
        { name: 'Tank 1', uv: 31.47, pv: 2400, fill: '#ef4444' },
        { name: 'Tank 2', uv: 26.69, pv: 4567, fill: '#f97316' },
        { name: 'Tank 3', uv: 15.69, pv: 1398, fill: '#eab308' },
        { name: 'Tank 4', uv: 8.22, pv: 9800, fill: '#22c55e' },
    ];

    return (
        <div className="space-y-6 animate-slide-in">
            {/* Risk Alert Banner */}
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                    <AlertTriangle className="text-red-500 w-8 h-8" />
                    <div>
                        <h3 className="text-red-200 font-bold font-orbitron">HAZARD MONITORING ACTIVE</h3>
                        <p className="text-red-300/70 text-sm">Continuous hull integrity scanning in progress.</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-red-400 uppercase">Spill Probability</p>
                    <div className="text-2xl font-bold text-red-100">0.02%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tank Pressure Monitor */}
                <div className="col-span-2 bg-slate-900/50 p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                    <h4 className="text-cyan-100 font-rajdhani font-bold mb-4 flex items-center gap-2">
                        <Droplets size={18} className="text-cyan-400" /> Tank Pressure Loads
                    </h4>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart innerRadius="10%" outerRadius="80%" barSize={10} data={tankData}>
                                <RadialBar
                                    minAngle={15}
                                    label={{ position: 'insideStart', fill: '#fff' }}
                                    background
                                    clockWise
                                    dataKey="uv"
                                />
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ color: '#94a3b8' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ef4444', color: '#fff' }} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vital Reads */}
                <div className="space-y-4">
                    <div className="bg-slate-800/80 p-5 rounded-xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
                        <Thermometer className="text-cyan-400 w-8 h-8 mb-2" />
                        <p className="text-xs text-gray-400 uppercase">Cargo Temp</p>
                        <h3 className="text-2xl font-bold text-white font-orbitron">4.2°C</h3>
                        <span className="text-xs text-green-500">Stable</span>
                    </div>
                    <div className="bg-slate-800/80 p-5 rounded-xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
                        <Wind className="text-cyan-400 w-8 h-8 mb-2" />
                        <p className="text-xs text-gray-400 uppercase">Vapor Pressure</p>
                        <h3 className="text-2xl font-bold text-white font-orbitron">102 kPa</h3>
                        <span className="text-xs text-yellow-500">Elevated</span>
                    </div>
                    <div className="bg-slate-800/80 p-5 rounded-xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
                        <ShieldCheck className="text-green-400 w-8 h-8 mb-2" />
                        <p className="text-xs text-gray-400 uppercase">Safety Systems</p>
                        <h3 className="text-xl font-bold text-white font-orbitron">ONLINE</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TankerDashboard;
