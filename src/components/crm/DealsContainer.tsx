"use client";

import React, { useState } from 'react';
import DealsHeader from './DealsHeader';
import KanbanBoard from './KanbanBoard';
import NewDealModal from './NewDealModal';
import { useRouter } from 'next/navigation';

export default function DealsContainer({ deals, stages }: { deals: any[], stages: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        setIsModalOpen(false);
        router.refresh();
    };

    return (
        <div className="p-4 md:p-6 h-[calc(100vh-2rem)] flex flex-col space-y-6">
            <DealsHeader onNewClick={() => setIsModalOpen(true)} />

            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    initialDeals={deals}
                    initialStages={stages}
                    onAddDeal={() => setIsModalOpen(true)}
                />
            </div>

            {isModalOpen && (
                <NewDealModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
