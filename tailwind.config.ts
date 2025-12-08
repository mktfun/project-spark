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
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'cyber-grid': 'linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px)',
            },
        },
    },
    plugins: [],
}
export default config
