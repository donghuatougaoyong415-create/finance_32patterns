/**
 * sessionStorage のキー。タイプコードを変えた 2026-11-08 に v2 にした。
 * 旧キー（旧コードの結果が入っている可能性がある）は読まずに消す。
 */
export const PROGRESS_KEY = 'investor16:progress_v2';
export const COMPLETED_KEY = 'investor16:completed_v2';

const LEGACY_KEYS = ['investor16:progress', 'investor16:completed'];

export function clearLegacyStorage(): void {
  try {
    for (const k of LEGACY_KEYS) sessionStorage.removeItem(k);
  } catch {
    /* 保存できない環境では何もしない */
  }
}
