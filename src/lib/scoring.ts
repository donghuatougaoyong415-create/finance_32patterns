import { AXES, type AxisKey } from './axes';

export interface Question {
  id: number;
  page: number;
  axis: AxisKey;
  text: string;
  /** 寄り（この問に「そう思う」と答えるとどちらの文字に寄るか） */
  lean: string;
  /** 合計が0のときの決め手の問か */
  decisive: boolean;
}

/** 回答値：+2〜−2。キーは設問ID */
export type Answers = Record<number, number>;

export interface AxisResult {
  axis: AxisKey;
  /** 寄りを考慮した合計（＋なら左、−なら右）。範囲 −16〜+16 */
  total: number;
  letter: string;
  /** 勝った側の%（整数） */
  percent: number;
}

export interface ScoreResult {
  code: string;
  axes: AxisResult[];
}

export const ANSWER_VALUES = [2, 1, 0, -1, -2] as const;

function signed(q: Question, value: number): number {
  const axis = AXES.find((a) => a.key === q.axis)!;
  return q.lean === axis.left.letter ? value : -value;
}

/** 32問の回答からタイプコードと各軸の強さを出す。純粋関数。 */
export function score(questions: Question[], answers: Answers): ScoreResult {
  const axes = AXES.map((axis): AxisResult => {
    const qs = questions.filter((q) => q.axis === axis.key);
    const total = qs.reduce((sum, q) => sum + signed(q, answers[q.id] ?? 0), 0);

    let isLeft: boolean;
    if (total !== 0) {
      isLeft = total > 0;
    } else {
      const key = qs.find((q) => q.decisive);
      const v = key ? signed(key, answers[key.id] ?? 0) : 0;
      isLeft = v >= 0; // 決め手も0なら左
    }

    const max = qs.length * 2; // 8問×2 = 16
    const p = (total + max) / (max * 2);
    const percent = Math.round((isLeft ? p : 1 - p) * 100);
    return { axis: axis.key, total, letter: isLeft ? axis.left.letter : axis.right.letter, percent };
  });

  return { code: axes.map((a) => a.letter).join(''), axes };
}

/** `s=72-61-58-80` をパースする。不正なら null */
export function parseStrengths(s: string | null | undefined): number[] | null {
  if (!s) return null;
  const parts = s.split('-').map((x) => Number(x));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 50 || n > 100)) return null;
  return parts;
}
