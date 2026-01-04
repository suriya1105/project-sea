import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, Cpu, Zap, Activity } from 'lucide-react';
import '../App.css'; // Ensure we use the global styles

import { processAIQuery } from './services/AIEngine';

const AvatarAssistant = ({ isOpen, onClose, context, token }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Systems Online. I am your SeaTrace AI Co-Pilot. How can I assist with the current marine situation?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Process with AI Engine
        setTimeout(async () => {
            const response = await processAIQuery(userMsg.text, context, token);

            setMessages(prev => [...prev, { id: Date.now() + 1, text: response.text, sender: 'ai' }]);
            setIsTyping(false);

            // Execute Actions
            if (response.action === 'navigate_spills') {
                if (context.setActiveTab) context.setActiveTab('spills');
            }
            if (response.action === 'focus_map') {
                if (context.setActiveTab) context.setActiveTab('map');
            }
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-96 bg-slate-900/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl z-[100] flex flex-col overflow-hidden animate-slide-up">
            {/* Header with "Neat Symbol" */}
            <div className="bg-gradient-to-r from-cyan-900 to-slate-900 p-4 border-b border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* The "Neat Symbol" - An animated AI Core */}
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-1 bg-cyan-400/30 rounded-full animate-pulse"></div>
                        <Cpu className="w-6 h-6 text-cyan-300 relative z-10 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                    </div>
                    <div>
                        <h3 className="font-orbitron font-bold text-cyan-100 tracking-wider">AVATAR AI</h3>
                        <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            ONLINE
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-cyan-400/70 hover:text-cyan-100 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm font-rajdhani leading-relaxed whitespace-pre-wrap shadow-sm ${msg.sender === 'user'
                            ? 'bg-cyan-700/30 text-cyan-50 border border-cyan-500/30 rounded-tr-none'
                            : 'bg-slate-800/90 text-gray-200 border border-slate-600 rounded-tl-none shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/50 p-3 rounded-lg rounded-tl-none flex gap-1">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-cyan-500/20 bg-slate-900/50">
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-full border border-cyan-500/20 px-4 py-2 focus-within:border-cyan-500/60 transition-colors">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask SeaTrace AI..."
                        className="bg-transparent border-none text-cyan-100 placeholder-cyan-700/50 text-sm focus:outline-none w-full font-rajdhani"
                    />
                    <button onClick={handleSend} className="text-cyan-400 hover:text-white transition-colors">
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarAssistant;
