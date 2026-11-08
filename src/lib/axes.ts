export type AxisKey = 'time' | 'risk' | 'basis' | 'crowd';

export interface AxisDef {
  key: AxisKey;
  label: string;
  /** 左（＋側）の文字と呼び名 */
  left: { letter: string; label: string };
  /** 右（－側）の文字と呼び名 */
  right: { letter: string; label: string };
}

/** コードの並び順：時間軸・リスク・判断根拠・群れとの距離 */
export const AXES: AxisDef[] = [
  { key: 'time', label: '時間軸', left: { letter: 'Q', label: '短期' }, right: { letter: 'P', label: '長期' } },
  { key: 'risk', label: 'リスク', left: { letter: 'B', label: '攻め' }, right: { letter: 'G', label: '守り' } },
  { key: 'basis', label: '判断根拠', left: { letter: 'R', label: '数字' }, right: { letter: 'I', label: '感覚' } },
  { key: 'crowd', label: '群れとの距離', left: { letter: 'A', label: '逆張り' }, right: { letter: 'W', label: '順張り' } },
];

export const TYPE_CODE_RE = /^[QP][BG][RI][AW]$/;
