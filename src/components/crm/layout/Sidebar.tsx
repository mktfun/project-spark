'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    RefreshCcw,
    ShieldCheck,
    LogOut
} from "lucide-react"

interface SidebarProps {
    isOpen?: boolean
    setIsOpen?: (open: boolean) => void
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const pathname = usePathname()

    const links = [
        { href: "/crm/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/crm/deals", label: "Negociações", icon: Users },
        { href: "/crm/renewals", label: "Renovações", icon: RefreshCcw },
        { href: "/crm/documents", label: "Documentos", icon: FileText },
        { href: "/crm/settings", label: "Configurações", icon: Settings },
    ]

    return (
        <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gradient-to-tr from-crm-primary to-crm-secondary rounded-lg flex items-center justify-center shadow-lg ring-1 ring-white/10">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white/90">
                        Tork<span className="text-crm-secondary">CRM</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                    Menu Principal
                </div>

                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || pathname?.startsWith(link.href)

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen && setIsOpen(false)} // Close sidebar on mobile nav
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-crm-secondary/10 text-crm-secondary border border-crm-secondary/20 shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-crm-secondary" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            {link.label}
                        </Link>
                    )
                })}

                <div className="mt-8">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                        Sistema
                    </div>
                    <Link
                        href="/crm/styleguide"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                            pathname === "/crm/styleguide"
                                ? "bg-crm-secondary/10 text-crm-secondary border border-crm-secondary/20 shadow-sm"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <FileText className="h-5 w-5" />
                        Styleguide (Dev)
                    </Link>
                </div>
            </div>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="h-9 w-9 rounded-full bg-crm-secondary/20 flex items-center justify-center ring-2 ring-transparent group-hover:ring-crm-secondary/50 transition-all">
                        <span className="text-xs font-bold text-crm-secondary">AD</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Admin User</p>
                        <p className="text-xs text-slate-400 truncate">admin@tork.com</p>
                    </div>
                    <LogOut className="h-4 w-4 text-slate-500 hover:text-white" />
                </div>
            </div>
        </div>
    )
}
