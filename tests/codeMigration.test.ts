import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { OLD_TO_NEW, LETTER_MAP_BY_POSITION } from '../src/lib/codeMigration';
import { TYPES } from '../src/lib/types';
import { TYPE_CODE_RE } from '../src/lib/axes';
import questionsJson from '../src/data/questions.json';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

/** INSTRUCTIONS.md の表の行（| で始まる行）をセルの配列にする */
function tableRows(md: string, firstCell: RegExp): string[][] {
  return md
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
    .filter((cells) => firstCell.test(cells[0]));
}

describe('旧コード → 新コードの対応', () => {
  // CODE_MIGRATION.md の表をそのまま写したもの（旧コード, 新コード, 動物）
  const expected: [string, string, string][] = [
    ['SANT', 'QBRW', 'cheetah'], ['SANC', 'QBRA', 'falcon'], ['SAFT', 'QBIW', 'dolphin'], ['SAFC', 'QBIA', 'shark'],
    ['SDNT', 'QGRW', 'bee'], ['SDNC', 'QGRA', 'fox'], ['SDFT', 'QGIW', 'meerkat'], ['SDFC', 'QGIA', 'cat'],
    ['LANT', 'PBRW', 'beaver'], ['LANC', 'PBRA', 'crow'], ['LAFT', 'PBIW', 'penguin'], ['LAFC', 'PBIA', 'squirrel'],
    ['LDNT', 'PGRW', 'elephant'], ['LDNC', 'PGRA', 'sheep'], ['LDFT', 'PGIW', 'turtle'], ['LDFC', 'PGIA', 'bear'],
  ];

  it('16件すべてが表どおりで、キャラも同じ', () => {
    expect(Object.keys(OLD_TO_NEW)).toHaveLength(16);
    for (const [o, n, animal] of expected) {
      expect(OLD_TO_NEW[o], o).toBe(n);
      expect(TYPES.find((t) => t.code === n)?.animal, n).toBe(animal);
    }
  });

  it('1文字ずつ位置ごとに置き換えた結果と一致する', () => {
    for (const [o, n] of Object.entries(OLD_TO_NEW)) {
      const byLetter = [...o].map((c, i) => LETTER_MAP_BY_POSITION[i][c]).join('');
      expect(byLetter, o).toBe(n);
    }
  });

  it('新コードは重複なく、types.json の16タイプと一致する', () => {
    const news = Object.values(OLD_TO_NEW);
    expect(new Set(news).size).toBe(16);
    expect(new Set(TYPES.map((t) => t.code))).toEqual(new Set(news));
    for (const n of news) expect(n).toMatch(TYPE_CODE_RE);
  });

  it('相性◎のペアは旧コードのときと同じ組み合わせ', () => {
    // 旧INSTRUCTIONS.mdの相性◎（旧コード）
    const oldCompat: Record<string, string> = {
      SANT: 'SDFT', SANC: 'SDFC', SAFT: 'SDNT', SAFC: 'SDNC', SDNT: 'SAFT', SDNC: 'SAFC', SDFT: 'SANT', SDFC: 'SANC',
      LANT: 'LDFT', LANC: 'LDFC', LAFT: 'LDNT', LAFC: 'LDNC', LDNT: 'LAFT', LDNC: 'LAFC', LDFT: 'LANT', LDFC: 'LANC',
    };
    for (const [o, c] of Object.entries(oldCompat)) {
      expect(TYPES.find((t) => t.code === OLD_TO_NEW[o])?.compatible, o).toBe(OLD_TO_NEW[c]);
    }
  });

  it('types.json は INSTRUCTIONS.md の表（コード・動物・相性◎）と一致する', () => {
    const md = read('INSTRUCTIONS.md');
    const animals = tableRows(md, TYPE_CODE_RE).filter((r) => r.length === 5);
    const compat = tableRows(md, TYPE_CODE_RE).filter((r) => r.length === 4);
    expect(animals).toHaveLength(16);
    expect(compat).toHaveLength(16);
    for (const [code, animal, name] of animals) {
      const t = TYPES.find((x) => x.code === code);
      expect(t?.animal, code).toBe(animal);
      expect(t?.name, code).toBe(name);
    }
    for (const [code, , , c] of compat) expect(TYPES.find((x) => x.code === code)?.compatible, code).toBe(c);
  });

  it('questions.json の寄りは INSTRUCTIONS.md の設問表と一致する', () => {
    const rows = tableRows(read('INSTRUCTIONS.md'), /^\d+$/).filter((r) => r.length === 6);
    expect(rows).toHaveLength(32);
    for (const [id, , , text, lean, star] of rows) {
      const q = questionsJson.find((x) => x.id === Number(id))!;
      expect(q.text, id).toBe(text);
      expect(q.lean, id).toBe(lean);
      expect(q.decisive, id).toBe(star === '★');
    }
  });
});

describe('旧URLのリダイレクト', () => {
  const cf = read('public/_redirects');
  const vercel = JSON.parse(read('vercel.json')).redirects as { source: string; destination: string; statusCode: number }[];

  it('Cloudflare：16タイプ×4種類のURLを、大文字・小文字とも 301 で転送する', () => {
    for (const [o, n] of Object.entries(OLD_TO_NEW)) {
      for (const v of [o, o.toLowerCase()]) {
        expect(cf).toContain(`/result/${v} /result/${n} 301`);
        expect(cf).toContain(`/types/${v} /types/${n.toLowerCase()} 301`);
        expect(cf).toContain(`/report/${v} /report/${n.toLowerCase()} 301`);
        expect(cf).toContain(`/og/${v}.png /og/${n}.png 301`);
      }
    }
  });

  it('Vercel：同じ転送が 301 で入っている', () => {
    expect(vercel).toHaveLength(64);
    for (const [o, n] of Object.entries(OLD_TO_NEW)) {
      const any = `(${o}|${o.toLowerCase()})`;
      expect(vercel).toContainEqual({ source: `/result/:old${any}`, destination: `/result/${n}`, statusCode: 301 });
      expect(vercel).toContainEqual({ source: `/og/:old${any}.png`, destination: `/og/${n}.png`, statusCode: 301 });
    }
  });
});
