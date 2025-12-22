import type { Metadata } from 'next'
import { AppShell } from '@/components/crm/layout/AppShell'
import { Sidebar } from '@/components/crm/layout/Sidebar'
import { Topbar } from '@/components/crm/layout/Topbar'

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
        <AppShell
            sidebar={<Sidebar />}
            topbar={<Topbar />}
        >
            {children}
        </AppShell>
    )
}
