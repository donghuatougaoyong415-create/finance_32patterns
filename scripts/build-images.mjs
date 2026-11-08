// キャラ画像（1024px PNG）から表示用の WebP（512px・256px）を作る。
// 生成済みで元画像より新しければスキップする。
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.resolve('public/images/characters');
const sizes = [512, 256];

const files = (await readdir(dir)).filter((f) => /^[SL][AD][NF][CT]\.png$/.test(f));
let made = 0;
for (const file of files) {
  const src = path.join(dir, file);
  const srcTime = (await stat(src)).mtimeMs;
  for (const size of sizes) {
    const out = path.join(dir, `${path.basename(file, '.png')}-${size}.webp`);
    const outTime = await stat(out).then((s) => s.mtimeMs).catch(() => 0);
    if (outTime > srcTime) continue;
    await sharp(src).resize(size, size).webp({ quality: 82 }).toFile(out);
    made++;
  }
}
console.log(`characters: ${files.length} images, ${made} webp generated`);
