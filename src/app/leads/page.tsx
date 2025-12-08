import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PrismaClient } from '@prisma/client';
import LeadsContainer from '@/components/crm/LeadsContainer';

export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function getContacts() {
    return await prisma.contact.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            deals: {
                select: { status: true, title: true }
            }
        }
    });
}

export default async function LeadsPage() {
    const contacts = await getContacts();

    return (
        <ProtectedRoute>
            <LeadsContainer contacts={contacts} />
        </ProtectedRoute>
    );
}
