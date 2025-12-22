
import React, { useState } from 'react';
import { Search, Filter, Ship, Anchor, Navigation, Package, DollarSign, MapPin } from 'lucide-react';

const VesselsPage = ({ vessels }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    // Convert object to array if needed
    const vesselsList = Array.isArray(vessels) ? vessels : Object.values(vessels || {});

    const filteredVessels = vesselsList.filter(vessel => {
        const matchesSearch = vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vessel.imo.toString().includes(searchTerm);
        const matchesType = filterType === 'All' || vessel.type === filterType;
        return matchesSearch && matchesType;
    });

    const uniqueTypes = ['All', ...new Set(vesselsList.map(v => v.type))];

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search vessels or IMO..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-8 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none appearance-none"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            {uniqueTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="text-cyan-400 font-mono text-sm">
                    FLEET COUNT: <span className="text-white font-bold text-lg">{filteredVessels.length}</span> / {vesselsList.length}
                </div>
            </div>

            {/* Vessels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVessels.map((vessel) => (
                    <div key={vessel.imo} className="cyber-panel group relative overflow-hidden bg-slate-900 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
                        {/* Image Section */}
                        <div className="h-48 w-full relative overflow-hidden bg-slate-800">
                            <img
                                src={vessel.image || `https://source.unsplash.com/400x300/?ship,${vessel.type}`}
                                alt={vessel.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-75 group-hover:brightness-100"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/20">
                                IMO: {vessel.imo}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-900 to-transparent">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${vessel.risk_level === 'High' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                                    <span className="text-xs text-white font-mono">{vessel.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="p-4 space-y-3">
                            <div>
                                <h3 className="text-lg font-bold text-white font-orbitron truncate" title={vessel.name}>{vessel.name}</h3>
                                <div className="text-sm text-slate-400 flex items-center gap-1">
                                    <Ship className="w-3 h-3" /> {vessel.type} • {vessel.flag}
                                </div>
                            </div>

                            {/* Cargo Manifest (FMCG Data) */}
                            {vessel.cargo_manifest && (
                                <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-xs space-y-1">
                                    <div className="flex items-center gap-1 text-cyan-400 font-bold uppercase border-b border-slate-700 pb-1 mb-1">
                                        <Package className="w-3 h-3" /> Cargo Manifest
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Owner:</span>
                                        <span className="text-white">{vessel.cargo_manifest.major_brand}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Type:</span>
                                        <span className="text-cyan-100">{vessel.cargo_manifest.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Value:</span>
                                        <span className="text-green-400">{vessel.cargo_manifest.value_est_usd}</span>
                                    </div>
                                </div>
                            )}

                            {/* Route Info */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                    <div className="text-slate-500 flex items-center gap-1 mb-1">
                                        <Navigation className="w-3 h-3" /> Speed
                                    </div>
                                    <div className="text-white font-mono">{vessel.speed} kn</div>
                                </div>
                                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                    <div className="text-slate-500 flex items-center gap-1 mb-1">
                                        <MapPin className="w-3 h-3" /> Destination
                                    </div>
                                    <div className="text-white font-mono truncate" title={vessel.destination}>{vessel.destination}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredVessels.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <Ship className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-mono">No vessels found matching your filters.</p>
                </div>
            )}
        </div>
    );
};

export default VesselsPage;
