"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
        <div className="flex min-h-screen">
            {!isLoginPage && <Sidebar />}
            <div className={`flex-1 ${!isLoginPage ? 'md:ml-64' : ''} relative`}>
                {children}
            </div>
            {!isLoginPage && <MobileNav />}
        </div>
    );
}
