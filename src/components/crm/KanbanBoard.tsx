"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Draggable, DropResult } from '@hello-pangea/dnd';
import { StrictModeDroppable } from '@/components/lib/StrictModeDroppable';
import axios from 'axios';
import {
    MoreHorizontal, DollarSign, Plus,
    Car, Heart, Building, Wallet, Layers,
    Briefcase, Clock, User
} from 'lucide-react';

// Types
type Deal = {
    id: string;
    title: string;
    value: number | null;
    stage: string;
    priority?: string;
    insuranceType: string;
    contact: { name: string; phone?: string; email?: string };
    insuranceData: any;
    renewalDate?: string;
    createdAt: string;
};

type Stage = {
    id: string;
    name: string;
    color: string;
    order: number;
    type: string;
};

interface KanbanBoardProps {
    initialDeals: Deal[];
    initialStages?: Stage[];
    onAddDeal?: (stageId: string) => void;
}

const getStageColor = (color: string) => {
    const colors: any = {
        blue: { dot: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
        yellow: { dot: 'bg-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
        purple: { dot: 'bg-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
        green: { dot: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/30' },
        red: { dot: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/30' },
    };
    return colors[color] || colors.blue;
};

const getInsuranceIcon = (type: string) => {
    switch (type?.toUpperCase()) {
        case 'AUTO': return Car;
        case 'SAUDE': case 'VIDA': return Heart;
        case 'CONSORCIO': return Wallet;
        case 'EMPRESARIAL': return Building;
        default: return Briefcase;
    }
};

const PIPELINES = [
    { id: 'ALL', label: 'Todos', icon: Layers },
    { id: 'AUTO', label: 'Auto', icon: Car },
    { id: 'SAUDE', label: 'Saúde', icon: Heart },
    { id: 'CONSORCIO', label: 'Consórcio', icon: Wallet },
];

export default function KanbanBoard({ initialDeals, initialStages = [], onAddDeal }: KanbanBoardProps) {
    const [deals, setDeals] = useState<Deal[]>(initialDeals);
    const [stages, setStages] = useState<Stage[]>(initialStages || []);
    const [activePipeline, setActivePipeline] = useState('ALL');
    const router = useRouter();

    // Sync with server if initialDeals changes (e.g. after refresh)
    useEffect(() => {
        setDeals(initialDeals);
    }, [initialDeals]);

    const filteredDeals = deals.filter(deal => {
        if (activePipeline === 'ALL') return true;
        return deal.insuranceType?.toUpperCase() === activePipeline;
    });

    const getColumnDeals = (colId: string) => filteredDeals.filter((d) => d.stage === colId);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStage = destination.droppableId;
        const previousDeals = [...deals];

        // Optimistic Update
        setDeals(prev => prev.map((d) => d.id === draggableId ? { ...d, stage: newStage } : d));

        try {
            await axios.patch(`/api/deals/${draggableId}`, { stage: newStage });
            router.refresh();
        } catch (error) {
            console.error("Error saving move:", error);
            setDeals(previousDeals); // Revert
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Pipeline Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {PIPELINES.map((p) => {
                    const Icon = p.icon;
                    const isActive = activePipeline === p.id;
                    return (
                        <button
                            key={p.id}
                            onClick={() => setActivePipeline(p.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${isActive
                                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <Icon size={16} />
                            {p.label}
                        </button>
                    );
                })}
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-5 h-full min-w-max pb-4">
                        {stages.map((stage) => {
                            const stageStyle = getStageColor(stage.color);
                            const columnDeals = getColumnDeals(stage.id);

                            return (
                                <div key={stage.id} className="flex flex-col w-80 h-full">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${stageStyle.dot} shadow-lg ${stageStyle.glow}`} />
                                            <h3 className={`font-bold text-sm ${stageStyle.text}`}>{stage.name}</h3>
                                            <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full font-mono">
                                                {columnDeals.length}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => onAddDeal?.(stage.id)}
                                            className="text-gray-600 hover:text-cyan-400 transition-colors bg-transparent hover:bg-cyan-500/10 p-1 rounded"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {/* Droppable Column */}
                                    <StrictModeDroppable droppableId={stage.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 glass-panel p-3 overflow-y-auto transition-colors duration-300 rounded-xl ${snapshot.isDraggingOver
                                                        ? 'bg-cyan-500/10 border-cyan-500/30'
                                                        : 'bg-[#151b33]/50 hover:bg-[#151b33]/80'
                                                    }`}
                                            >
                                                {columnDeals.map((deal, index) => {
                                                    const InsuranceIcon = getInsuranceIcon(deal.insuranceType);

                                                    return (
                                                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    // REMOVED transform/scale from resting state to prevent DnD bugs
                                                                    className={`mb-3 p-4 rounded-xl border transition-all duration-200 group cursor-grab active:cursor-grabbing ${snapshot.isDragging
                                                                            ? 'bg-cyan-900/90 border-cyan-400 shadow-[0_0_30px_rgba(0,245,255,0.4)] z-50 ring-1 ring-cyan-400'
                                                                            : 'bg-[#131730] border-white/5 hover:border-cyan-500/30 hover:shadow-lg'
                                                                        }`}
                                                                    style={provided.draggableProps.style}
                                                                >
                                                                    {/* Card Header */}
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                                                                <InsuranceIcon size={12} className="text-cyan-400" />
                                                                            </div>
                                                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                                                                {deal.insuranceType}
                                                                            </span>
                                                                        </div>
                                                                        <button className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                                                                            <MoreHorizontal size={14} />
                                                                        </button>
                                                                    </div>

                                                                    {/* Title */}
                                                                    <h4 className="font-medium text-white text-sm mb-3 leading-relaxed line-clamp-2 group-hover:text-cyan-400 transition-colors">
                                                                        {deal.title}
                                                                    </h4>

                                                                    {/* Renewal Alert */}
                                                                    {deal.renewalDate && (
                                                                        <div className={`mb-3 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit ${new Date(deal.renewalDate) < new Date()
                                                                                ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                                                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/15'
                                                                            }`}>
                                                                            <Clock size={10} />
                                                                            {new Date(deal.renewalDate).toLocaleDateString('pt-BR')}
                                                                        </div>
                                                                    )}

                                                                    {/* Footer */}
                                                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                                                                                <User size={10} className="text-cyan-400" />
                                                                            </div>
                                                                            <span className="text-xs text-gray-500 truncate max-w-[80px]">
                                                                                {deal.contact.name.split(' ')[0]}
                                                                            </span>
                                                                        </div>

                                                                        {deal.value && (
                                                                            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                                                                <DollarSign size={10} />
                                                                                {deal.value.toLocaleString('pt-BR', { notation: 'compact' })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}

                                                {/* Empty State */}
                                                {columnDeals.length === 0 && !snapshot.isDraggingOver && (
                                                    <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                                                            <Briefcase size={20} className="opacity-50" />
                                                        </div>
                                                        <span className="text-xs">Arraste cards aqui</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </StrictModeDroppable>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
}
