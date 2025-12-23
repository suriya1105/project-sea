import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Loader2, AlertTriangle, Ship, wind, Waves } from 'lucide-react';
// import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'; // Assuming standard map components used elsewhere

const AnalyticsPanel = () => {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [satelliteData, setSatelliteData] = useState(null);

    useEffect(() => {
        fetchAnomalies();
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

    const runSatelliteAnalysis = async () => {
        const token = localStorage.getItem('token');
        try {
            setSatelliteData({ status: 'analyzing' });
            const res = await fetch('http://localhost:5000/api/analytics/satellite-check', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSatelliteData(data);
        } catch (err) {
            console.error(err);
            setSatelliteData({ error: 'Analysis Failed' });
        }
    };

    if (loading) return <div className="p-8 text-cyan-400">Loading Analytics Module...</div>;

    return (
        <div className="p-6 bg-slate-900 min-h-screen text-cyan-50">
            <h1 className="text-3xl font-bold mb-6 text-cyan-400 glow-text">AI & Analytics Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* AIS Anomaly Detection Section */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Ship className="w-5 h-5 text-yellow-400" />
                            AIS Anomaly Detection
                        </h2>
                        <span className="text-xs px-2 py-1 bg-cyan-900 rounded text-cyan-300">Live Monitoring</span>
                    </div>

                    {anomalies.length === 0 ? (
                        <div className="text-green-400 p-4 bg-green-900/20 rounded-lg">
                            No critical anomalies detected in current vessel traffic.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {anomalies.map((a, i) => (
                                <div key={i} className="p-3 bg-red-900/20 border border-red-500/50 rounded flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-red-300">{a.type}</div>
                                        <div className="text-sm text-slate-300">{a.details} (IMO: {a.vessel_imo})</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 h-64">
                        <h3 className="text-sm text-cyan-500 mb-2">Traffic Violation Trends (24h)</h3>
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

                {/* Satellite Analysis Section */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Waves className="w-5 h-5 text-purple-400" />
                            Deep Learning Satellite Analysis
                        </h2>
                    </div>

                    <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 rounded-lg border border-dashed border-slate-600 relative overflow-hidden">
                        {satelliteData?.status === 'analyzing' ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                <span className="text-purple-300">Processing Imagery...</span>
                            </div>
                        ) : satelliteData?.detected !== undefined ? (
                            <div className="text-center p-4">
                                <div className={`text-2xl font-bold ${satelliteData.detected ? 'text-red-500' : 'text-green-400'}`}>
                                    {satelliteData.classification}
                                </div>
                                <div className="text-sm text-slate-400 mt-2">ID: {satelliteData.image_id}</div>
                                <div className="text-sm text-slate-400">Confidence: {(satelliteData.confidence * 100).toFixed(1)}%</div>
                                {satelliteData.detected && (
                                    <div className="mt-4 p-2 bg-red-500/20 text-red-200 text-xs rounded">
                                        Segmentation Mask Generated
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-slate-500 text-center">
                                <p>No active analysis.</p>
                                <button
                                    onClick={runSatelliteAnalysis}
                                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                                >
                                    Run Simulation
                                </button>
                            </div>
                        )}

                        {/* Overlay simulation */}
                        {satelliteData?.detected && (
                            <div className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse" />
                        )}
                    </div>

                    <div className="mt-4 text-xs text-slate-500">
                        Model: U-Net (ResNet34 Backbone) • Latency: 450ms • Accuracy: 94.2%
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsPanel;
