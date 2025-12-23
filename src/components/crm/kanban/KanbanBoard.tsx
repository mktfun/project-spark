'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard, Deal } from './KanbanCard';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchStages, fetchLeads, updateLeadStatus } from '@/lib/api';
import { StageDialog } from './StageDialog';

export interface Stage {
    id: number;
    name: string;
    slug: string; // Used as the column ID
    color: string;
    order: number;
}

export const KanbanBoard = () => {
    const [stages, setStages] = useState<Stage[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Stage Management State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeStage, setActiveStage] = useState<Stage | null>(null);

    // Initial Data Load
    useEffect(() => {
        const loadData = async () => {
            try {
                const [stagesData, leadsData] = await Promise.all([
                    fetchStages(),
                    fetchLeads()
                ]);
                setStages(stagesData);
                setDeals(leadsData);
            } catch (e) {
                console.error("Failed to load Kanban data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Track original status for rollback
    const [originalStatus, setOriginalStatus] = useState<string | null>(null);

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Deal') {
            const deal = event.active.data.current.deal as Deal;
            setActiveDeal(deal);
            setOriginalStatus(deal.status);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveDeal = active.data.current?.type === 'Deal';
        const isOverDeal = over.data.current?.type === 'Deal';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveDeal) return;

        // Moving Deal over another Deal
        if (isActiveDeal && isOverDeal) {
            setDeals((items) => {
                const activeIndex = items.findIndex((t) => t.id === activeId);
                const overIndex = items.findIndex((t) => t.id === overId);

                if (items[activeIndex].status !== items[overIndex].status) {
                    const newItems = [...items];
                    newItems[activeIndex].status = items[overIndex].status;
                    return arrayMove(newItems, activeIndex, overIndex);
                }

                return arrayMove(items, activeIndex, overIndex);
            });
        }

        // Moving Deal over empty Column
        if (isActiveDeal && isOverColumn) {
            setDeals((items) => {
                const activeIndex = items.findIndex((t) => t.id === activeId);
                const newStatus = overId as string;

                if (items[activeIndex].status !== newStatus) {
                    const newItems = [...items];
                    newItems[activeIndex].status = newStatus;
                    return arrayMove(newItems, activeIndex, activeIndex);
                }
                return items;
            });
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveDeal(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id;

        const activeDeal = deals.find(d => d.id === activeId);
        if (!activeDeal) return;

        let newStatus = activeDeal.status;

        // Determine new status
        if (over.data.current?.type === 'Column') {
            newStatus = overId as string;
        } else if (over.data.current?.type === 'Deal') {
            const overDeal = deals.find(d => d.id === overId);
            if (overDeal) newStatus = overDeal.status;
        }

        // Only update API if status changed
        if (activeDeal.status !== newStatus || (originalStatus && originalStatus !== newStatus)) {
            // Optimistic update already happened in DragOver mostly, but ensure consistency
            setDeals(prev => prev.map(d => d.id === activeId ? { ...d, status: newStatus } : d));

            try {
                await updateLeadStatus(activeId, newStatus);
            } catch (err) {
                // Structured logging - never console.error
                const error = err instanceof Error ? err.message : String(err);
                console.error('[KanbanBoard] Failed to update deal status', { dealId: activeId, newStatus, error });

                // Rollback with spring animation
                if (originalStatus) {
                    setDeals(prev => prev.map(d => d.id === activeId ? { ...d, status: originalStatus } : d));

                    // User feedback with glass-style toast
                    toast.error('Falha ao mover card. Revertendo...', {
                        duration: 3000,
                        icon: '⚠️',
                        style: {
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }
                    });
                }
            }
        }
        setOriginalStatus(null);
    };

    // Group deals by column (Stage Slug)
    const dealsByColumn = stages.reduce((acc, stage) => {
        acc[stage.slug] = deals.filter(d => d.status === stage.slug);
        return acc;
    }, {} as Record<string, Deal[]>);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full text-slate-400"><Loader2 className="animate-spin mr-2" /> Carregando Pipeline...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start px-2">
                {stages.map((stage) => (
                    <KanbanColumn
                        key={stage.slug}
                        id={stage.slug}
                        title={stage.name}
                        color={stage.color}
                        deals={dealsByColumn[stage.slug] || []}
                        onEdit={() => {
                            setActiveStage(stage);
                            setIsDialogOpen(true);
                        }}
                        onDelete={async () => {
                            if (window.confirm('Tem certeza que deseja excluir este estágio? Leads associados podem ser perdidos.')) {
                                try {
                                    /* In a real app we would check for dependencies first or prevent deletion if leads exist */
                                    // await deleteStage(stage.id); 
                                    // For now just alert that this is a critical action
                                    alert('Deleção bloqueada por segurança nesta versão.');
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        }}
                    />
                ))}

                {/* Add Stage Button */}
                <div className="shrink-0 w-[30px] pt-2">
                    <button
                        onClick={() => {
                            setActiveStage(null);
                            setIsDialogOpen(true);
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 backdrop-blur-sm"
                        title="Adicionar Estágio"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <DragOverlay>
                {activeDeal && <KanbanCard deal={activeDeal} isOverlay />}
            </DragOverlay>

            <StageDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={() => {
                    // Reload data
                    const loadData = async () => {
                        const [stagesData] = await Promise.all([fetchStages()]);
                        setStages(stagesData);
                    };
                    loadData();
                }}
                stageToEdit={activeStage}
            />
        </DndContext>
    );
};
