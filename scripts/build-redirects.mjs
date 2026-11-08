// 旧タイプコードのURL → 新コードのURL の 301 リダイレクトを書き出す。
// 対応表は src/lib/codeMigration.ts と同じ（テストで一致を確かめている）。
// 実行：node scripts/build-redirects.mjs
import { readFile, writeFile } from 'node:fs/promises';

const src = await readFile(new URL('../src/lib/codeMigration.ts', import.meta.url), 'utf8');
const map = Object.fromEntries([...src.matchAll(/^\s+([A-Z]{4}): '([A-Z]{4})',$/gm)].map((m) => [m[1], m[2]]));
if (Object.keys(map).length !== 16) throw new Error('対応表を16件読めませんでした');

// Cloudflare Pages（public/_redirects）。大文字・小文字の両方を書く
const lines = ['# 旧タイプコード → 新コード（2026-11-08 変更）。scripts/build-redirects.mjs で生成'];
for (const [o, n] of Object.entries(map)) {
  for (const v of [o, o.toLowerCase()]) {
    lines.push(`/result/${v} /result/${n} 301`);
    lines.push(`/types/${v} /types/${n.toLowerCase()} 301`);
    lines.push(`/report/${v} /report/${n.toLowerCase()} 301`);
    lines.push(`/og/${v}.png /og/${n}.png 301`);
  }
}
await writeFile(new URL('../public/_redirects', import.meta.url), lines.join('\n') + '\n');

// Vercel（vercel.json の redirects）
const vercelPath = new URL('../vercel.json', import.meta.url);
const vercel = JSON.parse(await readFile(vercelPath, 'utf8'));
vercel.redirects = Object.entries(map).flatMap(([o, n]) => {
  const any = `(${o}|${o.toLowerCase()})`;
  return [
    { source: `/result/:old${any}`, destination: `/result/${n}`, statusCode: 301 },
    { source: `/types/:old${any}`, destination: `/types/${n.toLowerCase()}`, statusCode: 301 },
    { source: `/report/:old${any}`, destination: `/report/${n.toLowerCase()}`, statusCode: 301 },
    { source: `/og/:old${any}.png`, destination: `/og/${n}.png`, statusCode: 301 },
  ];
});
await writeFile(vercelPath, JSON.stringify(vercel, null, 2) + '\n');
console.log(`redirects: ${lines.length - 1} (Cloudflare), ${vercel.redirects.length} (Vercel)`);
