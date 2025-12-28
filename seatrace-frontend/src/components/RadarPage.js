import React, { useState, useEffect } from 'react';
import { Target, Activity, Crosshair, Shield, Wifi, AlertTriangle, Wind, Info, Disc } from 'lucide-react';

// Actually, let's build a bigger, better one here relative to the page.

const RadarPage = ({ vessels = [] }) => {
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [scanMode, setScanMode] = useState('ACTIVE');
    const [range, setRange] = useState(50);
    const [radarObjects, setRadarObjects] = useState([]);

    // Convert vessels to radar objects (mocking relative position)
    useEffect(() => {
        // In a real app, calculate relative bearing/range from user/center
        const objects = vessels.map(v => ({
            id: v.imo,
            name: v.name,
            type: v.type,
            // Mock polar coordinates
            angle: Math.random() * 360,
            distance: Math.random() * 80, // % of radar radius
            speed: v.speed,
            status: v.status
        }));
        setRadarObjects(objects);
    }, [vessels]);

    return (
        <div className="flex h-full p-6 gap-6 relative overflow-hidden animate-slide-in">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #155e75 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    opacity: 0.1
                }}>
            </div>

            {/* Main Radar Scope Area */}
            <div className="flex-1 cyber-panel relative flex flex-col">
                <div className="flex items-center justify-between mb-4 z-10">
                    <h2 className="text-2xl font-orbitron text-cyan-400 flex items-center gap-3">
                        <Target className="w-8 h-8 animate-pulse" />
                        TACTICAL RADAR ARRAY
                    </h2>
                    <div className="flex gap-2">
                        <div className="px-2 py-1 rounded bg-green-900/20 border border-green-500/30 text-green-400 text-xs font-bold flex items-center animate-pulse mr-2">
                            SYSTEM ONLINE
                        </div>
                        <button
                            onClick={() => setScanMode(scanMode === 'ACTIVE' ? 'PASSIVE' : 'ACTIVE')}
                            className={`px-4 py-1 rounded border text-sm font-bold font-mono transition-all ${scanMode === 'ACTIVE'
                                ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                : 'bg-cyan-900/40 border-cyan-500/30 text-cyan-500'
                                }`}
                        >
                            {scanMode === 'ACTIVE' ? '● ACTIVE SCAN' : '○ PASSIVE LISTEN'}
                        </button>
                        <div className="px-4 py-1 rounded border border-cyan-500/30 bg-slate-900/50 text-cyan-400 text-sm font-mono">
                            RNG: {range}NM
                        </div>
                    </div>
                </div>

                {/* The Big Radar */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden border border-cyan-500/20 rounded-full bg-slate-900/80 aspect-square mx-auto shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                    {/* Rings */}
                    {[25, 50, 75, 100].map((r, i) => (
                        <div key={r} className="absolute border border-cyan-500/20 rounded-full text-[10px] text-cyan-600 font-mono flex items-start justify-center pt-1"
                            style={{ width: `${r}%`, height: `${r}%` }}>
                            <span className="bg-slate-900/80 px-1 rounded -mt-2">{r}%</span>
                        </div>
                    ))}

                    {/* Crosshairs */}
                    <div className="absolute top-0 bottom-0 w-[1px] bg-cyan-500/20"></div>
                    <div className="absolute left-0 right-0 h-[1px] bg-cyan-500/20"></div>

                    {/* Sweep */}
                    <div className={`absolute top-0 left-0 w-[50%] h-[50%] origin-bottom-right border-r border-cyan-400/50 bg-gradient-to-l from-cyan-400/20 to-transparent z-10 ${scanMode === 'ACTIVE' ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_10s_linear_infinite] opacity-30'} rounded-[100%_0_0_0]`}></div>

                    {/* Targets */}
                    {radarObjects.map(obj => (
                        <button
                            key={obj.id}
                            onClick={() => setSelectedTarget(obj)}
                            className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-150 ${selectedTarget?.id === obj.id ? 'bg-yellow-400 shadow-[0_0_15px_yellow] ring-2 ring-yellow-200' : 'bg-red-500 shadow-[0_0_5px_red]'}`}
                            style={{
                                top: `${50 - (Math.sin(obj.angle * Math.PI / 180) * obj.distance / 2)}%`,
                                left: `${50 + (Math.cos(obj.angle * Math.PI / 180) * obj.distance / 2)}%`
                            }}
                        >
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-cyan-300 opacity-0 hover:opacity-100 transition-opacity font-mono pointer-events-none">
                                {obj.name}
                            </div>
                        </button>
                    ))}

                    {/* Center Own Ship */}
                    <div className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] z-20"></div>
                </div>
            </div>

            {/* Info Sidebar */}
            <div className="w-80 flex flex-col gap-6">

                {/* Selected Target Details */}
                <div className="cyber-panel h-1/2 flex flex-col">
                    <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 border-b border-cyan-500/30 pb-2">
                        <Crosshair className="w-5 h-5" /> TARGET LOCK
                    </h3>
                    {selectedTarget ? (
                        <div className="space-y-4 animate-slide-in">
                            <div className="bg-slate-800/50 p-3 rounded border border-cyan-500/20">
                                <div className="text-xs text-cyan-600 uppercase font-bold tracking-wider mb-1">Vessel ID</div>
                                <div className="text-xl text-white font-orbitron">{selectedTarget.name}</div>
                                <div className="text-xs text-yellow-500 font-mono mt-1">IMO: {selectedTarget.id}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-900/50 p-2 rounded">
                                    <div className="text-[10px] text-cyan-600">BEARING</div>
                                    <div className="text-cyan-400 font-mono">{selectedTarget.angle.toFixed(1)}°</div>
                                </div>
                                <div className="bg-slate-900/50 p-2 rounded">
                                    <div className="text-[10px] text-cyan-600">DISTANCE</div>
                                    <div className="text-cyan-400 font-mono">{(selectedTarget.distance * 0.5).toFixed(1)} NM</div>
                                </div>
                                <div className="bg-slate-900/50 p-2 rounded">
                                    <div className="text-[10px] text-cyan-600">SPEED</div>
                                    <div className="text-cyan-400 font-mono">{selectedTarget.speed} KTS</div>
                                </div>
                                <div className="bg-slate-900/50 p-2 rounded">
                                    <div className="text-[10px] text-cyan-600">THREAT</div>
                                    <div className={`font-mono ${selectedTarget.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                                        {selectedTarget.status === 'Active' ? 'LOW' : 'UNK'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-cyan-600/50 text-center p-4">
                            <Crosshair className="w-16 h-16 mb-2 opacity-50 animate-pulse" />
                            <p className="font-mono text-sm">SELECT TARGET ON RADAR<br />TO INITIALIZE LOCK</p>
                        </div>
                    )}
                </div>

                {/* Target List */}
                <div className="cyber-panel h-1/2 flex flex-col">
                    <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2 border-b border-cyan-500/30 pb-2">
                        <Activity className="w-5 h-5" /> SIGNATURES ({radarObjects.length})
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {radarObjects.map(obj => (
                            <div
                                key={obj.id}
                                onClick={() => setSelectedTarget(obj)}
                                className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-between group ${selectedTarget?.id === obj.id
                                    ? 'bg-cyan-900/40 border-cyan-400/50'
                                    : 'bg-slate-900/30 border-slate-700 hover:border-cyan-500/30 hover:bg-slate-800'
                                    }`}
                            >
                                <div>
                                    <div className={`text-sm font-bold ${selectedTarget?.id === obj.id ? 'text-white' : 'text-slate-300 group-hover:text-cyan-200'}`}>{obj.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{obj.type}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-cyan-500 font-mono">{(obj.distance * 0.5).toFixed(0)} NM</div>
                                    <div className="text-[10px] text-slate-600">{obj.angle.toFixed(0)}°</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RadarPage;
