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
}

export const TYPES = typesJson as InvestorType[];

export function getType(code: string): InvestorType | undefined {
  return TYPES.find((t) => t.code === code.toUpperCase());
}

export function imageUrl(code: string, size: 256 | 512): string {
  return `/images/characters/${code.toUpperCase()}-${size}.webp`;
}

/** タイプ解説ページのURL。TODO（フェーズ2）：/types/{code} ができたら差し替える */
export function typePageUrl(code: string): string {
  return `/result/${code.toUpperCase()}`;
}
