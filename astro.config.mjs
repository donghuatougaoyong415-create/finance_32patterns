// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // TODO: ドメインが決まったら PUBLIC_SITE_URL を設定する（OGP・シェアURL・サイトマップの絶対URLに使う）
  site: process.env.PUBLIC_SITE_URL || 'https://example.com',
  output: 'static',
  // /result/SANT のように末尾スラッシュなしのURLで配信する（Cloudflare Pages / Vercel 共通）
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      // 結果ページはタイプ解説と内容が重なるので、検索にはタイプ解説を出す
      filter: (page) => !/\/(result|report)\//.test(page) && !/\/404$/.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
