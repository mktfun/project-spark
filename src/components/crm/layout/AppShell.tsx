'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
// We'll treat this as the main layout wrapper
// It handles the sidebar state and standard spacing

interface AppShellProps {
    children: React.ReactNode
    sidebar: React.ReactNode
    topbar: React.ReactNode
}

export const AppShell = ({ children, sidebar, topbar }: AppShellProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

    // Provide state to children if needed via context, or just cloneElement if simple
    // For now, we assume sidebar and topbar accept props to control state

    const sidebarWithProps = React.cloneElement(sidebar as React.ReactElement, {
        isOpen: isSidebarOpen,
        setIsOpen: setIsSidebarOpen
    })

    const topbarWithProps = React.cloneElement(topbar as React.ReactElement, {
        onMenuClick: () => setIsSidebarOpen(!isSidebarOpen)
    })

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-crm-primary/20 overflow-hidden font-sans">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - fixed on mobile, static on desktop */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-crm-primary text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-xl md:shadow-none border-r border-slate-700/50",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {sidebarWithProps}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {topbarWithProps}

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
