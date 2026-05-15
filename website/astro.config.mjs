// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://www.seomarkup.site',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // allow website/src/lib/extension-meta.ts to import from ../app/manifest.json
        '../../app/manifest.json': path.resolve(__dirname, '../app/manifest.json'),
      },
    },
  },
  integrations: [
    mdx(),
    sitemap(),
    preact({ compat: true }),
  ],
});
