"use client";

import { LayoutDashboard, Users, KanbanSquare, Settings, LogOut, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="sidebar-dock hidden md:flex flex-col">
            {/* Logo Header */}
            <div className="p-5 flex items-center gap-3 border-b border-white/5">
                <div className="w-9 h-9 flex items-center justify-center">
                    <img src="/tork-logo.png" alt="Tork Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-xl tracking-wide text-white">
                    TORK <span className="text-cyan-400">CRM</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 mt-2">
                <NavItem icon={<LayoutDashboard size={20} />} label="Visão Geral" href="/" />
                <NavItem icon={<Users size={20} />} label="Leads" href="/leads" />
                <NavItem icon={<KanbanSquare size={20} />} label="Negócios" href="/deals" />
                <NavItem icon={<Settings size={20} />} label="Configurações" href="/settings" />
            </nav>

            {/* User Profile */}
            <div className="p-3 border-t border-white/5">
                {user ? (
                    <div className="glass-panel p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-bold uppercase text-cyan-400">
                            {user.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate text-white">{user.name}</div>
                            <div className="text-xs text-gray-500 truncate capitalize">{user.role}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Sair"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="btn-primary w-full text-sm"
                    >
                        Entrar
                    </Link>
                )}
            </div>
        </aside>
    );
}

function NavItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
    const pathname = usePathname();
    const active = pathname === href;

    return (
        <Link
            href={href}
            className={`nav-item group ${active ? 'nav-item-active' : ''}`}
        >
            <span className={`nav-icon transition-all duration-200 ${active
                ? 'text-cyan-400'
                : 'text-gray-500 group-hover:text-cyan-400'
                }`}>
                {icon}
            </span>
            <span className={`font-medium text-sm ${active ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'
                }`}>
                {label}
            </span>
            {active && (
                <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse-glow" />
            )}
        </Link>
    );
}
