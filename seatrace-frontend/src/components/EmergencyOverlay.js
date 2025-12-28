import React from 'react';
import { AlertTriangle, AlertOctagon } from 'lucide-react';

const EmergencyOverlay = () => {
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none animate-in fade-in duration-300">
            {/* Flashing Red Border */}
            <div className="absolute inset-0 border-[8px] border-red-600/50 animate-pulse shadow-[inset_0_0_100px_rgba(220,38,38,0.5)]"></div>

            {/* Scrolling Tape Top */}
            <div className="absolute top-0 left-0 right-0 bg-red-600 overflow-hidden h-8 flex items-center">
                <div className="animate-marquee whitespace-nowrap flex gap-8 text-black font-bold font-mono text-sm tracking-widest uppercase items-center">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            EMERGENCY PROTOCOL ACTIVE - ALL VESSELS REPORT STATUS IMMEDIATELY
                        </span>
                    ))}
                </div>
            </div>

            {/* Scrolling Tape Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-red-600 overflow-hidden h-8 flex items-center">
                <div className="animate-marquee-reverse whitespace-nowrap flex gap-8 text-black font-bold font-mono text-sm tracking-widest uppercase items-center">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4" />
                            CRITICAL INCIDENT DETECTED - SEATRACE NETWORK ALERT
                        </span>
                    ))}
                </div>
            </div>

            {/* Central Warning (Pulse) */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-950/90 border border-red-500 px-6 py-2 rounded-b-lg shadow-[0_0_30px_rgba(220,38,38,0.6)] text-red-100 font-orbitron font-bold tracking-widest animate-pulse flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                RED ALERT
            </div>

            {/* Screen Tint */}
            <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay"></div>
        </div>
    );
};

export default EmergencyOverlay;
