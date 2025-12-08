const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const stages = [
        { id: 'NOVO', name: 'Novos Leads', order: 0, color: 'blue', type: 'OPEN' },
        { id: 'COTACAO', name: 'Em Cotação', order: 1, color: 'yellow', type: 'OPEN' },
        { id: 'FECHAMENTO', name: 'Fechamento', order: 2, color: 'purple', type: 'OPEN' },
        { id: 'GANHO', name: 'Ganho', order: 3, color: 'green', type: 'WON' },
        { id: 'PERDIDO', name: 'Perdido', order: 4, color: 'red', type: 'LOST' },
    ];

    for (const stage of stages) {
        await prisma.pipelineStage.upsert({
            where: { id: stage.id },
            update: stage,
            create: stage,
        });
    }

    console.log('Default stages seeded!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
