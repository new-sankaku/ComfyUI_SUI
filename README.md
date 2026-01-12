# ComfyUI UI プロジェクト

ComfyUIと連携して画像生成を行うWebベースのUIアプリケーションです。

---

## ファイル依存関係

```
index.html
├── CSS（読み込み順）
│   ├── css_comfyui-variables.css      ... 全CSSが参照するCSS変数
│   ├── css_comfyui-layout.css         ... 全体レイアウト
│   ├── css_comfyui-components.css     ... フォーム・ボタン等
│   ├── css_comfyui-modal.css          ... モーダル
│   └── css_comfyui-workflow-editor.css ... ワークフローエディタ
│
├── 外部ライブラリ
│   ├── localforage              ... ブラウザストレージ
│   ├── interact.js              ... ドラッグ&リサイズ
│   └── masonry                  ... グリッドレイアウト
│
└── JavaScript（読み込み順・依存順）
    ├── js_simple_core.js              ... 基盤（$関数、ComfyUIEndpoints、WebSocket）
    │   └─ 他の全JSファイルが依存
    │
    ├── js_comfyui-workflow-builder.js ... ワークフロー構築
    │   └─ js_comfyui-util.js、js_simple_generator.jsが使用
    │
    ├── js_comfyui-util.js             ... ComfyUIユーティリティv1
    │   └─ js_comfyui-management.jsが使用
    │
    ├── js_simple_settings-storage.js  ... 設定永続化
    │   └─ js_simple_app-init.jsが使用
    │
    ├── js_simple_prompt-util.js       ... プロンプト処理
    │   └─ js_simple_generator.js、js_simple_app-init.jsが使用
    │
    ├── js_simple_connection.js        ... 接続状態管理
    │   └─ js_simple_app-init.jsが使用
    │
    ├── js_simple_metadata-marker.js   ... メタデータ埋め込み
    │   └─ js_simple_image-display.jsが使用
    │
    ├── js_simple_image-display.js     ... 画像表示
    │   └─ js_simple_generator.jsが使用
    │
    ├── js_simple_generator.js         ... 画像生成メイン
    │   └─ js_simple_app-init.jsがイベント登録
    │
    ├── js_comfyui-object-info-repository.js ... ObjectInfo永続化
    │   ├─ js_comfyui-util-v2.jsが使用
    │   └─ js_comfyui-workflow-editor.jsが使用
    │
    ├── js_comfyui-workflow-repository.js    ... ワークフロー永続化
    │   ├─ js_simple_generator.jsが使用
    │   ├─ js_simple_ui-controller.jsが使用
    │   └─ js_comfyui-workflow-editor.jsが使用
    │
    ├── js_comfyui-workflow-editor.js        ... エディタ本体
    │   └─ js_comfyui-workflow-editor-tab.jsを管理
    │
    ├── js_comfyui-util-v2.js                ... ComfyUIユーティリティv2
    │   ├─ js_comfyui-workflow-editor.jsが使用
    │   ├─ js_comfyui-workflow-editor-tab.jsが使用
    │   └─ js_simple_generator.jsが使用
    │
    ├── js_comfyui-workflow-editor-tab.js    ... タブUI
    │   └─ js_comfyui-workflow-editor.jsが生成・管理
    │
    ├── js_comfyui-workflow-interact.js      ... ウィンドウ制御
    │   └─ js_simple_ui-controller.jsが使用
    │
    ├── js_simple_ui-controller.js           ... UI制御
    │   └─ js_simple_app-init.jsが使用
    │
    ├── js_comfyui-management.js             ... ComfyUI管理v1
    │   └─ 旧バージョン、一部機能で使用
    │
    └── js_simple_app-init.js                ... 初期化（エントリーポイント）
        └─ DOMContentLoadedで全体を起動
```

---

## 主要クラス・関数一覧

### クラス

| クラス名 | ファイル | 説明 |
|---------|---------|------|
| ComfyUIEndpoints | js_simple_core.js | ComfyUI APIエンドポイントURL生成。Proxyパターンでプロパティアクセス時に動的生成 |
| ComfyUIWorkflowBuilder | js_comfyui-workflow-builder.js | ワークフローJSON編集。ビルダーパターンでノード値更新、プレースホルダー置換 |
| ComfyUIWorkflowEditor | js_comfyui-workflow-editor.js | ワークフローエディタ本体。タブ管理、ObjectInfo管理、デフォルトワークフロー登録 |
| ComfyUIWorkflowTab | js_comfyui-workflow-editor-tab.js | 個別ワークフロータブ。ノードUI描画、入力値管理、保存、Masonryレイアウト |
| ComfyUIWorkflowWindow | js_comfyui-workflow-interact.js | ワークフローエディタウィンドウ。モーダル生成、ドラッグ/リサイズ、テスト生成 |

### リポジトリ（シングルトンオブジェクト）

| オブジェクト名 | ファイル | 説明 |
|--------------|---------|------|
| objectInfoRepository | js_comfyui-object-info-repository.js | ComfyUIノード定義情報の永続化。saveObjectInfo/getObjectInfo |
| comfyUIWorkflowRepository | js_comfyui-workflow-repository.js | ユーザーワークフローCRUD。saveWorkflow/getWorkflow/getAllWorkflows/deleteWorkflow |
| settingsStore | js_simple_settings-storage.js | フォーム設定値の永続化 |

### 主要関数

| 関数名 | ファイル | 説明 |
|-------|---------|------|
| $() | js_simple_core.js | document.getElementByIdの短縮形 |
| Comfyui_connect() | js_simple_core.js | WebSocket接続開始 |
| generateImage() | js_simple_generator.js | 通常生成実行 |
| generateImageLoopExec() | js_simple_generator.js | ループ生成実行 |
| generateImageWildcardExec() | js_simple_generator.js | ワイルドカード生成実行 |
| executeWorkflow() | js_simple_generator.js | ワークフロー実行・完了待機 |
| Comfyui_replace_placeholders() | js_comfyui-util.js | ワークフローにプロンプト・シード等を埋め込み |
| comfyui_fixWorkflowTypes_v2() | js_comfyui-util-v2.js | ObjectInfo基準で入力値の型を修正 |
| comfyui_put_queue_v2() | js_comfyui-util-v2.js | キュー投入・完了待機・画像取得 |
| comfyui_uploadImage_v2() | js_comfyui-util-v2.js | 画像アップロード |
| displayGeneratedImage() | js_simple_image-display.js | 生成画像をUIに表示 |
| applyMetadataMarker() | js_simple_metadata-marker.js | 画像にプロンプト情報をオーバーレイ描画 |
| expandWildcards() | js_simple_prompt-util.js | ワイルドカード記法を展開 |
| adjustPromptWeight() | js_simple_prompt-util.js | プロンプト重み調整（Ctrl+矢印） |
| saveFormSettings() | js_simple_settings-storage.js | フォーム設定保存 |
| loadFormSettings() | js_simple_settings-storage.js | フォーム設定読込 |
| switchMode() | js_simple_ui-controller.js | 生成モード切替 |
| openWorkflowEditor() | js_simple_ui-controller.js | ワークフローエディタ起動 |
| checkComfyUIConnection() | js_simple_connection.js | 接続状態確認・UI更新 |
| createWorkflowBuilder() | js_comfyui-workflow-builder.js | ComfyUIWorkflowBuilderインスタンス生成 |

---

## 処理フロー

### 1. アプリケーション起動フロー

```
DOMContentLoaded (js_simple_app-init.js)
    │
    ├─ loadFormSettings()           ... 保存済み設定復元
    ├─ setupAutoSave()              ... 自動保存イベント登録
    ├─ イベントリスナー登録          ... ボタン、入力欄等
    ├─ hookWorkflowRepository()     ... ワークフロー保存時フック
    ├─ setupPromptWeightAdjustment() ... Ctrl+矢印キー登録
    ├─ checkComfyUIConnection()     ... 初回接続確認
    ├─ setInterval(checkComfyUIConnection, 5000) ... 定期確認
    ├─ Comfyui_connect()            ... WebSocket接続
    └─ updateWorkflowDisplays()     ... ワークフロー名表示
```

### 2. 通常画像生成フロー

```
btnGenerateNormal クリック
    │
    ▼
generateImageNormal() (js_simple_generator.js)
    │
    ▼
generateImage(count)
    │
    ├─ comfyUIWorkflowRepository.getEnabledWorkflowByType("T2I")
    │       ... 有効なT2Iワークフロー取得
    │
    ├─ ループ開始 (count回)
    │   │
    │   ├─ Comfyui_replace_placeholders(workflow, requestData)
    │   │       ... プロンプト、シード、サイズを埋め込み
    │   │
    │   ├─ executeWorkflow(workflow)
    │   │   │
    │   │   ├─ comfyui_fixWorkflowTypes_v2()
    │   │   │       ... 型修正
    │   │   │
    │   │   ├─ fetch(comfyUIUrls.prompt) POST
    │   │   │       ... ComfyUIにキュー投入
    │   │   │
    │   │   ├─ waitForCompletion(promptId)
    │   │   │       ... 完了ポーリング
    │   │   │
    │   │   ├─ fetch(comfyUIUrls.history + promptId)
    │   │   │       ... 結果取得
    │   │   │
    │   │   └─ getImageUrl(imageOutput)
    │   │           ... 画像URL生成
    │   │
    │   └─ displayGeneratedImage(result.image)
    │       │
    │       ├─ (metadataEnabled時) applyMetadataMarker()
    │       │       ... プロンプト情報オーバーレイ
    │       │
    │       └─ DOMに画像要素追加
    │
    └─ ループ終了
```

### 3. ワークフローエディタ起動フロー

```
btnOpenWorkflow クリック
    │
    ▼
openWorkflowEditor() (js_simple_ui-controller.js)
    │
    ├─ new ComfyUIWorkflowWindow()
    │       ... ウィンドウ生成
    │
    ├─ comfyUIWorkflowWindow.show()
    │       ... 表示
    │
    └─ (初回のみ)
        ├─ new ComfyUIWorkflowEditor()
        │
        ├─ comfyUIWorkflowEditor.initialize()
        │   │
        │   ├─ objectInfoRepository.getObjectInfo()
        │   │       ... 保存済みノード情報取得
        │   │
        │   ├─ addDefaultWorkflows()
        │   │       ... デフォルトワークフロー登録
        │   │
        │   ├─ comfyUIWorkflowRepository.getAllWorkflows()
        │   │       ... 全ワークフロー取得
        │   │
        │   ├─ 各ワークフローに対してcreateTab()
        │   │   │
        │   │   └─ new ComfyUIWorkflowTab()
        │   │           ... タブ生成、ノードUI描画
        │   │
        │   └─ renderTabs()
        │           ... タブリスト描画
        │
        └─ comfyui_monitorConnection_v2()
                ... 接続監視開始、オンライン時ObjectInfo更新
```

### 4. ワークフロー保存フロー

```
Saveボタン クリック (タブ内)
    │
    ▼
ComfyUIWorkflowTab.saveWorkflow()
    │
    ├─ comfyUIWorkflowRepository.saveWorkflow(type, id, name, workflow, enabled)
    │   │
    │   ├─ (enabled時) disableWorkflowsByType(type)
    │   │       ... 同タイプの他ワークフローを無効化
    │   │
    │   └─ store.setItem(id, workflowData)
    │           ... localforageに保存
    │
    └─ clearUnsavedState()
            ... 未保存マーク解除
```

---

## ファイル別詳細

### HTML

| ファイル名 | 説明 |
|-----------|------|
| index.html | メインHTML。レイアウト定義、UI要素配置、ライブラリ読み込み、JS読み込み順序管理 |

### CSS

| ファイル名 | 説明 |
|-----------|------|
| css_comfyui-variables.css | CSS変数定義。カラー、フォントサイズ等のデザイントークン |
| css_comfyui-layout.css | Flexbox/Gridレイアウト。サイドバー、センター、タブ |
| css_comfyui-components.css | フォーム、ボタン、ステータス表示、インジケーター |
| css_comfyui-modal.css | モーダル表示、画像ズーム |
| css_comfyui-workflow-editor.css | ノードカード、タブリスト、未保存状態表示 |

### JavaScript

| ファイル名 | 説明 |
|-----------|------|
| js_simple_core.js | 基盤。$関数、ComfyUIEndpointsクラス、WebSocket管理、グローバル変数 |
| js_simple_app-init.js | 初期化。イベント登録、getText関数、起動処理 |
| js_comfyui-management.js | ComfyUI管理v1。API呼び出し、モデル情報取得。fabric.js依存 |
| js_comfyui-util.js | ユーティリティv1。エラー判定、プレースホルダー置換、ノードチェック |
| js_comfyui-util-v2.js | ユーティリティv2。型修正、キュー実行、画像アップロード、接続監視 |
| js_comfyui-object-info-repository.js | ObjectInfo永続化。ノード定義情報の保存・取得 |
| js_comfyui-workflow-repository.js | ワークフロー永続化。CRUD、タイプ別管理 |
| js_comfyui-workflow-builder.js | ワークフロー構築。ビルダーパターンでJSON編集 |
| js_comfyui-workflow-editor.js | エディタ本体。タブ管理、ObjectInfo管理 |
| js_comfyui-workflow-editor-tab.js | タブUI。ノード描画、入力管理、Masonry |
| js_comfyui-workflow-interact.js | ウィンドウ制御。ドラッグ/リサイズ、テスト生成 |
| js_simple_generator.js | 生成処理。通常/ループ/ワイルドカード、実行・待機 |
| js_simple_image-display.js | 画像表示。サムネイル、モーダル、ズーム、ダウンロード |
| js_simple_metadata-marker.js | メタデータ埋め込み。オーバーレイ描画、PNG/WebPチャンク操作 |
| js_simple_ui-controller.js | UI制御。モード切替、タブ切替、エディタ起動 |
| js_simple_connection.js | 接続管理。状態確認、UI更新 |
| js_simple_settings-storage.js | 設定永続化。フォーム保存・読込・自動保存 |
| js_simple_prompt-util.js | プロンプト処理。ワイルドカード展開、重み調整 |

---

## 機能追加ガイド

| 追加したい機能 | 編集ファイル | 関連関数・クラス |
|---------------|-------------|-----------------|
| 新しい生成モード | js_simple_generator.js, js_simple_ui-controller.js, index.html | generateImage系関数、switchMode |
| 新しいUI要素 | index.html, css_comfyui-components.css, js_simple_app-init.js | イベントリスナー登録 |
| ComfyUI API呼び出し追加 | js_comfyui-util-v2.js | comfyUIUrls参照 |
| ワークフロー処理変更 | js_comfyui-workflow-builder.js | ComfyUIWorkflowBuilder |
| 設定項目追加 | js_simple_settings-storage.js, index.html | saveFormSettings, loadFormSettings |
| 画像後処理追加 | js_simple_metadata-marker.js | applyMetadataMarker |
| ワークフローエディタ機能 | js_comfyui-workflow-editor.js, js_comfyui-workflow-editor-tab.js | ComfyUIWorkflowEditor, ComfyUIWorkflowTab |
| 新しいワークフロータイプ | js_comfyui-workflow-editor-tab.js | comfyuiTypes配列 |
| 永続化データ追加 | 新規または既存リポジトリ | localforageインスタンス |
