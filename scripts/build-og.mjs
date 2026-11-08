// OGP画像（1200×630）をビルド時に作る：public/og/{CODE}.png と public/og/default.png
// 文字は Noto Sans JP を Google Fonts から「使う文字だけ」取得して描く（取得結果はキャッシュ）。
import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

const ROOT = path.resolve('.');
const CHAR_DIR = path.join(ROOT, 'public/images/characters');
const OUT_DIR = path.join(ROOT, 'public/og');
const CACHE_DIR = path.join(ROOT, 'node_modules/.cache/investor16-og');
const TYPES_PATH = path.join(ROOT, 'src/data/types.json');

const W = 1200;
const H = 630;
const C = { paper: '#f5f0e6', deep: '#ebe3d3', ink: '#3b2a1e', soft: '#6b5848', clay: '#9a4f36', line: '#d9cdb8' };
const SITE = '投資家16タイプ診断';
const DEFAULT_LINES = ['日常の32問でわかる', 'あなたが投資したら、', 'どのタイプ？'];
const DEFAULT_SUB = '買い物・旅行・食事の質問に答えるだけ。登録不要。';

const types = JSON.parse(await readFile(TYPES_PATH, 'utf8'));

// ---- 生成が必要か（出力が、データ・画像・このスクリプトより新しければスキップ）
const mtime = (p) => stat(p).then((s) => s.mtimeMs).catch(() => 0);
const inputs = [TYPES_PATH, new URL(import.meta.url).pathname, ...types.map((t) => path.join(CHAR_DIR, `${t.code}.png`))];
const newestInput = Math.max(...(await Promise.all(inputs.map(mtime))));
const outputs = [...types.map((t) => path.join(OUT_DIR, `${t.code}.png`)), path.join(OUT_DIR, 'default.png')];
const oldestOutput = Math.min(...(await Promise.all(outputs.map(mtime))));
if (oldestOutput > newestInput) {
  console.log('og: up to date');
  process.exit(0);
}

// ---- フォント（使う文字だけのサブセット）
const text = [SITE, ...DEFAULT_LINES, DEFAULT_SUB, '投資したら', 'あなたは', ...types.flatMap((t) => [t.code, t.name, t.invest])].join('');
const chars = [...new Set(text + '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')].sort().join('');

async function loadFont(weight) {
  const key = createHash('sha1').update(`${weight}:${chars}`).digest('hex').slice(0, 16);
  const cached = path.join(CACHE_DIR, `noto-sans-jp-${weight}-${key}.ttf`);
  try {
    return await readFile(cached);
  } catch {
    /* キャッシュなし */
  }
  const url = new URL('https://fonts.googleapis.com/css2');
  url.searchParams.set('family', `Noto Sans JP:wght@${weight}`);
  url.searchParams.set('text', chars);
  // 古いUAで頼むと TrueType 形式で返る（satori は woff2 を読めない）
  const css = await fetch(url, { headers: { 'User-Agent': 'Mozilla/4.0' } }).then((r) => {
    if (!r.ok) throw new Error(`Google Fonts CSS: HTTP ${r.status}`);
    return r.text();
  });
  const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error('Google Fonts CSS にフォントのURLがない');
  const res = await fetch(fontUrl);
  if (!res.ok) throw new Error(`Google Fonts: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cached, buf);
  return buf;
}

const fonts = [
  { name: 'Noto Sans JP', data: await loadFont(400), weight: 400, style: 'normal' },
  { name: 'Noto Sans JP', data: await loadFont(700), weight: 700, style: 'normal' },
];

// ---- 部品
const h = (type, style, children) => ({ type, props: { style, children } });
const img = (src, size, radius) => ({
  type: 'img',
  props: { src, width: size, height: size, style: { width: size, height: size, borderRadius: radius } },
});

async function charDataUri(code, size) {
  const buf = await sharp(path.join(CHAR_DIR, `${code}.png`)).resize(size, size).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function render(tree, out) {
  const svg = await satori(tree, { width: W, height: H, fonts });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true, quality: 90, dither: 0.6 }).toFile(out);
}

await mkdir(OUT_DIR, { recursive: true });

// ---- タイプ別：左にキャラ、右にコード・名前・「投資したら」
const IMG = 460;
const RIGHT_W = W - 56 - IMG - 44 - 56; // 右側の文字エリアの幅
for (const t of types) {
  // 長い名前は1行に収まるよう文字を小さくする
  const nameSize = Math.min(52, Math.floor(RIGHT_W / [...t.name].length));
  const tree = h(
    'div',
    { width: W, height: H, display: 'flex', alignItems: 'center', backgroundColor: C.paper, fontFamily: 'Noto Sans JP', color: C.ink, padding: '0 56px' },
    [
      img(await charDataUri(t.code, IMG), IMG, 48),
      h('div', { display: 'flex', flexDirection: 'column', marginLeft: 44, width: RIGHT_W }, [
        h('div', { fontSize: 26, color: C.soft, fontWeight: 700 }, SITE),
        h('div', { fontSize: 104, fontWeight: 700, letterSpacing: 8, lineHeight: 1.1, marginTop: 16 }, t.code),
        h('div', { fontSize: nameSize, fontWeight: 700, lineHeight: 1.25, marginTop: 4 }, t.name),
        h('div', { display: 'flex', flexDirection: 'column', marginTop: 36, padding: '22px 28px', backgroundColor: C.deep, borderRadius: 28 }, [
          h('div', { fontSize: 24, fontWeight: 700, color: C.clay }, '投資したら'),
          h('div', { fontSize: 31, fontWeight: 700, lineHeight: 1.45, marginTop: 6 }, t.invest),
        ]),
      ]),
    ],
  );
  await render(tree, path.join(OUT_DIR, `${t.code}.png`));
}

// ---- 共通：キャッチと4キャラ
const sample = ['SANT', 'LDFT', 'LAFT', 'SDFC'];
const thumbs = await Promise.all(sample.map((c) => charDataUri(c, 160)));
const defaultTree = h(
  'div',
  { width: W, height: H, display: 'flex', alignItems: 'center', backgroundColor: C.paper, fontFamily: 'Noto Sans JP', color: C.ink, padding: '0 64px' },
  [
    h('div', { display: 'flex', flexDirection: 'column', width: 680 }, [
      h('div', { fontSize: 30, fontWeight: 700, color: C.clay }, SITE),
      ...DEFAULT_LINES.map((l) => h('div', { fontSize: 60, fontWeight: 700, lineHeight: 1.35 }, l)),
      h('div', { fontSize: 26, color: C.soft, marginTop: 24 }, DEFAULT_SUB),
    ]),
    h(
      'div',
      { display: 'flex', flexWrap: 'wrap', width: 336, gap: 16, position: 'absolute', right: 64, top: 147 },
      thumbs.slice(0, 4).map((src) => img(src, 160, 28)),
    ),
  ],
);
await render(defaultTree, path.join(OUT_DIR, 'default.png'));

console.log(`og: ${types.length + 1} images generated`);
