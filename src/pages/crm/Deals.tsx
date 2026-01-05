import React from 'react';
import { KanbanBoard } from '@/components/crm/kanban/KanbanBoard';
import { Button } from '@/components/crm/Button';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/crm/layout/AppShell';

export default function DealsPage() {
    return (
        <AppShell>
            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b0f19]">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Pipeline de Vendas</h1>
                        <p className="text-sm text-slate-500">Gerencie seus negócios e oportunidades.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Negócio
                    </Button>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#020617] p-6">
                    <KanbanBoard />
                </div>
            </div>
        </AppShell>
    );
}
