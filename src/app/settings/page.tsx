"use client";

import React, { useState } from 'react';
import { Webhook, ArrowRightLeft, Send, ShieldCheck, Save } from 'lucide-react';

export default function SettingsPage() {
    const [webhookOut, setWebhookOut] = useState(''); // URL do n8n para receber dados

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const webhookIn = `${origin}/api/leads`;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">

            {/* Cabeçalho */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Central de Integrações</h1>
                <p className="text-gray-400">Conecte o Tork CRM ao seu ecossistema de automação (n8n, Typebot).</p>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {/* Card 1: Entrada (Receber Leads) */}
                <div className="bg-[#151b33] border border-gray-800 rounded-xl p-6 flex gap-5">
                    <div className="p-3 bg-green-500/10 rounded-lg text-green-400 h-fit"><ArrowRightLeft size={24} /></div>
                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between">
                            <h3 className="text-lg font-bold text-white">Recebimento de Leads (Inbound)</h3>
                            <span className="px-2 py-1 rounded bg-green-900/30 text-green-400 text-xs border border-green-800">Ativo</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Copie este URL e configure no nó <strong>HTTP Request</strong> do seu n8n para criar leads automaticamente quando o cliente conversar no Chatwoot.
                        </p>
                        <div className="bg-black/40 border border-gray-700 rounded-lg p-3 font-mono text-sm text-cyan-400 select-all">
                            {webhookIn}
                        </div>
                    </div>
                </div>

                {/* Card 2: Saída (Notificações e Disparos) */}
                <div className="bg-[#151b33] border border-gray-800 rounded-xl p-6 flex gap-5">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 h-fit"><Send size={24} /></div>
                    <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-bold text-white">Disparos e Automação (Outbound)</h3>
                        <p className="text-sm text-gray-400">
                            Para onde devemos enviar os dados quando você clicar em "Notificar WhatsApp" ou quando uma renovação vencer?
                        </p>
                        <div className="flex gap-2">
                            <input
                                placeholder="Cole aqui o Webhook do seu n8n (Ex: https://n8n.seudominio.com/webhook/disparo)"
                                className="flex-1 bg-[#0a0e27] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                                value={webhookOut}
                                onChange={e => setWebhookOut(e.target.value)}
                            />
                            <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-lg flex items-center gap-2 font-medium">
                                <Save size={16} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card 3: Hierarquia e Permissões */}
                <div className="bg-[#151b33] border border-gray-800 rounded-xl p-6 flex gap-5 opacity-75">
                    <div className="p-3 bg-gray-700/30 rounded-lg text-gray-400 h-fit"><ShieldCheck size={24} /></div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-300">Gestão de Equipe</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Gerencie corretores e permissões de visualização. (Em breve na versão Pro)
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
