import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/(site)/**/*.{js,ts,jsx,tsx,mdx}',  // Explicitly include (site) route group
        './src/app/(app)/**/*.{js,ts,jsx,tsx,mdx}',   // Explicitly include (app) route group
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e0fbff',
                    100: '#b3f4ff',
                    400: '#33f0ff',
                    500: '#00f5ff', // TORK NEON BASE
                    600: '#00ccda',
                    900: '#003d42',
                },
                dark: {
                    900: '#020410', // Deepest Black
                    800: '#0a0e27', // Deep Navy
                    700: '#131730', // Panel BG
                },
                // CRM Specific Colors (BrokerOS V2)
                crm: {
                    primary: '#0F172A', // Deep Navy
                    secondary: '#3B82F6', // Royal Blue
                    success: '#10B981', // Emerald Green
                    warning: '#F59E0B', // Amber
                    error: '#EF4444',  // Crimson
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'cyber-grid': 'linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px)',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    },
                },
                shimmer: {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(100%)' },
                },
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'blob': 'blob 7s infinite',
                'gradient-x': 'gradient-x 3s ease infinite',
                'shimmer': 'shimmer 2s infinite',
            },
        },
    },
    plugins: [],
}
export default config
