import React, { useState, useContext, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ChevronLeft, LayoutDashboard, User, LogOut, ChevronDown, Check, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [notifications, setNotifications] = useState([]);

    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data);
            } catch (err) {
                console.error("Error fetching notifications", err);
            }
        };

        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 3000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const searchableModules = [
        { name: 'Dashboard', path: '/' },
        { name: 'Inventory Management', path: '/inventory' },
        { name: 'Order Processing', path: '/orders' },
        { name: 'Recruitment (HR)', path: '/recruitment' },
        { name: 'CRM & Leads', path: '/crm' },
        { name: 'Procurement', path: '/procurement' },
        { name: 'Customer Complaints', path: '/complaints' },
        { name: 'IT Support Tickets', path: '/it-support' },
        { name: 'Vendor Management', path: '/vendors' },
        { name: 'Employee Training', path: '/training' },
        { name: 'Performance Reviews', path: '/performance' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.length > 0) {
            const filtered = searchableModules.filter(module =>
                module.name.toLowerCase().includes(value.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        setQuery('');
        setResults([]);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
        setShowLogoutModal(false);
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Error marking as read", err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Error marking all read", err);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'alert': return <AlertTriangle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " mesi ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4 relative">
                <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-all">
                    {isSidebarOpen ? <ChevronLeft size={22} /> : <Menu size={22} />}
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="text-gray-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-all group"
                    title="Go to Dashboard"
                >
                    <LayoutDashboard size={22} className="group-hover:scale-110 transition-transform" />
                </button>

                <div className="hidden md:flex flex-col relative ml-2">
                    <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 w-64 lg:w-96 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={query}
                            onChange={handleSearch}
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    {results.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                            {results.map((result) => (
                                <div
                                    key={result.path}
                                    onClick={() => handleNavigate(result.path)}
                                    className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 flex items-center gap-3 transition-colors"
                                >
                                    <div className="p-1.5 bg-indigo-100 rounded-md">
                                        <Search size={12} className="text-indigo-600" />
                                    </div>
                                    {result.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">

                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="fixed left-4 right-4 top-[4.5rem] md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animation-fade-in-down">
                            <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            onClick={() => markAsRead(notif._id)}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-gray-200 transition-all"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md text-sm">
                            {getInitials(user?.name)}
                        </div>
                        <div className="hidden md:flex flex-col items-start">
                            <span className="text-sm font-semibold text-gray-700 leading-none">{user?.name || 'User'}</span>
                            <span className="text-[10px] text-gray-500 font-medium mt-0.5">{user?.role === 'admin' ? 'Administrator' : 'Employee'}</span>
                        </div>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animation-fade-in-down">
                            <div className="px-4 py-3 border-b border-gray-50">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>

                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <User size={16} className="text-gray-400" />
                                    My Profile
                                </button>
                            </div>

                            <div className="border-t border-gray-50 py-1">
                                <button
                                    onClick={() => {
                                        setShowLogoutModal(true);
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={16} className="text-red-500" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                <LogOut className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out?</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to sign out of your account?
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
