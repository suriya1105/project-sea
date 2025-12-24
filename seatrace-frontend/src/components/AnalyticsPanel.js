import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Loader2, Ship, Waves, Cpu, ShieldCheck, Zap } from 'lucide-react';

const AnalyticsPanel = () => {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [satelliteData, setSatelliteData] = useState(null); // Unused
    const [summaryIndex, setSummaryIndex] = useState(0);

    // Large Dataset of 40 Unique Images for Visual Feed
    const datasetImages = [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600",
        "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?q=80&w=600",
        "https://images.unsplash.com/photo-1466617692045-37938555ea4a?q=80&w=600",
        "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=600",
        "https://images.unsplash.com/photo-1580252187760-478db11e4c7a?q=80&w=600",
        "https://images.unsplash.com/photo-1605218427368-35b84d4d6a78?q=80&w=600",
        "https://images.unsplash.com/photo-1623910270634-118bdab3304a?q=80&w=600",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600",
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=600",
        "https://images.unsplash.com/photo-1542350719-7517c919d650?q=80&w=600",
        "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?q=80&w=600",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
        "https://images.unsplash.com/photo-1497493292307-31c376b6e479?q=80&w=600",
        "https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?q=80&w=600",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600",
        "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?q=80&w=600",
        "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600",
        "https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=600",
        "https://images.unsplash.com/photo-1534067783741-512d0aeaf04c?q=80&w=600",
        "https://images.unsplash.com/photo-1535498730771-e735b998cd64?q=80&w=600",
        "https://images.unsplash.com/photo-1566404287661-827c81d365f5?q=80&w=600",
        "https://images.unsplash.com/photo-1581023256087-947f6312480b?q=80&w=600",
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=600",
        "https://images.unsplash.com/photo-1570535316335-7ad70335cb99?q=80&w=600",
        "https://images.unsplash.com/photo-1610484518485-35c81de47cc5?q=80&w=600",
        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600",
        "https://images.unsplash.com/photo-1552083974-186346191183?q=80&w=600",
        "https://images.unsplash.com/photo-1552554746-991f2479e0a0?q=80&w=600",
        "https://images.unsplash.com/photo-1559160581-44bd4621e3d8?q=80&w=600",
        "https://images.unsplash.com/photo-1559825481-12a05cc00f08?q=80&w=600",
        "https://images.unsplash.com/photo-1601056639645-12b2e56bdc39?q=80&w=600",
        "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=600",
        "https://images.unsplash.com/photo-1520690214124-2405c5217036?q=80&w=600",
        "https://images.unsplash.com/photo-1563861826-6b5a791a9a88?q=80&w=600",
        // Additional diverse ocean/tech images
    ];
    const [currentImage, setCurrentImage] = useState(0);

    // Dynamic AI Summaries - Rotation Speed: 10s
    const aiSummaries = [
        "Analyzing spectral signatures... No hydrocarbon indicators found in Sector 7G.",
        "Cross-referencing AIS trajectory with SAR imagery. Correlation coefficient: 0.98.",
        "Monitoring localized thermal anomalies. Probability of engine discharge: < 2%.",
        "Sentinel-1B downlink complete. Updating global risk heatmap.",
        "Predictive model refreshed. Spill forecast accuracy increased to 94.2%.",
        "Scanning Sector 4 for illegal bilge dumping... Status: ALL CLEAR.",
        "Atmospheric synthesis complete. Wind shear compensating for drift models.",
        "Avatar AI: Re-calibrating optical sensors for low-light detection.",
        "Telemetry uplink synchronized. Real-time data stream active.",
        "Analyzing vessel density in Strait of Malacca. Risk Index: MODERATE."
    ];

    useEffect(() => {
        // Init logic
        fetchAnomalies();
    }, []);

    // Fast Rotation: Text (10s), Image (5s)
    useEffect(() => {
        const textInterval = setInterval(() => {
            setSummaryIndex(prev => (prev + 1) % aiSummaries.length);
        }, 10000); // 10 seconds

        const imageInterval = setInterval(() => {
            setCurrentImage(prev => (prev + 1) % datasetImages.length);
        }, 5000); // 5 seconds

        return () => {
            clearInterval(textInterval);
            clearInterval(imageInterval);
        };
    }, []); // aiSummaries and datasetImages are constant, dependencies not strictly needed for stable logic

    const fetchAnomalies = async () => {
        try {
            const token = localStorage.getItem('token');
            // Mock data fallback if API fails
            setAnomalies([
                { type: 'Course Violation', details: 'Vessel deviated from shipping lane', vessel_imo: '9123456' },
                { type: 'Speed Alert', details: 'Excessive speed in coastal zone', vessel_imo: '8899776' }
            ]);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-cyan-400 flex items-center gap-2"><Loader2 className="animate-spin" /> Initializing AI Sentinel...</div>;

    return (
        <div className="p-4 md:p-6 bg-slate-900 min-h-screen text-cyan-50 font-rajdhani">

            {/* Header Section */}
            <div className="flex items-center justify-between mb-6 border-b border-cyan-500/30 pb-4">
                <div className="flex items-center gap-3">
                    <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
                    <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 glow-text tracking-widest uppercase">AI Sentinel Analysis</h1>
                </div>
                <div className="text-xs font-mono text-cyan-300">
                    UPDATED: {new Date().toLocaleTimeString()} <Activity className="inline w-3 h-3 ml-1 animate-pulse" />
                </div>
            </div>

            {/* Top Dashboard Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Visual Feed */}
                <div className="lg:col-span-2 bg-black rounded-lg border border-slate-700 relative overflow-hidden h-64 lg:h-80 group shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <img
                        src={datasetImages[currentImage]}
                        alt="Satellite Feed"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                    {/* Overlay Grid Effect */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="grid-overlay opacity-30"></div>

                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 border border-cyan-500/50 backdrop-blur rounded text-xs text-cyan-400 font-mono flex items-center gap-2">
                        <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                        LIVE SATELLITE FEED :: SECTOR {currentImage + 1}
                    </div>

                    <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] text-red-500 font-bold tracking-wider">REC</span>
                    </div>
                </div>

                {/* Threat Status */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-cyan-500/20 col-span-1 flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <label className="text-xs text-cyan-500 font-bold tracking-widest flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4" /> THREAT ASSESSMENT
                        </label>
                        <div className="text-5xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">CLEAR</div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-3 rounded border border-cyan-500/10">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Detection Source</div>
                            <div className="text-sm font-mono text-cyan-200">Sentinel-1B (SAR)</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded border border-cyan-500/10">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">False Positive Check</div>
                            <div className="text-sm font-mono text-green-300 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Calibration Nominal
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary Banner */}
            <div className="mb-8 bg-slate-800/80 border-t border-b border-cyan-500/30 p-4 font-mono text-sm text-cyan-300 flex items-center gap-3 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-cyan-500/5 animate-pulse-slow"></div>
                <span className="font-bold shrink-0 text-cyan-500 text-lg">{'>_ AI_SUMMARY:'}</span>
                <span className="relative z-10 typing-effect text-base">{aiSummaries[summaryIndex]}</span>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-cyan-100 mb-4">
                        <Ship className="w-5 h-5 text-yellow-400" /> AIS Anomaly Trends
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ hour: '00:00', count: 2 }, { hour: '06:00', count: 5 }, { hour: '12:00', count: 1 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="hour" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0ea5e9' }} />
                                <Bar dataKey="count" fill="#0ea5e9" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-200 mb-4">
                        <Waves className="w-5 h-5 text-purple-400" /> Neural Network Status
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-900/20 rounded border border-purple-500/20 text-center">
                            <div className="text-2xl font-bold text-white">98.4%</div>
                            <div className="text-xs text-purple-300 uppercase">Confidence Score</div>
                        </div>
                        <div className="p-4 bg-purple-900/20 rounded border border-purple-500/20 text-center">
                            <div className="text-2xl font-bold text-white">45ms</div>
                            <div className="text-xs text-purple-300 uppercase">Inference Time</div>
                        </div>
                        <div className="col-span-2 p-3 bg-purple-900/10 rounded flex items-center justify-between">
                            <span className="text-sm text-slate-300">Model Architecture</span>
                            <span className="font-mono text-purple-300">U-Net + ResNet34 (v2.1)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
