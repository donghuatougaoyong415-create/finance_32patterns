# 投資家16タイプ診断

日常の32問に答えると「投資したらどのタイプか」が16タイプで分かる診断サイト。仕様は [INSTRUCTIONS.md](INSTRUCTIONS.md)。

## 使い方

```bash
npm install
npm run dev      # 開発サーバー（http://localhost:4321）
npm test         # 採点ロジックのユニットテスト
npm run build    # dist/ に静的サイトを出力
```

- 設問・タイプの文言は `src/data/questions.json` と `src/data/types.json` だけで直せる。
- キャラ画像は `public/images/characters/{CODE}.png`。表示用の WebP（512px・256px）は `npm run dev` / `npm run build` の前に自動生成される（git には入れない）。
- 環境変数は `.env.example` を参照。

## 進捗

- [x] フェーズ1：Astro＋Tailwind、データJSON、`scoring.ts`＋テスト、`/test`、`/result/{CODE}`、キャラ画像の配置
- [ ] フェーズ2：トップ、タイプ解説・一覧、OGP画像、GA4、運営情報ページ、デプロイ設定
- [ ] フェーズ3：有料レポート・アフィリエイト・広告枠
