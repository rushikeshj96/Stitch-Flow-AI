/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            /* ─── Typography ─────────────────────────────── */
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                mono: ['"Fira Code"', 'monospace'],
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
                xl: ['1.25rem', { lineHeight: '1.875rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
            },

            /* ─── Colors ─────────────────────────────────── */
            colors: {
                /* Brand */
                primary: {
                    50: '#fdf5ff',
                    100: '#faeaff',
                    200: '#f3d5ff',
                    300: '#e9b4fd',
                    400: '#d882f8',
                    500: '#c453f0',
                    600: '#a932d5',
                    700: '#8d25b0',
                    800: '#74218f',
                    900: '#5e1d74',
                    950: '#3e0850',
                },
                /* Neutral — light theme */
                neutral: {
                    50: '#fafafa',
                    100: '#f4f4f5',
                    200: '#e4e4e7',
                    300: '#d1d1d6',
                    400: '#a0a0ab',
                    500: '#71717a',
                    600: '#52525b',
                    700: '#3f3f46',
                    800: '#27272a',
                    900: '#18181b',
                    950: '#09090b',
                },
                /* Semantic */
                success: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
                warning: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
                danger: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                info: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
            },

            /* ─── Spacing & Sizing ────────────────────────── */
            spacing: {
                18: '4.5rem',
                sidebar: '16rem',          /* 256px sidebar */
                'sidebar-collapsed': '4.5rem',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },

            /* ─── Shadows ─────────────────────────────────── */
            boxShadow: {
                card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
                'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.10), 0 4px 10px -5px rgb(0 0 0 / 0.06)',
                input: '0 0 0 3px rgb(196 83 240 / 0.15)',
                glow: '0 0 20px -5px rgb(196 83 240 / 0.50)',
            },

            /* ─── Animations ──────────────────────────────── */
            keyframes: {
                'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
                'slide-up': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                'slide-in': { from: { opacity: 0, transform: 'translateX(-10px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
                shimmer: { '0%': { backgroundPosition: '-400% 0' }, '100%': { backgroundPosition: '400% 0' } },
                'spin-slow': { to: { transform: 'rotate(360deg)' } },
            },
            animation: {
                'fade-in': 'fade-in 0.25s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'slide-in': 'slide-in 0.3s ease-out',
                shimmer: 'shimmer 2s linear infinite',
                'spin-slow': 'spin-slow 3s linear infinite',
            },
        },
    },
    plugins: [],
};
