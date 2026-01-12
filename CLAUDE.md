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
