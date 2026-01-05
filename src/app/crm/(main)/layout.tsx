import type { Metadata } from 'next'
import { AppShell } from '@/components/crm/layout/AppShell'

export const metadata: Metadata = {
    title: 'Tork CRM | BrokerOS',
    description: 'Sistema de gestão inteligente para corretoras de seguros',
}

export default function CRMLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AppShell>
            {children}
        </AppShell>
    )
}
