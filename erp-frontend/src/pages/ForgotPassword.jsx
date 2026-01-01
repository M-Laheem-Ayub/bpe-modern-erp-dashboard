import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Mail, ArrowRight, ChevronLeft, Loader2, KeyRound, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Call the real backend API
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err) {
            console.error('Error sending reset email', err);
            // We usually don't want to reveal if an email exists or not for security, 
            // but for this ERP UX we might want to show errors if it's a network issue.
            // For now, let's just proceed to submitted state or show generic error if 500
            if (err.response && err.response.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                // Even if user not found, we often fake success to prevent email enumeration.
                // But typically in ERPs we might want to be helpful. 
                // Let's assume we proceed to success screen to be secure by default.
                setSubmitted(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-100 opacity-50 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-purple-100 opacity-50 blur-2xl"></div>

                <div className="text-center relative z-10">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
                        <KeyRound className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">Enter your email to receive recovery instructions</p>
                </div>

                {!submitted ? (
                    <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
                        {error && (
                            <div className="flex items-center text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 pl-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 border-gray-200 bg-gray-50/50 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-indigo-200"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            <ArrowRight className="h-5 w-5 text-indigo-100 group-hover:text-white" />
                                        </span>
                                        Send Reset Link
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-8 text-center space-y-6 relative z-10 animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-50/80 backdrop-blur p-6 rounded-2xl border border-green-100 shadow-sm">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-gray-900 font-bold text-lg mb-2">Check your email</h3>
                            <p className="text-gray-600">
                                We've sent password reset instructions to <strong>{email}</strong>.
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Did not receive the email? Check your spam folder or try again.
                        </p>
                    </div>
                )}

                <div className="text-center mt-6 relative z-10">
                    <Link to="/login" className="flex items-center justify-center gap-2 font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                        <ChevronLeft size={16} /> Back to Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
