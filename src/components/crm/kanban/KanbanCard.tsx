import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/crm/Card';
import { Badge } from 'lucide-react'; // Placeholder badge
import { cn } from '@/lib/utils';

// We define what a Deal looks like for the frontend
export interface Deal {
    id: number;
    name: string;
    value: number;
    priority: 'high' | 'medium' | 'low';
    status: string;
    email?: string;
    phone?: string;
    title?: string; // fallback if name is missing?
}

interface KanbanCardProps {
    deal: Deal;
    isOverlay?: boolean;
}

export const KanbanCard = ({ deal, isOverlay }: KanbanCardProps) => {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: deal.id,
        data: {
            type: 'Deal',
            deal,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityColors = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-amber-100 text-amber-700 border-amber-200',
        low: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 h-24 rounded-xl border-2 border-crm-secondary border-dashed bg-slate-50"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative",
                isOverlay && "shadow-xl rotate-2 scale-105 cursor-grabbing z-50 ring-2 ring-crm-secondary border-transparent"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                    priorityColors[deal.priority]
                )}>
                    {deal.priority === 'high' ? 'Alta' : deal.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
                <span className="text-xs font-mono text-slate-400">#{deal.id}</span>
            </div>

            <h4 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-crm-secondary transition-colors line-clamp-2">
                {deal.name}
            </h4>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                </p>
            </div>
        </div>
    );
};
