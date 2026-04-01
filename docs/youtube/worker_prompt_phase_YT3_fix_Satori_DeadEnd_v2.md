# プロジェクト: 9coma - YouTube版
## Phase YT-3 追加修正指示書: Satori C++レイアウトエンジン（Segfault）クラッシュの完全解消

作業ワーカーへ。先ほどの対応で `onClick` エラーや基本のSatori禁忌は解消されましたが、まだOGP画像の生成時にNext.jsのローカルサーバーごと落ちる（Exit 52: Empty reply from server: Node.js Segfault）現象が残っています。

監督（Antigravity）およびオーナーの厳密な監査の結果、**マンガ版のOGPでは一切起きない「2つの致命的なSatori仕様違反」**があなたのコードに新たに混入していることが特定されました。
直ちに以下の修正を実行してください。

---

### 【絶対順守：クラッシュを引き起こす2つのロジックの修正】
ファイル: `src/app/yt/list/[id]/opengraph-image.tsx`

#### 1. `<img />`タグへの直接の `borderRadius` 指定の禁止
現在のコードでは、チャンネルアイコン（丸い画像）を描画するにあたり、`<img style={{ borderRadius: 60 }} />` と直接指定していますが、**Satori では `<img>` に対する `borderRadius` はサポートされておらず、描画パイプラインで即死します。**
*   **修正内容**:
    画像を `borderRadius` および `overflow: 'hidden'` を持つ `div` でラップ（包装）し、親の `div` に角丸の役割を担わせてください。
    ```tsx
    // 悪い例（クラッシュ）
    <img src={imageUrl} style={{ width: '120px', height: '120px', borderRadius: 60 }} />

    // 良い例（マンガ版と同じ安全な構造）
    <div style={{
      width: '120px', height: '120px',
      borderRadius: 60, overflow: 'hidden', display: 'flex'
    }}>
      <img src={imageUrl} style={{ width: '100%', height: '100%' }} />
    </div>
    ```

#### 2. CSSの「幅・高さ」における無限小数の禁止（整数の厳守）
現在のコードはキャンバス幅から `gap` を引いたものを 単純に `3` で割り、小数を出力しています。
（例: `1200 - 16 = 1184` -> `1184 / 3 = 394.66666px`）
Yogaレイアウトエンジンは、JSXのstyle内のpx指定においてこのような**無限循環の浮動小数を受け取るとAST解析に失敗しプロセスがフリーズ・クラッシュ**します。
*   **修正内容**:
    Satoriに渡すピクセル数値を計算する変数は、必ず `Math.floor()` で切り捨てて「完全な整数」にしてください。
    ```tsx
    // 悪い例（クラッシュ）
    const itemWidth = (size.width - gap * 2) / 3;

    // 良い例（安全な整数）
    const itemWidth = Math.floor((size.width - gap * 2) / 3);
    const itemHeight = Math.floor((size.height - gap * 2) / 3);
    ```

以上の2点を修正の上、完了したら報告してください。これが解決すればYT-3の作業は全て完遂となります。
