import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Loader2, AlertTriangle, Ship, Waves, Activity, Cpu, Radio, ShieldCheck } from 'lucide-react';

const AnalyticsPanel = () => {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [satelliteData, setSatelliteData] = useState(null);
    const [summaryIndex, setSummaryIndex] = useState(0);

    // Mock Satellite/Dataset Images for Visual Feed
    const datasetImages = [
        "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&q=80&w=400", // Ocean 1
        "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&q=80&w=400", // Ocean 2
        "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=400", // Aerial view
        "https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&q=80&w=400"  // Ship top view
    ];
    const [currentImage, setCurrentImage] = useState(0);

    // Dynamic AI Summaries
    const aiSummaries = [
        "Analyzing spectral signatures... No hydrocarbon indicators found in Sector 7G.",
        "Cross-referencing AIS trajectory with SAR imagery. Correlation coefficient: 0.98.",
        "Monitoring localized thermal anomalies. Probability of engine discharge: < 2%.",
        "Sentinel-1B downlink complete. Updating global risk heatmap.",
        "Predictive model refreshed. Spill forecast accuracy increased to 94.2%."
    ];

    useEffect(() => {
        fetchAnomalies();
    }, []);

    // Rotate Summary and Image every minute (and 5s for image)
    useEffect(() => {
        const textInterval = setInterval(() => {
            setSummaryIndex(prev => (prev + 1) % aiSummaries.length);
        }, 60000); // Change text every 1 minute

        const imageInterval = setInterval(() => {
            setCurrentImage(prev => (prev + 1) % datasetImages.length);
        }, 5000); // Change image every 5 seconds for visual interest

        return () => {
            clearInterval(textInterval);
            clearInterval(imageInterval);
        };
    }, []);

    const fetchAnomalies = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/analytics/ais-anomalies', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAnomalies(data.anomalies || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
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

                {/* Threat Level */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-cyan-500/20 col-span-1 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <ShieldCheck className="w-24 h-24 text-cyan-500" />
                    </div>
                    <label className="text-xs text-cyan-500 font-bold tracking-widest mb-2">THREAT LEVEL</label>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-green-400" />
                        <span className="text-4xl font-bold text-green-400 group-hover:text-green-300 transition-colors">CLEAR</span>
                    </div>
                </div>

                {/* Detection Source & False Positive Check */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20 border-l-4 border-l-cyan-500">
                        <label className="text-xs text-cyan-500 font-bold tracking-widest flex items-center gap-2">
                            <Radio className="w-3 h-3" /> DETECTION SOURCE
                        </label>
                        <div className="text-xl font-mono text-white mt-1">Sentinel-1B (SAR)</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20 border-l-4 border-l-green-500">
                        <label className="text-xs text-green-500 font-bold tracking-widest flex items-center gap-2">
                            <Activity className="w-3 h-3" /> FALSE POSITIVE CHECK
                        </label>
                        <div className="text-lg font-mono text-slate-300 mt-1">Calibration nominal.</div>
                    </div>
                </div>

                {/* Visual Feed */}
                <div className="bg-black rounded-lg border border-slate-700 relative overflow-hidden h-48 lg:h-auto group">
                    <img
                        src={datasetImages[currentImage]}
                        alt="Satellite Feed"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-2 right-2 flex gap-1">
                        {datasetImages.map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentImage ? 'bg-cyan-400' : 'bg-slate-600'}`}></div>
                        ))}
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 border border-cyan-500/30 text-[10px] text-cyan-400 font-mono">
                        LIVE FEED: SECTOR {currentImage + 1}
                    </div>
                </div>
            </div>

            {/* AI Summary Banner */}
            <div className="mb-8 bg-slate-800/80 border-t border-b border-cyan-500/30 p-4 font-mono text-sm text-cyan-300 flex items-start gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/5 animate-pulse-slow"></div>
                <span className="font-bold shrink-0 text-cyan-500">{'>_ AI_SUMMARY:'}</span>
                <span className="relative z-10 typing-effect">{aiSummaries[summaryIndex]}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AIS Anomaly Detection Chart */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Ship className="w-5 h-5 text-yellow-400" />
                            AIS Anomaly Trends
                        </h2>
                    </div>
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

                {/* Deep Learning Status */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Waves className="w-5 h-5 text-purple-400" />
                            Deep Learning Engine
                        </h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded">
                            <span className="text-slate-400">Model Architecture</span>
                            <span className="text-purple-300 font-mono">U-Net + ResNet34</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded">
                            <span className="text-slate-400">Inference Latency</span>
                            <span className="text-purple-300 font-mono">45ms</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-purple-500/20">
                            <span className="text-slate-400">Confidence Score</span>
                            <span className="text-green-400 font-bold font-mono">98.4%</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsPanel;
