import React, { useState, useEffect } from 'react';
import { Crosshair, Battery, Wifi, Navigation, Maximize, Target, Video, Radio, AlertTriangle } from 'lucide-react';

const DronePage = ({ vessels = [] }) => {
    const [activeDrone, setActiveDrone] = useState(1);
    const [altitude, setAltitude] = useState(1200);
    const [battery, setBattery] = useState(87);
    const [signal, setSignal] = useState(98);

    // Simulate telemetry fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setAltitude(prev => prev + (Math.random() * 10 - 5));
            setSignal(prev => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))));
            if (Math.random() > 0.95) setBattery(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const targetVessel = vessels[0] || { name: 'UNKNOWN TARGET', lat: 0, lon: 0 };

    return (
        <div className="h-full w-full relative bg-black overflow-hidden flex flex-col animate-in fade-in duration-500">

            {/* Camera Feed Background (Simulated) */}
            <div className="absolute inset-0 z-0">
                {/* Simulated Ocean/Static Feed */}
                <div className="absolute inset-0 bg-[url('https://source.unsplash.com/1600x900/?ocean,storm,night')] bg-cover bg-center opacity-60 grayscale contrast-125 saturate-50"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay animate-pulse-fast"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 via-transparent to-cyan-900/40 mix-blend-multiply"></div>

                {/* CRT Scanline Effect */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 2px, 3px 100%',
                    pointerEvents: 'none'
                }}></div>
            </div>

            {/* HUD Overlay */}
            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between font-mono text-cyan-400 pointer-events-none select-none">

                {/* Top Bar */}
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="border border-cyan-500/50 p-2 bg-black/50 backdrop-blur">
                            <div className="text-xs text-cyan-500/70 mb-1">UNIT ID</div>
                            <div className="font-bold text-lg leading-none">DRONE-{activeDrone.toString().padStart(2, '0')}-AX</div>
                        </div>
                        <div className="border border-cyan-500/50 p-2 bg-black/50 backdrop-blur">
                            <div className="text-xs text-red-500/70 mb-1 flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> REC</div>
                            <div className="font-bold text-lg leading-none">00:14:22:09</div>
                        </div>
                    </div>

                    {/* Compass Tape */}
                    <div className="flex-1 max-w-lg mx-8 relative overflow-hidden h-12 border-b border-cyan-500/50 mask-linear-fade">
                        <div className="absolute top-4 left-0 right-0 flex justify-between px-10 text-xs font-bold opacity-70">
                            <span>NW</span><span>N</span><span>NE</span><span>E</span><span>SE</span><span>S</span><span>SW</span><span>W</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-cyan-400"></div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 bg-black/50 px-2 py-1 rounded border border-cyan-500/30">
                                <span className="text-xs font-bold">{signal.toFixed(0)}%</span>
                                <Wifi className="w-4 h-4" />
                            </div>
                            <div className={`flex items-center gap-2 bg-black/50 px-2 py-1 rounded border ${battery < 20 ? 'border-red-500/30 text-red-500' : 'border-cyan-500/30'}`}>
                                <span className="text-xs font-bold">{battery}%</span>
                                <Battery className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Reticle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-500/30 rounded-full flex items-center justify-center pointer-events-auto cursor-crosshair group">
                    {/* Inner Crosshair */}
                    <div className="absolute w-4 h-4 border-l border-t border-cyan-400"></div>
                    <div className="absolute w-4 h-4 border-r border-t border-cyan-400"></div>
                    <div className="absolute w-4 h-4 border-l border-b border-cyan-400"></div>
                    <div className="absolute w-4 h-4 border-r border-b border-cyan-400"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Lock Details */}
                    <div className="absolute top-full mt-4 text-center opacity-80">
                        <div className="text-xs bg-cyan-900/80 px-2 text-cyan-200 mb-1">TARGET LOCKED</div>
                        <div className="text-sm font-bold tracking-widest">{targetVessel.name.toUpperCase()}</div>
                        <div className="text-[10px]">{targetVessel.lat.toFixed(4)}, {targetVessel.lon.toFixed(4)}</div>
                    </div>

                    {/* Rotating Elements */}
                    <div className="absolute inset-0 border border-dashed border-cyan-500/20 rounded-full animate-spin-slow"></div>
                </div>

                {/* Bottom Bar */}
                <div className="flex justify-between items-end">

                    {/* Telemetry */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <div className="bg-black/50 p-2 border border-cyan-500/30 w-32">
                                <div className="text-[10px] text-cyan-500/70">ALTITUDE</div>
                                <div className="text-xl font-bold">{altitude.toFixed(1)} <span className="text-xs">FT</span></div>
                            </div>
                            <div className="bg-black/50 p-2 border border-cyan-500/30 w-32">
                                <div className="text-[10px] text-cyan-500/70">SPEED</div>
                                <div className="text-xl font-bold">45.2 <span className="text-xs">KTS</span></div>
                            </div>
                        </div>
                        <div className="text-[10px] text-cyan-500/50 max-w-xs">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            CAUTION: WIND SHEAR REPORTED IN SECTOR 7. MAINTAIN VISUAL LINE OF SIGHT.
                        </div>
                    </div>

                    {/* Drone Controls (Simulated) */}
                    <div className="flex gap-2 pointer-events-auto">
                        {[1, 2, 3].map(id => (
                            <button
                                key={id}
                                onClick={() => setActiveDrone(id)}
                                className={`px-4 py-2 border text-xs font-bold hover:bg-cyan-500/20 transition-all ${activeDrone === id
                                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                                        : 'bg-black/50 border-cyan-500/30 text-cyan-700'
                                    }`}
                            >
                                <Video className="w-4 h-4 mb-1 mx-auto" />
                                CAM {id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DronePage;
