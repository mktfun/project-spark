'use client'

import * as React from 'react'
import { Button } from '@/components/crm/Button'
import { Input } from '@/components/crm/Input'
import { Card } from '@/components/crm/Card'
import { Modal } from '@/components/crm/Modal'
import { ShieldCheck, Car, Heart, Coins } from 'lucide-react'

export default function StyleguidePage() {
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    return (
        <div className="space-y-10 pb-20">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Design System & Styleguide</h1>
                <p className="text-slate-500">Componentes base para o Tork CRM (BrokerOS v2)</p>
            </div>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* BUTTONS */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="h-6 w-1 bg-crm-secondary rounded-full"></span>
                    Botões
                </h2>
                <Card className="space-y-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary">Primary Action</Button>
                        <Button variant="secondary">Secondary Action</Button>
                        <Button variant="ghost">Ghost Button</Button>
                        <Button variant="danger">Danger Button</Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary" size="sm">Small</Button>
                        <Button variant="primary" size="md">Medium</Button>
                        <Button variant="primary" size="lg">Large</Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary" isLoading>Loading...</Button>
                        <Button variant="secondary" disabled>Disabled</Button>
                    </div>
                </Card>
            </section>

            {/* INPUTS */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="h-6 w-1 bg-crm-secondary rounded-full"></span>
                    Inputs & Formulários
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="space-y-4">
                        <h3 className="font-medium text-slate-900">Estados Normais</h3>
                        <Input placeholder="Ex: João da Silva" label="Nome do Segurado" />
                        <Input placeholder="email@exemplo.com" label="E-mail" />
                        <Input placeholder="Digite algo..." />
                    </Card>
                    <Card className="space-y-4">
                        <h3 className="font-medium text-slate-900">Variações</h3>
                        <Input placeholder="000.000.000-00" label="CPF (Com Erro)" error="CPF Inválido" />
                        <Input placeholder="Digite seu nome" label="Floating Label" floatingLabel />
                        <Input placeholder="Digite seu nome" label="Floating + Erro" floatingLabel error="Campo obrigatório" />
                    </Card>
                </div>
            </section>

            {/* CARDS */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="h-6 w-1 bg-crm-secondary rounded-full"></span>
                    Cards & Containers
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <div className="h-full flex flex-col justify-between gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-lg">
                                <Car className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Forecast Auto</p>
                                <p className="text-2xl font-bold text-slate-900">R$ 45.200</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="h-full flex flex-col justify-between gap-4">
                            <div className="p-3 bg-green-50 text-green-600 w-fit rounded-lg">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Apólices Ativas</p>
                                <p className="text-2xl font-bold text-slate-900">1,240</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border-l-4 border-l-crm-warning">
                        <div className="h-full flex flex-col justify-between gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-lg">
                                <Coins className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Renovações (D-30)</p>
                                <p className="text-2xl font-bold text-slate-900">12</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* MODALS */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="h-6 w-1 bg-crm-secondary rounded-full"></span>
                    Interatividade
                </h2>
                <Card className="flex items-center gap-4">
                    <Button onClick={() => setIsModalOpen(true)}>Abrir Modal de Exemplo</Button>
                </Card>
            </section>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Detalhes da Apólice #12345"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="h-5 w-5 text-crm-primary" />
                            <span className="font-semibold text-slate-800">Seguro Auto - Honda Civic</span>
                        </div>
                        <p className="text-sm text-slate-500">Vigência: 20/12/2024 a 20/12/2025</p>
                    </div>

                    <p className="text-slate-600 text-sm">
                        Esta apólice foi importada automaticamente pelo sistema com base no PDF enviado. Verifique se todos os dados de Classe de Bônus estão corretos antes de prosseguir com a renovação.
                    </p>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirmar Dados</Button>
                    </div>
                </div>
            </Modal>

        </div>
    )
}
