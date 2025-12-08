"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MoreHorizontal, Calendar, DollarSign, User,
    Car, Heart, Building, Wallet, Layers,
    Inbox, Zap, CheckCircle2, XCircle, Briefcase, AlertCircle
} from 'lucide-react';
import DealDetailModal from './DealDetailModal';

// Tipos
// Types
type Deal = {
    id: string;
    title: string;
    value: number | null;
    stage: string;
    insuranceType: string;
    contact: { name: string; phone?: string; email?: string };
    insuranceData: any;
    renewalDate?: Date | string; // Adjusted to accept Date from Prisma
    createdAt: Date | string;
};

type Stage = {
    id: string;
    name: string;
    color: string;
    order: number;
    type: string;
};

// Icon Mapping Helper
const getStageIcon = (type: string) => {
    switch (type) {
        case 'WON': return CheckCircle2;
        case 'LOST': return XCircle;
        default: return Briefcase; // Default icon
    }
};

const getStageStyles = (color: string) => {
    const styles: any = {
        blue: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
        yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
        purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
        green: { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400' },
        red: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
    };
    return styles[color] || styles.blue;
};

// ... PIPELINES constant stays the same ...
const PIPELINES = [
    { id: 'ALL', label: 'Visão Geral', icon: Layers },
    { id: 'AUTO', label: 'Automóvel', icon: Car },
    { id: 'SAUDE', label: 'Saúde/Vida', icon: Heart },
    { id: 'CONSORCIO', label: 'Consórcio', icon: Wallet },
    { id: 'RAMOS_ELEMENTARES', label: 'Resid/Emp', icon: Building },
];

export default function KanbanBoard({ initialDeals, initialStages = [] }: { initialDeals: Deal[], initialStages?: Stage[] }) {
    const [deals, setDeals] = useState<Deal[]>(initialDeals);
    const [stages, setStages] = useState<Stage[]>(initialStages || []);
    const [activePipeline, setActivePipeline] = useState('ALL');
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

    const filteredDeals = deals.filter(deal => {
        if (activePipeline === 'ALL') return true;
        return deal.insuranceType?.toUpperCase() === activePipeline;
    });

    const getColumnDeals = (colId: string) => filteredDeals.filter((d) => d.stage === colId);

    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter(); // Import needed

    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        const newStage = destination.droppableId;
        const previousStage = source.droppableId;

        // Optimistic Update
        const updatedDeals = deals.map((d) =>
            d.id === draggableId ? { ...d, stage: newStage } : d
        );
        const previousDeals = [...deals];
        setDeals(updatedDeals);

        try {
            await axios.patch(`/api/deals/${draggableId}`, { stage: newStage });
            router.refresh();
        } catch (error) {
            console.error("Erro ao salvar movimento:", error);
            // Revert on error
            setDeals(previousDeals);
            alert("Erro ao mover o card. A alteração foi revertida.");
        }
    };

    if (!enabled) {
        return null;
    }

    return (
        <div className="flex flex-col h-full font-sans">

            {/* 1. Barra de Filtros (Estilo Abas Limpas) */}
            <div className="flex gap-1 mb-6 border-b border-gray-800 pb-0 px-2 overflow-x-auto">
                {PIPELINES.map((pipeline) => {
                    const Icon = pipeline.icon;
                    const isActive = activePipeline === pipeline.id;
                    return (
                        <button
                            key={pipeline.id}
                            onClick={() => setActivePipeline(pipeline.id)}
                            className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative top-[1px]
                ${isActive
                                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
              `}
                        >
                            <Icon size={16} />
                            {pipeline.label}
                        </button>
                    );
                })}
            </div>

            {/* 2. O Quadro Kanban */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-4 h-full min-w-[1300px] pb-4 px-2">
                        {stages.map((stage) => {
                            const ColumnIcon = getStageIcon(stage.type);
                            const style = getStageStyles(stage.color);
                            return (
                                <div
                                    key={stage.id}
                                    className="w-80 flex-shrink-0 flex flex-col bg-[#0f1535]/50 rounded-xl border border-gray-800/50"
                                >
                                    {/* Header da Coluna (Clean & Functional) */}
                                    <div className={`p-4 flex justify-between items-center border-b border-gray-800 ${style.border}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-md ${style.bg} ${style.text}`}>
                                                <ColumnIcon size={16} />
                                            </div>
                                            <h3 className="font-semibold text-gray-200 text-sm">
                                                {stage.name}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500 bg-gray-900/50 px-2 py-1 rounded">
                                            {getColumnDeals(stage.id).length}
                                        </span>
                                    </div>

                                    {/* Área Droppable */}
                                    <Droppable droppableId={stage.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`
                          flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800
                          ${snapshot.isDraggingOver ? 'bg-gray-800/20' : ''}
                        `}
                                            >
                                                <AnimatePresence mode='popLayout'>
                                                    {getColumnDeals(stage.id).map((deal, index) => (
                                                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="mb-3 outline-none"
                                                                    style={{ ...provided.draggableProps.style }} // Ensure transform is applied
                                                                >
                                                                    <div
                                                                        className={`
                                      bg-[#1a2040] border border-gray-700 rounded-lg p-3 shadow-sm group cursor-grab active:cursor-grabbing
                                      hover:border-gray-500 hover:shadow-md transition-all duration-200
                                      ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-cyan-500 rotate-2 z-50 bg-[#1f294f]' : ''}
                                    `}
                                                                        onClick={() => setSelectedDeal(deal)}
                                                                    >
                                                                        {/* Badges e Tags */}
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <span className={`
                                        text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded
                                        ${deal.insuranceType === 'AUTO' ? 'bg-blue-900/30 text-blue-300' :
                                                                                    deal.insuranceType === 'SAUDE' ? 'bg-pink-900/30 text-pink-300' :
                                                                                        deal.insuranceType === 'CONSORCIO' ? 'bg-purple-900/30 text-purple-300' :
                                                                                            'bg-gray-800 text-gray-400'}
                                      `}>
                                                                                {deal.insuranceType}
                                                                            </span>

                                                                            <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded">
                                                                                <MoreHorizontal size={14} />
                                                                            </button>
                                                                        </div>

                                                                        {/* Conteúdo Principal */}
                                                                        <h4 className="font-medium text-gray-200 text-sm mb-3 leading-snug">
                                                                            {deal.title}
                                                                        </h4>

                                                                        {/* Alerta de Renovação */}
                                                                        {deal.renewalDate && (
                                                                            <div className={`
                                                                        mt-2 mb-2 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit
                                                                        ${new Date(deal.renewalDate) < new Date() ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}
                                                                      `}>
                                                                                <AlertCircle size={10} />
                                                                                Renova: {new Date(deal.renewalDate).toLocaleDateString('pt-BR')}
                                                                            </div>
                                                                        )}

                                                                        {/* Footer */}
                                                                        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-700/50">
                                                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                                                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-300">
                                                                                    {deal.contact.name.substring(0, 2).toUpperCase()}
                                                                                </div>
                                                                                <span className="truncate max-w-[80px]">
                                                                                    {deal.contact.name.split(' ')[0]}
                                                                                </span>
                                                                            </div>

                                                                            {deal.value && (
                                                                                <div className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-900/10 px-1.5 py-0.5 rounded">
                                                                                    <span>R$</span>
                                                                                    {deal.value.toLocaleString('pt-BR', { notation: 'compact' })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                </AnimatePresence>
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DragDropContext>

            <DealDetailModal
                deal={selectedDeal}
                onClose={() => setSelectedDeal(null)}
            />
        </div>
    );
}
