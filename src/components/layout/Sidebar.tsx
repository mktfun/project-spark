"use client";

import { LayoutDashboard, Users, KanbanSquare, Settings, LogOut, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#0a0e27]/95 backdrop-blur-xl border-r border-gray-800 z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                    {/* Placeholder Logo or keep existing if generic */}
                    <img src="/tork-logo.png" alt="Tork Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-xl tracking-wider text-white">TORK <span className="text-cyan-400">CRM</span></span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                <NavItem icon={<LayoutDashboard size={20} />} label="Visão Geral" href="/" />
                <NavItem icon={<Users size={20} />} label="Leads" href="/leads" />
                <NavItem icon={<KanbanSquare size={20} />} label="Negócios" href="/deals" />
                <NavItem icon={<Settings size={20} />} label="Configurações" href="/settings" />
            </nav>

            <div className="p-4 border-t border-gray-800">
                {user ? (
                    <div className="glass-card p-3 rounded-lg flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold uppercase">
                            {user.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-medium truncate text-white">{user.name}</div>
                            <div className="text-xs text-gray-400 truncate capitalize">{user.role}</div>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-medium">
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${active
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <span className={`${active ? 'text-cyan-400' : 'text-gray-500 group-hover:text-white'}`}>
                {icon}
            </span>
            <span className="font-medium">{label}</span>
            {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
        </Link>
    );
}
