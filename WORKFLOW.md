# Workflow System

ComfyUI SUIのワークフローシステムの仕組みを説明します。

---

## 概要

ComfyUI SUIは、ComfyUIのAPI形式JSONワークフローに**プレースホルダー**を埋め込むことで、UIからの入力値を動的に反映させています。

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  ユーザー入力    │ ──→ │  プレースホルダー置換  │ ──→ │  ComfyUI    │
│  (prompt, size) │     │  (WorkflowBuilder)    │     │  API実行    │
└─────────────────┘     └──────────────────────┘     └─────────────┘
```

---

## プレースホルダー一覧

### テキスト置換

ワークフロー内の文字列を**完全一致**で置換します。

| プレースホルダー | 置換内容 | 使用例 |
|-----------------|---------|--------|
| `%prompt%` | ポジティブプロンプト | CLIPTextEncodeのtext |
| `%negative%` | ネガティブプロンプト | CLIPTextEncodeのtext |
| `%AnglePrompt%` | アングルプロンプト（I2I Angle用） | 角度変更指示 |

**ワークフロー例:**
```json
{
  "6": {
    "inputs": {
      "text": "%prompt%",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": { "title": "CLIP Text Encode (Positive)" }
  },
  "7": {
    "inputs": {
      "text": "%negative%",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": { "title": "CLIP Text Encode (Negative)" }
  }
}
```

### 入力名マッチング

ワークフロー内の**入力名（キー名）が一致**するノードを自動検出して値を更新します。

| 入力名 | 置換内容 | 対象ノード例 |
|--------|---------|-------------|
| `seed` | シード値 | KSampler |
| `noise_seed` | ノイズシード | KSamplerAdvanced, RandomNoise |
| `width` | 画像幅 | EmptyLatentImage, EmptySD3LatentImage |
| `height` | 画像高さ | EmptyLatentImage, EmptySD3LatentImage |
| `image` | 入力画像ファイル名（I2I用） | LoadImage |

**特殊動作:**
- `seed` / `noise_seed` が `0` または `-1` の場合、**ランダム値**が自動生成されます

**ワークフロー例:**
```json
{
  "3": {
    "inputs": {
      "seed": 0,
      "steps": 20,
      "cfg": 7,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1
    },
    "class_type": "KSampler"
  },
  "5": {
    "inputs": {
      "width": 1024,
      "height": 1024,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage"
  }
}
```

### 日付プレースホルダー

ファイル名などに日時を動的に埋め込めます。

| 形式 | 説明 | 例 |
|------|------|-----|
| `%date:yyyy-MM-dd%` | 年-月-日 | 2025-01-12 |
| `%date:yyyyMMdd_HHmmss%` | 年月日_時分秒 | 20250112_143052 |
| `%date:yyyyMMdd_HHmmss_SSS%` | ミリ秒含む | 20250112_143052_123 |

**フォーマット記号:**
| 記号 | 意味 |
|------|------|
| `yyyy` | 4桁年 |
| `yy` | 2桁年 |
| `MM` | 月（2桁） |
| `dd` | 日（2桁） |
| `HH` | 時（24時間） |
| `mm` | 分 |
| `ss` | 秒 |
| `SSS` | ミリ秒 |

**ワークフロー例:**
```json
{
  "9": {
    "inputs": {
      "filename_prefix": "%date:yyyy-MM-dd%/ComfyUI_%date:yyyyMMdd_HHmmss_SSS%",
      "images": ["8", 0]
    },
    "class_type": "SaveImage"
  }
}
```

---

## 処理フロー

```
comfyuiReplacePlaceholders(workflow, requestData, Type)
    │
    ├─ createWorkflowBuilder(workflow)
    │       ... ワークフローのディープコピー作成
    │
    ├─ updateNodesByInputName({seed, noise_seed, width, height})
    │       ... 入力名でノードを検索・値を更新
    │
    ├─ (I2I/Rembg/Upscaler時)
    │   └─ updateNodesByInputName({image: uploadFileName})
    │           ... LoadImageノードに画像ファイル名を設定
    │
    ├─ updateValueByTargetValue("%prompt%", prompt)
    │       ... 全ノードの文字列を検索・置換
    │
    ├─ updateValueByTargetValue("%negative%", negative_prompt)
    │
    ├─ (Angle時)
    │   └─ updateValueByTargetValue("%AnglePrompt%", anglePrompt)
    │
    ├─ replaceDatePlaceholders()
    │       ... %date:format%を現在日時で置換
    │
    └─ build()
            ... 置換済みワークフローを返却
```

---

## ワークフロータイプ

ワークフローエディタで選択できるタイプは4種類です。

| タイプ | 説明 | 必須プレースホルダー |
|--------|------|---------------------|
| **T2I** | Text-to-Image | `%prompt%`, `%negative%` |
| **I2I** | Image-to-Image | `%prompt%`, `%negative%`, `image`入力 |
| **REMBG** | 背景除去 | `image`入力 |
| **Upscaler** | アップスケール | `image`入力 |

---

## 生成モードとワークフローの関係

UIの生成モードとワークフロータイプの対応:

| 生成モード | 使用ワークフロータイプ | 備考 |
|-----------|---------------------|------|
| T2I | T2I | 通常のテキストから画像生成 |
| T2I Loop | T2I | プロンプトリストで連続生成 |
| I2I | I2I | 画像を入力として生成 |
| I2I Loop | I2I | 画像×プロンプトリストで連続生成 |
| **I2I Angle** | **I2I** | `%AnglePrompt%`を使用するI2Iワークフローが必要 |

### I2I Angleモードについて

I2I Angleモードは特別なワークフロータイプではなく、**I2Iワークフロー**を使用します。

ただし、ワークフロー内に `%AnglePrompt%` プレースホルダーが必要です。
デフォルトの `ImageEdit_MultiAngle.json` がこれに対応しています。

```json
// ImageEdit_MultiAngle.json の一部
"112": {
  "inputs": {
    "prompt": "%AnglePrompt%",  // ← ここにアングル指示が入る
    "clip": ["93", 0],
    "vae": ["95", 0],
    "image1": ["107", 0]
  },
  "class_type": "TextEncodeQwenImageEditPlus"
}
```

---

## カスタムワークフローの作り方

### 1. ComfyUIでワークフローを作成

通常通りComfyUIでワークフローを構築します。

### 2. API形式でエクスポート

ComfyUIの設定で「Enable Dev mode」を有効にし、「Save (API Format)」でエクスポートします。

### 3. プレースホルダーを埋め込む

エクスポートしたJSONを編集し、動的に変更したい値をプレースホルダーに置き換えます。

**編集例:**
```json
// Before
"text": "masterpiece, best quality, 1girl"

// After
"text": "%prompt%"
```

### 4. SUIに登録

1. サイドバーの「ComfyUI Workflows」をクリック
2. 「ワークフロー追加」でJSONをペースト
3. タイプを選択（T2I/I2I等）
4. 保存して有効化

---

## 実装詳細

### ComfyUIWorkflowBuilder クラス

ワークフローの値を置換するビルダークラスです。

```javascript
const builder = createWorkflowBuilder(workflow);

builder
  .updateNodesByInputName({ seed: 12345, width: 1024, height: 1024 })
  .updateValueByTargetValue("%prompt%", "1girl, masterpiece")
  .updateValueByTargetValue("%negative%", "bad quality")
  .replaceDatePlaceholders();

const newWorkflow = builder.build();
```

**メソッド:**

| メソッド | 説明 |
|---------|------|
| `updateNodesByInputName(inputs)` | 入力名が一致するノードの値を更新 |
| `updateNodesByType(classType, inputs)` | クラスタイプが一致するノードの値を更新 |
| `updateValueByTargetValue(target, value)` | 文字列を検索して置換 |
| `replaceDatePlaceholders()` | 日付プレースホルダーを置換 |
| `build()` | 置換済みワークフローを返却 |

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `js/ai/ComfyUI/v2/comfyui-workflow-builder.js` | WorkflowBuilderクラス |
| `js/ai/ComfyUI/v2/comfyui-util.js` | `comfyuiReplacePlaceholders()`関数 |
| `js/ai/ComfyUI/v2/comfyui_workflow/*.js` | デフォルトワークフロー定義 |
