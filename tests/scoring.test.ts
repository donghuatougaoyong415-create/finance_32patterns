import { describe, it, expect } from 'vitest';
import questionsJson from '../src/data/questions.json';
import typesJson from '../src/data/types.json';
import { score, parseStrengths, type Question, type Answers } from '../src/lib/scoring';
import { AXES } from '../src/lib/axes';

const questions = questionsJson as Question[];

const all = (v: number): Answers => Object.fromEntries(questions.map((q) => [q.id, v]));

describe('データ', () => {
  it('32問・各軸8問・各軸に決め手1問・各画面4問', () => {
    expect(questions).toHaveLength(32);
    for (const a of AXES) {
      const qs = questions.filter((q) => q.axis === a.key);
      expect(qs).toHaveLength(8);
      expect(qs.filter((q) => q.decisive)).toHaveLength(1);
      expect(qs.every((q) => q.lean === a.left.letter || q.lean === a.right.letter)).toBe(true);
    }
    for (let p = 1; p <= 8; p++) expect(questions.filter((q) => q.page === p)).toHaveLength(4);
  });

  it('16タイプ・相性◎は時間軸と群れが同じでリスクと判断根拠が逆', () => {
    expect(typesJson).toHaveLength(16);
    for (const t of typesJson) {
      const c = t.compatible;
      expect(c[0]).toBe(t.code[0]);
      expect(c[3]).toBe(t.code[3]);
      expect(c[1]).not.toBe(t.code[1]);
      expect(c[2]).not.toBe(t.code[2]);
    }
  });
});

describe('score', () => {
  // 各軸は寄りが左4問・右4問なので、全部同じ値だと合計は0になり決め手で決まる
  it('全部+2：合計0、決め手の寄りで決まる', () => {
    const r = score(questions, all(2));
    // 決め手：時間軸=L(16) リスク=D(11) 判断根拠=N(3) 群れ=C(6)
    expect(r.code).toBe('LDNC');
    expect(r.axes.every((a) => a.total === 0 && a.percent === 50)).toBe(true);
  });

  it('全部−2：決め手の逆側', () => {
    expect(score(questions, all(-2)).code).toBe('SAFT');
  });

  it('全部0：決め手も0なので全軸左', () => {
    const r = score(questions, all(0));
    expect(r.code).toBe('SANC');
    expect(r.axes.map((a) => a.percent)).toEqual([50, 50, 50, 50]);
  });

  it('左寄りの問に+2、右寄りの問に−2：全軸左100%', () => {
    const ans: Answers = {};
    for (const q of questions) {
      const axis = AXES.find((a) => a.key === q.axis)!;
      ans[q.id] = q.lean === axis.left.letter ? 2 : -2;
    }
    const r = score(questions, ans);
    expect(r.code).toBe('SANC');
    expect(r.axes.map((a) => a.total)).toEqual([16, 16, 16, 16]);
    expect(r.axes.map((a) => a.percent)).toEqual([100, 100, 100, 100]);
  });

  it('右寄りの問に+2：全軸右100%', () => {
    const ans: Answers = {};
    for (const q of questions) {
      const axis = AXES.find((a) => a.key === q.axis)!;
      ans[q.id] = q.lean === axis.right.letter ? 2 : 0;
    }
    const r = score(questions, ans);
    expect(r.code).toBe('LDFT');
    expect(r.axes.map((a) => a.total)).toEqual([-8, -8, -8, -8]);
    expect(r.axes.map((a) => a.percent)).toEqual([75, 75, 75, 75]);
  });

  for (const axis of AXES) {
    it(`${axis.label}がちょうど0：決め手の回答で決まる`, () => {
      const qs = questions.filter((q) => q.axis === axis.key);
      const key = qs.find((q) => q.decisive)!;
      const other = qs.find((q) => !q.decisive && q.lean === key.lean)!;
      // 決め手に+1、同じ寄りの別の問に−1 → 合計0、決め手は寄り側へ
      const ans: Answers = { ...all(0), [key.id]: 1, [other.id]: -1 };
      const r = score(questions, ans).axes.find((a) => a.axis === axis.key)!;
      expect(r.total).toBe(0);
      expect(r.letter).toBe(key.lean);
      expect(r.percent).toBe(50);

      // 符号を逆にすると反対側
      const ans2: Answers = { ...all(0), [key.id]: -1, [other.id]: 1 };
      const r2 = score(questions, ans2).axes.find((a) => a.axis === axis.key)!;
      expect(r2.total).toBe(0);
      expect(r2.letter).not.toBe(key.lean);
    });
  }

  it('%は四捨五入（合計+7 → 23/32=71.875 → 72）', () => {
    const qs = questions.filter((q) => q.axis === 'time' && q.lean === 'S');
    const ans: Answers = { ...all(0), [qs[0].id]: 2, [qs[1].id]: 2, [qs[2].id]: 2, [qs[3].id]: 1 };
    const r = score(questions, ans).axes[0];
    expect(r.total).toBe(7);
    expect(r.letter).toBe('S');
    expect(r.percent).toBe(72);
  });
});

describe('parseStrengths', () => {
  it('正しい形式', () => expect(parseStrengths('72-61-58-80')).toEqual([72, 61, 58, 80]));
  it('不正な形式は null', () => {
    expect(parseStrengths(null)).toBeNull();
    expect(parseStrengths('72-61-58')).toBeNull();
    expect(parseStrengths('72-61-58-abc')).toBeNull();
    expect(parseStrengths('10-61-58-80')).toBeNull();
  });
});
