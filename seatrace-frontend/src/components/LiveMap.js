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

    const getVesselClass = (type) => {
        if (type.includes('Tanker')) return 'marker-shape-tanker';
        if (type.includes('Container') || type.includes('Cargo')) return 'marker-shape-cargo';
        if (type.includes('Navy') || type.includes('Military')) return 'marker-shape-navy';
        return 'marker-shape-standard';
    };

    return (
        <div className="flex-1 flex flex-col h-full cyber-panel p-0 overflow-hidden relative" style={{ minHeight: '80vh' }}>
            <div className="absolute inset-0 z-0 map-radar-overlay"></div>

            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 p-2 rounded text-cyan-400 text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> LIVE SAT FEED</div>
                    <div>LAT: {vessels[0]?.lat.toFixed(4) || '00.000'} | LON: {vessels[0]?.lon.toFixed(4) || '00.000'}</div>
                    <div>TRACKED: {vessels.length} VESSELS</div>
                </div>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-6 right-4 z-[500] map-legend">
                <div className="text-xs text-cyan-400 font-bold mb-2 border-b border-cyan-500/30 pb-1">Identified Signals</div>
                <div className="map-legend-item">
                    <span className="legend-shape marker-shape-cargo"></span>
                    <span>Cargo / Container</span>
                </div>
                <div className="map-legend-item">
                    <span className="legend-shape marker-shape-tanker"></span>
                    <span>Oil Tanker (HazMat)</span>
                </div>
                <div className="map-legend-item">
                    <span className="legend-shape marker-shape-navy"></span>
                    <span>Naval Entity</span>
                </div>
                <div className="map-legend-item">
                    <span className="legend-shape marker-shape-standard"></span>
                    <span>Standard / Fishing</span>
                </div>
            </div>

            <MapContainer center={[20, 80]} zoom={5} style={{ height: '100%', width: '100%' }} className="z-0 bg-slate-900">
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Deep Ocean (Dark)">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite Mode">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri &mdash; Source: Esri'
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* GeoJSON Boundaries */}
                {Object.values(countryBoundaries).map((country, index) => (
                    <GeoJSON
                        key={index}
                        data={country}
                        style={{
                            color: '#00f3ff',
                            weight: 1,
                            fillColor: '#00f3ff',
                            fillOpacity: 0.05,
                            dashArray: '5, 5'
                        }}
                    />
                ))}

                {/* Vessels with Unique Geometric Neon Icons */}
                {vessels.map(vessel => {
                    const routeStyle = getRouteStyle(vessel.type);
                    const vesselClass = getVesselClass(vessel.type);

                    const customIcon = L.divIcon({
                        className: 'custom-vessel-icon',
                        html: `<div class="${vesselClass}" style="transform: rotate(${vessel.course}deg);"></div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    // Get trailing path from vesselMovementData prop
                    const trail = vesselMovementData && vesselMovementData[vessel.imo]
                        ? vesselMovementData[vessel.imo].map(p => [p.lat, p.lon])
                        : [];

                    return (
                        <div key={vessel.imo}>
                            <Marker position={[vessel.lat, vessel.lon]} icon={customIcon}>
                                <Popup className="cyber-popup">
                                    <div className="p-2 bg-slate-900 text-cyan-400 border border-cyan-500/50 rounded text-xs font-mono">
                                        <strong className="text-sm block mb-1 border-b border-cyan-500/30 pb-1">{vessel.name}</strong>
                                        <div>TYPE: {vessel.type}</div>
                                        <div>COURSE: {vessel.course.toFixed(0)}°</div>
                                        <div>SPEED: {vessel.speed.toFixed(1)} kts</div>
                                        <div className={`mt-1 font-bold ${vessel.risk_level === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                                            RISK: {vessel.risk_level}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Vessel Historic Track (Breadcrumbs) from Movement Data */}
                            {trail.length > 1 && (
                                <Polyline
                                    positions={trail}
                                    pathOptions={{
                                        color: routeStyle.color,
                                        weight: routeStyle.weight,
                                        opacity: 0.6,
                                        dashArray: routeStyle.dashArray,
                                        className: 'animate-pulse-slow'
                                    }}
                                />
                            )}
                        </div>
                    );
                })}

                {/* Oil Spills */}
                {oilSpills.map(spill => (
                    <div key={spill.spill_id}>
                        <Circle
                            center={[spill.lat, spill.lon]}
                            radius={(spill.size_tons || 100) * 50}// approximate radius from tons
                            pathOptions={{
                                color: '#ef4444',
                                fillColor: '#ef4444',
                                fillOpacity: 0.3,
                                className: 'animate-pulse'
                            }}
                        >
                            <Popup>
                                <div className="p-2 bg-red-900/90 text-red-100 border border-red-500 rounded text-xs font-mono">
                                    <strong className="text-sm block mb-1">⚠️ SPILL DETECTED</strong>
                                    <div>ID: {spill.spill_id}</div>
                                    <div>Severtiy: {spill.severity}</div>
                                    <div>Size: {spill.size_tons}t</div>
                                    {spill.vessel_name && (
                                        <div className="mt-2 pt-2 border-t border-red-500/50 text-yellow-300 animate-pulse">
                                            SOURCE CONFIRMED: <br />{spill.vessel_name}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Circle>

                        {/* Source Identification Link Line */}
                        {spill.vessel_name && vessels.find(v => v.name === spill.vessel_name) && (
                            <Polyline
                                positions={[
                                    [spill.lat, spill.lon],
                                    [vessels.find(v => v.name === spill.vessel_name).lat, vessels.find(v => v.name === spill.vessel_name).lon]
                                ]}
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
