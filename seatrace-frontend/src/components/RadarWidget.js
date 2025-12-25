import React from 'react';
import { Activity, Radio, Target } from 'lucide-react';

const RadarWidget = () => {
    return (
        <div className="cyber-panel overflow-hidden relative group">
            {/* Header */}
            <h3 className="text-cyan-400 font-orbitron mb-4 flex items-center gap-2 text-sm border-b border-cyan-500/30 pb-2 relative z-10">
                <Target className="w-4 h-4 animate-pulse" /> LIVE SONAR FEED
            </h3>

            {/* Radar Container */}
            <div className="relative w-full h-64 flex items-center justify-center bg-slate-900/50 rounded-lg overflow-hidden border border-cyan-900/50">

                {/* Grid Lines */}
                <div className="absolute inset-0 z-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px), radial-gradient(circle, #06b6d4 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 20px 20px'
                }}></div>

                {/* Radar Circles */}
                <div className="absolute w-[90%] h-[90%] border border-cyan-500/20 rounded-full"></div>
                <div className="absolute w-[60%] h-[60%] border border-cyan-500/20 rounded-full"></div>
                <div className="absolute w-[30%] h-[30%] border border-cyan-500/20 rounded-full"></div>
                <div className="absolute w-1 h-1 bg-cyan-500 rounded-full box-shadow-[0_0_10px_#06b6d4]"></div>

                {/* Rotating Sweep Arm */}
                <div className="absolute w-[50%] h-[50%] top-0 left-0 origin-bottom-right border-r border-cyan-500/80 bg-gradient-to-l from-cyan-500/20 to-transparent animate-[spin_4s_linear_infinite] z-10"
                    style={{ borderTopRightRadius: '100%' }}>
                </div>

                {/* Blips (Simulated Targets) */}
                <div className="absolute top-[30%] left-[60%] w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-[30%] left-[60%] w-2 h-2 bg-red-500 rounded-full opacity-100 shadow-[0_0_10px_red]"></div>

                <div className="absolute bottom-[40%] right-[30%] w-1.5 h-1.5 bg-green-500 rounded-full animate-ping delay-1000 opacity-75"></div>
                <div className="absolute bottom-[40%] right-[30%] w-1.5 h-1.5 bg-green-500 rounded-full opacity-100 shadow-[0_0_10px_green]"></div>

                <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-700 opacity-90 shadow-[0_0_10px_yellow]"></div>

                {/* Overlay Text */}
                <div className="absolute bottom-2 left-3 text-[10px] font-mono text-cyan-500/70 z-20">
                    RANGE: 50NM<br />
                    MODE: ACTIVE
                </div>
            </div>

            {/* Scan Lines Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.05)_50%)] bg-[length:100%_4px] pointer-events-none z-20"></div>
        </div>
    );
};

export default RadarWidget;
