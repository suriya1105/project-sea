import React, { useState } from 'react';
import { CloudLightning, Wind, CloudRain, Navigation, Thermometer, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const StormWatch = () => {

    // Mock Forecast Data
    const forecastData = [
        { time: '00:00', wind: 20, wave: 2.5 },
        { time: '04:00', wind: 45, wave: 4.2 },
        { time: '08:00', wind: 80, wave: 6.8 }, // Storm Peak
        { time: '12:00', wind: 65, wave: 5.5 },
        { time: '16:00', wind: 40, wave: 3.5 },
        { time: '20:00', wind: 25, wave: 2.8 },
    ];

    return (
        <div className="h-full w-full p-6 space-y-6 overflow-y-auto custom-scrollbar animate-fade-in bg-slate-900">

            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-indigo-500 flex items-center gap-3">
                        <CloudLightning className="w-8 h-8 text-yellow-400" /> STORM WATCH PREDICTOR
                    </h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Advanced Meteorological Intelligence</p>
                </div>
                <div className="bg-slate-800 border border-yellow-500/30 px-4 py-2 rounded-lg flex items-center gap-4">
                    <span className="text-yellow-500 font-bold border-r border-slate-600 pr-4">SECTOR 7</span>
                    <span className="text-slate-300 text-sm">Condition: <span className="text-red-400 font-bold">SEVERE</span></span>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex items-start gap-4 animate-pulse-slow">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                    <h3 className="text-red-400 font-bold">STORM FRONT 'CYCLOPS' DETECTED</h3>
                    <p className="text-xs text-red-200/70">
                        Class 4 automated warning. All vessels in quadrants 4-Alpha through 9-Zulu are advised to reroute immediately.
                        Estimated impact: T-minus 4 hours.
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-indigo-950 rounded-full"><Wind className="w-6 h-6 text-indigo-400" /></div>
                    <div>
                        <div className="text-xs text-indigo-300 uppercase">Wind Speed</div>
                        <div className="text-2xl font-bold text-white">82 <span className="text-sm font-normal">kts</span></div>
                    </div>
                </div>
                <div className="bg-cyan-900/30 border border-cyan-500/30 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-cyan-950 rounded-full"><CloudRain className="w-6 h-6 text-cyan-400" /></div>
                    <div>
                        <div className="text-xs text-cyan-300 uppercase">Precipitation</div>
                        <div className="text-2xl font-bold text-white">45 <span className="text-sm font-normal">mm/h</span></div>
                    </div>
                </div>
                <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-purple-950 rounded-full"><Navigation className="w-6 h-6 text-purple-400" /></div>
                    <div>
                        <div className="text-xs text-purple-300 uppercase">Pressure</div>
                        <div className="text-2xl font-bold text-white">984 <span className="text-sm font-normal">hPa</span></div>
                    </div>
                </div>
                <div className="bg-orange-900/30 border border-orange-500/30 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-orange-950 rounded-full"><Thermometer className="w-6 h-6 text-orange-400" /></div>
                    <div>
                        <div className="text-xs text-orange-300 uppercase">Air Temp</div>
                        <div className="text-2xl font-bold text-white">18.4 <span className="text-sm font-normal">°C</span></div>
                    </div>
                </div>
            </div>

            {/* Forecast Chart */}
            <div className="bg-slate-900/80 border border-slate-700/50 p-6 rounded-xl h-80 flex flex-col">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">48-Hour Intensity Forecast</h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="wind" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4 }} name="Wind (kts)" />
                            <Line type="monotone" dataKey="wave" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Wave Height (m)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Radar Map Placeholder */}
            <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590552515252-3a5a1bce71bd?q=80&w=800')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-transparent"></div>
                <div className="absolute bottom-6 left-6 grid gap-1">
                    <h3 className="text-xl font-bold text-white">SATELLITE RADAR VIEW</h3>
                    <p className="text-xs text-slate-400">Live feed from MeteoSat-9</p>
                </div>
                <div className="absolute top-4 right-4 animate-pulse">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </div>

        </div>
    );
};

export default StormWatch;
