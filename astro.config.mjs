import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://jeremytech.io.vn',
  output: 'static',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: true,
    imageService: 'compile',
  }),
  integrations: [react(), mdx(), sitemap()],
  compressHTML: true,
  inlineStylesheets: 'auto',
  prefetch: true,
  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'en',
    prefixDefaultLocale: false,
    fallback: { vi: 'en' },
    fallbackType: 'rewrite',
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    domains: [],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
