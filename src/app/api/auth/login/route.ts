import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        // Login genérico (aceita email ou username se implementado, aqui usaremos email)
        const user = await prisma.user.findFirst({
            where: {
                email: username // O form envia "username" mas nosso schema usa email
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
        }

        // Gerar JWT
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new jose.SignJWT({ id: user.id, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('8h')
            .sign(secret);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Erro interno no login' }, { status: 500 });
    }
}
