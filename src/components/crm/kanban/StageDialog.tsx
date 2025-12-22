import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/crm/Button';
import { createStage, updateStage } from '@/lib/api';
import { Stage } from './KanbanBoard';

interface StageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    stageToEdit?: Stage | null;
}

export const StageDialog = ({ isOpen, onClose, onSuccess, stageToEdit }: StageDialogProps) => {
    const [name, setName] = useState(stageToEdit?.name || '');
    const [color, setColor] = useState(stageToEdit?.color || 'bg-slate-500');
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when opening for new stage
    React.useEffect(() => {
        if (isOpen) {
            setName(stageToEdit?.name || '');
            setColor(stageToEdit?.color || 'bg-slate-500');
        }
    }, [isOpen, stageToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (stageToEdit) {
                await updateStage(stageToEdit.id, { name, color });
            } else {
                // Slug generation simple logic
                const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                await createStage({ name, slug, color });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save stage');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={stageToEdit ? 'Editar Estágio' : 'Novo Estágio'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-300">
                        Nome do Estágio
                    </label>
                    <input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Negociação"
                        required
                        className="w-full h-10 px-3 rounded-md border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="color" className="text-sm font-medium text-slate-300">
                        Cor (Tailwind Class)
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            id="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="Ex: bg-blue-500"
                            className="flex-1 h-10 px-3 rounded-md border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className={`h-10 w-10 rounded-md border border-slate-700 shrink-0 ${color}`}></div>
                    </div>
                    <p className="text-xs text-slate-500">
                        Opções: bg-blue-500, bg-amber-500, bg-purple-500, bg-emerald-500, bg-red-500
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onClose}
                        className="border-slate-600 text-slate-300 hover:text-white bg-transparent hover:bg-slate-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        {isLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
