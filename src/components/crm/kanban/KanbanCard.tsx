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

import { motion } from 'framer-motion';

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
        transform: CSS.Translate.toString(transform), // Use Translate for smoother GPU
        transition,
    };

    const priorityColors = {
        high: 'bg-red-500/20 text-red-200 border-red-500/30',
        medium: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
        low: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-40 h-24 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
            />
        );
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            layoutId={String(deal.id)}
            layout // Enable layout animations for smooth position changes
            initial={isOverlay ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
            animate={isOverlay ? {
                scale: 1.03, // Levitation effect
                rotate: 2,
                boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" // shadow-2xl equivalent
            } : {
                scale: 1,
                rotate: 0,
                boxShadow: "none"
            }}
            whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30
            }}
            className={cn(
                "glass-card p-4 rounded-xl group relative cursor-grab active:cursor-grabbing mb-3",
                isOverlay && "cursor-grabbing z-50 ring-1 ring-white/30 dark:ring-white/10"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border backdrop-blur-md",
                    priorityColors[deal.priority]
                )}>
                    {deal.priority === 'high' ? 'Alta' : deal.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">#{deal.id}</span>
            </div>

            <h4 className="font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors line-clamp-2">
                {deal.name}
            </h4>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50 dark:border-white/10">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                </p>
            </div>
        </motion.div>
    );
};
