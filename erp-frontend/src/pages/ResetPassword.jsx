import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock, ArrowRight, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
        setValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        });
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const allValid = Object.values(validations).every(Boolean);
        if (!allValid) {
            setError('Please strictly follow the password requirements below.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setSuccess('Password updated successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Link might be expired.');
            setIsLoading(false);
        }
    };

    const ValidationItem = ({ fulfilled, text }) => (
        <div className={`flex items-center text-xs transition-colors duration-300 ${fulfilled ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
            {fulfilled ? <Check size={14} className="mr-1.5" /> : <div className="w-3.5 h-3.5 mr-1.5 rounded-full border border-gray-300" />}
            {text}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 rounded-full bg-indigo-100 opacity-50 blur-2xl"></div>

                <div className="text-center relative z-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Set New Password</h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">Create a strong password for your account</p>
                </div>

                {success ? (
                    <div className="bg-green-50/80 backdrop-blur text-green-700 p-6 rounded-2xl text-center border border-green-100 shadow-sm animate-in fade-in zoom-in">
                        <Check className="h-10 w-10 text-green-600 mx-auto mb-2" />
                        <h3 className="text-lg font-bold">Success!</h3>
                        <p>{success}</p>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
                        {error && (
                            <div className="flex items-center text-red-500 text-sm bg-red-50/80 backdrop-blur p-4 rounded-xl border border-red-100 animate-pulse">
                                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 pl-1">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-11 pr-12 py-3.5 border-gray-200 bg-gray-50/50 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm"
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 pl-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-11 pr-12 py-3.5 border-gray-200 bg-gray-50/50 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/80 backdrop-blur p-4 rounded-xl border border-gray-100 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <ValidationItem fulfilled={validations.length} text="8+ characters" />
                                <ValidationItem fulfilled={validations.uppercase} text="Uppercase (A-Z)" />
                                <ValidationItem fulfilled={validations.lowercase} text="Lowercase (a-z)" />
                                <ValidationItem fulfilled={validations.number} text="Number (0-9)" />
                                <ValidationItem fulfilled={validations.special} text="Special (@$!%)" />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !Object.values(validations).every(Boolean)}
                                className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all duration-200 shadow-lg 
                                ${isLoading ? 'bg-indigo-400 cursor-wait' :
                                        Object.values(validations).every(Boolean)
                                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 cursor-pointer'
                                            : 'bg-gray-400 cursor-not-allowed shadow-none opacity-70'}`}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            <ArrowRight className={`h-5 w-5 transition-colors ${Object.values(validations).every(Boolean) ? 'text-indigo-100 group-hover:text-white' : 'text-gray-200'}`} />
                                        </span>
                                        Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
