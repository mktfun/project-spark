"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Calendar, DollarSign, Shield, FileText, MessageCircle } from 'lucide-react';

type Deal = {
    id: string;
    title: string;
    value: number | null;
    stage: string;
    insuranceType: string;
    contact: { name: string; phone?: string; email?: string };
    insuranceData: any;
    renewalDate?: string | Date; // Permite Date ou string
    createdAt: string | Date;    // Permite Date ou string
};

interface ModalProps {
    deal: Deal | null;
    onClose: () => void;
}

export default function DealDetailModal({ deal, onClose }: ModalProps) {
    if (!deal) return null;

    // Formata o JSON de dados específicos para exibição (Remove chaves vazias ou nulas)
    const insuranceDetails = deal.insuranceData
        ? Object.entries(deal.insuranceData).filter(([_, v]) => v !== null && v !== undefined && v !== '')
        : [];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">

                {/* Backdrop (Fundo escuro borrado) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
                />

                {/* Janela do Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="relative w-full max-w-2xl bg-[#0f1535] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto"
                >

                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 bg-[#151b33] flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`
                  text-xs font-bold uppercase tracking-wider px-2 py-1 rounded
                  ${deal.insuranceType === 'AUTO' ? 'bg-blue-500/20 text-blue-400' :
                                        deal.insuranceType === 'SAUDE' ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-700 text-gray-300'}
                `}>
                                    {deal.insuranceType}
                                </span>
                                <span className="text-gray-500 text-xs font-mono">#{deal.id.slice(0, 8)}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-tight">{deal.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Corpo (Scrollável) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-800">

                        {/* 1. Dados do Cliente */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#1a2040] p-4 rounded-xl border border-gray-700/50">
                                <h3 className="text-gray-400 text-xs uppercase font-bold mb-3 flex items-center gap-2">
                                    <User size={14} /> Cliente
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-white font-medium text-lg">{deal.contact.name}</p>
                                    {deal.contact.phone && (
                                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                                            <Phone size={14} className="text-cyan-400" />
                                            {deal.contact.phone}
                                        </div>
                                    )}
                                    {deal.contact.email && (
                                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                                            <Mail size={14} className="text-cyan-400" />
                                            {deal.contact.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Resumo Financeiro */}
                            <div className="bg-[#1a2040] p-4 rounded-xl border border-gray-700/50">
                                <h3 className="text-gray-400 text-xs uppercase font-bold mb-3 flex items-center gap-2">
                                    <DollarSign size={14} /> Negócio
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-emerald-400 font-bold text-2xl">
                                        {deal.value ? `R$ ${deal.value.toLocaleString('pt-BR')}` : 'R$ --'}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        Criado em: {new Date(deal.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                    {deal.renewalDate && (
                                        <div className="mt-2 pt-2 border-t border-gray-700 flex items-center gap-2 text-orange-400 text-sm font-medium">
                                            <Calendar size={14} />
                                            Renova em: {new Date(deal.renewalDate).toLocaleDateString('pt-BR')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Dados Específicos do Seguro (O Polimorfismo Visual) */}
                        {insuranceDetails.length > 0 && (
                            <div>
                                <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
                                    <Shield size={16} className="text-cyan-400" /> Detalhes da Apólice ({deal.insuranceType})
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {insuranceDetails.map(([key, value]) => (
                                        <div key={key} className="bg-[#131730] p-3 rounded-lg border border-gray-800">
                                            <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 truncate" title={key}>
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-sm text-gray-200 font-medium break-words">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Caso não tenha detalhes */}
                        {insuranceDetails.length === 0 && (
                            <div className="text-center py-8 text-gray-500 bg-[#131730]/50 rounded-xl border border-dashed border-gray-800">
                                <FileText size={48} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Nenhum detalhe adicional disponível para este tipo de seguro.</p>
                            </div>
                        )}

                    </div>

                    {/* Footer (Ações) */}
                    <div className="p-4 bg-[#151b33] border-t border-gray-800 flex justify-end gap-3">
                        <button className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm font-medium">
                            Editar Dados
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30 transition-all text-sm font-medium flex items-center gap-2">
                            <MessageCircle size={16} /> Abrir WhatsApp
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
