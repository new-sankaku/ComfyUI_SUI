# Project Rules

## Internationalization (i18n)

### Translation Requirement
All user-facing text (toast messages, UI labels, error messages, etc.) must use the `I18nManager.t()` function for translation support.

**Do:**
```javascript
createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.enterPositivePrompt'));
```

**Don't:**
```javascript
createToastError('入力エラー', 'ポジティブプロンプトを入力してください');
```

### Adding New Translations
When adding new user-facing text:
1. Add translation keys to `js/i18n/sui-i18n.js` for all supported languages (ja, en, zh)
2. Use the `I18nManager.t('category.key')` function to retrieve translated text

### No Hardcoded Japanese in JavaScript
JavaScript files must NOT contain hardcoded Japanese strings. All user-facing text must go through i18n.

**Exceptions:** `console.log()` and `console.error()` messages are developer-facing and do not require i18n.

**Do:**
```javascript
$('generationStatus').textContent = I18nManager.t('status.generating');
wildcardToast(I18nManager.t('toast.wildcardSaved'), 'success');
if (!confirm(I18nManager.t('confirm.deleteAllWildcards'))) return;
```

**Don't:**
```javascript
$('generationStatus').textContent = '生成中...';
wildcardToast('保存しました', 'success');
if (!confirm('全てのワイルドカードを削除しますか？')) return;
```

### Translation File Structure
Translations are organized in `js/i18n/sui-i18n.js` with the following categories:
- `menu` - Menu items
- `modes` - Generation modes
- `config` - Configuration labels
- `tabs` - Tab labels
- `basic` - Basic settings
- `advanced` - Advanced settings
- `wildcard` - Wildcard management
- `sidebar` - Sidebar elements
- `common` - Common UI elements
- `language` - Language selector
- `toast` - Toast notifications and error messages
- `status` - Generation status messages
- `confirm` - Confirmation dialog messages
- `workflowEditor` - Workflow editor window messages
- `errorGuide` - Error guide dialog messages

## Code Reuse (DRY)

### No Duplicate Logic
同じ処理を複数箇所に書かない。共通処理は必ず既存の共通関数を使うこと。新規に同等の処理を別の場所に作ってはいけない。

### ComfyUI Workflow Execution
ComfyUIへのワークフロー実行（キュー投入→完了待ち→履歴取得→エラーチェック）は `comfyui-util-v2.js` の共通関数を使うこと。

```
comfyui_execute_and_wait_v2(workflow)  ← 実行基盤（comfyui-util-v2.js）
  ├─ ComfyUIWorkflowBuilder + replaceDatePlaceholders
  ├─ comfyui_fixWorkflowTypes_v2
  ├─ comfyui_queue_prompt_v2 (POST /prompt)
  ├─ comfyui_track_prompt_progress_v2 (WebSocket完了待ち)
  ├─ comfyui_get_history_v2
  └─ comfyui_isError_v2 + comfyui_getErrorMessage_v2
  → { error, promptId, outputs } を返す

comfyui_put_queue_v2(workflow)  ← 画像生成用ラッパー（comfyui-util-v2.js）
  └─ comfyui_execute_and_wait_v2 + comfyui_get_image_v2

executeWorkflow(workflow)  ← 通常画面の画像生成（generator.js）
  └─ comfyui_put_queue_v2

executeWorkflowAudio(workflow)  ← 通常画面の音声生成（generator.js）
  └─ comfyui_execute_and_wait_v2 + 音声出力抽出
```

- generator.js等の呼び出し側で独自のポーリングやAPI呼び出しを実装してはいけない
