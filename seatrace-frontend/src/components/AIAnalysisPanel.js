import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Zap, Shield, AlertTriangle, Wind, Eye, Activity, Cpu } from 'lucide-react';


// Cyber-themed component for AI Analysis
const AIAnalysisPanel = ({ token, userRole }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            // Simulate network delay for "AI processing" effect
            await new Promise(r => setTimeout(r, 800));

            const response = await axios.get(`${API_BASE_URL}/analysis/realtime`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAnalysis(response.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching AI analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchAnalysis, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !analysis) {
        return (
            <div className="cyber-panel h-64 flex flex-col items-center justify-center animate-pulse">
                <Cpu className="w-12 h-12 text-cyan-500 mb-4 animate-spin-slow" />
                <div className="text-cyan-400 font-mono tracking-widest">INITIALIZING DEEP LEARING MODELS...</div>
            </div>
        );
    }

    // Determine status color
    const getStatusColor = (status) => {
        if (status === 'CRITICAL_DETECTION') return '#ef4444'; // Red
        if (status === 'WARNING') return '#f59e0b'; // Amber
        return '#10b981'; // Green
    };

    const statusColor = getStatusColor(analysis?.status);

    return (
        <div className="cyber-panel relative overflow-hidden group">
            {/* Decorative cyber lines */}
            <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-lg"></div>

            <div className="flex justify-between items-center mb-6 border-b border-cyan-500/20 pb-2">
                <h3 className="text-lg font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    AI SENTINEL ANALYSIS
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-600 animate-pulse">
                        {loading ? 'PROCESSING...' : `UPDATED: ${lastUpdated?.toLocaleTimeString()}`}
                    </span>
                    <button
                        onClick={fetchAnalysis}
                        className="p-1 hover:bg-cyan-500/20 rounded-full transition-colors"
                        title="Run Live Scan"
                    >
                        <Activity className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Col: Status & Confidence */}
                <div className="space-y-4">
                    <div className="p-4 bg-slate-900/50 border border-cyan-500/20 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-scan"></div>
                        <div className="text-xs text-cyan-500 font-bold uppercase tracking-wider mb-1">THREAT LEVEL</div>
                        <div className="text-2xl font-rajdhani font-bold flex items-center gap-2" style={{ color: statusColor }}>
                            {analysis?.status === 'CRITICAL_DETECTION' ? <AlertTriangle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                            {analysis?.status.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-cyan-500/20 rounded-lg flex items-center justify-between">
                        <div>
                            <div className="text-xs text-cyan-500 font-bold uppercase tracking-wider mb-1">CONFIDENCE SCORE</div>
                            <div className="text-3xl font-orbitron font-bold text-white">
                                {analysis?.confidence_score}<span className="text-sm text-cyan-600">%</span>
                            </div>
                        </div>
                        {/* Simple Confidence Gauge Visualization */}
                        <div className="w-16 h-16 relative flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="none" />
                                <circle cx="32" cy="32" r="28" stroke={statusColor} strokeWidth="4" fill="none" strokeDasharray={`${analysis?.confidence_score * 1.75} 1000`} />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Middle Col: Source & Reason */}
                <div className="space-y-4">
                    <div className="p-3 border-l-2 border-cyan-500 bg-slate-800/30">
                        <div className="text-xs text-blue-400 font-bold mb-1 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> DETECTION SOURCE
                        </div>
                        <div className="text-sm text-cyan-100 font-mono">
                            {analysis?.detection_source}
                        </div>
                    </div>

                    {analysis?.source_identification && (
                        <div className="p-3 border-l-2 border-purple-500 bg-slate-800/30">
                            <div className="text-xs text-purple-400 font-bold mb-1 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> SUSPECT SOURCE
                            </div>
                            <div className="text-sm text-purple-100 font-mono">
                                {analysis.source_identification.likely_source}
                                <span className="ml-2 text-xs bg-purple-900/50 px-1 rounded border border-purple-500/30">
                                    {analysis.source_identification.probability}% PROB
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="p-3 border-l-2 border-green-500 bg-slate-800/30">
                        <div className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                            <Wind className="w-3 h-3" /> FALSE POSITIVE CHECK
                        </div>
                        <div className="text-xs text-green-100/80">
                            {analysis?.false_positive_check?.details || "Calibration nominal."}
                        </div>
                    </div>
                </div>

                {/* Right Col: Satellite Imagery Preview */}
                <div className="relative group rounded-lg overflow-hidden border border-cyan-500/30 aspect-video md:aspect-auto">
                    {analysis?.imagery?.sar_url ? (
                        <>
                            <img
                                src={analysis.imagery.sar_url}
                                alt="SAR Scan"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity filter sepia-[.5] hue-rotate-[180deg]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                            <div className="absolute bottom-2 left-2 text-xs font-mono text-cyan-400 bg-black/60 px-2 py-1 rounded border border-cyan-500/30">
                                SATELLITE SAR-1B VIEW
                            </div>
                            {/* Target Reticle Overlay */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-red-500/50 rounded-full animate-ping"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-cyan-500/30 font-mono">
                            NO VISUAL FEED
                        </div>
                    )}
                </div>
            </div>

            {/* AI Summary Text */}
            <div className="mt-4 p-4 bg-cyan-900/10 border border-cyan-500/30 rounded font-mono text-sm text-cyan-100/90 shadow-inner shadow-black/20">
                <span className="text-cyan-400 font-bold mr-2">&gt;_ AI_SUMMARY:</span>
                {analysis?.ai_summary}
            </div>

        </div>
    );
};

export default AIAnalysisPanel;
