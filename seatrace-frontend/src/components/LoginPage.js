import React, { useState } from 'react';
import { ArrowRight, Globe, Zap, Shield, Activity, Anchor } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const LoginPage = ({ onLogin }) => {
    // Get Google OAuth Client ID from environment variables
    const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_ACTUAL_CLIENT_ID_HERE";

    const handleGoogleSuccess = (credentialResponse) => {
        console.log("Google Success:", credentialResponse);
        if (credentialResponse.credential) {
            onLogin('google-user@seatrace.com', 'google-auth');
        }
    };

    const handleGoogleError = () => {
        console.log('Login Failed');
        alert("Google Sign-In Failed");
    };

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
