import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
    // Debug Log Verbose
    const text = await request.text();
    console.log("🔥 CHATWOOT WEBHOOK RECEIVED:", text);

    const { name, email, phone_number } = contact;

    // Upsert logic
    if (email || phone_number) {
        let existing = null;
        // Find logic
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
            console.log(`✅ Contact Updated: ${name || existing.name}`);
        } else {
            // Verifica obrigatoriedade de telefone
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
                console.log(`✅ Contact Created: ${name}`);
            }
        }
    } else {
        console.log("⚠️ Contact missing email and phone.");
    }
}
return NextResponse.json({ received: true });
    } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}
