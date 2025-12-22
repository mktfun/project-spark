import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // LOG PARA VOCÊ VER NO TERMINAL O QUE ESTÁ CHEGANDO
    const hostname = request.headers.get('host')
    console.log(`[DEBUG MIDDLEWARE] Host: ${hostname} | Path: ${pathname}`)

    // 🚨 REGRA 1: LOGIN UNIVERSAL
    // Se pedir /login, entrega /crm/login. Foda-se o domínio por enquanto.
    // Isso resolve o seu 404 IMEDIATAMENTE.
    if (pathname === '/login') {
        url.pathname = '/crm/login'
        return NextResponse.rewrite(url)
    }

    // 🚨 REGRA 2: Roteamento de Subdomínio (CRM)
    if (hostname && hostname.includes('crm.')) {
        // Se estiver na raiz do CRM, joga pro Dashboard
        if (pathname === '/') {
            url.pathname = '/crm/dashboard'
            return NextResponse.redirect(url)
        }

        // Proteção básica de rotas internas
        if (pathname.startsWith('/crm') && !pathname.includes('/login')) {
            const token = request.cookies.get('tork_token')
            if (!token) {
                const loginUrl = new URL('/login', request.url)
                return NextResponse.redirect(loginUrl)
            }
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
