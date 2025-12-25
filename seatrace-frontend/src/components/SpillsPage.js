import React from 'react';
import { Shield, Anchor, AlertTriangle } from 'lucide-react';

const SpillsPage = ({ oilSpills, userRole, vessels = [] }) => {
    const [selectedSpill, setSelectedSpill] = React.useState(null);

    // Helper to find linked vessel data
    const getLinkedVessel = (spillVesselName) => {
        return vessels.find(v => v.name?.toLowerCase() === spillVesselName?.toLowerCase());
    };

    if (userRole === 'viewer') {
        return <div className="text-white p-6">Access Restricted</div>;
    }

    return (
        <div className="space-y-6 animate-slide-in p-6 relative">
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
                    <div
                        key={spill.spill_id}
                        onClick={() => setSelectedSpill(spill)}
                        className="cyber-panel p-0 overflow-hidden group hover:border-red-500/50 transition-all duration-300 cursor-pointer active:scale-95"
                    >
                        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs border border-cyan-500/50 font-bold backdrop-blur-sm">TAP TO INSPECT</span>
                            </div>
                            <img
                                src={spill.image || 'https://images.unsplash.com/photo-1628126233061-0b445853b02c?auto=format&fit=crop&q=80'}
                                alt={spill.spill_id}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1628126233061-0b445853b02c?auto=format&fit=crop&q=80' }}
                            />
                            {/* ... labels ... */}
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
                                    {getLinkedVessel(spill.vessel_name) && (
                                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-600/80 text-white border border-blue-400/50 flex items-center gap-1">
                                            <Anchor className="w-3 h-3" /> AIS LINKED
                                        </span>
                                    )}
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
                                    <div className="text-xs text-slate-400 mt-1">
                                        ID: {spill.spill_id}
                                    </div>
                                </div>
                                {/* Stats */}
                                <div className="col-span-1">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Spill Size</span>
                                    <span className="text-slate-300 font-medium">{spill.size_tons} tons</span>
                                </div>
                                <div className="col-span-1">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Affected Area</span>
                                    <span className="text-slate-300 font-medium">{spill.estimated_area_km2} km²</span>
                                </div>
                                <div className="col-span-1">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Status</span>
                                    <span className="text-slate-300 font-medium capitalize">{spill.status}</span>
                                </div>
                                <div className="col-span-1">
                                    <span className="text-slate-500 text-xs uppercase block mb-0.5">Reported</span>
                                    <span className="text-slate-400 text-xs font-mono">{spill.timestamp ? new Date(spill.timestamp).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Interaction Modal */}
            {selectedSpill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-red-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.2)] relative flex flex-col">

                        {/* Modal Header */}
                        <div className="p-4 border-b border-red-500/20 flex items-center justify-between bg-red-950/20">
                            <h3 className="text-xl font-bold font-orbitron text-red-100 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" /> HAZARD ANALYSIS # {selectedSpill.spill_id}
                            </h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedSpill(null); }}
                                className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                            >
                                ✖
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">

                            {/* Vessel & AIS Link Section */}
                            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                                <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3 border-b border-cyan-500/20 pb-1">AIS Target Identification</h4>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="text-slate-500 text-xs">Vessel Name</div>
                                        <div className="text-xl text-white font-bold">{selectedSpill.vessel_name}</div>
                                    </div>
                                    {getLinkedVessel(selectedSpill.vessel_name) ? (
                                        <div className="flex-1 bg-cyan-900/20 p-2 rounded border border-cyan-500/30">
                                            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live AIS Signal
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                                                <div>Flag: <span className="text-white">{getLinkedVessel(selectedSpill.vessel_name).flag}</span></div>
                                                <div>Type: <span className="text-white">{getLinkedVessel(selectedSpill.vessel_name).type}</span></div>
                                                <div>IMO: <span className="text-white font-mono">{getLinkedVessel(selectedSpill.vessel_name).imo}</span></div>
                                                <div>Speed: <span className="text-white">{getLinkedVessel(selectedSpill.vessel_name).speed} kts</span></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 bg-slate-800 p-2 rounded border border-slate-600 border-dashed flex items-center justify-center text-slate-500 text-xs italic">
                                            No Live AIS Signal Detected
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Risk Profile & Analysis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="cyber-panel border-red-500/30 p-4">
                                    <h4 className="text-xs font-bold text-red-500 uppercase mb-2">Impact Assessment</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Severity Level</span>
                                            <span className={`font-bold ${selectedSpill.severity === 'High' ? 'text-red-500' : 'text-yellow-500'}`}>{selectedSpill.severity}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Est. Cleanup Time</span>
                                            <span className="text-white font-mono">48-72 Hours</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Detection Conf.</span>
                                            <span className="text-cyan-400 font-mono">{selectedSpill.confidence}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div className="bg-red-500 h-full" style={{ width: `${selectedSpill.confidence}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="cyber-panel border-orange-500/30 p-4">
                                    <h4 className="text-xs font-bold text-orange-500 uppercase mb-2">Company Risk Profile</h4>
                                    <div className="text-xs text-slate-400 mb-2">
                                        Historical incident data for operator associated with {selectedSpill.vessel_name}.
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-3xl font-bold text-white">B+</div>
                                        <div className="text-xs text-green-400">Safety Rating</div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        2 Incidents in last 5 years. <br />
                                        Status: <span className="text-orange-400">Under Surveillance</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded uppercase tracking-wider text-sm transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                                    Deploy Response Team
                                </button>
                                <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded uppercase tracking-wider text-sm border border-slate-600 transition-all">
                                    Download Full Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpillsPage;
