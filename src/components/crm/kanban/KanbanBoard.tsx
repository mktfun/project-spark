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
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/crm/Button';

// Initial Columns Setup
const COLUMNS = [
    { id: 'new', title: 'Novo Lead', color: 'bg-blue-500' },
    { id: 'contact', title: 'Em Contato', color: 'bg-amber-500' },
    { id: 'proposal', title: 'Proposta Enviada', color: 'bg-purple-500' },
    { id: 'won', title: 'Ganho / Efetivado', color: 'bg-emerald-500' },
    { id: 'lost', title: 'Perdido', color: 'bg-red-500' },
];

export const KanbanBoard = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load Deals
    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            const token = localStorage.getItem('tork_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crm/leads`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDeals(data);
            }
        } catch (e) {
            console.error("Failed to fetch deals", e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateDealStatus = async (dealId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('tork_token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/crm/leads/${dealId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) {
            console.error("Failed to update status", e);
            // Ideally revert optmistic update here
            fetchDeals(); // Resync
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 } // Prevent accidental drags
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Deal') {
            setActiveDeal(event.active.data.current.deal as Deal);
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

                // If specific logic needed for reordering within same column:
                // For now, we just rely on column change in dragEnd, 
                // OR we optmistically update status here if columns differ.
                if (items[activeIndex].status !== items[overIndex].status) {
                    const newItems = [...items];
                    newItems[activeIndex].status = items[overIndex].status; // Optimistic column switch
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
                    newItems[activeIndex].status = newStatus; // Optimistic update
                    return arrayMove(newItems, activeIndex, activeIndex);
                }
                return items;
            });
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveDeal(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id;

        const activeDeal = deals.find(d => d.id === activeId);
        if (!activeDeal) return;

        // If dropped on a column directly
        if (over.data.current?.type === 'Column') {
            const newStatus = overId as string;
            if (activeDeal.status !== newStatus) {
                updateDealStatus(activeId, newStatus);
            }
        }
        // If dropped on another card
        else if (over.data.current?.type === 'Deal') {
            const overDeal = deals.find(d => d.id === overId);
            if (overDeal && activeDeal.status !== overDeal.status) {
                updateDealStatus(activeId, overDeal.status);
            }
        }
    };

    // Group deals by column
    const dealsByColumn = COLUMNS.reduce((acc, col) => {
        acc[col.id] = deals.filter(d => d.status === col.id);
        return acc;
    }, {} as Record<string, Deal[]>);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crm-secondary" /></div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver} // Handle moving between lists
            onDragEnd={onDragEnd} // Handle final commit
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        deals={dealsByColumn[col.id] || []}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeDeal && <KanbanCard deal={activeDeal} isOverlay />}
            </DragOverlay>
        </DndContext>
    );
};
