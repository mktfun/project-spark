'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/crm/Button'
import { Input } from '@/components/crm/Input'
import { Card } from '@/components/crm/Card'
import { Loader2, Save, Cpu, ToggleLeft, ToggleRight, Key, ShieldCheck } from 'lucide-react'

// Mock Data for Providers
const AI_PROVIDERS = {
    'openai': { name: 'OpenAI (GPT)', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    'anthropic': { name: 'Anthropic (Claude)', models: ['claude-3-opus', 'claude-3.5-sonnet', 'claude-3-haiku'] },
    'groq': { name: 'Groq (Llama)', models: ['llama3-70b', 'mixtral-8x7b'] }
}

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [provider, setProvider] = useState('openai')
    const [model, setModel] = useState('gpt-4o')
    const [apiKey, setApiKey] = useState('')
    const [autoCreate, setAutoCreate] = useState(true)
    const [requireTag, setRequireTag] = useState(false)
    const [isApiKeySet, setIsApiKeySet] = useState(false)

    // Load Settings
    useEffect(() => {
        // Mock loading from API
        // In real impl: fetch('/api/crm/settings/{userId}')
        // For now, simulate default
    }, [])

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvider = e.target.value
        setProvider(newProvider)
        // Reset model to first option of new provider
        setModel(AI_PROVIDERS[newProvider as keyof typeof AI_PROVIDERS].models[0])
    }

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate API Call
        await new Promise(r => setTimeout(r, 1000))
        setIsSaving(false)
        setIsApiKeySet(!!apiKey || isApiKeySet)
        if (apiKey) setApiKey('') // Clear from UI after save
        alert('Configurações salvas com sucesso!')
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações e Integrações</h1>
                    <p className="text-slate-500">Gerencie a inteligência artificial e as automações do sistema.</p>
                </div>
                <Button onClick={handleSave} isLoading={isSaving} variant="secondary">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* AI Configuration */}
                <Card className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Cpu className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Inteligência Artificial</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Provedor de IA</label>
                            <select
                                value={provider}
                                onChange={handleProviderChange}
                                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-crm-secondary dark:bg-crm-primary/50 dark:border-slate-700 dark:text-white"
                            >
                                {Object.entries(AI_PROVIDERS).map(([key, val]) => (
                                    <option key={key} value={key}>{val.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Modelo</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-crm-secondary dark:bg-crm-primary/50 dark:border-slate-700 dark:text-white"
                            >
                                {AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS].models.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                                API Key do Provedor
                                {isApiKeySet && <span className="text-xs text-green-600 flex items-center"><ShieldCheck className="w-3 h-3 mr-1" />Chave Configurada</span>}
                            </label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    placeholder={isApiKeySet ? "••••••••••••••••" : "sk-..."}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="pr-10"
                                />
                                <Key className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">A chave é criptografada antes de ser salva no banco.</p>
                        </div>
                    </div>
                </Card>

                {/* Automation Toggles */}
                <Card className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <ToggleLeft className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Automação de Leads</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-slate-800 dark:text-white">Criar Leads Automaticamente</label>
                                <p className="text-xs text-slate-500 max-w-[250px]">Criar card no Kanban para todo novo contato que mandar oi.</p>
                            </div>
                            <button
                                onClick={() => setAutoCreate(!autoCreate)}
                                className={`w-11 h-6 flex items-center rounded-full transition-colors ${autoCreate ? 'bg-crm-secondary' : 'bg-slate-200'}`}
                            >
                                <span className={`h-4 w-4 bg-white rounded-full transition-transform transform ${autoCreate ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-slate-800 dark:text-white">Exigir Etiqueta de Interesse</label>
                                <p className="text-xs text-slate-500 max-w-[250px]">Só cria o card se você adicionar a tag "oportunidade" no Chatwoot.</p>
                            </div>
                            <button
                                onClick={() => setRequireTag(!requireTag)}
                                className={`w-11 h-6 flex items-center rounded-full transition-colors ${requireTag ? 'bg-crm-secondary' : 'bg-slate-200'}`}
                            >
                                <span className={`h-4 w-4 bg-white rounded-full transition-transform transform ${requireTag ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="p-3 bg-amber-50 text-amber-800 rounded-md text-xs">
                                <strong>Nota:</strong> As configurações de automação podem levar até 5 minutos para refletir em todos os webhooks ativos.
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
