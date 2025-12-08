import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e6f9ff',
                    500: '#00f5ff',  // Cyan neon
                    900: '#003d42'
                },
                success: '#00ff88',
                error: '#ff3366',
                warning: '#ffaa00',
                background: '#0a0e27'
            },
            backdropBlur: {
                xs: '2px'
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #00f5ff, 0 0 10px #00f5ff' },
                    '100%': { boxShadow: '0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff' }
                }
            }
        },
    },
    plugins: [],
}
export default config
