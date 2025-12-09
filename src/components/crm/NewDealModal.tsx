"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Car, Heart, Home, Calendar, AlertCircle, Loader2, Plus } from 'lucide-react';
import axios from 'axios';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string;
}

export default function NewDealModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [fetchingLeads, setFetchingLeads] = useState(true);
    const [isNewClientMode, setIsNewClientMode] = useState(false);

    // Initial Form State
    const [formData, setFormData] = useState({
        // Client Data
        leadId: '',
        newClientName: '',
        newClientPhone: '',
        newClientEmail: '',

        // Deal Data
        title: '',
        tipo: 'AUTO',
        valor: '',
        renovacao: '',
        dadosExtras: {} as any
    });

    // Fetch Leads on Mount
    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await axios.get('/api/leads');
                setLeads(res.data);
            } catch (err) {
                console.error("Error fetching leads:", err);
            } finally {
                setFetchingLeads(false);
            }
        };
        fetchLeads();
    }, []);

    const handleExtraChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            dadosExtras: { ...prev.dadosExtras, [key]: value }
        }));
    };

    // Auto-generate title based on data
    useEffect(() => {
        let clientName = '';
        if (isNewClientMode) {
            clientName = formData.newClientName;
        } else {
            const l = leads.find(l => l.id === formData.leadId);
            clientName = l ? l.name : '';
        }

        const typeLabel = formData.tipo === 'AUTO' ? 'Seguro Auto' :
            formData.tipo === 'SAUDE' ? 'Plano de Saúde' :
                formData.tipo === 'CONSORCIO' ? 'Consórcio' : formData.tipo;

        if (clientName) {
            setFormData(prev => ({ ...prev, title: `${typeLabel} - ${clientName}` }));
        }
    }, [formData.leadId, formData.newClientName, formData.tipo, leads, isNewClientMode]);


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
                        <input placeholder="Faixa Etária" className="input-tork col-span-2" onChange={e => handleExtraChange('idades', e.target.value)} />
                    </div>
                );
            default: return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalLeadId = formData.leadId;

            // Scenario: Creating New Lead on the fly
            if (isNewClientMode) {
                if (!formData.newClientName || !formData.newClientPhone) {
                    alert("Nome e Telefone são obrigatórios para novo cliente.");
                    setLoading(false);
                    return;
                }

                // Create Lead
                const leadRes = await axios.post('/api/leads', {
                    nome: formData.newClientName,
                    telefone: formData.newClientPhone,
                    email: formData.newClientEmail,
                    status: 'New'
                });
                finalLeadId = leadRes.data.id;
            } else {
                if (!finalLeadId) {
                    alert("Selecione um cliente.");
                    setLoading(false);
                    return;
                }
            }

            // Create Deal
            await axios.post('/api/deals', {
                title: formData.title,
                value: formData.valor ? parseFloat(formData.valor) : 0,
                contactId: finalLeadId,
                insuranceType: formData.tipo,
                insuranceData: { ...formData.dadosExtras, renovacao: formData.renovacao },
                stageId: 'NEW' // Should match your initial stage ID
            });

            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar. Verifique o console.');
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

                    {/* Section 1: Client Selection (Smart) */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</label>
                            {isNewClientMode && (
                                <button type="button" onClick={() => setIsNewClientMode(false)} className="text-[10px] text-cyan-400 hover:underline">
                                    Voltar para Seleção
                                </button>
                            )}
                        </div>

                        {!isNewClientMode ? (
                            <div className="flex gap-2">
                                <select
                                    className="input-tork flex-1"
                                    value={formData.leadId}
                                    onChange={e => setFormData({ ...formData, leadId: e.target.value })}
                                    disabled={fetchingLeads}
                                >
                                    <option value="">{fetchingLeads ? "Carregando..." : "Selecione um Cliente..."}</option>
                                    {leads.map(lead => (
                                        <option key={lead.id} value={lead.id}>{lead.name} ({lead.phone})</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsNewClientMode(true)}
                                    className="w-12 h-10 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all"
                                    title="Novo Cliente Rápido"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                                <input
                                    autoFocus
                                    placeholder="Nome do Novo Cliente"
                                    className="input-tork border-cyan-500/50"
                                    value={formData.newClientName}
                                    onChange={e => setFormData({ ...formData, newClientName: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        placeholder="WhatsApp (55...)"
                                        className="input-tork"
                                        value={formData.newClientPhone}
                                        onChange={e => setFormData({ ...formData, newClientPhone: e.target.value })}
                                    />
                                    <input
                                        placeholder="Email (Opcional)"
                                        className="input-tork"
                                        value={formData.newClientEmail}
                                        onChange={e => setFormData({ ...formData, newClientEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Deal Details */}
                    <div className="space-y-3 border-t border-gray-800 pt-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detalhes do Negócio</label>

                        <input
                            className="input-tork font-medium text-white"
                            placeholder="Título do Negócio (Automático)"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />

                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            {['AUTO', 'SAUDE', 'CONSORCIO', 'VIDA', 'EMPRESARIAL'].map(type => (
                                <button
                                    type="button"
                                    key={type}
                                    onClick={() => setFormData({ ...formData, tipo: type })}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-all ${formData.tipo === type
                                        ? 'bg-cyan-600 border-cyan-500 text-white'
                                        : 'bg-[#0a0e27] border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="bg-[#0a0e27]/50 p-4 rounded-xl border border-gray-700/50 mb-3">
                            {renderDynamicFields()}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Valor Estimado</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500 text-xs">R$</span>
                                    <input
                                        type="number"
                                        placeholder="0,00"
                                        className="input-tork pl-8"
                                        onChange={e => setFormData({ ...formData, valor: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-orange-400 mb-1 block font-bold flex items-center gap-1"><AlertCircle size={10} /> Renovação</label>
                                <input type="date" className="input-tork border-orange-500/30 text-orange-200" onChange={e => setFormData({ ...formData, renovacao: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="btn-primary w-full shadow-lg shadow-cyan-500/20 py-3">
                            {loading ? <Loader2 className="animate-spin" /> : (isNewClientMode ? 'Cadastrar Cliente & Criar Negócio' : 'Criar Negócio')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
