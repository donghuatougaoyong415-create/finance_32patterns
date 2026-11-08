import { describe, it, expect } from 'vitest';
import { TYPES, typePageUrl, getType } from '../src/lib/types';
import { xShareText, xLength } from '../src/lib/share';

describe('タイプ解説用のデータ', () => {
  it('全タイプに説明文と3つのヒントがある', () => {
    for (const t of TYPES) {
      expect(t.about.length, t.code).toBeGreaterThan(30);
      expect(t.tips, t.code).toHaveLength(3);
    }
  });

  it('避けるべき表現を含まない', () => {
    const banned = ['必ず儲か', '絶対に儲か', '確実に儲か', 'MBTI', '16Personalities'];
    const text = JSON.stringify(TYPES);
    for (const w of banned) expect(text).not.toContain(w);
  });
});

describe('URL', () => {
  it('タイプ解説は /types/{小文字コード}', () => {
    expect(typePageUrl('QBRW')).toBe('/types/qbrw');
    expect(getType('qbrw')?.code).toBe('QBRW');
  });
});

describe('シェア文', () => {
  it('全タイプでURL込み280以内（X の数え方）', () => {
    for (const t of TYPES) expect(xLength(xShareText(t)) + 24, t.code).toBeLessThanOrEqual(280);
  });
});
