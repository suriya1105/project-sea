import React from 'react';
import { Shield, Loader, CheckCircle, UserPlus, Users, Trash2, Activity, FileText } from 'lucide-react';

const AdminOperationsPanel = ({
    adminPanelMessage,
    handleCreateUser,
    newUserData,
    setNewUserData,
    adminPanelLoading,
    fetchAllUsers,
    allUsers,
    handleDeleteUser,
    email,
    fetchAuditLogs,
    auditLogs
}) => {
    return (
        <div className="space-y-6 animate-fade-in relative z-20 p-4 lg:p-6 pb-20 pointer-events-none">
            {/* Holographic Scanline Overlay - Pure Visual */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[url('https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif')] bg-cover mix-blend-screen"></div>

            {/* Header Section - Interactive */}
            <div className="flex items-center justify-between mb-4 pointer-events-auto bg-slate-900/90 backdrop-blur-xl p-4 rounded-lg border border-cyan-500/40 shadow-lg shadow-cyan-500/10 relative z-30">
                <h2 className="text-2xl font-bold font-orbitron text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-500" />
                    COMMAND CENTER STATUS: <span className="text-green-400">ONLINE</span>
                </h2>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-cyan-500/70 border border-cyan-500/20 px-3 py-1 rounded hidden sm:block">SECURE CONNECTION</span>
                    {adminPanelMessage && (
                        <div className={`px-4 py-2 rounded border text-xs font-bold ${adminPanelMessage.includes('Error') ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-green-500/10 border-green-500 text-green-400'}`}>
                            {adminPanelMessage}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pointer-events-auto relative z-30">

                {/* User Access Management (Left Col) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Create User Panel */}
                    <div className="cyber-panel p-4 lg:p-6 border-l-4 border-l-cyan-500 relative overflow-hidden group bg-slate-900/90 backdrop-blur-md">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <UserPlus className="w-24 h-24 text-cyan-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                            <UserPlus className="w-5 h-5 text-cyan-400" /> PROVISION NEW CREDENTIALS
                        </h3>

                        <form onSubmit={handleCreateUser} className="space-y-4 relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-cyan-400 uppercase font-mono">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Captain Sarah Lance"
                                        value={newUserData.name}
                                        onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-600 transition-all hover:border-slate-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-cyan-400 uppercase font-mono">Email Identifier</label>
                                    <input
                                        type="email"
                                        placeholder="user@seatrace.mil"
                                        value={newUserData.email}
                                        onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-600 transition-all hover:border-slate-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-cyan-400 uppercase font-mono">Access Key (Password)</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={newUserData.password}
                                        onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-600 transition-all hover:border-slate-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-cyan-400 uppercase font-mono">Affiliation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Naval Command"
                                        value={newUserData.company}
                                        onChange={(e) => setNewUserData({ ...newUserData, company: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 placeholder-slate-600 transition-all hover:border-slate-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <label className="text-xs text-cyan-400 uppercase font-mono">Clearance Level</label>
                                    <select
                                        value={newUserData.role}
                                        onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 p-2.5 cursor-pointer hover:border-slate-500"
                                    >
                                        <option value="operator">Operator (Standard)</option>
                                        <option value="viewer">Viewer (Read Only)</option>
                                        <option value="admin">Administrator (Full)</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={adminPanelLoading}
                                    className="w-full h-[42px] text-white bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 font-bold rounded text-sm px-5 transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
                                >
                                    {adminPanelLoading ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Grant Access</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Users List */}
                    <div className="cyber-panel p-0 overflow-hidden flex flex-col h-[300px] lg:h-[400px] bg-slate-900/90 backdrop-blur-md">
                        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center backdrop-blur">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-400" /> Active Personnel Registry
                            </h3>
                            <button
                                onClick={fetchAllUsers}
                                className="text-cyan-400 hover:text-white text-xs font-mono bg-cyan-900/30 hover:bg-cyan-800/50 px-3 py-1 rounded transition-all border border-cyan-500/20"
                                disabled={adminPanelLoading}
                            >
                                SYNCHRONIZE DB 🔄
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 sticky top-0 backdrop-blur z-10">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-3 font-mono">Personnel</th>
                                        <th className="px-4 lg:px-6 py-3 font-mono hidden sm:table-cell">Role</th>
                                        <th className="px-4 lg:px-6 py-3 font-mono text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {allUsers.map((user, idx) => (
                                        <tr key={idx} className="bg-transparent hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-4 lg:px-6 py-3">
                                                <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{user.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                                                {/* Mobile role indicator since column is hidden */}
                                                <span className="sm:hidden mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">{user.role}</span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 hidden sm:table-cell">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' :
                                                    user.role === 'operator' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' :
                                                        'bg-green-900/20 text-green-400 border-green-500/30'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 text-right">
                                                {user.email !== email && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.email)}
                                                        disabled={adminPanelLoading}
                                                        className="text-red-500/70 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded transition-all"
                                                        title="Revoke Access"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {allUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-slate-500 italic">No personnel records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Audit Logs (Right Col) */}
                <div className="lg:col-span-5 h-full">
                    <div className="cyber-panel flex flex-col h-[350px] lg:h-full border-t-4 border-t-yellow-500/50 bg-slate-900/90 backdrop-blur-md">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-800/50">
                            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2 uppercase tracking-wider">
                                <Activity className="w-4 h-4" /> System Audit Stream
                            </h3>
                            <button
                                onClick={fetchAuditLogs}
                                className="text-slate-400 hover:text-white text-xs"
                            >
                                <span className="animate-pulse">●</span> LIVE
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-black/20 font-mono text-xs lg:max-h-[600px]">
                            {auditLogs.length > 0 ? (
                                auditLogs.map((log, idx) => (
                                    <div key={idx} className="p-2.5 rounded border-l-2 border-slate-700 bg-slate-900/40 hover:bg-slate-800 hover:border-cyan-500 transition-all group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                            <span className={`font-bold px-1.5 rounded ${log.action.includes('DELETE') || log.action.includes('FAIL') ? 'bg-red-900/30 text-red-500' :
                                                log.action.includes('CREATE') || log.action.includes('REGISTER') ? 'bg-green-900/30 text-green-500' :
                                                    'bg-blue-900/30 text-blue-400'
                                                }`}>{log.action}</span>
                                        </div>
                                        <div className="text-slate-300 group-hover:text-white transition-colors">{log.user_email}</div>
                                        <div className="text-slate-600 truncate mt-0.5">{log.resource}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                    <FileText className="w-12 h-12 mb-2" />
                                    <p>NO AUDIT TRAIL DATA</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};


export default AdminOperationsPanel;
