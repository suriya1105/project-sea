import React, { useState } from 'react';
import { Leaf, Droplet, Wind, AlertTriangle, TrendingDown, Thermometer, Info, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const EcoScanner = () => {
    const [scanActive, setScanActive] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);

    const ecoData = [
        { time: '00:00', carbon: 450, toxicity: 12 },
        { time: '04:00', carbon: 420, toxicity: 15 },
        { time: '08:00', carbon: 580, toxicity: 20 },
        { time: '12:00', carbon: 650, toxicity: 25 },
        { time: '16:00', carbon: 600, toxicity: 18 },
        { time: '20:00', carbon: 480, toxicity: 14 },
    ];

    const handleScan = () => {
        setScanActive(true);
        setScanProgress(0);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setScanActive(false);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);
    };

    return (
        <div className="h-full w-full p-4 md:p-6 space-y-6 overflow-y-auto animate-fade-in custom-scrollbar">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 flex items-center gap-3">
                        <Leaf className="w-8 h-8 text-green-500" /> ECO-SCANNER
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time Environmental Impact Analysis</p>
                </div>

                <button
                    onClick={handleScan}
                    disabled={scanActive}
                    className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all relative overflow-hidden group ${scanActive ? 'bg-green-900/50 text-green-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {scanActive ? 'Scanning...' : 'Initiate Scan'}
                        <Wind className={scanActive ? 'animate-spin' : ''} />
                    </span>
                    {scanActive && (
                        <div className="absolute inset-0 bg-green-500/20" style={{ width: `${scanProgress}%`, transition: 'width 0.1s linear' }}></div>
                    )}
                </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Carbon Footprint */}
                <div className="bg-slate-900/80 border border-green-500/20 p-6 rounded-xl backdrop-blur relative overflow-hidden group hover:border-green-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown className="w-24 h-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm font-rajdhani font-bold text-slate-400 uppercase tracking-widest mb-1">Regional Carbon Index</div>
                        <div className="text-4xl font-mono font-bold text-white mb-2">412 <span className="text-lg text-slate-500">ppm</span></div>
                        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded w-fit">
                            <TrendingDown className="w-3 h-3" /> -2.4% vs Yesterday
                        </div>
                    </div>
                    <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[65%]"></div>
                    </div>
                </div>

                {/* Water Toxicity */}
                <div className="bg-slate-900/80 border border-red-500/20 p-6 rounded-xl backdrop-blur relative overflow-hidden group hover:border-red-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm font-rajdhani font-bold text-slate-400 uppercase tracking-widest mb-1">Water Toxicity Levels</div>
                        <div className="text-4xl font-mono font-bold text-white mb-2">SAFE <span className="text-lg text-slate-500">Trace</span></div>
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded w-fit">
                            <AlertTriangle className="w-3 h-3" /> Contaminant Alert: Zone 4
                        </div>
                    </div>
                    <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[12%] animate-pulse"></div>
                    </div>
                </div>

                {/* Ocean Temp */}
                <div className="bg-slate-900/80 border border-cyan-500/20 p-6 rounded-xl backdrop-blur relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Thermometer className="w-24 h-24 text-cyan-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm font-rajdhani font-bold text-slate-400 uppercase tracking-widest mb-1">Surface Temperature</div>
                        <div className="text-4xl font-mono font-bold text-white mb-2">24.8°C <span className="text-lg text-slate-500">+0.4°</span></div>
                        <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded w-fit">
                            <Info className="w-3 h-3" /> Nominal Range
                        </div>
                    </div>
                    <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 w-[45%]"></div>
                    </div>
                </div>
            </div>

            {/* Analysis Chart */}
            <div className="bg-slate-900/80 border border-slate-700/50 p-6 rounded-xl backdrop-blur h-96 flex flex-col">
                <h3 className="text-lg font-rajdhani font-bold text-slate-200 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" /> ENVIRONMENTAL TREND ANALYSIS
                </h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ecoData}>
                            <defs>
                                <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTox" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Area type="monotone" dataKey="carbon" stroke="#22c55e" fillOpacity={1} fill="url(#colorCarbon)" name="Carbon PPM" />
                            <Area type="monotone" dataKey="toxicity" stroke="#ef4444" fillOpacity={1} fill="url(#colorTox)" name="Toxicity Index" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Biodiversity Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-[url('https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=600')] bg-cover bg-center mask-linear-fade opacity-30"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2">Marine Biodiversity Health</h3>
                    <p className="text-slate-400 max-w-lg mb-6">
                        AI analysis of spectral imaging suggests a 15% increase in coral bleaching risk in Sector 7.
                        Recommendation: Restrict heavy vessel traffic in protected zones.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-slate-950/50 border border-slate-700 px-4 py-2 rounded-lg">
                            <div className="text-xs text-slate-500 uppercase">Whale Migration</div>
                            <div className="text-green-400 font-bold">Safe Corridor</div>
                        </div>
                        <div className="bg-slate-950/50 border border-slate-700 px-4 py-2 rounded-lg">
                            <div className="text-xs text-slate-500 uppercase">Algae Bloom</div>
                            <div className="text-yellow-400 font-bold">Moderate Risk</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EcoScanner;
