'use client';

import React, { useState } from 'react';
import { Card } from '@/components/crm/Card';
import { Button } from '@/components/crm/Button';
import { Input } from '@/components/crm/Input'; // Assuming Input exists, if not using native
import { Settings, Zap, Save, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'integrations' | 'ai';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('integrations');
    const [isLoading, setIsLoading] = useState(false);

    // Simple state for form fields - In production use React Hook Form
    const [formData, setFormData] = useState({
        chatwootUrl: '',
        accountId: '',
        userToken: '',
        aiProvider: 'openai',
        aiModel: 'gpt-4-turbo',
        aiApiKey: ''
    });

    const handleSave = () => {
        setIsLoading(true);
        // Simulating API call
        setTimeout(() => {
            console.log('Saving settings:', formData);
            setIsLoading(false);
            // Add toast success here
        }, 1000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
                <p className="text-slate-400">Gerencie integrações e preferências do sistema.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-2">
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
                            activeTab === 'integrations'
                                ? "bg-blue-600/10 text-blue-400 border border-blue-900/50"
                                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                        )}
                    >
                        <Globe className="h-4 w-4" />
                        Integrações
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
                            activeTab === 'ai'
                                ? "bg-blue-600/10 text-blue-400 border border-blue-900/50"
                                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                        )}
                    >
                        <Zap className="h-4 w-4" />
                        Inteligência Artificial
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <Card className="bg-[#111827] border-slate-800 p-6 min-h-[500px]">

                        {activeTab === 'integrations' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-1">Chatwoot</h2>
                                    <p className="text-sm text-slate-400">Conecte sua instância do Chatwoot para sincronizar contatos.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">URL do Chatwoot</label>
                                        <input
                                            name="chatwootUrl"
                                            value={formData.chatwootUrl}
                                            onChange={handleChange}
                                            placeholder="https://chat.suaempresa.com"
                                            className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Account ID</label>
                                            <input
                                                name="accountId"
                                                value={formData.accountId}
                                                onChange={handleChange}
                                                placeholder="1"
                                                className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">User Access Token</label>
                                            <input
                                                name="userToken"
                                                value={formData.userToken}
                                                onChange={handleChange}
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 mt-6">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Webhook URL (Read Only)</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-black/30 px-3 py-2 rounded text-slate-300 font-mono text-sm break-all">
                                                https://crm.davicode.me/api/webhooks/chatwoot
                                            </code>
                                            <Button variant="ghost" size="sm" onClick={() => { }}>Copiar</Button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Configure esta URL no seu Chatwoot para receber atualizações em tempo real.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-1">Cérebro IA</h2>
                                    <p className="text-sm text-slate-400">Configure o modelo de linguagem que irá processar seus dados.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Provedor</label>
                                        <select
                                            name="aiProvider"
                                            value={formData.aiProvider}
                                            onChange={handleChange}
                                            className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="openai">OpenAI (GPT-4)</option>
                                            <option value="anthropic">Anthropic (Claude 3)</option>
                                            <option value="google">Google (Gemini Pro)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Nome do Modelo</label>
                                        <input
                                            name="aiModel"
                                            value={formData.aiModel}
                                            onChange={handleChange}
                                            placeholder="gpt-4-turbo-preview"
                                            className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">API Key</label>
                                        <input
                                            name="aiApiKey"
                                            value={formData.aiApiKey}
                                            onChange={handleChange}
                                            type="password"
                                            placeholder="sk-..."
                                            className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Action */}
                        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                            <Button
                                onClick={handleSave}
                                isLoading={isLoading}
                                className="bg-blue-600 hover:bg-blue-500 text-white min-w-[120px]"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                            </Button>
                        </div>

                    </Card>
                </div>
            </div>
        </div>
    );
}
