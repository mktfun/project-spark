import React from 'react';
import { Card } from '@/components/crm/Card';
import { Construction } from 'lucide-react';
import { AppShell } from '@/components/crm/layout/AppShell';

export default function LeadsPage() {
    return (
        <AppShell>
            <div className="p-8 h-[calc(100vh-64px)] flex flex-col items-center justify-center">
                <Card className="bg-[#111827] border-slate-800 p-12 text-center max-w-lg">
                    <div className="h-16 w-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                        <Construction className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Gestão de Leads</h1>
                    <p className="text-slate-400 mb-6">
                        Este módulo está sendo reformulado para oferecer uma visualização em lista avançada com filtros e automação.
                    </p>
                    <div className="text-xs text-slate-600 uppercase tracking-widest font-mono">
                        Em Breve • Tork v0.3
                    </div>
                </Card>
            </div>
        </AppShell>
    );
}
