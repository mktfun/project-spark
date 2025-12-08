import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PrismaClient } from '@prisma/client';
import { DollarSign, UserCheck, RefreshCw, BarChart3, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function getDashboardData() {
    // 1. Total Vendas (Ganho)
    const wonDeals = await prisma.deal.aggregate({
        where: { stage: 'GANHO' },
        _sum: { value: true },
        _count: { id: true }
    });

    // 2. Leads Novos (Novo + Cotação)
    const activeDealsCount = await prisma.deal.count({
        where: {
            stage: { in: ['NOVO', 'COTACAO'] },
            status: 'ACTIVE'
        }
    });

    // 3. Renovações Próximas (30 dias)
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Agora que o Prisma Client regenerou, podemos usar renewalDate
    const renewalsCount = await prisma.deal.count({
        where: {
            renewalDate: {
                gte: today,
                lte: next30Days
            }
        }
    });

    // 4. Últimas Atividades
    const latestDeals = await prisma.deal.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { contact: { select: { name: true } } }
    });

    // 5. Total de Deals para percentuais
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
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h1>
                        <p className="text-gray-400 mt-1">Gestão de Vendas e Renovações</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-medium">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Vendas (Total)"
                        value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { notation: 'compact' })}`}
                        subValue="Negócios ganhos"
                        icon={<DollarSign size={20} />}
                        color="emerald"
                        progress={metrics.totalRevenue > 0 ? 100 : 0}
                    />
                    <StatCard
                        title="Em Negociação"
                        value={metrics.activeLeads}
                        subValue="Leads no funil"
                        icon={<UserCheck size={20} />}
                        color="cyan"
                        progress={50}
                    />
                    <StatCard
                        title="Renovações"
                        value={metrics.renewals}
                        subValue="Próximos 30 dias"
                        icon={<RefreshCw size={20} />}
                        color="yellow"
                        progress={metrics.renewals > 0 ? 80 : 0}
                    />
                    <StatCard
                        title="Taxa Conversão"
                        value={`${metrics.conversionRate}%`}
                        subValue="Ganho / Total"
                        icon={<TrendingUp size={20} />}
                        color="purple"
                        progress={Number(metrics.conversionRate)}
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Funil Visual (Simplificado) */}
                    <div className="lg:col-span-2 glass-card p-6 rounded-xl border border-gray-800 flex flex-col justify-center items-center text-center">
                        <div className="bg-cyan-500/5 p-8 rounded-full mb-4">
                            <BarChart3 size={48} className="text-cyan-500/50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Seu Pipeline está Ativo</h3>
                        <p className="text-gray-400 max-w-md">Os dados estão fluindo do n8n e das entradas manuais. Acesse o Quadro Kanban para mover os cards.</p>
                        <Link href="/deals" className="mt-6 btn-primary px-8">
                            Acessar Kanban
                        </Link>
                    </div>

                    {/* Últimas Atividades */}
                    <div className="glass-card p-6 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity size={18} className="text-cyan-400" />
                            <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
                        </div>
                        <div className="space-y-4">
                            {activities.map((deal) => (
                                <div key={deal.id} className="flex gap-3 items-start border-b border-gray-800/50 pb-3 last:border-0 last:pb-0">
                                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${deal.stage === 'GANHO' ? 'bg-emerald-400' :
                                            deal.stage === 'PERDIDO' ? 'bg-red-400' : 'bg-cyan-400'
                                        }`} />
                                    <div>
                                        <p className="text-sm text-gray-300">
                                            {deal.stage === 'NOVO' ? 'Novo lead:' : 'Negócio atualizado:'} <span className="text-white font-medium">{deal.contact.name}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {deal.insuranceType.toLowerCase()} • {new Date(deal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <p className="text-gray-500 text-sm italic">Nenhuma atividade recente.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatCard({ title, value, subValue, icon, color, progress }: any) {
    const colors: any = {
        cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
        purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    };

    const theme = colors[color] || colors.cyan;
    const progressColor = color === 'emerald' ? 'bg-emerald-400' : color === 'yellow' ? 'bg-yellow-400' : color === 'purple' ? 'bg-purple-400' : 'bg-cyan-400';

    return (
        <div className="glass-card p-5 rounded-xl border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
                </div>
                <div className={`p-2 rounded-lg ${theme}`}>
                    {icon}
                </div>
            </div>
            {progress !== undefined && (
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
