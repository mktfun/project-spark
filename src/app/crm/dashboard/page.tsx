'use client';

import React, { useState } from 'react';
import { KanbanBoard } from '@/components/crm/kanban/KanbanBoard';
import { Button } from '@/components/crm/Button';
import { Modal } from '@/components/crm/Modal';
import { Input } from '@/components/crm/Input';
import { Plus, Upload } from 'lucide-react';
import { PDFUploadModal } from '@/components/crm/PDFUploadModal';

export default function DashboardPage() {
    const [isNewDealOpen, setIsNewDealOpen] = useState(false);
    const [isPDFUploadOpen, setIsPDFUploadOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        const form = e.target as HTMLFormElement;

        const dealData = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            value: parseFloat((form.elements.namedItem('value') as HTMLInputElement).value) || 0,
            priority: (form.elements.namedItem('priority') as HTMLSelectElement).value,
            status: 'new'
        };

        try {
            const token = localStorage.getItem('tork_token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crm/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dealData)
            });
            setIsNewDealOpen(false);
            window.location.reload(); // Quick refresh to show new deal, could be better
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pipeline de Vendas</h1>
                    <p className="text-slate-500">Gerencie leads, renovações e negociações em tempo real.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setIsPDFUploadOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Importar PDF
                    </Button>
                    <Button onClick={() => setIsNewDealOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Lead
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <KanbanBoard />
            </div>

            <Modal isOpen={isNewDealOpen} onClose={() => setIsNewDealOpen(false)} title="Nova Oportunidade">
                <form onSubmit={handleCreateDeal} className="space-y-4">
                    <Input name="name" label="Nome do Cliente / Lead" placeholder="Ex: João Silva - Seguro Auto" required />

                    <Input name="value" label="Valor Estimado (R$)" type="number" placeholder="0.00" required />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prioridade</label>
                        <select
                            name="priority"
                            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-crm-secondary dark:bg-crm-primary/50 dark:border-slate-700 dark:text-white"
                        >
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="low">Baixa</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsNewDealOpen(false)}>Cancelar</Button>
                        <Button type="submit" isLoading={isCreating}>Criar Oportunidade</Button>
                    </div>
                </form>
            </Modal>

            <PDFUploadModal isOpen={isPDFUploadOpen} onClose={() => setIsPDFUploadOpen(false)} />
        </div>
    );
}
