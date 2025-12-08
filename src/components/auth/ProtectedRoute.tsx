"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (!isAuthenticated) {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
            }
        }
    }, [isAuthenticated, router]);

    if (!isClient) {
        return null; // Return null during SSR
    }

    if (!isAuthenticated && !localStorage.getItem('token')) {
        return null;
    }

    return <>{children}</>;
}
