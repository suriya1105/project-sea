import React, { useState, useEffect } from 'react';
import { ArrowRight, Globe, Zap, Shield, Activity, Anchor, Eye, EyeOff, User, Lock, Mail, Phone, MapPin, Waves, Ship, Radar, Satellite, Database, Users, TrendingUp } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        company: '',
        phone: '',
        role: 'viewer'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [particles, setParticles] = useState([]);

    // Generate floating particles effect
    useEffect(() => {
        const generateParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 50; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
            setParticles(newParticles);
        };
        generateParticles();
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                // Login logic
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccess('Login successful! Redirecting...');
                    setTimeout(() => {
                        onLogin(formData.email, formData.password);
                    }, 1500);
                } else {
                    setError(data.error || 'Login failed');
                }
            } else {
                // Registration logic
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        name: formData.name,
                        company: formData.company,
                        phone: formData.phone,
                        role: formData.role
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccess('Registration successful! Please check your email for verification.');
                    setIsLogin(true);
                } else {
                    setError(data.error || 'Registration failed');
                }
            }
        } catch (error) {
            setError('Network error. Please try again.');
        }

        setLoading(false);
    };

    const demoAccounts = [
        { email: 'admin@seatrace.com', role: 'Administrator', icon: '⚡' },
        { email: 'operator@seatrace.com', role: 'Operator', icon: '⚓' },
        { email: 'viewer@seatrace.com', role: 'Viewer', icon: '👁️' }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Ocean waves animation */}
                <div className="absolute inset-0 opacity-20">
                    <div className="wave wave1"></div>
                    <div className="wave wave2"></div>
                    <div className="wave wave3"></div>
                </div>

                {/* Floating particles */}
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full bg-cyan-400 animate-pulse"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            opacity: particle.opacity,
                            animationDuration: `${particle.speed * 3}s`,
                            animationDelay: `${particle.id * 0.1}s`
                        }}
                    />
                ))}

                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            </div>

            <div className="flex w-full max-w-7xl relative z-10 px-4 sm:px-6 lg:px-8 py-8 gap-8 lg:gap-16 items-center justify-between">

                {/* Left: Hero Section */}
                <div className="hidden lg:flex flex-1 flex-col space-y-8 text-left">
                    <div className="space-y-6">
                        <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2">
                            <Satellite className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400 text-sm font-medium">LIVE MONITORING ACTIVE</span>
                        </div>

                        <h1 className="text-6xl lg:text-7xl font-black tracking-tight leading-none">
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                SeaTrace
                            </span>
                            <br />
                            <span className="text-white text-4xl lg:text-5xl font-light">
                                Maritime Intelligence
                            </span>
                        </h1>

                        <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
                            Advanced ocean monitoring, real-time vessel tracking, and environmental protection through cutting-edge maritime surveillance technology.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <Ship className="w-8 h-8 text-blue-400" />
                                <div>
                                    <div className="text-2xl font-bold text-white">2,847</div>
                                    <div className="text-sm text-slate-400">Active Vessels</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <Radar className="w-8 h-8 text-green-400" />
                                <div>
                                    <div className="text-2xl font-bold text-white">99.8%</div>
                                    <div className="text-sm text-slate-400">Uptime</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <Database className="w-8 h-8 text-purple-400" />
                                <div>
                                    <div className="text-2xl font-bold text-white">1.2M</div>
                                    <div className="text-sm text-slate-400">Data Points</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="w-8 h-8 text-orange-400" />
                                <div>
                                    <div className="text-2xl font-bold text-white">24/7</div>
                                    <div className="text-sm text-slate-400">Monitoring</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Auth Form */}
                <div className="w-full lg:w-[480px]">
                    <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4">
                                <Anchor className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {isLogin ? 'Welcome Back' : 'Join SeaTrace'}
                            </h2>
                            <p className="text-slate-400">
                                {isLogin ? 'Sign in to access maritime intelligence' : 'Create your account to get started'}
                            </p>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-green-400 text-sm">{success}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {!isLogin && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                placeholder="Enter your full name"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                placeholder="Company name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Phone
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="operator">Operator</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            placeholder="Confirm your password"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Demo Accounts */}
                        {isLogin && (
                            <div className="mt-8">
                                <div className="text-center mb-4">
                                    <span className="text-slate-400 text-sm">Or try demo accounts:</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {demoAccounts.map((account) => (
                                        <button
                                            key={account.email}
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    email: account.email,
                                                    password: 'demo123'
                                                });
                                            }}
                                            className="flex items-center space-x-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-lg transition-colors duration-200"
                                        >
                                            <span className="text-2xl">{account.icon}</span>
                                            <div className="text-left">
                                                <div className="text-white text-sm font-medium">{account.email}</div>
                                                <div className="text-slate-400 text-xs">{account.role}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Toggle Login/Register */}
                        <div className="text-center mt-8">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    setSuccess('');
                                    setFormData({
                                        email: '',
                                        password: '',
                                        confirmPassword: '',
                                        name: '',
                                        company: '',
                                        phone: '',
                                        role: 'viewer'
                                    });
                                }}
                                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-200"
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .wave {
                    position: absolute;
                    width: 200%;
                    height: 100%;
                    background: linear-gradient(45deg, transparent, rgba(6, 182, 212, 0.1), transparent);
                    animation: wave 15s infinite linear;
                }

                .wave1 {
                    top: 0;
                    animation-delay: 0s;
                }

                .wave2 {
                    top: 20%;
                    animation-delay: -5s;
                    opacity: 0.5;
                }

                .wave3 {
                    top: 40%;
                    animation-delay: -10s;
                    opacity: 0.3;
                }

                @keyframes wave {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans text-slate-900 bg-white">
                {/* Modern Light Background with abstract shapes */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 z-0"></div>

                {/* Animated Background Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>

                <div className="flex flex-col lg:flex-row w-full max-w-7xl relative z-10 px-4 sm:px-6 lg:px-8 py-8 gap-12 lg:gap-16 items-center justify-between">

                    {/* Left: 3D/Model Visual Area & Unique Text */}
                    <div className="w-full lg:flex-1 text-center lg:text-left space-y-10 relative perspective-1000">
                        <div className="transform-style-3d hover:rotate-y-2 transition-transform duration-500">
                            {/* Unique 3D Text Effect */}
                            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-4 font-heading drop-shadow-2xl">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
                                    ⚓ SeaTrace
                                </span>
                            </h1>

                            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase font-heading text-cyan-600 mb-2 transform -skew-x-12 inline-block bg-blue-50 px-2 py-1 shadow-sm border-l-4 border-cyan-500">
                                MARITIME INTELLIGENCE
                            </h2>

                            <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed mt-4 drop-shadow-sm">
                                Advanced Ocean Monitoring & <br />
                                <span className="text-blue-600 font-bold">Environmental Protection</span>
                            </p>
                        </div>

                        {/* "Interesting Model" - CSS Animated Globe/Radar */}
                        <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto lg:mx-0 perspective-1000 group">
                            {/* Central 3D Sphere Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-400 rounded-full shadow-[0_0_60px_-15px_rgba(37,99,235,0.5)] opacity-90 animate-[pulse_4s_ease-in-out_infinite] transform-style-3d group-hover:rotate-x-12 transition-transform duration-1000"></div>

                            <Globe className="absolute inset-0 w-full h-full text-white/30 animate-[spin_20s_linear_infinite]" strokeWidth={0.5} />

                            {/* Orbital Rings - 3D Tilted */}
                            <div className="absolute inset-[-10%] border-2 border-slate-300/30 rounded-full animate-[spin_8s_linear_infinite_reverse] transform rotate-x-60"></div>
                            <div className="absolute inset-[-30%] border border-dashed border-slate-400/20 rounded-full animate-[spin_12s_linear_infinite] transform rotate-y-45"></div>

                            {/* Floating 3D Cards */}
                            <div className="absolute -top-5 -right-5 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/40 animate-bounce transform rotate-3 hover:rotate-0 transition-transform">
                                <Activity className="w-6 h-6 text-green-500 mb-1" />
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Analytics</div>
                                <div className="text-xl font-bold text-slate-800">Real-time</div>
                            </div>

                            <div className="absolute top-1/2 -left-12 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/40 animate-bounce delay-1000 transform -rotate-3 hover:rotate-0 transition-transform">
                                <Shield className="w-6 h-6 text-indigo-500 mb-1" />
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Protection</div>
                                <div className="text-xl font-bold text-slate-800">Active</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Modern Light Login Card */}
                    <div className="w-full lg:w-[480px]">
                        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 sm:p-12 relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">

                            {/* Top Accent Line */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500"></div>

                            <div className="mb-10 relative">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-green-500 to-emerald-700 font-heading mb-3 flex items-center gap-2">
                                    <span>🎉</span> Welcome to SeaTrace!
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Real-time vessel tracking, oil spill monitoring, and maritime analytics.
                                </p>
                                <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 text-xs font-medium text-blue-600 flex items-center gap-2">
                                    <Zap className="w-4 h-4 fill-current" />
                                    Click any demo account below for instant access!
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="w-full transform transition-all duration-300 hover:scale-[1.02]">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        theme="filled_blue"
                                        size="large"
                                        text="continue_with"
                                        shape="pill"
                                        width="100%"
                                        logo_alignment="left"
                                    />
                                </div>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or Connect With</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>

                                {/* Fake "Demo Accounts" as stylized buttons per text request "Click any demo..." */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => console.log('Demo clicked')} className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs font-bold text-slate-600 flex items-center justify-center gap-2 group">
                                        <Anchor className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                                        Viewer Demo
                                    </button>
                                    <button onClick={() => console.log('Demo clicked')} className="p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-xs font-bold text-slate-600 flex items-center justify-center gap-2 group">
                                        <Activity className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
                                        Operator Demo
                                    </button>
                                </div>

                                <div className="text-center text-[10px] text-slate-400 mt-6">
                                    Protected by SeaTrace Identity Cloud
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;
