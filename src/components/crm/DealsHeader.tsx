"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface DealsHeaderProps {
    onNewClick: () => void;
}

export default function DealsHeader({ onNewClick }: DealsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Pipeline de Vendas</h1>
                <p className="text-gray-500 mt-1 text-sm">Gerencie seus negócios e oportunidades</p>
            </div>

            <button
                onClick={onNewClick}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-cyan-900/20"
            >
                <Plus size={18} /> Novo Negócio
            </button>
        </div>
    );
}
