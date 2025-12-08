import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
    const stages = await prisma.pipelineStage.findMany({
        orderBy: { order: 'asc' }
    });
    return NextResponse.json(stages);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { name, color, type } = body;

    // Auto-calculate order (last + 1)
    const lastStage = await prisma.pipelineStage.findFirst({
        orderBy: { order: 'desc' }
    });
    const order = (lastStage?.order ?? -1) + 1;

    const newStage = await prisma.pipelineStage.create({
        data: {
            id: crypto.randomUUID(),
            name,
            color: color || 'blue',
            type: type || 'OPEN',
            order
        }
    });
    return NextResponse.json(newStage);
}

export async function PUT(req: Request) {
    const body = await req.json();
    const { stages } = body; // Expect array of { id, order }

    // Transaction to update all orders
    await prisma.$transaction(
        stages.map((s: any) =>
            prisma.pipelineStage.update({
                where: { id: s.id },
                data: { order: s.order }
            })
        )
    );

    return NextResponse.json({ success: true });
}
