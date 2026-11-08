# タイプコード変更の指示書（フェーズ2まで実装済みのプロジェクト向け）

Claude Code への指示：「CODE_MIGRATION.md を読んで、タイプコードを新しいものに置き換えて」

## 背景

旧コード（例：LDFC）が既存の別サービスのコードと重なったため、4軸のアルファベットをすべて変える。軸の意味、設問、採点ロジック、キャラ、文章は変えない。変えるのは文字だけ。

INSTRUCTIONS.md は新コードに更新済み。今後はそちらが正。

## 1. 軸の文字

| 軸 | 旧（左／右） | 新（左／右） |
| --- | --- | --- |
| 時間軸 | S 短期／L 長期 | **Q** 短期（Quick）／**P** 長期（Patient） |
| リスク | A 攻め／D 守り | **B** 攻め（Bold）／**G** 守り（Guard） |
| 判断根拠 | N 数字／F 感覚 | **R** 数字（Reason）／**I** 感覚（Intuition） |
| 群れとの距離 | C 逆張り／T 順張り | **A** 逆張り（Against）／**W** 順張り（With） |

文字の対応：S→Q、L→P、A→B、D→G、N→R、F→I、C→A、T→W

注意：`A` は旧コードでは「攻め」、新コードでは「逆張り」で意味が変わる。一括置換を1文字ずつ順番にやると壊れるので、**4文字コード単位で下の対応表を使って置き換える**こと。

## 2. 16タイプの対応表

| 旧コード | 新コード | キャラ | zip内の画像ファイル | 旧URL → 新URL |
| --- | --- | --- | --- | --- |
| SANT | QBRW | 追い風のチーター | SANT_cheetah.png | /types/sant → /types/qbrw |
| SANC | QBRA | 狙い撃ちのハヤブサ | SANC_falcon.png | /types/sanc → /types/qbra |
| SAFT | QBIW | 波乗りのイルカ | SAFT_dolphin.png | /types/saft → /types/qbiw |
| SAFC | QBIA | 嵐を好むサメ | SAFC_shark.png | /types/safc → /types/qbia |
| SDNT | QGRW | 時計じかけのミツバチ | SDNT_bee.png | /types/sdnt → /types/qgrw |
| SDNC | QGRA | 計算高いキツネ | SDNC_fox.png | /types/sdnc → /types/qgra |
| SDFT | QGIW | 見張り番のミーアキャット | SDFT_meerkat.png | /types/sdft → /types/qgiw |
| SDFC | QGIA | 忍び足のネコ | SDFC_cat.png | /types/sdfc → /types/qgia |
| LANT | PBRW | 築城のビーバー | LANT_beaver.png | /types/lant → /types/pbrw |
| LANC | PBRA | 宝探しのカラス | LANC_crow.png | /types/lanc → /types/pbra |
| LAFT | PBIW | 空を夢見るペンギン | LAFT_penguin.png | /types/laft → /types/pbiw |
| LAFC | PBIA | 種まきのリス | LAFC_squirrel.png | /types/lafc → /types/pbia |
| LDNT | PGRW | 大行進のゾウ | LDNT_elephant.png | /types/ldnt → /types/pgrw |
| LDNC | PGRA | 実りのヒツジ | LDNC_sheep.png | /types/ldnc → /types/pgra |
| LDFT | PGIW | コツコツのカメ | LDFT_turtle.png | /types/ldft → /types/pgiw |
| LDFC | PGIA | 冬眠のクマ | LDFC_bear.png | /types/ldfc → /types/pgia |

相性◎のペアは同じ組み合わせのまま、コードだけ新しくなる（例：QBRW ⇔ QGIW）。

## 3. 直すところ

1. **データ**
   - `types.json`：各タイプの `code` と、相性◎の相手コード。
   - `questions.json`：各問の「寄り」の文字（S→Q など）。
2. **採点**：`scoring.ts` の軸の文字の定義。左が Q/B/R/A、右が P/G/I/W。
3. **画像**：`public/images/characters/` のファイル名を新コードに変更（`SANT.png` → `QBRW.png` など）。WebP の縮小版も作り直す。
4. **OGP画像**：16枚を新コードで作り直す（`/og/QBRW.png` など）。画像内にコードを描いているなら、その文字も新しくする。
5. **ページとURL**：`/result/{CODE}`、`/types/{code}`、`/report/{code}` を新コードで生成し、sitemap も更新する。
6. **旧URLのリダイレクト（必須）**：すでにシェアされたリンクが切れないように、旧URLから新URLへ 301 リダイレクトする。
   - `/result/SANT` → `/result/QBRW`（クエリ `?s=` は引き継ぐ）
   - `/types/sant` → `/types/qbrw`
   - `/og/SANT.png` → `/og/QBRW.png`
   - Cloudflare Pages なら `public/_redirects`、Vercel なら `vercel.json` の `redirects` に16タイプ分を書く。大文字・小文字の両方に対応させる。
7. **途中保存のデータ**：`sessionStorage` の保存キーにバージョンを付ける（例：`answers_v2`）。古いキーは読まずに消す。回答そのものは問番号で持っているなら影響はないが、旧コードの結果を保存している場合に備える。
8. **計測**：GA4 の `test_complete` の `type` は新コードで送る。旧コードと混ざらないよう、変更日をメモしておく。
9. **テスト**：`scoring` のテストの期待値を新コードに更新し、すべて通ること。旧→新の16件の対応が正しいことを確かめるテストも1本足す。

## 4. 完了の確認

- [ ] `grep -rnE "\b(SANT|SANC|SAFT|SAFC|SDNT|SDNC|SDFT|SDFC|LANT|LANC|LAFT|LAFC|LDNT|LDNC|LDFT|LDFC)\b" src public` の結果が、リダイレクト設定とこのファイル以外で0件
- [ ] 32問すべて「とてもそう思う」で PGRA、すべて「全くそう思わない」で QBIW になる（どちらも各軸の合計が0になり、★の決め手で決まるため）
- [ ] `/result/SANT` を開くと `/result/QBRW` に転送される
- [ ] `/result/QBRW` を X に貼ると、チーターの OGP 画像が出る
- [ ] テストがすべて通る
- [ ] Lighthouse のモバイル Performance が 90 以上のまま
