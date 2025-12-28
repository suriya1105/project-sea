import React, { useState } from 'react';
import { FileText, Download, Shield, Activity, Anchor, Clock, CheckCircle, Lock, Database, User } from 'lucide-react';

const ReportsPage = ({ userRole }) => {
    const [generating, setGenerating] = useState(null);

    // Mock report generation
    const handleGenerate = (reportType) => {
        setGenerating(reportType);
        setTimeout(() => {
            setGenerating(null);
            // In a real app, this would trigger a download
            alert(`${reportType.toUpperCase()} report generated successfully.`);
        }, 2000);
    };

    const isAdminOrEmployer = userRole === 'admin' || userRole === 'operator';

    return (
        <div className="space-y-6 animate-slide-in p-6 relative h-full overflow-y-auto custom-scrollbar">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-cyan-500" />
                        MISSION REPORTS GENERATOR
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Secure generation of operational manifests and compliance logs.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`text-xs font-mono px-3 py-1 rounded border ${isAdminOrEmployer ? 'border-red-500/30 bg-red-900/20 text-red-400' : 'border-cyan-500/30 bg-cyan-900/20 text-cyan-400'}`}>
                        ACCESS LEVEL: {userRole?.toUpperCase() || 'UNKNOWN'}
                    </div>
                </div>
            </div>

            {/* Admin/Employer View - Full Access */}
            {isAdminOrEmployer && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm border-b border-red-500/30 pb-2 mb-4">
                        <Lock className="w-4 h-4" /> CLASSIFIED OPERATIONS (ADMIN/EMPLOYER ONLY)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Fleet Registry */}
                        <div className="cyber-panel group hover:border-cyan-400/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Anchor className="w-32 h-32 text-cyan-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 z-10">
                                <span className="bg-cyan-900/30 p-1.5 rounded text-cyan-400"><Database className="w-5 h-5" /></span>
                                FLEET REGISTRY
                            </h3>
                            <p className="text-slate-400 text-sm mb-6 flex-1 z-10 hidden md:block">
                                Generate comprehensive manifest of all active vessels, including compliance ratings and risk assessments.
                            </p>
                            <button
                                onClick={() => handleGenerate('fleet')}
                                disabled={generating === 'fleet'}
                                className="w-full py-3 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] z-10"
                            >
                                {generating === 'fleet' ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {generating === 'fleet' ? 'COMPILING...' : 'EXPORT DOSSIER'}
                            </button>
                        </div>

                        {/* Incident Logs */}
                        <div className="cyber-panel group hover:border-red-500/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Shield className="w-32 h-32 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 z-10">
                                <span className="bg-red-900/30 p-1.5 rounded text-red-400"><Activity className="w-5 h-5" /></span>
                                INCIDENT LOGS
                            </h3>
                            <p className="text-slate-400 text-sm mb-6 flex-1 z-10 hidden md:block">
                                Detailed analysis of environmental hazards, oil spill tracking data, and severity classifications.
                            </p>
                            <button
                                onClick={() => handleGenerate('incidents')}
                                disabled={generating === 'incidents'}
                                className="w-full py-3 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 hover:border-red-400 text-red-400 font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(248,113,113,0.2)] z-10"
                            >
                                {generating === 'incidents' ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {generating === 'incidents' ? 'COMPILING...' : 'EXPORT LOGS'}
                            </button>
                        </div>

                        {/* Full Brief */}
                        <div className="cyber-panel group hover:border-purple-500/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText className="w-32 h-32 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 z-10">
                                <span className="bg-purple-900/30 p-1.5 rounded text-purple-400"><Lock className="w-5 h-5" /></span>
                                MASTER DISPOSAL
                            </h3>
                            <p className="text-slate-400 text-sm mb-6 flex-1 z-10 hidden md:block">
                                Strategic overview combining fleet telemetry and environmental hazards into a single command document.
                            </p>
                            <button
                                onClick={() => handleGenerate('master')}
                                disabled={generating === 'master'}
                                className="w-full py-3 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 hover:border-purple-400 text-purple-400 font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(192,132,252,0.2)] z-10"
                            >
                                {generating === 'master' ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {generating === 'master' ? 'COMPILING...' : 'EXPORT BRIEF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Standard User View */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-cyan-500/30 pb-2 mb-4 mt-8">
                    <User className="w-4 h-4" /> PERSONNEL RECORDS {isAdminOrEmployer ? '& PUBLIC DATA' : ''}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* My Activity */}
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded hover:border-cyan-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white text-sm">My Activity Log</h4>
                            <Clock className="w-4 h-4 text-slate-500" />
                        </div>
                        <p className="text-slate-500 text-xs mb-4">Export your personal login history and action audit trail.</p>
                        <button
                            onClick={() => handleGenerate('personal')}
                            disabled={generating === 'personal'}
                            className="text-xs w-full py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded"
                        >
                            {generating === 'personal' ? 'Processing...' : 'Download PDF'}
                        </button>
                    </div>

                    {/* Compliance Docs */}
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded hover:border-cyan-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white text-sm">Compliance Certs</h4>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-slate-500 text-xs mb-4">Public safety certificates and operational guidelines.</p>
                        <button
                            onClick={() => handleGenerate('compliance')}
                            disabled={generating === 'compliance'}
                            className="text-xs w-full py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded"
                        >
                            {generating === 'compliance' ? 'Processing...' : 'Download PDF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent generated list (Visual Filler) */}
            <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Transmissions</h3>
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 border-l-2 border-slate-700 hover:border-cyan-500 hover:bg-slate-900/50 transition-all group">
                            <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                <span className="text-sm text-slate-400 font-mono">SEATRACE_LOG_{20250000 + i}.enc</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-slate-600 uppercase">Size: {24 * i}KB</span>
                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">ARCHIVED</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ReportsPage;
