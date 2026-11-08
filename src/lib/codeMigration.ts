/**
 * 旧タイプコード → 新タイプコードの対応（2026-11-08 に変更）。
 * 旧URLのリダイレクト生成とテストに使う。詳細は CODE_MIGRATION.md。
 */
export const OLD_TO_NEW: Record<string, string> = {
  SANT: 'QBRW',
  SANC: 'QBRA',
  SAFT: 'QBIW',
  SAFC: 'QBIA',
  SDNT: 'QGRW',
  SDNC: 'QGRA',
  SDFT: 'QGIW',
  SDFC: 'QGIA',
  LANT: 'PBRW',
  LANC: 'PBRA',
  LAFT: 'PBIW',
  LAFC: 'PBIA',
  LDNT: 'PGRW',
  LDNC: 'PGRA',
  LDFT: 'PGIW',
  LDFC: 'PGIA',
};

/** 旧コードの1文字 → 新コードの1文字（位置ごと。A は位置によって意味が違う） */
export const LETTER_MAP_BY_POSITION: Record<string, string>[] = [
  { S: 'Q', L: 'P' },
  { A: 'B', D: 'G' },
  { N: 'R', F: 'I' },
  { C: 'A', T: 'W' },
];
