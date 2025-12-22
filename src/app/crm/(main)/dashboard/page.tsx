'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/crm/Card';
import { ArrowUpRight, DollarSign, Users, Briefcase, Activity, Loader2 } from 'lucide-react';
import { fetchLeads, fetchStages } from '@/lib/api';

interface DashboardMetric {
    label: string;
    value: string;
    change?: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
}

export default function DashboardPage() {
    // SWR Data Fetching
    const { data: leads, error: leadsError, isLoading: leadsLoading } = useSWR('crm-leads', fetchLeads, { refreshInterval: 5000 });

    // Metrics Calculation
    const metrics = useMemo<DashboardMetric[]>(() => {
        if (!leads || !Array.isArray(leads)) return [
            { label: 'Total de Leads', value: '-', trend: 'neutral', icon: Users },
            { label: 'Negócios Ativos', value: '-', trend: 'neutral', icon: Briefcase },
            { label: 'Valor em Pipeline', value: 'R$ -', trend: 'neutral', icon: DollarSign },
            { label: 'Taxa de Conversão', value: '-', trend: 'neutral', icon: Activity },
        ];

        const totalLeads = leads.length;
        const activeDeals = leads.filter((l: any) => l.status !== 'won' && l.status !== 'lost').length;
        const totalValue = leads.reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);
        const wonDeals = leads.filter((l: any) => l.status === 'won').length;
        const conversionRate = totalLeads > 0 ? ((wonDeals / totalLeads) * 100).toFixed(1) : '0';

        return [
            {
                label: 'Total de Leads',
                value: totalLeads.toString(),
                change: 'Atualizado agora',
                trend: 'neutral',
                icon: Users,
            },
            {
                label: 'Negócios Ativos',
                value: activeDeals.toString(),
                change: 'Em andamento',
                trend: 'neutral',
                icon: Briefcase,
            },
            {
                label: 'Valor em Pipeline',
                value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
                change: 'Total acumulado',
                trend: 'up',
                icon: DollarSign,
            },
            {
                label: 'Taxa de Conversão',
                value: `${conversionRate}%`,
                change: `${wonDeals} ganhos`,
                trend: 'up',
                icon: Activity,
            },
        ];
    }, [leads]);

    if (leadsError) return <div className="p-8 text-red-500">Erro ao carregar dados do dashboard. Verifique a conexão.</div>;

    return (
        <main className="space-y-8 p-8 h-full overflow-y-auto custom-scrollbar">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Dashboard Executivo</h1>
                <p className="text-slate-500 dark:text-slate-400">Visão geral em tempo real da sua operação.</p>
            </header>

            {/* KPIs Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Key Performance Indicators">
                {metrics.map((metric, idx) => (
                    <Card key={idx} className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-500">
                                <metric.icon className="h-5 w-5" />
                            </div>
                            {metric.change && (
                                <div className="flex items-center text-slate-400 text-xs font-medium">
                                    {metric.change}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                            {leadsLoading ? (
                                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-1" />
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metric.value}</h3>
                            )}
                        </div>
                    </Card>
                ))}
            </section>

            {/* Recent Leads Section (Simplified List) */}
            <section aria-label="Recent Activity">
                <Card className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Últimos Leads</h3>

                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nome</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Valor</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leadsLoading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8">
                                            <Loader2 className="animate-spin h-6 w-6 mx-auto text-slate-400" />
                                        </td>
                                    </tr>
                                ) : leads?.slice(0, 5).map((lead: any) => (
                                    <tr key={lead.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{lead.name}</td>
                                        <td className="px-6 py-4">{lead.email}</td>
                                        <td className="px-6 py-4">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(lead.value) || 0)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                                                {lead.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!leadsLoading && (!leads || leads.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-slate-400">Nenhum lead encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>
        </main>
    );
}
