'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/crm/Button'
import { Input } from '@/components/crm/Input'
import { Card } from '@/components/crm/Card'
import { TorkLogo } from '@/components/landing/TorkLogo'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('tork_token');
        if (token) {
            router.push('/crm/dashboard');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const form = e.target as HTMLFormElement
        const email = (form.elements.namedItem('email') as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                // Try to get specific error message
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.detail || 'Erro ao autenticar. Verifique suas credenciais.');
            }

            const data = await res.json()

            // Store token in localStorage
            localStorage.setItem('tork_token', data.access_token)
            localStorage.setItem('tork_user', JSON.stringify(data.user))

            // Set Cookie for Middleware
            document.cookie = `tork_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax; Secure`

            router.push('/crm/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <div className="h-16 w-auto mx-auto mb-6 flex justify-center">
                    <TorkLogo className="h-16 w-auto" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Login Tork CRM</h1>
                <p className="text-slate-400 text-sm">Acesso restrito via Chatwoot Bridge</p>
            </div>

            <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl">
                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        name="email"
                        label="E-mail"
                        type="email"
                        placeholder="admin@tork.com"
                        required
                        className="dark:bg-slate-800"
                    />

                    <Input
                        name="password"
                        label="Senha"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="dark:bg-slate-800"
                    />

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isLoading} variant="secondary">
                        Acessar Painel
                    </Button>
                </form>
            </Card>

            <p className="mt-8 text-xs text-slate-600">
                Tork CRM v0.2 &copy; 2024
            </p>
        </div>
    )
}
