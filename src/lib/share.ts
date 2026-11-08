import type { InvestorType } from './types';

/** X の文字数（全角=2、URLは一律23）で数える簡易版 */
function xLength(text: string): number {
  let n = 0;
  for (const ch of text) n += /[\u0000-ჿ -‍‐-‟′-‷]/.test(ch) ? 1 : 2;
  return n;
}

export function shareText(t: InvestorType, withDaily = true): string {
  return `${withDaily ? t.daily : ''}私、投資したら【${t.code} ${t.name}】だった #投資家16タイプ診断`;
}

/** X投稿文（URLを除く）。長すぎる場合は「日常のあなた」を省く */
export function xShareText(t: InvestorType): string {
  const full = shareText(t, true);
  // URLぶん（23＋空白1）を残して280以内
  return xLength(full) + 24 <= 280 ? full : shareText(t, false);
}
