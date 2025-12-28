import React, { useState, useEffect } from 'react';
import { Heart, Activity, User, AlertCircle, Thermometer, Wind, Zap } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const CrewMemberCard = ({ name, role, status, image }) => {
    // Simulate live heart rate data
    const [data, setData] = useState(Array(20).fill(0).map(() => ({ value: 60 + Math.random() * 20 })));
    const [bpm, setBpm] = useState(72);
    const [stress, setStress] = useState(12);

    useEffect(() => {
        const interval = setInterval(() => {
            const newBpm = 60 + Math.random() * 40 + (status === 'Critical' ? 40 : 0);
            setBpm(Math.floor(newBpm));
            setStress(Math.floor(newBpm / 2));

            setData(prev => {
                const newData = [...prev.slice(1), { value: newBpm }];
                return newData;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [status]);

    return (
        <div className={`cyber-panel p-4 flex gap-4 ${status === 'Critical' ? 'border-red-500/50 bg-red-900/10' : ''}`}>
            {/* Avatar & Info */}
            <div className="flex flex-col items-center gap-2 min-w-[100px]">
                <div className="relative">
                    <img
                        src={image}
                        alt={name}
                        className={`w-20 h-20 rounded-lg object-cover border-2 ${status === 'Critical' ? 'border-red-500' : 'border-cyan-500/50'}`}
                    />
                    <div className={`absolute -bottom-2 -right-2 p-1 rounded-full border border-black ${status === 'Critical' ? 'bg-red-500' : 'bg-green-500'}`}>
                        <Activity className="w-3 h-3 text-black" />
                    </div>
                </div>
                <div className="text-center">
                    <div className="font-bold text-white text-sm">{name}</div>
                    <div className="text-[10px] text-cyan-400 uppercase tracking-widest">{role}</div>
                </div>
            </div>

            {/* Vitals Graphs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Heart Rate */}
                <div className="bg-slate-900/50 p-2 rounded border border-cyan-500/20 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                            <Heart className={`w-3 h-3 ${status === 'Critical' ? 'text-red-500 animate-ping' : 'text-cyan-500'}`} /> HR (BPM)
                        </span>
                        <span className={`text-xl font-mono font-bold leading-none ${status === 'Critical' ? 'text-red-500' : 'text-green-400'}`}>
                            {bpm}
                        </span>
                    </div>
                    <div className="h-10 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={status === 'Critical' ? '#ef4444' : '#22c55e'}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 p-2 rounded border border-cyan-500/20">
                        <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-500" /> Stress
                        </div>
                        <div className="text-lg font-mono font-bold text-yellow-400">{stress}%</div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-cyan-500/20">
                        <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                            <Wind className="w-3 h-3 text-blue-400" /> O2 Sat
                        </div>
                        <div className="text-lg font-mono font-bold text-blue-400">98%</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CrewPage = ({ vessels }) => {
    // Mock crew data
    const crew = [
        { id: 1, name: "Cpt. Sarah Vance", role: "Commander", status: "Active", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" },
        { id: 2, name: "Lt. Mike Ross", role: "Engineering", status: "Critical", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" },
        { id: 3, name: "Off. Elena K.", role: "Navigator", status: "Active", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" },
        { id: 4, name: "Dr. Aris Thorne", role: "Medical", status: "Active", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200" },
    ];

    return (
        <div className="p-6 h-full overflow-y-auto animate-slide-in">
            <h2 className="text-2xl font-orbitron text-cyan-400 mb-6 flex items-center gap-3">
                <div className="p-2 border border-cyan-500 rounded-full bg-cyan-900/20">
                    <User className="w-6 h-6" />
                </div>
                PERSONNEL BIOMETRICS MONITORING
                <span className="text-xs font-mono bg-cyan-900 text-cyan-200 px-2 py-1 rounded ml-4 border border-cyan-500/30">
                    LIVE FEED: ACTIVE
                </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Crew List */}
                <div className="space-y-4">
                    {crew.map(member => (
                        <CrewMemberCard key={member.id} {...member} />
                    ))}
                </div>

                {/* Overall Ship Status */}
                <div className="space-y-6">
                    <div className="cyber-panel border-yellow-500/50 bg-yellow-900/5">
                        <h3 className="text-yellow-500 font-bold mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> MEDICAL ALERTS
                        </h3>
                        <div className="space-y-2">
                            <div className="bg-red-500/10 border-l-4 border-red-500 p-3 text-xs text-slate-300">
                                <span className="text-red-400 font-bold block mb-1">HIGH STRESS DETECTED - ENGINEERING</span>
                                Lt. Ross is showing elevated cortisol levels and rapid heart rate variability. Recommendation: Immediate relief from duty.
                            </div>
                            <div className="bg-slate-900/50 border-l-4 border-cyan-500 p-3 text-xs text-slate-300">
                                <span className="text-cyan-400 font-bold block mb-1">ROUTINE SCAN COMPLETE</span>
                                All other personnel within nominal range. Next scheduled bi-scan in 04:00 hours.
                            </div>
                        </div>
                    </div>

                    <div className="cyber-panel">
                        <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                            <Thermometer className="w-5 h-5" /> ENVIRONMENTAL HEALTH
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-slate-900 p-3 rounded border border-cyan-500/20">
                                <div className="text-2xl font-bold text-white">21°C</div>
                                <div className="text-[10px] text-slate-500 uppercase">Cabin Temp</div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded border border-cyan-500/20">
                                <div className="text-2xl font-bold text-white">45%</div>
                                <div className="text-[10px] text-slate-500 uppercase">Humidity</div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded border border-cyan-500/20">
                                <div className="text-2xl font-bold text-white">0.2</div>
                                <div className="text-[10px] text-slate-500 uppercase">Radiation (mSv)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrewPage;
