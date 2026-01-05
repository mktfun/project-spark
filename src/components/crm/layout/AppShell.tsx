import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

interface AppShellProps {
    children: React.ReactNode
}

export const AppShell = ({ children }: AppShellProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#020617] overflow-hidden font-sans">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-[#0b0f19] text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-xl md:shadow-none border-r border-slate-700/50",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="flex-1 overflow-y-auto scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}
