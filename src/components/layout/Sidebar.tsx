"use client";

import { LayoutDashboard, Users, KanbanSquare, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-50 p-4">
            {/* Glass Container - Floating Look */}
            <div className="flex flex-col h-full w-full glass-panel overflow-hidden relative">

                {/* Logo Area */}
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,245,255,0.15)]">
                        <img src="/tork-logo.png" alt="Tork" className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                        <span className="font-bold text-xl tracking-widest text-white block leading-none">TORK</span>
                        <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">CRM System</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 mt-6">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Visão Geral" href="/" />
                    <NavItem icon={<Users size={20} />} label="Leads" href="/leads" />
                    <NavItem icon={<KanbanSquare size={20} />} label="Negócios" href="/deals" />
                    <NavItem icon={<Settings size={20} />} label="Configurações" href="/settings" />
                </nav>

                {/* User Footer */}
                <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-black shadow-lg">
                                {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-sm font-bold text-white truncate">{user.name}</div>
                                <div className="text-xs text-gray-400 truncate capitalize">{user.role}</div>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Sair"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn-primary w-full text-sm">
                            Entrar
                        </Link>
                    )}
                </div>
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
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                ? 'text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {active && (
                <div className="absolute inset-0 bg-cyan-500/10 border-l-4 border-cyan-400" />
            )}

            <span className={`relative z-10 transition-transform duration-300 ${active ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]' : 'group-hover:scale-110'}`}>
                {icon}
            </span>
            <span className="relative z-10 font-medium tracking-wide">{label}</span>
        </Link>
    );
}
