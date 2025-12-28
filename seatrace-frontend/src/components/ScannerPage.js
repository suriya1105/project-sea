import React, { useState, useEffect } from 'react';
import { Scan, Box, Activity, Zap, Layers, Cpu, Database, AlertCircle, ChevronRight, Search } from 'lucide-react';

const ScannerPage = ({ vessels = [] }) => {
    const [selectedVessel, setSelectedVessel] = useState(vessels[0] || null);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanning, setScanning] = useState(false);
    const [activeLayer, setActiveLayer] = useState('hull'); // hull, cargo, engine

    // Simulate scanning process
    useEffect(() => {
        if (scanning) {
            const interval = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 100) {
                        setScanning(false);
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 30);
            return () => clearInterval(interval);
        }
    }, [scanning]);

    const handleVesselSelect = (vessel) => {
        setSelectedVessel(vessel);
        setScanProgress(0);
        setScanning(true);
    };

    return (
        <div className="flex h-full p-6 gap-6 relative overflow-hidden animate-slide-in">
            {/* Background Grid - Blueprint Style */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    backgroundColor: 'rgba(8, 51, 68, 0.3)',
                    opacity: 0.1,
                    transform: 'perspective(500px) rotateX(10deg) scale(1.5)'
                }}>
            </div>

            {/* Left Panel: Vessel List */}
            <div className="w-80 cyber-panel flex flex-col z-10">
                <h2 className="text-xl font-orbitron text-cyan-400 mb-4 flex items-center gap-2 border-b border-cyan-500/30 pb-2">
                    <Database className="w-5 h-5" /> VESSEL DATABASE
                </h2>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search Registry ID..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded py-2 pl-9 pr-2 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {vessels.map(v => (
                        <div
                            key={v.imo}
                            onClick={() => handleVesselSelect(v)}
                            className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between group ${selectedVessel?.imo === v.imo
                                ? 'bg-cyan-900/40 border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                                : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-200'
                                }`}
                        >
                            <div>
                                <div className="font-bold text-sm">{v.name}</div>
                                <div className="text-[10px] font-mono opacity-70">IMO: {v.imo}</div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedVessel?.imo === v.imo ? 'rotate-900 text-cyan-400' : ''}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Center: Holographic Viewer */}
            <div className="flex-1 flex flex-col z-10 relative">
                <div className="absolute top-0 right-0 left-0 flex justify-between items-start pointer-events-none">
                    <div className="bg-slate-900/80 backdrop-blur p-2 rounded border border-cyan-500/30 text-cyan-400 font-mono text-xs">
                        <Scan className="w-4 h-4 inline mr-2 animate-pulse" />
                        HOLOGRAM PROJECTION ACTIVE
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative perspective-container">
                    {/* The "Hologram" */}
                    {selectedVessel ? (
                        <div className="relative w-[600px] h-[400px] flex items-center justify-center group preserve-3d">

                            {/* Scanning Beam */}
                            <div
                                className="absolute left-0 right-0 h-[2px] bg-cyan-400/80 shadow-[0_0_20px_#22d3ee] z-50 pointer-events-none transition-all duration-[3000ms] ease-in-out"
                                style={{
                                    top: scanning ? '100%' : '0%',
                                    opacity: scanning ? 1 : 0
                                }}
                            ></div>

                            {/* Main Wireframe Container */}
                            <div className={`relative w-full h-full border-2 border-cyan-500/30 rounded-lg p-8 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm transition-all duration-1000 ${scanning ? 'shadow-[0_0_50px_rgba(6,182,212,0.2)]' : ''}`}>

                                {/* Placeholder for complex SVG Wireframe - Using simulated CSS shapes for demo */}
                                <div className="relative w-96 h-32 border-b-4 border-cyan-500 rounded-[0_0_40px_40px] flex items-center justify-center">
                                    <div className="absolute top-[-40px] left-10 w-20 h-40 bg-cyan-500/10 border border-cyan-400/30 transform skew-x-[-10deg]"></div>
                                    <div className="absolute top-[-20px] left-40 w-10 h-20 bg-cyan-500/10 border border-cyan-400/30"></div>
                                    <div className="absolute inset-0 bg-cyan-400/5 animate-pulse"></div>

                                    {/* Layer Specific Overlays */}
                                    {activeLayer === 'engine' && (
                                        <div className="absolute bottom-4 right-20 w-16 h-16 rounded-full border-2 border-orange-500/50 bg-orange-500/10 animate-spin-slow flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                                            <Cpu className="w-8 h-8 text-orange-400" />
                                        </div>
                                    )}
                                    {activeLayer === 'cargo' && (
                                        <div className="absolute top-0 w-60 h-20 flex gap-1 justify-center opacity-60">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="w-8 h-10 bg-green-500/20 border border-green-400/40 transform skew-x-[-10deg]"></div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Annotations */}
                                    <div className="absolute -top-10 -right-20 flex flex-col items-start">
                                        <div className="h-[1px] w-20 bg-cyan-500/50 mb-1"></div>
                                        <div className="text-[10px] font-mono text-cyan-400 bg-slate-900 p-1 border border-cyan-500/30">
                                            CLASS A STRUCTURAL INTEGRITY
                                        </div>
                                    </div>
                                </div>

                                {/* Scanning Grid Overlay */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 via-transparent to-transparent"></div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-cyan-500/50 text-xl font-orbitron animate-pulse">INITIATE SELECTION PROTOCOL...</div>
                    )}
                </div>

                {/* Layer Controls */}
                <div className="flex justify-center gap-4 mb-8">
                    {['hull', 'cargo', 'engine'].map(layer => (
                        <button
                            key={layer}
                            onClick={() => setActiveLayer(layer)}
                            className={`px-6 py-2 rounded-full border font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2 ${activeLayer === layer
                                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#22d3ee]'
                                : 'bg-slate-900/50 border-cyan-500/30 text-cyan-500 hover:border-cyan-400'
                                }`}
                        >
                            {layer === 'hull' && <Layers className="w-4 h-4" />}
                            {layer === 'cargo' && <Box className="w-4 h-4" />}
                            {layer === 'engine' && <Activity className="w-4 h-4" />}
                            {layer} VIEW
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Analyzed Data */}
            <div className="w-80 flex flex-col gap-4 z-10">
                <div className="cyber-panel h-1/3">
                    <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4" /> DIAGNOSTICS
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Engine Output</span>
                                <span>{scanning ? Math.floor(Math.random() * 100) : 92}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Hull Integrity</span>
                                <span>98%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: '98%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Fuel Reserves</span>
                                <span>45%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cyber-panel flex-1">
                    <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2 text-sm">
                        <Box className="w-4 h-4" /> CARGO MANIFEST
                    </h3>
                    {scanning ? (
                        <div className="h-full flex flex-col items-center justify-center text-cyan-500/60 font-mono text-xs gap-2">
                            <Scan className="w-8 h-8 animate-spin" />
                            DECRYPTING MANIFEST...
                        </div>
                    ) : (
                        <div className="space-y-2 font-mono text-xs">
                            <div className="p-2 bg-slate-900/50 border-l-2 border-green-500 text-slate-300">
                                <span className="text-green-400 block font-bold">CONTAINER #8821</span>
                                Electronics (High Value)
                            </div>
                            <div className="p-2 bg-slate-900/50 border-l-2 border-yellow-500 text-slate-300">
                                <span className="text-yellow-400 block font-bold">CONTAINER #1102</span>
                                Industrial Chemicals (HazMat)
                            </div>
                            <div className="p-2 bg-slate-900/50 border-l-2 border-slate-500 text-slate-300">
                                <span className="text-slate-400 block font-bold">BULK HOLD A</span>
                                Raw Materials
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 rounded border border-red-500/30 bg-red-900/10">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs mb-2">
                        <AlertCircle className="w-4 h-4 animate-pulse" /> ANOMALIES DETECTED
                    </div>
                    <div className="text-[10px] text-red-300 font-mono">
                        &gt; Thermal spike in auxiliary thruster.<br />
                        &gt; Unexpected cargo weight in Hold B.
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ScannerPage;
