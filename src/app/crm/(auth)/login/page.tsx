'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/crm/Button'
import { Input } from '@/components/crm/Input'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Verifica se já está logado
    useEffect(() => {
        const token = localStorage.getItem('tork_token')
        if (token) {
            router.push('/crm/dashboard')
        }
    }, [router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const form = e.target as HTMLFormElement
        const email = (form.elements.namedItem('email') as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value

        try {
            console.log('[LOGIN] Tentando autenticar via Proxy:', email)

            // USANDO PROXY REVERSO DO NEXT.JS (/api -> http://tork-api:8000)
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => null)
                console.error('[LOGIN ERROR] Resposta do backend:', res.status, errData)
                throw new Error(errData?.detail || `Erro ${res.status}: Falha ao autenticar`)
            }

            const data = await res.json()
            console.log('[LOGIN SUCCESS] Token recebido')

            // Salva token
            localStorage.setItem('tork_token', data.access_token)
            localStorage.setItem('tork_user', JSON.stringify(data.user))

            // Cookie para middleware
            document.cookie = `tork_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax; Secure`

            router.push('/crm/dashboard')
        } catch (err: any) {
            console.error('[LOGIN CRITICAL]', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0e17] flex flex-col items-center justify-center p-4">

            {/* Header / Logo */}
            <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="h-16 flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold tracking-tight text-white">TORK</span>
                    <span className="text-4xl font-bold tracking-tight text-blue-600 ml-1">CRM</span>
                </div>
                <p className="text-slate-400 text-sm">Broker Operating System</p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-[#111827] border border-blue-900/50 rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in duration-500">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white">Acessar Painel</h2>
                    <p className="text-slate-500 text-xs mt-1">Entre com suas credenciais do Chatwoot</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                        name="email"
                        label="E-mail Profissional"
                        type="email"
                        placeholder="admin@corretora.com"
                        required
                        className="bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white placeholder-slate-600"
                    />

                    <Input
                        name="password"
                        label="Senha"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white placeholder-slate-600"
                    />

                    {error && (
                        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start gap-3">
                            <div className="text-red-500 mt-0.5">⚠️</div>
                            <div className="text-xs text-red-200">
                                <span className="font-semibold block mb-1">Falha na Autenticação</span>
                                {error}
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                        isLoading={isLoading}
                    >
                        Entrar no Sistema
                    </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-600">
                        Problemas de acesso? Contate o suporte Tork.
                    </p>
                </div>
            </div>

            {/* Footer Text */}
            <div className="mt-8 text-center text-[10px] text-slate-700 font-mono">
                SECURE CONNECTION • TORK V0.2
            </div>
        </div>
    )
}
