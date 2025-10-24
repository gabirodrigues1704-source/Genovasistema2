import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast"; // para a mensagem elegante

const Navbar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const { toast } = useToast();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/clientes', label: 'Clientes', icon: Users },
        { path: '/honorarios', label: 'Honorários', icon: FileText },
    ];

    // 🔥 Novo logout com toast estilizado
    const handleLogout = () => {
        const confirmLogout = window.confirm(
            `👋 Olá${user?.email ? `, ${user.email}` : ""}!\n\nTem certeza de que deseja sair do sistema Gênova Contabilidade?`
        );

        if (confirmLogout) {
            logout();
            toast({
                title: "Logout realizado com sucesso!",
                description: "Esperamos vê-lo novamente em breve 💼",
            });
        }
    };

    return (
        <nav className="bg-white shadow-md border-b-4 border-[#d4af37]">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* 🧾 Logo e nome */}
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Gênova Contabilidade
                        </span>
                    </div>

                    {/* 🔗 Navegação central */}
                    <div className="flex items-center space-x-2">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                                    location.pathname === path
                                        ? "bg-[#d4af37] text-white shadow-md"
                                        : "text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* 👤 Área do usuário */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-700 font-semibold">
                                {user?.email || "Usuário"}
                            </p>
                            <p className="text-xs text-gray-500">Administrador</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
