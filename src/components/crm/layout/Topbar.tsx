'use client'

import { Menu, Bell, Search, Sun, Moon } from "lucide-react"
import { Button } from "@/components/crm/Button"
import { Input } from "@/components/crm/Input"

interface TopbarProps {
    onMenuClick?: () => void
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
    return (
        <div className="h-16 bg-white dark:bg-crm-primary border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8">
            {/* Left: Mobile Toggle & Breadcrumbs (Placeholder) */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <h2 className="text-lg font-semibold text-slate-800 dark:text-white hidden md:block">
                    Visão Geral
                </h2>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <div className="hidden md:block w-64 max-w-sm mr-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar leads, apólices..."
                            className="w-full h-9 pl-9 pr-4 text-sm rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-crm-secondary focus:bg-white transition-all dark:bg-crm-primary dark:border-slate-700 dark:text-white"
                        />
                    </div>
                </div>

                <button className="p-2 text-slate-400 hover:text-crm-secondary hover:bg-slate-100 rounded-full transition-all dark:hover:bg-slate-800 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-crm-primary"></span>
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                {/* Theme Toggle Placeholder - Assuming functionality later */}
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full dark:hover:text-white">
                    <Sun className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}
