"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import NewDealModal from './NewDealModal';

export default function DealsHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pipeline de Vendas</h1>
                    <p className="text-gray-400 text-sm">Gerencie suas oportunidades</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Novo Negócio
                </button>
            </div>

            {isModalOpen && (
                <NewDealModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        router.refresh(); // Atualiza o Kanban sem recarregar a página
                    }}
                />
            )}
        </>
    );
}
