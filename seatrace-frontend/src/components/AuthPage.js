import React, { useState } from 'react';
import { User, Lock, ArrowRight, Activity, Shield, Eye, EyeOff, Anchor, Mail, Phone, Info } from 'lucide-react';
import BiometricAuth from './BiometricAuth';
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

    // Marine Facts State
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [showBiometric, setShowBiometric] = useState(false);
    const [pendingAuthData, setPendingAuthData] = useState(null);

    const marineFacts = [
        "AI satellites can detect oil spills as small as 10 square meters from space.",
        "90% of world trade is carried by the international shipping industry.",
        "Ghost ships (vessels with disabled AIS) account for 15% of illegal fishing globally.",
        "Machine learning models can predict ocean currents with 85% accuracy using thermal imagery.",
        "A single quart of oil can contaminate up to 2 million gallons of drinking water.",
        "Satellite SAR radar can see through clouds and darkness to track vessels 24/7.",
        "The Great Pacific Garbage Patch is three times the size of France."
    ];

    // Auto-rotate facts
    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFactIndex((prev) => (prev + 1) % marineFacts.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [marineFacts.length]);

    const [error, setError] = useState('');

    const validateForm = () => {
        // Name Validation (Letters and spaces only)
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!isLoginMode && !nameRegex.test(name)) {
            throw new Error("Name must contain only letters.");
        }

        // Phone Validation (Exactly 10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!isLoginMode && !phoneRegex.test(phone)) {
            throw new Error("Phone number must be exactly 10 digits.");
        }

        // Email Validation (@gmail.com mandatory)
        if (!isLoginMode && !email.endsWith('@gmail.com')) {
            throw new Error("Only @gmail.com addresses are allowed.");
        }

        // Password Validation (8 chars, letters, symbols, numbers)
        // At least one letter, one number, one special char, min 8 chars
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!isLoginMode && !passwordRegex.test(password)) {
            throw new Error("Password must be at least 8 characters and include letters, numbers, and symbols.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await new Promise(r => setTimeout(r, 1200)); // Cinematic delay for effect

            if (isLoginMode) {
                // Verify credentials first (mock or real)
                // For actual implementation, we might want to verify first then show biometrics or show biometrics as part of '2FA'
                // Here: We simulate flow.
                const authResponse = await onLogin(email, password, true); // Pass true to 'dryRun' if we can, else just assume onLogin returns data or throws
                // Since onLogin in App.js might set state directly, we need to adapt.
                // Assuming onLogin returns void but throws on error. 
                // We will hijack the flow: 
                // 1. We know credentials are GOOD if onLogin doesn't throw.
                // 2. But onLogin calls handleAuthSuccess immediately. We need to prevent that if we want scan.
                // Actually, let's just show Scan -> Then call onLogin. 
                // Wait, onLogin uses API. We need to verify API first.
                // Refactoring: we will call onLogin, but App.js handleLogin sets state.
                // Let's use a local internal validation if possible, OR just trigger biometric animation THEN login.
                // Better flow: 
                // 1. User submits -> Biometric Scan (Simulation of "Scanning User") -> 
                // 2. If Scan success -> Call API Login.

                setShowBiometric(true);
                // We keep email/password in state to use after scan
            } else {
                // Run Validation
                validateForm();

                // Sign Up Logic
                // Auto-add country code (+91) for now as requested
                const formattedPhone = `+91${phone}`;

                const response = await fetch(`${API_BASE_URL}/auth/register-public`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone: formattedPhone, password }),
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
                errorMessage = `⚠️ Unable to connect to server at ${API_BASE_URL}. \n\nPOSSIBLE CAUSES:\n1. Backend is sleeping (Render Free Tier) - Wait 60s and try again.\n2. Incorrect API Configuration - Check REACT_APP_API_BASE_URL in Vercel settings.\n3. Backend Deployment Failed - Check Render logs.`;
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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 font-sans animate-slide-in">


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
                            <div className="relative">
                                {/* Holographic Projection Ray */}
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-24 bg-gradient-to-b from-cyan-500/20 to-transparent blur-xl"></div>
                                {/* Main Logo - App Icon Style with Glow */}
                                <img src="/logo.png" alt="SeaTrace Logo" className="w-48 h-48 rounded-[2rem] object-cover shadow-[0_0_30px_rgba(6,182,212,0.6)] ring-1 ring-cyan-400/50 opacity-90 animate-pulse brightness-110" />
                            </div>
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
                        <p className="font-mono text-sm tracking-widest text-cyan-400/60 mb-8">NEXT GEN MARITIME INTELLIGENCE</p>

                        {/* Marine Fact Ticker */}
                        <div className="max-w-sm mx-auto bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider mb-1">Did You Know?</div>
                                    <div className="text-xs text-slate-300 font-mono leading-relaxed h-12 flex items-center transition-all duration-500">
                                        {marineFacts[currentFactIndex]}
                                    </div>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="absolute bottom-0 left-0 h-0.5 bg-cyan-500/30 w-full">
                                <div className="h-full bg-cyan-400 animate-[progress_5s_linear_infinite] origin-left"></div>
                            </div>
                        </div>
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
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
            `}</style>

            {showBiometric && (
                <BiometricAuth
                    onComplete={async () => {
                        try {
                            await onLogin(email, password);
                        } catch (err) {
                            setShowBiometric(false);
                            setError("Biometric Verified but Server Rejected: " + err.message);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default AuthPage;
