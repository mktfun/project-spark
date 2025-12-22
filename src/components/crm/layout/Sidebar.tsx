'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Kanban, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/crm/Button';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/crm/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/crm/leads', icon: Users },
    { name: 'Negócios', href: '/crm/deals', icon: Kanban },
    { name: 'Configurações', href: '/crm/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        // Implement logout logic here later (clear tokens, redirect)
        document.cookie = 'tork_token=; path=/; max-age=0;';
        localStorage.removeItem('tork_token');
        localStorage.removeItem('tork_user');
        window.location.href = '/crm/login';
    };

    return (
        <aside className="w-64 min-h-screen bg-[#0b0f19] border-r border-[#1e293b] flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
                <span className="text-2xl font-bold tracking-tight text-white">TORK</span>
                <span className="text-2xl font-bold tracking-tight text-blue-600 ml-1">CRM</span>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                                isActive
                                    ? 'bg-blue-600/10 text-blue-400'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5', isActive ? 'text-blue-500' : 'text-slate-500')} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-[#1e293b]">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-800 text-blue-200 text-xs font-bold">
                        AD
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Admin User</p>
                        <p className="text-xs text-slate-500 truncate">admin@tork.com</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair do Sistema
                </Button>
            </div>
        </aside>
    );
}
