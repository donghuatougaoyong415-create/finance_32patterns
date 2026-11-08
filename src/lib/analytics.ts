// GA4 のイベント送信。PUBLIC_GA_ID が未設定なら gtag が無いので何もしない。
type Params = Record<string, string | number>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: string, params: Params = {}): void {
  window.gtag?.('event', name, params);
}

/**
 * data-track="イベント名" の要素がクリックされたら送る。
 * data-track-* の属性はパラメータになる（例：data-track-channel="x" → channel: 'x'）。
 */
export function bindTrackedClicks(root: ParentNode = document): void {
  root.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
    if (!el) return;
    const params: Params = {};
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.startsWith('track') && k !== 'track' && v !== undefined) {
        params[k.slice(5).replace(/^./, (c) => c.toLowerCase())] = v;
      }
    }
    track(el.dataset.track!, params);
  });
}
