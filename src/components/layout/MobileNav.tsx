"use client";

import { LayoutDashboard, Users, KanbanSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0e27]/90 backdrop-blur-xl border-t border-gray-800 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                <MobileNavItem icon={<LayoutDashboard size={24} />} label="Visão" href="/" />
                <MobileNavItem icon={<Users size={24} />} label="Leads" href="/leads" />
                <MobileNavItem icon={<KanbanSquare size={24} />} label="Negócios" href="/deals" />
                <MobileNavItem icon={<Settings size={24} />} label="Config" href="/settings" />
            </div>
        </nav>
    );
}

function MobileNavItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
    const pathname = usePathname();
    const active = pathname === href;

    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-cyan-400' : 'text-gray-500'
                }`}
        >
            <div className={`p-1 rounded-lg transition-all ${active ? 'bg-cyan-500/10' : ''}`}>
                {icon}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
}
