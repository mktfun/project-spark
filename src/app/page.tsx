import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PrismaClient } from '@prisma/client';
import { DollarSign, UserCheck, RefreshCw, TrendingUp, Activity, BarChart3, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function getDashboardData() {
    const wonDeals = await prisma.deal.aggregate({
        where: { stage: 'GANHO' },
        _sum: { value: true },
        _count: { id: true }
    });

    const activeDealsCount = await prisma.deal.count({
        where: {
            stage: { in: ['NOVO', 'COTACAO'] },
            status: 'ACTIVE'
        }
    });

    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const renewalsCount = await prisma.deal.count({
        where: {
            renewalDate: {
                gte: today,
                lte: next30Days
            }
        }
    });

    const latestDeals = await prisma.deal.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { contact: { select: { name: true } } }
    });

    const totalDeals = await prisma.deal.count();
    const conversionRate = totalDeals > 0 ? ((wonDeals._count.id / totalDeals) * 100).toFixed(0) : 0;

    return {
        metrics: {
            totalRevenue: wonDeals._sum.value ? Number(wonDeals._sum.value) : 0,
            activeLeads: activeDealsCount,
            renewals: renewalsCount,
            conversionRate: conversionRate
        },
        activities: latestDeals
    };
}

export default async function DashboardPage() {
    const data = await getDashboardData();
    const { metrics, activities } = data;

    return (
        <ProtectedRoute>
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h1>
                        <p className="text-gray-500 mt-1">Gestão de Vendas e Renovações</p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-medium shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* KPI Grid - Glass Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Vendas (Total)"
                        value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { notation: 'compact' })}`}
                        subValue="Negócios ganhos"
                        icon={<DollarSign size={24} />}
                        color="emerald"
                    />
                    <StatCard
                        title="Em Negociação"
                        value={metrics.activeLeads}
                        subValue="Leads no funil"
                        icon={<UserCheck size={24} />}
                        color="cyan"
                    />
                    <StatCard
                        title="Renovações"
                        value={metrics.renewals}
                        subValue="Próximos 30 dias"
                        icon={<RefreshCw size={24} />}
                        color="yellow"
                    />
                    <StatCard
                        title="Taxa Conversão"
                        value={`${metrics.conversionRate}%`}
                        subValue="Ganho / Total"
                        icon={<TrendingUp size={24} />}
                        color="purple"
                    />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pipeline CTA */}
                    <div className="lg:col-span-2 glass-panel p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,245,255,0.15)]">
                                <BarChart3 size={36} className="text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Seu Pipeline está Ativo</h3>
                            <p className="text-gray-400 max-w-md mb-6">
                                Os dados estão fluindo do n8n e das entradas manuais. Acesse o Quadro Kanban para mover os cards.
                            </p>
                            <Link href="/deals" className="btn-primary px-8 py-3">
                                <Zap size={18} />
                                Acessar Kanban
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <Activity size={18} className="text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Atividade Recente</h3>
                        </div>
                        <div className="space-y-4">
                            {activities.map((deal) => (
                                <div key={deal.id} className="flex gap-3 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                    <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 shadow-lg ${deal.stage === 'GANHO' ? 'bg-emerald-400 shadow-emerald-400/50' :
                                            deal.stage === 'PERDIDO' ? 'bg-red-400 shadow-red-400/50' :
                                                'bg-cyan-400 shadow-cyan-400/50'
                                        }`} />
                                    <div>
                                        <p className="text-sm text-gray-300">
                                            {deal.stage === 'NOVO' ? 'Novo lead:' : 'Negócio atualizado:'}{' '}
                                            <span className="text-white font-medium">{deal.contact.name}</span>
                                        </p>
                                        <p className="text-xs text-gray-600 capitalize mt-0.5">
                                            {deal.insuranceType.toLowerCase()} • {new Date(deal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <p className="text-gray-600 text-sm italic text-center py-4">Nenhuma atividade recente.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatCard({ title, value, subValue, icon, color }: any) {
    const colorStyles: any = {
        cyan: {
            icon: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            glow: 'shadow-[0_0_20px_rgba(0,245,255,0.1)]',
            hover: 'group-hover:text-cyan-400'
        },
        purple: {
            icon: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            glow: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]',
            hover: 'group-hover:text-purple-400'
        },
        emerald: {
            icon: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
            hover: 'group-hover:text-emerald-400'
        },
        yellow: {
            icon: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            glow: 'shadow-[0_0_20px_rgba(234,179,8,0.1)]',
            hover: 'group-hover:text-yellow-400'
        },
    };

    const style = colorStyles[color] || colorStyles.cyan;

    return (
        <div className={`glass-panel p-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] ${style.glow}`}>
            {/* Background Icon */}
            <div className={`absolute -right-4 -bottom-4 ${style.icon} opacity-5 group-hover:opacity-10 transition-opacity`}>
                {icon && <span className="text-[120px]">{icon}</span>}
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <div className={`p-2.5 rounded-xl ${style.bg} ${style.border} border ${style.icon}`}>
                        {icon}
                    </div>
                </div>
                <h3 className={`text-3xl font-bold text-white transition-colors ${style.hover}`}>
                    {value}
                </h3>
                {subValue && (
                    <p className="text-xs text-gray-500 mt-2">{subValue}</p>
                )}
            </div>
        </div>
    );
}
