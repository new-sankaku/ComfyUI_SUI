// Upscaler model selector
//
// アップスケーラーはrembgと異なり、モデルが変わってもグラフ構造は同じ
// (UpscaleModelLoader -> ImageUpscaleWithModel)。差分は model_name の文字列だけで、
// 選択肢はユーザーの models/upscale_models/ 配下に依存するため、
// モデルごとのワークフローを用意せず /object_info から実行時に一覧を取得する。
//
// 未選択(空文字)の場合はワークフローJSONの値をそのまま使う。

const UPSCALER_MODEL_SELECT_ID = 'upscalerModelSelect';

// 保存済み設定の復元先。ドロップダウンはComfyUI接続後に構築されるため、
// loadFormSettings時点ではoptionが存在しない。ここに退避して構築時に反映する。
let preferredUpscalerModelName = '';

// ComfyUIの /object_info は入力定義を2形式で返す
//   旧: [["a.pth", "b.pth"], {}]
//   新: ["COMBO", { options: ["a.pth", "b.pth"] }]
function extractComboOptions(inputDef) {
    if (Array.isArray(inputDef)) {
        if (Array.isArray(inputDef[0])) {
            return inputDef[0];
        }
        if (inputDef[0] === 'COMBO' && inputDef[1] && Array.isArray(inputDef[1].options)) {
            return inputDef[1].options;
        }
    }
    return [];
}

function setPreferredUpscalerModel(name) {
    preferredUpscalerModelName = name || '';
    const select = $(UPSCALER_MODEL_SELECT_ID);
    if (select) select.value = preferredUpscalerModelName;
}

function getSelectedUpscalerModel() {
    const select = $(UPSCALER_MODEL_SELECT_ID);
    return select ? select.value : '';
}

function updateUpscalerDropdown(models) {
    const select = $(UPSCALER_MODEL_SELECT_ID);
    if (!select) return;

    const desired = preferredUpscalerModelName;
    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.setAttribute('data-i18n', 'config.upscalerModelFromWorkflow');
    defaultOption.textContent = I18nManager.t('config.upscalerModelFromWorkflow');
    select.appendChild(defaultOption);

    models.forEach((model) => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        select.appendChild(option);
    });

    // ComfyUI側に存在しないモデルが選択されていた場合は表示上「ワークフロー設定に従う」に戻す。
    // preferredUpscalerModelNameは保持したままにして、
    // そのモデルを持つComfyUIに繋ぎ直したときに復帰できるようにする。
    select.value = models.some((m) => m.name === desired) ? desired : '';
}

// ユーザー操作をpreferredUpscalerModelNameへ反映する。
// これが無いと、一覧を再構築するたびに保存値で選択が上書きされてしまう。
document.addEventListener('DOMContentLoaded', () => {
    const select = $(UPSCALER_MODEL_SELECT_ID);
    if (select) {
        select.addEventListener('change', () => {
            preferredUpscalerModelName = select.value;
        });
    }
});

function refreshUpscalerModelOptions(objectInfo) {
    const inputDef = objectInfo?.UpscaleModelLoader?.input?.required?.model_name;
    const options = extractComboOptions(inputDef);
    updateUpscalerDropdown(options.map((name) => ({ name: name })));
}

async function loadUpscalerModelOptionsFromCache() {
    try {
        const objectInfo = await objectInfoRepository.getObjectInfo();
        if (objectInfo) refreshUpscalerModelOptions(objectInfo);
    } catch (error) {
        console.error('loadUpscalerModelOptionsFromCache error:', error);
    }
}
