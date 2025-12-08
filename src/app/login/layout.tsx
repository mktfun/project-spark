import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login - Command Center',
    description: 'Sign in to Command Center',
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
