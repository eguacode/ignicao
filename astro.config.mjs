import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
    site: 'https://www.comunidadeignicao.com.br',
    output: 'static',
    adapter: vercel(),
    integrations: [
        react(),
        tailwind({ applyBaseStyles: false }),
    ],
    vite: {
        optimizeDeps: {
            include: ['marked'],
        },
    },
    image: {
        domains: ['images.unsplash.com', 'unsplash.com', 'localhost'],
    },
    build: {
        inlineStylesheets: 'always',
    },
});
