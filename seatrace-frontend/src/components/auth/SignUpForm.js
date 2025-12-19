import React, { useState } from 'react';
import { Mail, Phone, User, Lock, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import VerificationModal from './VerificationModal';

const SignUpForm = ({ onAuthSuccess, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Verification State
    const [showVerification, setShowVerification] = useState(false);
    const [verifyMethod, setVerifyMethod] = useState(null); // 'email' or 'sms'
    const [verifyTarget, setVerifyTarget] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Register User
            const response = await fetch('http://localhost:5000/api/auth/register-public', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // 2. Prompt for Verification
            // Default to Email verification first, but user could choose
            setVerifyMethod('email');
            setVerifyTarget(formData.email);

            // Trigger Send Code
            await sendVerificationCode(formData.email, 'email');

            setShowVerification(true);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const sendVerificationCode = async (target, method) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target, method })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // For demo purposes, we log the simulated code or show a toast
            console.log('Verification Code:', data.simulated_code);
            // In a real app, we wouldn't show this, but for "User Friendly" testing:
            alert(`SIMULATED CODE: ${data.simulated_code}`);

        } catch (err) {
            console.error('Failed to send code:', err);
            setError('Failed to send verification code. Please try again.');
        }
    };

    const handleVerify = async (code) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target: verifyTarget,
                    code: code,
                    email: formData.email
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Verify Success -> Auto Login
            setShowVerification(false);
            await loginUser();

        } catch (err) {
            throw new Error(err.message || 'Invalid code');
        }
    };

    const loginUser = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });
            const data = await response.json();
            if (response.ok) {
                onAuthSuccess(data);
            } else {
                onSwitchToLogin(); // Fallback
            }
        } catch (e) {
            onSwitchToLogin();
        }
    };

    return (
        <>
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                    {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <span>Create Account</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <VerificationModal
                isOpen={showVerification}
                onClose={() => setShowVerification(false)}
                onVerify={handleVerify}
                onResend={() => sendVerificationCode(verifyTarget, verifyMethod)}
                method={verifyMethod}
                target={verifyTarget}
            />
        </>
    );
};

export default SignUpForm;
