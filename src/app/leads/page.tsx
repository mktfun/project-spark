import { PrismaClient } from '@prisma/client';
import { User, Phone, MessageCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Singleton Pattern para evitar exaustão de conexões no desenvolvimento
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
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Carteira de Clientes</h1>
                    <p className="text-gray-400 mt-1">Gerencie seus contatos e histórico</p>
                </div>
                <div className="bg-[#0f1535] px-4 py-2 rounded-lg border border-gray-800 text-gray-400 text-sm">
                    Total: <span className="text-white font-bold">{contacts.length}</span>
                </div>
            </div>

            <div className="bg-[#151b33] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#0a0e27] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                            <th className="px-6 py-4 font-medium">Cliente</th>
                            <th className="px-6 py-4 font-medium">Contato</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Negócios Ativos</th>
                            <th className="px-6 py-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {contacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/20">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{contact.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={10} />
                                                Cadastrado em {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                                            <Phone size={14} className="text-gray-500" />
                                            {contact.phone}
                                        </div>
                                        {contact.email && (
                                            <div className="text-xs text-gray-500">{contact.email}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {contact.deals.length > 0 ? (
                                        <span className="text-white bg-blue-600/20 px-2 py-1 rounded text-xs border border-blue-600/30 text-blue-400">
                                            {contact.deals.length} Apólices
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 text-xs italic">Sem negócios</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 hover:text-green-400 transition-colors p-2 hover:bg-green-500/10 rounded-lg" title="Chamar no WhatsApp">
                                        <MessageCircle size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {contacts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Nenhum lead encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
