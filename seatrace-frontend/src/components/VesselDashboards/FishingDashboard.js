import React from 'react';
import { Fish, Anchor, Scale, Map, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const FishingDashboard = ({ vessel }) => {
    const catchData = [
        { name: 'Tuna', value: 400 },
        { name: 'Mackerel', value: 300 },
        { name: 'Sardine', value: 300 },
        { name: 'Bycatch', value: 50 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const zoneData = [
        { name: 'Zone A', yield: 80, limit: 100 },
        { name: 'Zone B', yield: 45, limit: 120 },
        { name: 'Zone C', yield: 95, limit: 100 },
    ];

    return (
        <div className="space-y-6 animate-slide-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 p-4 rounded-xl border border-cyan-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-cyan-400 text-xs uppercase tracking-wider">Total Catch</p>
                            <h3 className="text-2xl font-bold text-white font-orbitron">1,050 <span className="text-sm text-gray-400">tons</span></h3>
                        </div>
                        <Fish className="text-cyan-500 w-6 h-6" />
                    </div>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl border border-cyan-500/20">
                    <div>
                        <p className="text-green-400 text-xs uppercase tracking-wider">Sustainable Limit</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-white font-orbitron">88%</h3>
                            <span className="text-xs text-green-500 mb-1">SAFE</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 mt-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: '88%' }}></div>
                    </div>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl border border-cyan-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-yellow-400 text-xs uppercase tracking-wider">Zone Status</p>
                            <h3 className="text-xl font-bold text-white font-orbitron">Restricted</h3>
                        </div>
                        <Map className="text-yellow-500 w-6 h-6" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Approaching Marine Sanctuary</p>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl border border-cyan-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-400 text-xs uppercase tracking-wider">Market Value</p>
                            <h3 className="text-2xl font-bold text-white font-orbitron">$42.5k</h3>
                        </div>
                        <TrendingUp className="text-purple-500 w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Catch Composition */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                    <h4 className="text-cyan-100 font-rajdhani font-bold mb-4 flex items-center gap-2">
                        <Scale size={18} className="text-cyan-400" /> Catch Composition
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={catchData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {catchData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-gray-300">
                        {catchData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Zone Yield Analysis */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                    <h4 className="text-cyan-100 font-rajdhani font-bold mb-4 flex items-center gap-2">
                        <Anchor size={18} className="text-cyan-400" /> Zone Yield vs Limits
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={zoneData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip cursor={{ fill: 'rgba(6,182,212,0.1)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff' }} />
                                <Bar dataKey="yield" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Current Yield" />
                                <Bar dataKey="limit" fill="#334155" radius={[4, 4, 0, 0]} name="Limit" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FishingDashboard;
