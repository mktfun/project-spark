"use client";

import React, { useState } from 'react';
import { Users, Phone, MessageCircle, Calendar, Plus, Search } from 'lucide-react';
// Importe o modal de lead se existir, ou use o de deals adaptado?
// O usuário pediu "NewDealModal" em "deals" mas "Novo Lead" em "leads".
// Vou usar NewDealModal também para leads, já que o modal aceita dados do cliente?
// O NewDealModal no codigo do usuário *cria* um lead (POST /api/leads). Então é o mesmo modal.
import NewDealModal from '@/components/crm/NewDealModal';
import { useRouter } from 'next/navigation';

export default function LeadsContainer({ contacts }: { contacts: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        setIsModalOpen(false);
        router.refresh();
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">Leads</h1>
                    <p className="text-gray-500 mt-1">Gerencie seus contatos e histórico</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm">
                        Total: <span className="text-white font-bold">{contacts.length}</span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus size={18} />
                        Novo Lead
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="glass-panel p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Contato</th>
                            <th className="px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Negócios</th>
                            <th className="px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact, index) => (
                            <tr
                                key={contact.id}
                                className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm shadow-lg">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{contact.name}</p>
                                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                                <Calendar size={10} />
                                                {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                                            <Phone size={14} className="text-gray-600" />
                                            {contact.phone}
                                        </div>
                                        {contact.email && (
                                            <div className="text-xs text-gray-600">{contact.email}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                        Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {contact.deals.length > 0 ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                                            {contact.deals.length} Apólices
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 text-xs italic">Sem negócios</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        className="p-2.5 rounded-xl text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Chamar no WhatsApp"
                                    >
                                        <MessageCircle size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <NewDealModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
