export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#003087',
                    yellow: '#FFD100',
                },
                primary: {
                    DEFAULT: '#003087', // Brand Blue
                    foreground: '#FFFFFF',
                },
                accent: {
                    DEFAULT: '#FFD100', // Brand Yellow
                    foreground: '#003087', // Blue text for contrast on yellow
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    foreground: '#1F2937', // Gray-800
                },
                muted: {
                    DEFAULT: '#F1F5F9', // Slate-100
                    foreground: '#64748B', // Slate-500
                },
                destructive: {
                    DEFAULT: '#DC2626', // Red-600
                    foreground: '#FFFFFF',
                },
                success: {
                    DEFAULT: '#16A34A', // Green-600
                    foreground: '#FFFFFF',
                },
            },
            fontFamily: {
                sans: [
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    'sans-serif',
                ],
            },
            borderRadius: {
                DEFAULT: '0.5rem', // rounded-lg
            },
        },
    },
    plugins: [
        function ({ addUtilities, theme }) {
            addUtilities({
                '.focus-ring': {
                    outline: 'none',
                    '@apply ring-2 ring-offset-2 ring-primary': {},
                },
            });
        },
    ],
};
