import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, GeoJSON, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue (if not already handled globally, but good to ensure)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LiveMap = ({
    vessels,
    oilSpills,
    countryBoundaries,
    predictionData,
    simParams,
    setSimParams,
    runSimulation,
    selectedSpillId,
    predictionStats,
    vesselMovementData
}) => {

    // Custom Icon Logic
    const getIconColor = (type) => {
        if (type.includes('Tanker')) return '#ef4444'; // Red
        if (type.includes('Container')) return '#06b6d4'; // Cyan
        if (type.includes('Fishing')) return '#22c55e'; // Green
        return '#f59e0b'; // Amber default
    };

    const getRouteStyle = (type) => {
        if (type.includes('Tanker')) return { color: '#ef4444', dashArray: '10, 5', weight: 3 };
        if (type.includes('Container')) return { color: '#06b6d4', dashArray: '20, 10', weight: 2 };
        if (type.includes('Fishing')) return { color: '#22c55e', dashArray: '5, 5', weight: 1 };
        return { color: '#f59e0b', dashArray: '5, 10', weight: 2 };
    };

    const [isLegendOpen, setIsLegendOpen] = React.useState(window.innerWidth > 768);

    const [visibleLayers, setVisibleLayers] = React.useState({
        cargo: true,
        tanker: true,
        navy: true,
        fishing: true,
        spills: true
    });

    const toggleLayer = (layer) => {
        setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    const getVesselClass = (type) => {
        if (type.includes('Tanker')) return 'marker-shape-tanker';
        if (type.includes('Container') || type.includes('Cargo')) return 'marker-shape-cargo';
        if (type.includes('Navy') || type.includes('Military')) return 'marker-shape-navy';
        return 'marker-shape-standard';
    };

    return (
        <div className="flex-1 flex flex-col h-full cyber-panel p-0 overflow-hidden relative">
            <div className="absolute inset-0 z-0 map-radar-overlay"></div>

            {/* Map Controls: Live Feed Info */}
            <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 p-2 rounded text-cyan-400 text-xs font-mono shadow-lg">
                    <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> LIVE SAT FEED</div>
                    <div className="text-[10px] text-slate-400">LAT: {vessels[0]?.lat.toFixed(4) || '00.00'}<br />LON: {vessels[0]?.lon.toFixed(4) || '00.00'}</div>
                </div>
            </div>

            {/* Interactive Layer Filter / Legend */}
            <div className={`absolute bottom-6 right-4 z-[500] transition-all duration-300 ${isLegendOpen ? 'translate-x-0' : 'translate-x-[calc(100%-32px)]'}`}>
                <div className="bg-slate-900/95 border border-cyan-500/30 rounded-lg shadow-xl backdrop-blur overflow-hidden w-48">
                    <button
                        onClick={() => setIsLegendOpen(!isLegendOpen)}
                        className="w-full p-2 bg-slate-800/90 border-b border-cyan-500/20 text-xs text-cyan-400 font-bold flex items-center justify-between hover:bg-slate-800 transition-colors"
                    >
                        <span>LAYER CONTROL</span>
                        <span className={`transform transition-transform ${isLegendOpen ? 'rotate-0' : 'rotate-180'}`}>▼</span>
                    </button>

                    <div className={`p-2 space-y-1 ${isLegendOpen ? 'block' : 'hidden'}`}>
                        {[
                            { id: 'cargo', label: 'Cargo Vessels', color: '#06b6d4', shape: 'marker-shape-cargo' },
                            { id: 'tanker', label: 'Oil Tankers', color: '#ef4444', shape: 'marker-shape-tanker' },
                            { id: 'navy', label: 'Naval / Military', color: '#22c55e', shape: 'marker-shape-navy' },
                            { id: 'fishing', label: 'Fishing / Other', color: '#f59e0b', shape: 'marker-shape-standard' },
                        ].map(layer => (
                            <div
                                key={layer.id}
                                onClick={() => toggleLayer(layer.id)}
                                className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-all ${visibleLayers[layer.id] ? 'bg-slate-800' : 'opacity-50 hover:opacity-75'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`legend-shape ${layer.shape}`}></div>
                                    <span className="text-[11px] text-slate-300">{layer.label}</span>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${visibleLayers[layer.id] ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-slate-600'}`}></div>
                            </div>
                        ))}

                        <div className="h-px bg-slate-700 my-1"></div>

                        <div
                            onClick={() => toggleLayer('spills')}
                            className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-all ${visibleLayers.spills ? 'bg-red-900/20 border border-red-500/30' : 'opacity-50 hover:opacity-75'}`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-red-500">🛢️</span>
                                <span className="text-[11px] text-red-300">Hazards (Spills)</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${visibleLayers.spills ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-slate-600'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            <MapContainer center={[20, 80]} zoom={5} style={{ height: '100%', width: '100%' }} className="z-0 bg-slate-900" zoomControl={false}>
                <LayersControl position="topleft">
                    <LayersControl.BaseLayer checked name="Deep Ocean (Dark)">
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap & CARTO" />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite Mode">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* GeoJSON Boundaries */}
                {Object.values(countryBoundaries).map((country, index) => (
                    <GeoJSON key={index} data={country} style={{ color: '#00f3ff', weight: 1, fillColor: '#00f3ff', fillOpacity: 0.05, dashArray: '5, 5' }} />
                ))}

                {/* Vessels with Unique Geometric Neon Icons and New Popups */}
                {vessels.filter(v => {
                    if (v.type.includes('Tanker') && !visibleLayers.tanker) return false;
                    if ((v.type.includes('Container') || v.type.includes('Cargo')) && !visibleLayers.cargo) return false;
                    if ((v.type.includes('Navy') || v.type.includes('Military')) && !visibleLayers.navy) return false;
                    if (!v.type.includes('Tanker') && !v.type.includes('Container') && !v.type.includes('Cargo') && !v.type.includes('Navy') && !visibleLayers.fishing) return false;
                    return true;
                }).map(vessel => {
                    const routeStyle = getRouteStyle(vessel.type);
                    const vesselClass = getVesselClass(vessel.type);

                    const customIcon = L.divIcon({
                        className: 'custom-vessel-icon',
                        html: `<div class="${vesselClass}" style="transform: rotate(${vessel.course}deg);"></div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    // Trail logic...
                    const trail = vesselMovementData && vesselMovementData[vessel.imo] ? vesselMovementData[vessel.imo].map(p => [p.lat, p.lon]) : [];

                    return (
                        <div key={vessel.imo}>
                            <Marker position={[vessel.lat, vessel.lon]} icon={customIcon}>
                                <Popup className="cyber-popup p-0" maxWidth={300} minWidth={280}>
                                    <div className="bg-slate-900 text-cyan-50 border border-cyan-500/50 rounded overflow-hidden shadow-2xl">
                                        {/* Header Image */}
                                        <div className="h-24 bg-slate-800 relative group overflow-hidden">
                                            <img
                                                src={vessel.image || `https://source.unsplash.com/400x200/?ship,${vessel.type.split(' ')[0]}`}
                                                alt={vessel.name}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] text-white font-bold tracking-wider uppercase border border-white/10">
                                                {vessel.status || 'Active'}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-3">
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-cyan-500/20">
                                                <div>
                                                    <h3 className="font-bold text-lg text-cyan-400 leading-none">{vessel.name}</h3>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">{vessel.type}</span>
                                                </div>
                                                <div className={`text-xs font-bold px-2 py-1 rounded ${vessel.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
                                                    {vessel.risk_level === 'High' ? '⚠️ HIGH RISK' : '✓ OK'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                                <div className="bg-slate-800/50 p-1.5 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase">Speed</div>
                                                    <div className="text-white font-mono">{vessel.speed.toFixed(1)} <span className="text-slate-500">kn</span></div>
                                                </div>
                                                <div className="bg-slate-800/50 p-1.5 rounded">
                                                    <div className="text-[10px] text-slate-500 uppercase">Course</div>
                                                    <div className="text-white font-mono">{vessel.course.toFixed(0)}°</div>
                                                </div>
                                                <div className="col-span-2 bg-slate-800/50 p-1.5 rounded flex items-center justify-between">
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase">Voyage</div>
                                                        <div className="text-cyan-300 font-bold">{vessel.destination || 'Open Sea'}</div>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">ETA: --:--</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors uppercase">
                                                    Track
                                                </button>
                                                <button className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition-colors uppercase border border-slate-600">
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                            {trail.length > 1 && visibleLayers[vessel.type.toLowerCase().split(' ')[0]] && (
                                <Polyline positions={trail} pathOptions={{ color: routeStyle.color, weight: routeStyle.weight, opacity: 0.6, dashArray: routeStyle.dashArray, className: 'animate-pulse-slow' }} />
                            )}
                        </div>
                    );
                })}

                {/* Consolidated Oil Spills Layer */}
                {visibleLayers.spills && oilSpills.map(spill => (
                    <div key={spill.spill_id}>
                        <Circle
                            center={[spill.lat, spill.lon]}
                            radius={(spill.size_tons || 100) * 50}
                            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3, className: 'animate-pulse' }}
                        >
                            <Popup maxWidth={320} minWidth={300} className="cyber-popup p-0">
                                <div className="bg-slate-900 border border-red-500/50 rounded overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                    {/* Spill Header Image */}
                                    <div className="h-32 bg-red-950/50 relative">
                                        <img
                                            src={spill.image || 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=400'}
                                            alt={spill.spill_id}
                                            className="w-full h-full object-cover opacity-90"
                                        />
                                        <div className="absolute top-0 right-0 p-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider">
                                            {spill.severity} Severity
                                        </div>
                                    </div>

                                    <div className="p-4 text-slate-100">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-red-400 font-bold text-lg flex items-center gap-2">
                                                    ⚠️ HAZARD DETECTED
                                                </h3>
                                                <div className="text-xs text-slate-400 font-mono">ID: {spill.spill_id}</div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-300 mb-3 leading-relaxed border-l-2 border-red-500/30 pl-2">
                                            {spill.description || `Unidentified oil discharge verified via satellite imagery. Estimated spread ${(spill.estimated_area_km2 || 0).toFixed(2)} km².`}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-center">
                                                <div className="text-[10px] text-red-300/70 uppercase">Spill Volume</div>
                                                <div className="text-red-400 font-bold font-mono text-sm">{spill.size_tons} T</div>
                                            </div>
                                            <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-center">
                                                <div className="text-[10px] text-red-300/70 uppercase">Affected Area</div>
                                                <div className="text-red-400 font-bold font-mono text-sm">{spill.estimated_area_km2} km²</div>
                                            </div>
                                        </div>

                                        {spill.vessel_name && (
                                            <div className="mt-3 pt-3 border-t border-red-800/50">
                                                <div className="text-[10px] text-slate-400 uppercase mb-1">Likely Source Vessel</div>
                                                <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm bg-yellow-900/10 p-2 rounded border border-yellow-500/20">
                                                    <Activity className="w-3 h-3 animate-pulse" /> {spill.vessel_name}
                                                </div>
                                            </div>
                                        )}

                                        <button className="w-full mt-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded uppercase transition-colors shadow-lg shadow-red-900/20">
                                            Initiate Response
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Circle>

                        {spill.vessel_name && vessels.find(v => v.name === spill.vessel_name) && (
                            <Polyline
                                positions={[[spill.lat, spill.lon], [vessels.find(v => v.name === spill.vessel_name).lat, vessels.find(v => v.name === spill.vessel_name).lon]]}
                                pathOptions={{ color: '#ef4444', weight: 2, dashArray: '10, 10', className: 'animate-pulse' }}
                            />
                        )}
                    </div>
                ))}

                {/* Prediction Layer (AI Simulation) */}
                {predictionData && predictionData.map((point, i) => (
                    <Circle
                        key={i}
                        center={[point.lat, point.lon]}
                        radius={point.radius * 111000} // deg to meters
                        pathOptions={{
                            color: '#a855f7', // Purple
                            fillColor: '#a855f7',
                            fillOpacity: 0.1 + (i / 24) * 0.2, // Fade in
                            weight: 1
                        }}
                    />
                ))}
            </MapContainer>

            {/* Simulation Control Panel Overlay */}
            <div className="absolute bottom-4 left-4 z-[500] cyber-panel w-72 bg-slate-900/90 backdrop-blur">
                <h3 className="text-cyan-400 font-orbitron text-sm mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> AI SIMULATION MODE
                </h3>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Wind Speed: {simParams?.wind_speed || 10} kts</label>
                        <input
                            type="range" min="0" max="50"
                            value={simParams?.wind_speed || 10}
                            onChange={(e) => {
                                setSimParams({ ...simParams, wind_speed: e.target.value });
                                if (selectedSpillId) runSimulation(selectedSpillId);
                            }}
                            className="w-full accent-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Current Dir: {simParams?.current_direction || 90}°</label>
                        <input
                            type="range" min="0" max="360"
                            value={simParams?.current_direction || 90}
                            onChange={(e) => {
                                setSimParams({ ...simParams, current_direction: e.target.value });
                                if (selectedSpillId) runSimulation(selectedSpillId);
                            }}
                            className="w-full accent-cyan-500"
                        />
                    </div>
                    <button
                        onClick={() => runSimulation(oilSpills[0]?.spill_id)}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded uppercase transition-colors"
                    >
                        {predictionData ? 'Update Prediction' : 'Run Scenario'}
                    </button>

                    {predictionStats && predictionStats.economic_impact && (
                        <div className="mt-4 pt-3 border-t border-slate-700/50">
                            <h4 className="text-xs text-slate-400 font-bold mb-2">ECONOMIC IMPACT ESTIMATE</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-slate-800/80 p-1.5 rounded border border-red-500/30">
                                    <span className="block text-slate-500 text-[10px]">TOTAL LOSS</span>
                                    <span className="text-red-400 font-mono font-bold">
                                        ${(predictionStats.economic_impact.total_estimated_cost / 1000000).toFixed(2)}M
                                    </span>
                                </div>
                                <div className="bg-slate-800/80 p-1.5 rounded border border-cyan-500/30">
                                    <span className="block text-slate-500 text-[10px]">CLEANUP</span>
                                    <span className="text-cyan-400 font-mono font-bold">
                                        ${(predictionStats.economic_impact.cleanup_cost / 1000000).toFixed(2)}M
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 text-[10px] text-slate-500 italic text-center">
                                *Based on {predictionStats.final_area_km2.toFixed(1)} km² spread
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveMap;
