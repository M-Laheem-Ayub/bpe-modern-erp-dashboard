import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShoppingCart, Users, LifeBuoy, CreditCard, Heart, Monitor, Truck, BookOpen, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
            <p className="text-sm text-gray-400">{subtext}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        inventory: 0,
        orders: 0,
        candidates: 0,
        tickets: 0,
        leads: 0,
        vendors: 0
    });

    const [stockAlerts, setStockAlerts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    inventoryRes,
                    ordersRes,
                    jobsRes,
                    complaintsRes,
                    crmRes,
                    vendorsRes
                ] = await Promise.all([
                    api.get('/inventory'),
                    api.get('/orders'),
                    api.get('/jobs'),
                    api.get('/complaints'),
                    api.get('/crm'),
                    api.get('/vendors')
                ]);

                const inventory = inventoryRes.data;
                const orders = ordersRes.data;

                setStats({
                    inventory: inventory.length,
                    orders: orders.length,
                    candidates: jobsRes.data.length,
                    tickets: complaintsRes.data.length,
                    leads: crmRes.data.length,
                    vendors: vendorsRes.data.length
                });

                // 1. Logic for Low Stock Alerts (Stock < 20)
                const lowStock = inventory.filter(item => item.currentStock < 20);
                setStockAlerts(lowStock.slice(0, 3));

                // 2. Logic for Recent Orders (Last 5)
                const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentOrders(sortedOrders.slice(0, 5));

                // 3. Logic for Weekly Activity Chart (Last 7 Days Orders)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d;
                }).reverse();

                const chartData = last7Days.map(date => {
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateStr = date.toISOString().split('T')[0];

                    // Count orders that match this date (ignoring time)
                    const count = orders.filter(order => {
                        if (!order.createdAt) return false;
                        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                        return orderDate === dateStr;
                    }).length;

                    return { name: dayName, value: count };
                });
                setChartData(chartData);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const modules = [
        { name: 'Inventory', path: '/inventory', icon: Package, color: 'bg-blue-100 text-blue-600' },
        { name: 'Orders', path: '/orders', icon: ShoppingCart, color: 'bg-green-100 text-green-600' },
        { name: 'CRM', path: '/crm', icon: Heart, color: 'bg-pink-100 text-pink-600' },
        { name: 'HR', path: '/recruitment', icon: Users, color: 'bg-purple-100 text-purple-600' },
        { name: 'Procurement', path: '/procurement', icon: CreditCard, color: 'bg-orange-100 text-orange-600' },
        { name: 'Support', path: '/complaints', icon: LifeBuoy, color: 'bg-red-100 text-red-600' },
        { name: 'IT Support', path: '/it-support', icon: Monitor, color: 'bg-indigo-100 text-indigo-600' },
        { name: 'Vendors', path: '/vendors', icon: Truck, color: 'bg-teal-100 text-teal-600' },
        { name: 'Training', path: '/training', icon: BookOpen, color: 'bg-cyan-100 text-cyan-600' },
        { name: 'Performance', path: '/performance', icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
                <p className="text-gray-500 text-sm">Real-time metrics from your Smart ERP.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inventory"
                    value={stats.inventory}
                    subtext="Items in stock"
                    icon={Package}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    subtext="Orders processed"
                    icon={ShoppingCart}
                    color="bg-green-500"
                />
                <StatCard
                    title="CRM Leads"
                    value={stats.leads}
                    subtext="Potential customers"
                    icon={Heart}
                    color="bg-pink-500"
                />
                <StatCard
                    title="Support Tickets"
                    value={stats.tickets}
                    subtext="Open issues"
                    icon={LifeBuoy}
                    color="bg-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Chart & Quick Access */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Weekly Activity</h3>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Links Grid */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Access</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {modules.slice(0, 8).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`${item.color} p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity text-center h-24`}
                                >
                                    <item.icon size={24} />
                                    <span className="text-xs font-semibold">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column: Alerts & Recent Orders */}
                <div className="space-y-6">

                    {/* Stock Alerts Widget */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="text-orange-500" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Stock Alerts</h3>
                        </div>
                        {stockAlerts.length > 0 ? (
                            <div className="space-y-3">
                                {stockAlerts.map(item => (
                                    <div key={item._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{item.itemName}</p>
                                            <p className="text-xs text-red-600 font-medium">Only {item.currentStock} left</p>
                                        </div>
                                        <Link to="/inventory" className="text-orange-600 hover:text-orange-800">
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Inventory levels are healthy.</p>
                        )}
                    </div>

                    {/* Recent Orders Widget */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                            <Link to="/orders" className="text-xs text-blue-600 hover:underline">View All</Link>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {recentOrders.map((order, idx) => (
                                    <div key={order._id || idx} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                                            {order.customerName ? order.customerName.charAt(0) : '#'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">${order.totalAmount} • {order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No recent orders.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
