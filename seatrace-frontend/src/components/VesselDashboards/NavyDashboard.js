import React from 'react';
import { Target, Radio, Crosshair } from 'lucide-react';

const NavyDashboard = ({ vessel }) => {
    const tacticalTargets = [
        { id: 'TGT-01', dist: '12nm', bearing: '220°', status: 'Neutral' },
        { id: 'TGT-02', dist: '4nm', bearing: '045°', status: 'Unknown' },
        { id: 'TGT-03', dist: '18nm', bearing: '180°', status: 'Friendly' },
    ];

    return (
        <div className="space-y-6 animate-slide-in">
            <div className="flex gap-4 items-center mb-4">
                <div className="px-3 py-1 bg-cyan-900/40 border border-cyan-500 text-cyan-400 text-xs font-mono rounded">
                    SECURE CHANNEL ESTABLISHED
                </div>
                <div className="px-3 py-1 bg-red-900/40 border border-red-500 text-red-400 text-xs font-mono rounded animate-pulse">
                    DEFCON 4
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tactical Radar Display */}
                <div className="bg-black/60 p-6 rounded-xl border border-cyan-500/30 relative aspect-square flex items-center justify-center overflow-hidden">
                    {/* Radar Rings */}
                    <div className="absolute inset-4 border border-cyan-900/50 rounded-full"></div>
                    <div className="absolute inset-12 border border-cyan-900/50 rounded-full"></div>
                    <div className="absolute inset-24 border border-cyan-900/50 rounded-full"></div>
                    <div className="absolute inset-36 border border-cyan-900/50 rounded-full"></div>

                    {/* Crosshairs */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-cyan-900/50"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-px bg-cyan-900/50"></div>
                    </div>

                    {/* Sweep Animation */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent rounded-full animate-spin-slow origin-center" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}></div>

                    {/* Center Ship */}
                    <div className="relative z-10 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>

                    {/* Random Blips */}
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>

                {/* Target List */}
                <div className="space-y-4">
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                        <h3 className="font-orbitron text-cyan-400 mb-4 flex items-center gap-2">
                            <Target size={18} /> DETECTED TARGETS
                        </h3>
                        <div className="space-y-2">
                            {tacticalTargets.map(tgt => (
                                <div key={tgt.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-cyan-500/10 hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <Crosshair size={14} className="text-gray-500 group-hover:text-cyan-400" />
                                        <div>
                                            <div className="text-sm font-bold text-gray-200">{tgt.id}</div>
                                            <div className="text-xs text-gray-500">RNG: {tgt.dist} | BRG: {tgt.bearing}</div>
                                        </div>
                                    </div>
                                    <div className={`text-xs px-2 py-0.5 rounded border ${tgt.status === 'Neutral' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                                        tgt.status === 'Unknown' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                                            'border-green-500/30 text-green-500 bg-green-500/10'
                                        }`}>
                                        {tgt.status.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mission Status */}
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                        <h3 className="font-orbitron text-cyan-400 mb-4 flex items-center gap-2">
                            <Radio size={18} /> MISSION PARAMETERS
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-cyan-300/80">
                            <div>
                                <span className="text-gray-500 block">PATROL ZONE</span>
                                <span className="text-white">SECTOR 4A</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">ROE</span>
                                <span className="text-white">WEAPONS TIGHT</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">COMMS</span>
                                <span className="text-white">ENCRYPTED</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">FUEL</span>
                                <span className="text-white">82%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavyDashboard;
