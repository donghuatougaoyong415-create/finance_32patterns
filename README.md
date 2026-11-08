# 投資家16タイプ診断

日常の32問に答えると「投資したらどのタイプか」が16タイプで分かる診断サイト。仕様は [INSTRUCTIONS.md](INSTRUCTIONS.md)。

## 使い方

```bash
npm install
npm run dev      # 開発サーバー（http://localhost:4321）
npm test         # ユニットテスト
npm run build    # dist/ に静的サイトを出力
```

- 設問・タイプの文言は `src/data/questions.json` と `src/data/types.json` だけで直せる（タイプ解説ページの説明文 `about` と付き合い方のヒント `tips` も types.json）。
- キャラ画像は `public/images/characters/{CODE}.png`。
- `npm run dev` / `npm run build` の前に、次の画像が自動で作られる（どちらも git には入れない）。
  - 表示用の WebP（512px・256px）：`public/images/characters/{CODE}-{size}.webp`
  - OGP画像（1200×630）：`public/og/{CODE}.png` と `public/og/default.png`。文字は Noto Sans JP を Google Fonts から「使う文字だけ」取得して描くため、ビルド環境からインターネットに出られる必要がある。

## ページ

| URL | 内容 |
| --- | --- |
| `/` | トップ |
| `/test` | 診断（32問・8画面） |
| `/result/{CODE}?s=72-61-58-80` | 結果 |
| `/types` | 16タイプ一覧 |
| `/types/{code}` | タイプ解説（小文字） |
| `/report/{code}` | 有料レポート（準備中・検索除外） |
| `/about` `/privacy` `/tokushoho` | 運営情報（`TODO` を埋めてから公開する） |

## 環境変数

`.env.example` を参照。ホスティング側の環境変数にも同じものを設定する。

| 名前 | 用途 |
| --- | --- |
| `PUBLIC_SITE_URL` | サイトのURL（例：`https://example.jp`）。OGP・シェアURL・サイトマップの絶対URLに使う。**必ず設定する** |
| `PUBLIC_GA_ID` | GA4 の測定ID（`G-XXXX`）。空なら計測しない |
| `PUBLIC_X_URL` | 運営者のXアカウントURL。空ならフォロー導線を出さない |

## GA4 イベント

| イベント | パラメータ | タイミング |
| --- | --- | --- |
| `test_start` | — | 診断ページを開いたとき（続きから再開したときは送らない） |
| `page_view_test_step` | `step`（1〜8） | 各画面を表示したとき |
| `test_complete` | `type` | 診断を終えて結果ページを開いたとき（シェアURLから来た人は数えない） |
| `share_click` | `channel`（x / line / copy） | 結果ページのシェアボタン |
| `affiliate_click` / `report_click` | 任意 | フェーズ3。リンクに `data-track="report_click"` を付けるだけで送られる |

**タイプコードの変更日：2026-11-08。** この日より前の `test_complete` の `type` は旧コード（SANT など）、この日以降は新コード（QBRW など）。集計するときは日付で分けるか、`src/lib/codeMigration.ts` の対応表で旧コードを新コードに読み替える。

## 旧タイプコードからの移行（2026-11-08）

4軸の文字を変えた（S/L→Q/P、A/D→B/G、N/F→R/I、C/T→A/W）。詳細は `CODE_MIGRATION.md`。

- 対応表は `src/lib/codeMigration.ts` の1か所だけ。
- 旧URL（`/result/SANT`、`/types/sant`、`/report/sant`、`/og/SANT.png`。大文字・小文字とも）は新URLへ 301 で転送する。
  - Cloudflare Pages：`public/_redirects`
  - Vercel：`vercel.json` の `redirects`
  - どちらも `node scripts/build-redirects.mjs` で生成する（手で直さない）。
- 途中保存のキーは `investor16:progress_v2` / `investor16:completed_v2`。旧キーは読まずに消す。

## デプロイ

### Cloudflare Pages

1. Cloudflare ダッシュボード → Workers & Pages → 作成 → Pages → Git に接続し、このリポジトリを選ぶ。
2. ビルド設定
   - フレームワーク：Astro
   - ビルドコマンド：`npm run build`
   - 出力ディレクトリ：`dist`
3. 環境変数に `PUBLIC_SITE_URL`（本番のURL）と、必要なら `PUBLIC_GA_ID` `PUBLIC_X_URL` を入れる。
4. Node のバージョンは `.node-version`（22）が使われる。キャッシュ設定は `public/_headers`。

### Vercel（代わりに使う場合）

リポジトリをインポートするだけで `vercel.json` の設定（ビルドコマンド・出力先・末尾スラッシュなしのURL）が使われる。環境変数は Cloudflare と同じ。

### 公開後の確認

- X の投稿画面に `/result/QBRW` のURLを貼り、キャラのOGP画像が出るか確かめる。
- `/result/SANT?s=72-61-58-80` を開き、`/result/QBRW?s=72-61-58-80` に転送されるか確かめる。
- Lighthouse（モバイル）：開発環境の計測では全ページ Performance 99〜100。

## 進捗

- [x] フェーズ1：Astro＋Tailwind、データJSON、`scoring.ts`＋テスト、`/test`、`/result/{CODE}`、キャラ画像の配置
- [x] フェーズ2：トップ、タイプ解説・一覧、OGP画像、GA4、運営情報ページ（プレースホルダー）、デプロイ設定
- [x] タイプコードを新コード（QBRW など）に移行し、旧URLを転送
- [ ] フェーズ3：有料レポート・アフィリエイト・広告枠
