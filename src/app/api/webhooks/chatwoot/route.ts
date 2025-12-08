import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log("Chatwoot Payload:", JSON.stringify(payload, null, 2)); // Log para debug

        const eventType = payload.event; // ou payload.event_type dependendo da versão

        if (eventType === 'contact_created' || eventType === 'contact_updated') {
            const contact = payload.data.contact || payload.data; // Tenta extrair de ambos os locais

            const { name, email, phone_number } = contact;

            // Upsert logic
            if (email || phone_number) {
                let existing = null;
                if (phone_number) existing = await prisma.contact.findUnique({ where: { phone: phone_number } });
                if (!existing && email) existing = await prisma.contact.findFirst({ where: { email: email } });

                if (existing) {
                    await prisma.contact.update({
                        where: { id: existing.id },
                        data: {
                            name: name || existing.name,
                            email: email || existing.email,
                            phone: phone_number || existing.phone
                        }
                    });
                } else {
                    // Verifica obrigatoriedade de telefone se necessário, mas para webhook inbound pode ser permissivo
                    if (!phone_number) {
                        console.log("Skipping Chatwoot contact without phone");
                    } else {
                        await prisma.contact.create({
                            data: {
                                name: name || 'Sem Nome',
                                phone: phone_number,
                                email: email,
                                type: 'PF'
                            }
                        });
                    }
                }
            }
        }
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
