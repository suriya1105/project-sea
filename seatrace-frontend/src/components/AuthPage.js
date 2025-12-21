import React, { useState } from 'react';
import { User, Lock, ArrowRight, Activity, Shield, Eye, EyeOff, Anchor, Mail, Phone } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AuthPage = ({ onLogin, onAuthSuccess }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await new Promise(r => setTimeout(r, 800)); // Cinematic delay

            if (isLoginMode) {
                await onLogin(email, password);
            } else {
                // Sign Up Logic
                const response = await fetch(`${API_BASE_URL}/auth/register-public`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password }),
                });

                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Registration failed');
                    } else {
                        const text = await response.text();
                        console.error("Non-JSON Error Response:", text);
                        throw new Error(`Server Error (${response.status}): The backend returned an unexpected response. Please check the server logs.`);
                    }
                }

                await response.json();

                // Auto login after signup (or show success message)
                // For now, let's auto-login or switch to login
                alert("Account created successfully! Logging you in...");
                await onLogin(email, password);
            }
        } catch (err) {
            console.error("Auth Error:", err);
            let errorMessage = err.message || 'Authentication failed';

            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                errorMessage = "Unable to connect to server. Please check your internet connection or try again later.";
            } else if (errorMessage.includes('401')) {
                errorMessage = "Invalid credentials. Please check your email and password.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        // Optional: Clear fields or keep them
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 font-sans">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0B1120] to-[#020617] z-0"></div>

            {/* Animated Grid Floor */}
            <div className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
                    transformOrigin: 'bottom'
                }}>
            </div>

            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] animate-pulse delay-1000"></div>

            <div className="flex w-full max-w-6xl relative z-10 p-4 gap-16 lg:gap-24 items-center justify-center lg:justify-between flex-col lg:flex-row">

                {/* Left: Holographic Ship Visual (Hidden on mobile when form is tall) */}
                <div className={`hidden lg:flex flex-1 flex-col items-center justify-center relative group perspective-1000 transition-all duration-500 ${!isLoginMode ? 'lg:scale-90' : ''}`}>
                    <div className="relative w-80 h-80 transform-style-3d animate-[float_6s_ease-in-out_infinite]">
                        {/* Central Hologram Core */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>

                        {/* Ship Icon / Structure */}
                        <div className="absolute inset-0 flex items-center justify-center transform translate-z-10">
                            <Anchor className="w-48 h-48 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] opacity-90" strokeWidth={0.5} />
                        </div>

                        {/* Orbiting Elements */}
                        <div className="absolute inset-[-20%] border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite] border-t-transparent border-l-transparent"></div>
                        <div className="absolute inset-[-10%] border border-dashed border-blue-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

                        {/* Floating Data Cards */}
                        <div className="absolute top-0 right-[-20px] bg-slate-800/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-lg transform rotate-6 hover:rotate-0 transition-all duration-300">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-mono text-cyan-300">SYSTEM: ONLINE</span>
                            </div>
                        </div>
                        <div className="absolute bottom-10 left-[-30px] bg-slate-800/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-lg transform -rotate-6 hover:rotate-0 transition-all duration-300">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-mono text-cyan-300">SECURE: ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-cyan-100/80">
                        <h2 className="text-3xl font-bold tracking-[0.2em] uppercase font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            SeaTrace
                        </h2>
                        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto my-4"></div>
                        <p className="font-mono text-sm tracking-widest text-cyan-400/60">NEXT GEN MARITIME INTELLIGENCE</p>
                    </div>
                </div>

                {/* Right: Auth Form */}
                <div className="w-full lg:w-[450px]">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">

                        {/* Top Lighting Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>

                        <div className="mb-8 text-center">
                            <h3 className="text-2xl font-bold text-white mb-2 font-['Orbitron'] tracking-wide">
                                {isLoginMode ? 'IDENTITY VERIFICATION' : 'NEW CLEARANCE REQUEST'}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                {isLoginMode ? 'Enter credentials to access command center.' : 'Register for maritime surveillance access.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLoginMode && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-cyan-500 uppercase tracking-wider ml-1">Full Name</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-cyan-400 font-semibold placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                                placeholder="Officer Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-cyan-500 uppercase tracking-wider ml-1">Contact Link</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                className="block w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-cyan-400 font-semibold placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                                placeholder="+1 (555) 000-0000"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-cyan-500 uppercase tracking-wider ml-1">Access ID (Email)</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-cyan-400 font-semibold placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                        placeholder="officer@seatrace.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-cyan-500 uppercase tracking-wider ml-1">Security Key</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-10 pr-10 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-cyan-400 font-semibold placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-pulse">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] uppercase tracking-wider"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    <>
                                        {isLoginMode ? 'Initialize Session' : 'Request Security Clearance'} <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/5 text-center">
                            <p className="text-slate-500 text-sm">
                                {isLoginMode ? 'New unit?' : 'Already cleared?'}
                                <button
                                    onClick={toggleMode}
                                    className="ml-2 text-cyan-400 hover:text-cyan-300 font-semibold hover:underline transition-all uppercase tracking-wide text-xs"
                                >
                                    {isLoginMode ? 'Request Clearance' : 'Access Terminal'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotateX(10deg); }
                    50% { transform: translateY(-20px) rotateX(15deg); }
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
            `}</style>
        </div>
    );
};

export default AuthPage;
