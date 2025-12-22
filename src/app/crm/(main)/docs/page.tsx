'use client';

import React from 'react';
import { Card } from '@/components/crm/Card';
import { Button } from '@/components/crm/Button';
import { FileText, Code, Server, Zap } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Documentação do Sistema</h1>
                <p className="text-slate-400">Referência técnica para integrações e uso da API Tork CRM.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* API Endpoints */}
                <div className="space-y-6">
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-white">
                            <Server className="text-crm-secondary h-5 w-5" />
                            <h2 className="text-xl font-semibold">CRM API Endpoints</h2>
                        </div>
                        <div className="space-y-4">
                            <EndpointCard
                                method="GET"
                                path="/api/crm/stages"
                                description="Retorna todas as etapas do pipeline configuradas."
                            />
                            <EndpointCard
                                method="GET"
                                path="/api/crm/leads"
                                description="Lista todos os leads (negócios) cadastrados."
                            />
                            <EndpointCard
                                method="PATCH"
                                path="/api/crm/leads/:id"
                                description="Atualiza o status (fase) de um lead."
                            />
                        </div>
                    </section>
                </div>

                {/* Webhooks Info */}
                <div className="space-y-6">
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-white">
                            <Zap className="text-yellow-500 h-5 w-5" />
                            <h2 className="text-xl font-semibold">Chatwoot Webhooks</h2>
                        </div>
                        <Card className="bg-[#111827] border-slate-800 p-6">
                            <p className="text-sm text-slate-400 mb-4">
                                O Tork CRM aceita eventos do Chatwoot para criar e atualizar leads automaticamente.
                                Configure a URL abaixo no Chatwoot:
                            </p>
                            <code className="block bg-black/50 p-3 rounded text-green-400 font-mono text-xs mb-6 border border-slate-800">
                                https://crm.davicode.me/api/webhooks/chatwoot
                            </code>

                            <h3 className="text-sm font-semibold text-white mb-2">Payload Suportado (JSON)</h3>
                            <pre className="bg-black/50 p-4 rounded text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800 custom-scrollbar">
                                {`{
  "event": "contact_created", // ou contact_updated
  "id": 12345,
  "name": "Cliente Exemplo",
  "email": "cliente@email.com",
  "phone_number": "+5511999999999",
  "custom_attributes": {
    "empresa": "Acme Corp"
  }
}`}
                            </pre>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
}

function EndpointCard({ method, path, description }: { method: string, path: string, description: string }) {
    const methodColor = {
        GET: 'text-blue-400',
        POST: 'text-green-400',
        PATCH: 'text-yellow-400',
        DELETE: 'text-red-400',
    }[method] || 'text-slate-400';

    return (
        <Card className="bg-[#111827] border-slate-800 p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 font-mono text-sm mb-2">
                <span className={`font-bold ${methodColor}`}>{method}</span>
                <span className="text-slate-300">{path}</span>
            </div>
            <p className="text-xs text-slate-500">{description}</p>
        </Card>
    );
}
