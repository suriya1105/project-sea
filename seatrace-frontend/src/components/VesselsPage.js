import React, { useState } from 'react';
import { Search, Filter, Ship, Anchor, Navigation, Package, DollarSign, MapPin, Flag, Activity, Plus } from 'lucide-react';

const VesselsPage = ({ vessels, onVesselSelect, onAddClick }) => {
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

    // Image set for vessels
    const vehicleImages = [
        "https://images.unsplash.com/photo-1542350719-7517c919d650?q=80&w=400",
        "https://images.unsplash.com/photo-1605218427368-35b84d4d6a78?q=80&w=400",
        "https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=400",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400",
        "https://images.unsplash.com/photo-1559825481-12a05cc00f08?q=80&w=400",
        "https://images.unsplash.com/photo-1563861826-6b5a791a9a88?q=80&w=400"
    ];

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <Anchor className="w-6 h-6" /> Vessel Registry
                </h1>
                <button
                    onClick={onAddClick}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all hover:scale-105"
                >
                    <Plus className="w-4 h-4" /> REGISTER NEW SHIP
                </button>
            </div>

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
                {filteredVessels.map((vessel, index) => (
                    <div
                        key={vessel.imo || index}
                        onClick={() => typeof onVesselSelect === 'function' && onVesselSelect(vessel)}
                        className="bg-slate-800/80 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group relative cursor-pointer"
                    >
                        {/* Image Section */}
                        <div className="h-40 w-full relative overflow-hidden bg-slate-800">
                            <img
                                src={vehicleImages[index % vehicleImages.length]}
                                alt={vessel.name}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/20">
                                IMO: {vessel.imo}
                            </div>
                            <div className="absolute bottom-2 left-2 px-2">
                                <h3 className="text-lg font-bold text-white font-orbitron truncate drop-shadow-md" title={vessel.name}>{vessel.name}</h3>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 flex items-center gap-1"><Flag className="w-3 h-3" /> Flag</span>
                                <span className="text-slate-200">{vessel.flag}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 flex items-center gap-1"><Ship className="w-3 h-3" /> Type</span>
                                <span className="text-white px-2 py-0.5 bg-cyan-900/30 rounded border border-cyan-500/20 text-xs">{vessel.type}</span>
                            </div>

                            {vessel.cargo_manifest && (
                                <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-xs mt-2 relative overflow-hidden">
                                    <div className="flex items-center gap-1 text-cyan-400 font-bold uppercase border-b border-slate-700 pb-1 mb-1">
                                        <Package className="w-3 h-3" /> Cargo
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2">
                                        <span className="text-slate-400">Owner:</span>
                                        <span className="text-white truncate">{vessel.cargo_manifest.major_brand}</span>
                                        <span className="text-slate-400">Value:</span>
                                        <span className="text-green-400">{vessel.cargo_manifest.value_est_usd}</span>
                                    </div>
                                </div>
                            )}

                            {/* Expanded Details on Hover/Touch */}
                            <div className="pt-3 border-t border-slate-700 flex justify-between items-center text-xs font-mono text-cyan-500">
                                <div className="flex items-center gap-1"><Activity className="w-3 h-3" /> {vessel.status || "Underway"}</div>
                                <div className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {vessel.speed} kn</div>
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
