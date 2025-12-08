import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/layout/ClientLayout'
import { AuthProvider } from '@/context/AuthContext'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Tork CRM',
    description: 'Gestão Inteligente para Corretores',
    icons: {
        icon: '/favicon.ico',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-[#0a0e27] text-white`}>
                <AuthProvider>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                </AuthProvider>
            </body>
        </html>
    )
}
