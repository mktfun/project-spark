import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PrismaClient } from '@prisma/client';
import DealsContainer from '@/components/crm/DealsContainer';

export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function getDealsAndStages() {
    const deals = await prisma.deal.findMany({
        include: {
            contact: {
                select: { name: true, phone: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const stages = await prisma.pipelineStage.findMany({
        orderBy: { order: 'asc' }
    });

    const formattedDeals = deals.map(deal => ({
        ...deal,
        value: deal.value !== null ? Number(deal.value) : null,
        createdAt: deal.createdAt.toISOString(),
        renewalDate: deal.renewalDate?.toISOString(),
        contact: {
            ...deal.contact,
            email: deal.contact.email ?? undefined
        }
    }));

    return { deals: formattedDeals, stages };
}

export default async function DealsPage() {
    const { deals, stages } = await getDealsAndStages();

    return (
        <ProtectedRoute>
            <DealsContainer deals={deals} stages={stages} />
        </ProtectedRoute>
    );
}
