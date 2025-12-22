import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { KanbanCard, Deal } from './KanbanCard';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

interface KanbanColumnProps {
    id: string; // 'new', 'contact', etc.
    title: string;
    deals: Deal[];
    color?: string; // e.g. 'bg-blue-500'
    onEdit?: () => void;
    onDelete?: () => void;
}

export const KanbanColumn = ({ id, title, deals, color, onEdit, onDelete }: KanbanColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: {
            type: 'Column',
            columnId: id
        }
    });

    const dealIds = useMemo(() => deals.map((d) => d.id), [deals]);

    const totalValue = useMemo(() =>
        deals.reduce((acc, curr) => acc + curr.value, 0),
        [deals]);

    return (
        <div className="flex flex-col h-full min-w-[320px] w-[320px] shrink-0 bg-transparent group/column">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1 group/header">
                <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", color || "bg-slate-400")} />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                        {deals.length}
                    </span>
                </div>

                {/* Actions (Visible on Hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-opacity">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-1 text-slate-400 hover:text-blue-500 rounded hover:bg-slate-800/50 transition-colors"
                            title="Editar Coluna"
                        >
                            <Pencil size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-800/50 transition-colors"
                            title="Excluir Coluna"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Total Value */}
            <div className="mb-3 px-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Estimado
                </p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                </p>
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 bg-slate-50/50 dark:bg-crm-primary/20 rounded-xl p-3 space-y-3 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 overflow-y-auto custom-scrollbar",
                    isOver && "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
                )}
            >
                <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
                    {deals.map((deal) => (
                        <KanbanCard key={deal.id} deal={deal} />
                    ))}
                </SortableContext>

                {deals.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                        Arraste um card aqui
                    </div>
                )}
            </div>
        </div>
    );
};
