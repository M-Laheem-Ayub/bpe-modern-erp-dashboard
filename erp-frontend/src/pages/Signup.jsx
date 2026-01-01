import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Check, AlertCircle, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Password Validation State
    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
        const { password } = formData;
        setValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        });
    }, [formData.password]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allValid = Object.values(validations).every(Boolean);
        if (!allValid) {
            setError('Please ensure your password meets all requirements below.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await register(formData.name, formData.email, formData.password);
            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 rounded-full bg-indigo-100 opacity-50 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full bg-purple-100 opacity-50 blur-2xl"></div>

                <div className="text-center relative z-10">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 transform hover:scale-105 transition-transform duration-300">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">Join the intelligent ERP system today</p>
                </div>

                {success ? (
                    <div className="bg-green-50/80 backdrop-blur text-green-700 p-6 rounded-2xl text-center border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Success!</h3>
                        <p>{success}</p>
                    </div>
                ) : (
                    <form className="mt-8 space-y-5 relative z-10" onSubmit={handleSubmit}>
                        {error && (
                            <div className="flex items-center text-red-500 text-sm bg-red-50/80 backdrop-blur p-4 rounded-xl border border-red-100 animate-pulse">
                                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 pl-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 border-gray-200 bg-gray-50/50 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

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
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 pl-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-11 pr-12 py-3.5 border-gray-200 bg-gray-50/50 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none cursor-pointer transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password Requirements Checklist */}
                        <div className="bg-gray-50/80 backdrop-blur p-5 rounded-2xl border border-gray-100 space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Security Check</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                            ? 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200 cursor-pointer'
                                            : 'bg-gray-400 cursor-not-allowed shadow-none opacity-70'}`}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            <ArrowRight className={`h-5 w-5 transition-colors ${Object.values(validations).every(Boolean) ? 'text-indigo-100 group-hover:text-white' : 'text-gray-200'}`} />
                                        </span>
                                        Sign Up
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-6 text-sm text-gray-500 relative z-10">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Sign in instead
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
