import React, { useState, useEffect, useRef } from 'react';
import { Radio, MessageSquare, Send, Lock, Wifi, Mic, Volume2 } from 'lucide-react';

const CommsPage = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'CMD_CENTER', text: 'OpSec Level 4 active. Maintain radio silence.', time: '14:02:00', type: 'system' },
        { id: 2, sender: 'VESSEL_04', text: 'Requesting permission to dock at Sector 7.', time: '14:05:12', type: 'incoming' },
        { id: 3, sender: 'OP_ALPHA', text: 'Permission granted. Proceed with caution.', time: '14:06:05', type: 'outgoing' },
    ]);
    const [inputText, setInputText] = useState('');
    const [frequency, setFrequency] = useState(142.05);
    const chatEndRef = useRef(null);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Simulate incoming ghost messages
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const ghostMessages = [
                    "Checking visuals on hull integrity...",
                    "Unidentified signal detected at coordinates 45.2, -12.4",
                    "Telemetry data sync complete.",
                    "WARNING: Storm front approaching Sector 9.",
                    "Intercepted partial transmission: '...cargo is secure...'"
                ];
                const msg = ghostMessages[Math.floor(Math.random() * ghostMessages.length)];
                addMessage('SIGNAL_INTERCEPT', msg, 'intercept');
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const addMessage = (sender, text, type) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender,
            text,
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            type
        }]);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        addMessage('OPERATOR', inputText, 'outgoing');
        setInputText('');
    };

    return (
        <div className="h-full p-6 flex gap-6 animate-slide-in">
            {/* Left Panel: Frequency & Crypto */}
            <div className="w-80 flex flex-col gap-6">

                {/* Radio Tuner */}
                <div className="cyber-panel relative overflow-hidden group">
                    <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                        <Radio className="w-5 h-5" /> FREQUENCY TUNER
                    </h3>

                    <div className="bg-black/50 p-4 border border-cyan-500/30 rounded mb-4 text-center">
                        <div className="text-4xl font-mono font-bold text-cyan-400 tracking-wider">
                            {frequency.toFixed(2)} <span className="text-xs text-slate-500">MHz</span>
                        </div>
                    </div>

                    <input
                        type="range"
                        min="100"
                        max="200"
                        step="0.01"
                        value={frequency}
                        onChange={(e) => setFrequency(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 mb-4"
                    />

                    {/* Waveform Visualizer (Simulated with CSS) */}
                    <div className="h-32 bg-slate-900 border border-cyan-500/20 rounded flex items-end justify-center gap-[2px] p-2 overflow-hidden">
                        {[...Array(40)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-cyan-500/50 transition-all duration-100 ease-in-out"
                                style={{
                                    height: `${Math.random() * 100}%`,
                                    opacity: Math.max(0.2, 1 - Math.abs(i - 20) / 10)
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Encryption Status */}
                <div className="cyber-panel flex-1">
                    <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" /> ENCRYPTION
                    </h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-green-900/10 border border-green-500/30 rounded">
                            <div className="text-xs text-slate-400 uppercase mb-1">Status</div>
                            <div className="text-green-400 font-bold flex items-center gap-2">
                                <Wifi className="w-4 h-4 animate-pulse" /> SECURE (AES-256)
                            </div>
                        </div>
                        <div className="p-3 bg-slate-900/50 border border-cyan-500/30 rounded">
                            <div className="text-xs text-slate-400 uppercase mb-1">Active Keys</div>
                            <div className="font-mono text-cyan-500 text-xs break-all">
                                7f8a9d0e1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Panel: Chat Terminal */}
            <div className="flex-1 cyber-panel flex flex-col p-0 overflow-hidden relative">

                {/* Header */}
                <div className="p-4 border-b border-cyan-500/30 bg-slate-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <MessageSquare className="w-5 h-5" /> SECURE CHANNEL #94
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1"><Mic className="w-3 h-3 text-red-500" /> REC</div>
                        <div className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> VOL 80%</div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar bg-black/40">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.type === 'outgoing' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[80%] rounded p-3 border ${msg.type === 'system' ? 'w-full bg-slate-900 text-slate-400 border-slate-700 text-center italic text-xs' :
                                    msg.type === 'outgoing' ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-100 rounded-br-none' :
                                        msg.type === 'intercept' ? 'bg-slate-800 border-dashed border-slate-500 text-slate-300' :
                                            'bg-slate-800/80 border-slate-600 text-white rounded-bl-none'
                                }`}>
                                <div className="flex justify-between items-center gap-4 mb-1 text-[10px] uppercase opacity-70">
                                    <span className={`font-bold ${msg.type === 'intercept' ? 'text-yellow-500' : 'text-cyan-500'}`}>{msg.sender}</span>
                                    <span>{msg.time}</span>
                                </div>
                                <div>{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-cyan-500/30 flex gap-4">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter encrypted message..."
                        className="flex-1 bg-black/50 border border-slate-600 rounded px-4 py-2 text-white focus:border-cyan-500 outline-none font-mono"
                    />
                    <button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                    >
                        SEND <Send className="w-4 h-4" />
                    </button>
                </form>

                {/* Scanlines Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
            </div>
        </div>
    );
};

export default CommsPage;
