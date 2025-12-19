import React, { useState } from 'react';
import { X, Lock, RefreshCw } from 'lucide-react';

const VerificationModal = ({ isOpen, onClose, onVerify, onResend, method, target }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (index, value) => {
        if (value.length > 1) return; // Prevent multiple chars

        // Allow only numbers
        if (value && !/^\d+$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-advance focus
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const nextInput = document.getElementById(`code-${index - 1}`);
            if (nextInput) {
                nextInput.focus();
                // Clear previous input if needed
                const newCode = [...code];
                newCode[index - 1] = '';
                setCode(newCode);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onVerify(fullCode);
            // Success is handled by parent
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backbone-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center space-x-2">
                        <Lock className="w-5 h-5" />
                        <span className="font-semibold text-lg">Verify Account</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📩</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Details Sent</h3>
                        <p className="text-gray-600">
                            We've sent a verification code to your {method === 'email' ? 'email' : 'phone'}
                        </p>
                        <p className="font-semibold text-blue-600 mt-1">{target}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center space-x-2 mb-6">
                            {code.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`code-${idx}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-14 border-2 border-gray-200 rounded-lg text-center text-2xl font-bold text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={onResend}
                            className="text-gray-500 text-sm hover:text-blue-600 transition flex items-center justify-center w-full"
                        >
                            Didn't receive code? <span className="font-semibold ml-1">Resend</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
