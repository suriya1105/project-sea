import React, { useEffect, useState } from 'react';
import { Fingerprint, Scan, ShieldCheck, Lock } from 'lucide-react';

const BiometricAuth = ({ onComplete }) => {
    const [scanState, setScanState] = useState('idle'); // idle, scanning, optimizing, success
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Auto-start scanning sequence
        const startScan = setTimeout(() => setScanState('scanning'), 500);

        return () => clearTimeout(startScan);
    }, []);

    useEffect(() => {
        if (scanState === 'scanning') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setScanState('optimizing');
                        return 100;
                    }
                    return prev + 2; // Fast scan
                });
            }, 20);
            return () => clearInterval(interval);
        }

        if (scanState === 'optimizing') {
            const timer = setTimeout(() => {
                setScanState('success');
                setTimeout(onComplete, 800); // Wait bit before closing
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [scanState, onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
            {/* Background Grid */}
            <div className={`absolute inset-0 grid-overlay opacity-20 pointer-events-none transition-opacity duration-1000 ${scanState === 'success' ? 'opacity-0' : ''}`}></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Scanner Visual */}
                <div className="relative w-64 h-64 mb-8">
                    {/* Rotating Rings */}
                    <div className={`absolute inset-0 border-4 border-cyan-900 rounded-full ${scanState === 'scanning' ? 'animate-spin-slow' : ''}`}></div>
                    <div className={`absolute inset-4 border-2 border-cyan-500/30 border-dashed rounded-full ${scanState === 'scanning' ? 'animate-spin-reverse' : ''}`}></div>

                    {/* Fingerprint / Shield Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {scanState === 'success' ? (
                            <ShieldCheck className="w-24 h-24 text-green-500 animate-bounce" />
                        ) : (
                            <Fingerprint className={`w-24 h-24 text-cyan-500 transition-all duration-300 ${scanState === 'scanning' ? 'opacity-100 scale-100' : 'opacity-50 scale-90'}`} />
                        )}
                    </div>

                    {/* Scanning Laser Line */}
                    {scanState === 'scanning' && (
                        <div className="absolute inset-0 w-full h-1 bg-cyan-400 blur-sm animate-scan-vertical"></div>
                    )}
                </div>

                {/* Status Text & Progress */}
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-xs uppercase tracking-widest text-cyan-400">
                        <span>{scanState === 'idle' ? 'INITIATING...' : scanState === 'scanning' ? 'BIOMETRIC SCAN' : scanState === 'optimizing' ? 'VERIFYING HASH' : 'ACCESS GRANTED'}</span>
                        <span>{progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-100 ease-linear ${scanState === 'success' ? 'bg-green-500' : 'bg-cyan-500'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="text-[10px] text-slate-500 text-center pt-2 h-4">
                        {scanState === 'scanning' && "Analyzing Retinal Patterns..."}
                        {scanState === 'optimizing' && "Decrypting 256-bit Secure Enclave..."}
                    </div>
                </div>

                {/* Decorative Bottom Text */}
                <div className="absolute bottom-10 text-[10px] text-slate-600 tracking-[0.5em] animate-pulse">
                    SEATRACE MILITARY GRADE SECURITY
                </div>
            </div>

            <style jsx>{`
                @keyframes scan-vertical {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan-vertical {
                    animation: scan-vertical 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default BiometricAuth;
