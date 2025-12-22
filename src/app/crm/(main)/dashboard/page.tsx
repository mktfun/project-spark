'use client';

import React from 'react';
import { Card } from '@/components/crm/Card';
import { ArrowUpRight, DollarSign, Users, Briefcase, Activity } from 'lucide-react';

interface DashboardMetric {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
}

const metrics: DashboardMetric[] = [
    {
        label: 'Total de Leads',
        value: '1,240',
        change: '+12% vs mês anterior',
        trend: 'up',
        icon: Users,
    },
    {
        label: 'Negócios em Aberto',
        value: '45',
        change: '-5% vs semana passada',
        trend: 'down',
        icon: Briefcase,
    },
    {
        label: 'Valor em Pipeline',
        value: 'R$ 450.000,00',
        change: '+22% recorde mensal',
        trend: 'up',
        icon: DollarSign,
    },
    {
        label: 'Taxa de Conversão',
        value: '18%',
        change: '+2% melhoria constante',
        trend: 'up',
        icon: Activity,
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard Executivo</h1>
                <p className="text-slate-400">Visão geral da performance da sua corretora.</p>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                    <Card key={metric.label} className="p-6 bg-[#111827] border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-900/20 flex items-center justify-center text-blue-500">
                                <metric.icon className="h-5 w-5" />
                            </div>
                            {metric.trend === 'up' && (
                                <div className="flex items-center text-emerald-400 text-xs font-medium">
                                    {metric.change}
                                    <ArrowUpRight className="h-3 w-3 ml-1" />
                                </div>
                            )}
                            {metric.trend === 'down' && (
                                <div className="flex items-center text-rose-400 text-xs font-medium">
                                    {metric.change}
                                    <ArrowUpRight className="h-3 w-3 ml-1 rotate-90" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{metric.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Activity Section */}
            <Card className="p-6 bg-[#111827] border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Últimas Atividades</h3>

                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Atividade</th>
                                <th scope="col" className="px-6 py-3">Usuário</th>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-800 hover:bg-slate-800/20">
                                <td className="px-6 py-4 font-medium text-white">Novo Lead Cadastrado: Roberto Silva</td>
                                <td className="px-6 py-4">Admin</td>
                                <td className="px-6 py-4">Hoje, 14:30</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-emerald-900/30 text-emerald-400">Concluído</span></td>
                            </tr>
                            <tr className="border-b border-slate-800 hover:bg-slate-800/20">
                                <td className="px-6 py-4 font-medium text-white">Proposta enviada para XP Investimentos</td>
                                <td className="px-6 py-4">Vendas</td>
                                <td className="px-6 py-4">Ontem, 10:15</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-400">Enviado</span></td>
                            </tr>
                            <tr className="border-b border-slate-800 hover:bg-slate-800/20">
                                <td className="px-6 py-4 font-medium text-white">Atualização de Sistema</td>
                                <td className="px-6 py-4">System</td>
                                <td className="px-6 py-4">20 Dez, 09:00</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-400">Log</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
