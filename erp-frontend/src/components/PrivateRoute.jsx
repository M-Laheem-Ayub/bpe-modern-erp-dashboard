import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Loader2, LayoutDashboard } from 'lucide-react'; // Using icons for a branded loader

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 fixed inset-0 z-50">
                <div className="relative">
                    {/* Animated outer ring */}
                    <div className="h-16 w-16 rounded-2xl border-4 border-indigo-200 animate-spin"></div>
                    {/* Static/Pulsing inner logo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center animate-pulse">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
                <h2 className="mt-4 text-gray-600 font-medium text-sm tracking-wide animate-pulse">Loading Dashboard...</h2>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
