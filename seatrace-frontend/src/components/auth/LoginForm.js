import React, { useState, useEffect } from 'react';
import { User, ArrowRight, Activity, Shield, Zap, Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ onLogin, onSwitchToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeRole, setActiveRole] = useState(null);

    // Initialize Matrix rain effect
    useEffect(() => {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '01SEATRACE';
        const drops = Array(Math.floor(canvas.width / 20)).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(3, 11, 20, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00f3ff';
            ctx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);
                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        const interval = setInterval(draw, 50);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e, overrideEmail = null) => {
        if (e) e.preventDefault();
        setLoading(true);
        // Add cool sound effect or delay here if needed
        const emailToUse = overrideEmail || email;
        await new Promise(r => setTimeout(r, 1000)); // Cinematic delay
        await onLogin(emailToUse, password || 'demo123');
        setLoading(false);
    };

    const handleRoleSelect = (role, demoEmail) => {
        setActiveRole(role);
        setEmail(demoEmail);
        setPassword('••••••••');
        setTimeout(() => handleSubmit(null, demoEmail), 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Backgrounds */}
            <div className="ocean-bg"></div>
            <div className="grid-overlay"></div>
            <canvas id="matrix-canvas" className="absolute top-0 left-0 opacity-20 pointer-events-none"></canvas>

            <div className="flex w-full max-w-6xl relative z-10 p-4 gap-20 items-center">

                {/* Left: Holographic Info */}
                <div className="hidden lg:block flex-1 text-left space-y-8">
                    <div className="glitch-wrapper mb-8">
                        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 glitch-text" data-text="SEATRACE">
                            SEATRACE
                        </h1>
                        <div className="text-xl text-cyan-200 mt-2 font-light tracking-[0.5em] uppercase">
                            Orbital Maritime Surveillance
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-4 border-l-2 border-cyan-500 bg-cyan-900/10 backdrop-blur-sm">
                            <Activity className="w-8 h-8 text-cyan-400" />
                            <div>
                                <div className="text-cyan-400 font-bold uppercase tracking-wider text-sm">System Status</div>
                                <div className="text-white text-lg">Online • Monitoring Active</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 p-4 border-l-2 border-purple-500 bg-purple-900/10 backdrop-blur-sm">
                            <Shield className="w-8 h-8 text-purple-400" />
                            <div>
                                <div className="text-purple-400 font-bold uppercase tracking-wider text-sm">Security Level</div>
                                <div className="text-white text-lg">Class A • Tetra Encryption</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Cyber Login Form */}
                <div className="w-full lg:w-[450px]">
                    <div className="cyber-card p-10">
                        <div className="mb-10 text-center">
                            <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
                            <h2 className="text-3xl font-bold text-white uppercase tracking-widest font-[Orbitron]">Identify</h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="cyber-input-group">
                                <input
                                    type="email"
                                    className="cyber-input"
                                    placeholder=" "
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <label className="cyber-label">Access ID / Email</label>
                                <User className="absolute right-4 top-4 text-cyan-700 w-5 h-5 pointer-events-none" />
                            </div>

                            <div className="cyber-input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="cyber-input"
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label className="cyber-label">Security Key</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-cyan-700 hover:text-cyan-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-8">
                                {[
                                    { id: 'admin', label: 'CMD', color: 'cyan' },
                                    { id: 'operator', label: 'OPS', color: 'purple' },
                                    { id: 'viewer', label: 'OBS', color: 'blue' }
                                ].map((role) => (
                                    <div
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id, `${role.id}@seatrace.com`)}
                                        className={`role-box p-2 text-center flex flex-col items-center justify-center h-20 ${activeRole === role.id ? 'active' : ''}`}
                                    >
                                        <span className="text-xs text-gray-400 mb-1">{role.label}</span>
                                        <span className="text-2xl">{role.id === 'admin' ? '⚡' : role.id === 'operator' ? '⚓' : '👁️'}</span>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="cyber-btn w-full flex items-center justify-center gap-3">
                                {loading ? 'Initializing...' : (
                                    <>
                                        Initialize Link <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <button
                                onClick={onSwitchToSignUp}
                                className="text-cyan-500/60 hover:text-cyan-400 text-sm uppercase tracking-widest hover:underline transition-all"
                            >
                                Request New Clearance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
