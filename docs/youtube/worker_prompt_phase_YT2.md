# プロジェクト: 9coma (私を構成する9つのマンガ) - YouTube版 (YouTube 9coma)
## Phase YT-2: データ保存APIとシェア個別ページ（/yt/list/[id]）の構築

あなたは「別AI（作業ワーカー）」として、監督AI（Antigravity）およびオーナーからの指示に基づき、このタスクを完遂してください。

### 【絶対順守事項：文脈保護ルール】
1. **マンガ版との完全分断**:
   既存のディレクトリ `src/app/(manga)` や `src/app/api/list` には **いかなる理由があっても絶対に触れてはならない。** あなたの実装はすべて `src/app/yt` または `src/app/api/yt`、および `src/components/youtube` 内で完結させること。
2. **Firestore コレクションの独立**:
   保存先は既存の `lists` ではなく **必ず `yt_lists` という新しいコレクション名** を使用すること。

---

### 【今回実装する各機能（順番通りに実行し、各ステップごとに確認をとること）】

#### ⚠️進捗報告ルール
以下の各ステップが完了するごとに、必ず一旦処理を停止し、「Step X が完了しました」と監督に報告してください。一気に全ステップを実行しないでください。

---

#### Step 4: 保存用 APIルート (`src/app/api/yt/list/route.ts`) の作成
1. `src/app/api/yt/list` ディレクトリを作成し、POST用の `route.ts` を実装する。
2. POSTリクエストで受け取るペイロードは以下の通り。
    - `slots`: `YouTubeSlot | null` の配列（要素数9）
    - `authorName`: 作成者名（未指定時は「私」）
    - `theme`: 任意のテーマ文字列（未指定可能）
    - `colorThemeId`: テーマカラーのID（現在のUIは未実装だが、後で使うため保存だけする。デフォルト '01'）
    - `createdAt`: `serverTimestamp()` で記録
3. Firestore の `yt_lists` コレクションに対し `addDoc` またはユニーク文字列を含んだIDで `setDoc`（例：`short-uuid`や nanoidを利用）で保存する。
4. レスポンスとして、生成されたドキュメントの `id` を JSON で返す。
5. （省略可能）もし時間があれば GET メソッドも実装し、ID パラメータで `yt_lists` から1件取得できるようにする。

---

#### Step 5: トップページ (`src/app/yt/page.tsx`) への「シェア（保存）」ボタン設置
1. `src/app/yt/page.tsx` を編集し、9マスのグリッドがすべて埋まった時（`slots.filter(s => s !== null).length === 9` の時）にのみ押せる「シェアする」ボタンを実装する。
2. クライアント側（ブラウザ側）の状態として `authorName` と `theme` の入力欄（input）を作成する。
3. シェアボタンを押下した際、作成した `POST /api/yt/list` を叩き、レスポンスとして帰ってきた `id` を用いて、`router.push('/yt/list/' + id)` へ画面遷移させる処理を書く。

---

#### Step 6: シェア用個別閲覧ページ (`src/app/yt/list/[id]/page.tsx`) の作成
1. シェアされた相手が見るためのリードオンリー（編集不可）ページ `src/app/yt/list/[id]/page.tsx` を作成する。
2. このページは `generateStaticParams` ではなく、ISR (`revalidate = 3600;`) や動的レンダリングとして設定し、サーバー側で Firestore の `yt_lists` コレクションからデータを取得（`getDoc`）する。
3. 取得した `slots` を元に、`YtGrid.tsx` や `YtGridSlot.tsx` を再利用して表示する。（※このページでのドラッグ・ドロップや削除ボタンなどの編集機能は完全に無効化すること。プロップスとして渡し方を調整する）。
4. （デザインの美観）既存の `YtGridSlot.tsx` に設定された美しいシャドウやフラットデザインは決して壊さずに、そのまま表示させること。

以上の Step 4, 5, 6 を順に実行してください。まずは Step 4「保存用APIの作成」から着手し、完了したら報告してください。
