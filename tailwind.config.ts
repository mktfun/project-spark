import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/(site)/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/(app)/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e0fbff',
                    100: '#b3f4ff',
                    400: '#33f0ff',
                    500: '#00f5ff',
                    600: '#00ccda',
                    900: '#003d42',
                },
                dark: {
                    900: '#020410',
                    800: '#0a0e27',
                    700: '#131730',
                },
                crm: {
                    primary: '#0F172A',
                    secondary: '#3B82F6',
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                },
            },
            backdropBlur: {
                'xs': '2px',
                'sm': '4px',
                'md': '12px',
                'lg': '16px',
                'xl': '24px',
                '2xl': '40px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
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
    plugins: [
        plugin(function ({ addComponents }) {
            addComponents({
                '.glass-panel': {
                    '@apply bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-glass': {},
                },
                '.glass-card': {
                    '@apply bg-white/5 dark:bg-white/[0.02] backdrop-blur-md border border-white/10 dark:border-white/5 hover:bg-white/15 dark:hover:bg-white/[0.08] transition-all shadow-glass-sm': {},
                },
            })
        }),
    ],
}
export default config
