import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Heart,
    CreditCard,
    LifeBuoy,
    Monitor,
    Truck,
    BookOpen,
    TrendingUp,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Inventory', path: '/inventory', icon: Package },
        { name: 'Orders', path: '/orders', icon: ShoppingCart },
        { name: 'Recruitment', path: '/recruitment', icon: Users },
        { name: 'CRM', path: '/crm', icon: Heart },
        { name: 'Procurement', path: '/procurement', icon: CreditCard },
        { name: 'Support', path: '/complaints', icon: LifeBuoy },
        { name: 'IT Support', path: '/it-support', icon: Monitor },
        { name: 'Vendors', path: '/vendors', icon: Truck },
        { name: 'Training', path: '/training', icon: BookOpen },
        { name: 'Performance', path: '/performance', icon: TrendingUp },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={toggleSidebar}
            />

            {/* Sidebar 
          - Always overflow-hidden to prevent text spilling during transition
          - Mobile: Fixed, slide in/out using translate
          - Desktop: Static, width transition from 0 to 64
      */}
            <div className={`fixed inset-y-0 left-0 z-50 bg-[#0f172a] text-white transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-0'}
        md:static
      `}>
                {/* Inner Container with min-width to ensure content doesn't wrap while parent shrinks */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 min-w-[256px]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-white">S</span>
                        </div>
                        <span className="text-xl font-bold whitespace-nowrap">Smart ERP</span>
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] min-w-[256px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 768 && toggleSidebar()}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 whitespace-nowrap ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} className="min-w-[20px]" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
