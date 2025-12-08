"use client";

import React, { useState } from 'react';
import { X, Save, User, Phone, Car, Heart, Home, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function NewDealModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nome: '', telefone: '', email: '',
        tipo: 'AUTO', valor: '', renovacao: '',
        // Campos dinâmicos (JSON)
        dadosExtras: {} as any
    });

    const handleExtraChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            dadosExtras: { ...prev.dadosExtras, [key]: value }
        }));
    };

    // Renderiza campos baseados no tipo de seguro
    const renderDynamicFields = () => {
        switch (formData.tipo) {
            case 'AUTO':
                return (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                        <input placeholder="Modelo (Ex: Civic)" className="input-tork" onChange={e => handleExtraChange('modelo', e.target.value)} />
                        <input placeholder="Placa" className="input-tork uppercase" onChange={e => handleExtraChange('placa', e.target.value)} />
                        <input placeholder="Ano Modelo" className="input-tork" type="number" onChange={e => handleExtraChange('ano', e.target.value)} />
                        <input placeholder="Seguradora Atual" className="input-tork" onChange={e => handleExtraChange('seguradora', e.target.value)} />
                    </div>
                );
            case 'SAUDE':
                return (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                        <select className="input-tork" onChange={e => handleExtraChange('modalidade', e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="PF">Pessoa Física</option>
                            <option value="PME">PME / Empresarial</option>
                            <option value="ADESAO">Adesão</option>
                        </select>
                        <input placeholder="Qtd. Vidas" type="number" className="input-tork" onChange={e => handleExtraChange('vidas', e.target.value)} />
                        <input placeholder="Faixa Etária (Ex: 30-45)" className="input-tork col-span-2" onChange={e => handleExtraChange('idades', e.target.value)} />
                    </div>
                );
            default:
                return <p className="text-xs text-gray-500 italic">Sem campos específicos para este produto.</p>;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/leads', {
                nome: formData.nome,
                telefone: formData.telefone,
                email: formData.email,
                tipo_seguro: formData.tipo,
                valor_estimado: formData.valor,
                resumo: `Cadastro manual (${formData.tipo})`,
                dados_extras: { ...formData.dadosExtras, renovacao: formData.renovacao } // Salva no JSON
            });
            onSuccess();
            onClose();
        } catch (error) {
            alert('Erro ao salvar. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#0f1535] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 bg-[#151b33] border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="bg-cyan-500/10 text-cyan-400 p-1.5 rounded-lg"><User size={18} /></span>
                        Novo Negócio
                    </h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">

                    {/* Seção 1: Cliente */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dados do Cliente</label>
                        <div className="grid grid-cols-1 gap-3">
                            <input required placeholder="Nome Completo" className="input-tork" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                            <div className="grid grid-cols-2 gap-3">
                                <input required placeholder="WhatsApp (55...)" className="input-tork" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} />
                                <input placeholder="E-mail (Opcional)" className="input-tork" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: O Negócio */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detalhes da Apólice</label>

                        <div className="flex gap-3 mb-3">
                            {['AUTO', 'SAUDE', 'CONSORCIO'].map(type => (
                                <button
                                    type="button"
                                    key={type}
                                    onClick={() => setFormData({ ...formData, tipo: type })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${formData.tipo === type
                                            ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/50'
                                            : 'bg-[#0a0e27] border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Campos Dinâmicos */}
                        <div className="bg-[#0a0e27]/50 p-4 rounded-xl border border-gray-700/50 mb-3">
                            {renderDynamicFields()}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Valor Estimado (Prêmio)</label>
                                <input type="number" placeholder="R$ 0,00" className="input-tork" onChange={e => setFormData({ ...formData, valor: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] text-orange-400 mb-1 block font-bold flex items-center gap-1"><AlertCircle size={10} /> Data Renovação</label>
                                <input type="date" className="input-tork border-orange-500/30 focus:border-orange-500 text-orange-200" onChange={e => setFormData({ ...formData, renovacao: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? <Loader2 className="animate-spin" /> : 'Criar Negócio'}
                    </button>

                </form>
            </div>
        </div>
    );
}
