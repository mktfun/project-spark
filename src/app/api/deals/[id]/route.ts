import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { stage, title, value } = body;
        const dealId = params.id;

        const updatedDeal = await prisma.deal.update({
            where: { id: dealId },
            data: {
                ...(stage && { stage }),
                ...(title && { title }),
                ...(value && { value }),
            },
        });

        // Automação: Se movido para GANHO, disparar Webhook de Saída
        // (Futuro: Ler URL do banco ou settings)
        if (stage === 'GANHO') {
            // TODO: Trigger Outbound Webhook here
            console.log(`Deal ${dealId} won! Triggering automation...`);
        }

        return NextResponse.json(updatedDeal);
    } catch (error) {
        console.error('Error updating deal:', error);
        return NextResponse.json(
            { error: 'Failed to update deal' },
            { status: 500 }
        );
    }
}
