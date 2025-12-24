import React from 'react';
import { Shield, Anchor, AlertTriangle } from 'lucide-react';

const SpillsPage = ({ oilSpills, userRole }) => {
    if (userRole === 'viewer') {
        return <div className="text-white p-6">Access Restricted</div>;
    }

    return (
        <div className="space-y-6 animate-slide-in p-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-500" />
                    INCIDENT RESPONSE LOG
                </h2>
                <div className="text-sm text-red-400/70 font-mono border border-red-500/30 px-3 py-1 rounded bg-slate-900/50">
                    ACTIVE HAZARDS: {oilSpills.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {oilSpills.map(spill => (
                    <div key={spill.spill_id} className="cyber-panel p-0 overflow-hidden group hover:border-red-500/50 transition-all duration-300">
                        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                            <img
                                src={spill.image || 'https://images.unsplash.com/photo-1628126233061-0b445853b02c?auto=format&fit=crop&q=80'}
                                alt={spill.spill_id}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1628126233061-0b445853b02c?auto=format&fit=crop&q=80' }}
                            />
                            <div className="absolute top-3 right-3 z-20">
                                <span className="px-3 py-1 rounded bg-slate-900/80 backdrop-blur border border-red-500/50 text-red-400 text-xs font-bold font-mono">
                                    CONFIDENCE: {spill.confidence}%
                                </span>
                            </div>
                            <div className="absolute bottom-3 left-4 z-20">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${spill.severity === 'High' ? 'bg-red-600/80 text-white' :
                                        spill.severity === 'Medium' ? 'bg-orange-500/80 text-white' :
                                            'bg-yellow-500/80 text-white'
                                        }`}>
                                        {spill.severity} SEVERITY
                                    </span>
                                    <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-600">ID: {spill.spill_id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-4 bg-slate-900/40">
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                <div className="col-span-2 border-b border-slate-700/50 pb-2 mb-1">
                                    <span className="text-slate-500 text-xs uppercase block">Related Vessel</span>
                                    <div className="text-white font-bold font-orbitron text-lg flex items-center gap-2">
                                        <Anchor className="w-4 h-4 text-cyan-500" /> {spill.vessel_name}
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Spill Size</span>
                                    <span className="text-slate-300 font-medium">{spill.size_tons} tons</span>
                                </div>
                                <div className="col-span-1">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Affected Area</span>
                                    <span className="text-slate-300 font-medium">{spill.estimated_area_km2} km²</span>
                                </div>
                                <div className="col-span-1">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Location</span>
                                    <span className="text-cyan-400 font-mono text-xs">{spill.lat.toFixed(3)}°N, {spill.lon.toFixed(3)}°E</span>
                                </div>
                                <div className="col-span-1">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Status</span>
                                    <span className="text-slate-300 font-medium capitalize">{spill.status}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Reported Time</span>
                                    <span className="text-slate-400 text-xs font-mono">{spill.timestamp ? new Date(spill.timestamp).toLocaleString() : 'Timestamp unavailable'}</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-700/50">
                                <button className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/60 text-red-400 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 group-hover:animate-pulse">
                                    <Shield className="w-4 h-4" /> Initiate Cleanup Protocol
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpillsPage;
