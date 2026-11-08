// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // TODO: ドメインが決まったら差し替える（OGP・シェアURLの絶対パスに使う）
  site: process.env.PUBLIC_SITE_URL || 'https://example.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
