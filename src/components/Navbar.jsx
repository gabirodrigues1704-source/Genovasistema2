import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/clientes', label: 'Clientes', icon: Users },
        { path: '/honorarios', label: 'Honorários', icon: FileText }
    ];

    return (
        <nav className="bg-white shadow-md border-b-4 border-[#d4af37]">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Gênova Contabilidade</span>
                    </div>

                    <div className="flex space-x-1">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                                    location.pathname === path
                                        ? "bg-[#d4af37] text-white shadow-md"
                                        : "text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;