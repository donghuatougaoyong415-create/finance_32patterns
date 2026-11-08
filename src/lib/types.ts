import typesJson from '../data/types.json';

export interface InvestorType {
  code: string;
  animal: string;
  name: string;
  daily: string;
  invest: string;
  strength: string;
  pitfall: string;
  compatible: string;
  /** タイプ解説ページの説明文 */
  about: string;
  /** タイプ解説ページの「付き合い方のヒント」 */
  tips: string[];
}

export const TYPES = typesJson as InvestorType[];

export function getType(code: string): InvestorType | undefined {
  return TYPES.find((t) => t.code === code.toUpperCase());
}

export function imageUrl(code: string, size: 256 | 512): string {
  return `/images/characters/${code.toUpperCase()}-${size}.webp`;
}

/** タイプ解説ページのURL（コードは小文字） */
export function typePageUrl(code: string): string {
  return `/types/${code.toLowerCase()}`;
}
