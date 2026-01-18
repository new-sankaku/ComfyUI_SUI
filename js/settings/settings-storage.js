const settingsStore = localforage.createInstance({ name: 'generatorSettings', storeName: 'formSettings' });
const urlHistoryStore = localforage.createInstance({ name: 'generatorSettings', storeName: 'urlHistory' });
const URL_HISTORY_MAX = 10;

async function getUrlHistory() {
    const history = await urlHistoryStore.getItem('comfyUIUrlHistory');
    return history || [];
}

async function addUrlToHistory(url) {
    if (!url || url.trim() === '') return;
    const trimmedUrl = url.trim();
    let history = await getUrlHistory();
    history = history.filter(u => u !== trimmedUrl);
    history.unshift(trimmedUrl);
    if (history.length > URL_HISTORY_MAX) {
        history = history.slice(0, URL_HISTORY_MAX);
    }
    await urlHistoryStore.setItem('comfyUIUrlHistory', history);
}

async function removeUrlFromHistory(url) {
    let history = await getUrlHistory();
    history = history.filter(u => u !== url);
    await urlHistoryStore.setItem('comfyUIUrlHistory', history);
    await renderUrlHistoryPopup();
}

const DEFAULT_COMFYUI_URL = 'http://localhost:8188';

function resetUrlToDefault() {
    const urlInput = $('comfyUIPageUrl');
    if (urlInput) {
        urlInput.value = DEFAULT_COMFYUI_URL;
        saveFormSettings();
    }
}

async function renderUrlHistoryPopup() {
    const listContainer = $('urlHistoryList');
    if (!listContainer) return;

    let history = await getUrlHistory();
    // デフォルトURLが履歴になければ追加
    if (!history.includes(DEFAULT_COMFYUI_URL)) {
        history.push(DEFAULT_COMFYUI_URL);
    }
    listContainer.innerHTML = '';

    history.forEach(url => {
        const isDefault = url === DEFAULT_COMFYUI_URL;
        const item = document.createElement('div');
        item.className = 'url-history-item';

        const urlText = document.createElement('span');
        urlText.className = 'url-history-item-url';
        urlText.textContent = url;
        urlText.addEventListener('click', () => {
            $('comfyUIPageUrl').value = url;
            saveFormSettings();
            hideUrlHistoryPopup();
        });

        item.appendChild(urlText);

        // デフォルトURLは削除不可
        if (!isDefault) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'url-history-item-remove';
            removeBtn.textContent = '×';
            removeBtn.title = I18nManager.t('advanced.removeFromHistory');
            removeBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await removeUrlFromHistory(url);
            });
            item.appendChild(removeBtn);
        }

        listContainer.appendChild(item);
    });
}

function showUrlHistoryPopup() {
    const popup = $('urlHistoryPopup');
    if (popup) {
        popup.style.display = 'block';
        renderUrlHistoryPopup();
    }
}

function hideUrlHistoryPopup() {
    const popup = $('urlHistoryPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function toggleUrlHistoryPopup() {
    const popup = $('urlHistoryPopup');
    if (popup) {
        if (popup.style.display === 'none') {
            showUrlHistoryPopup();
        } else {
            hideUrlHistoryPopup();
        }
    }
}

function setupUrlHistoryPopup() {
    document.addEventListener('click', (e) => {
        const popup = $('urlHistoryPopup');
        const historyBtn = $('showUrlHistory');
        if (popup && popup.style.display !== 'none') {
            if (!popup.contains(e.target) && e.target !== historyBtn) {
                hideUrlHistoryPopup();
            }
        }
    });
}
async function saveFormSettings() {
const settings = {
prompt: $('prompt').value,
negative_prompt: $('negative_prompt').value,
width: $('width').value,
height: $('height').value,
seed: $('seed').value,
comfyUIPageUrl: $('comfyUIPageUrl').value,
normalGenerateCount: $('normalGenerateCount').value,
loopPositivePrompts: $('loopPositivePrompts').value,
loopNegativePrompts: $('loopNegativePrompts').value,
i2iGenerateCount: $('i2iGenerateCount').value,
i2iloopPositivePrompts: $('i2iloopPositivePrompts').value,
i2iloopNegativePrompts: $('i2iloopNegativePrompts').value,
i2ianglePrompts: $('i2ianglePrompts').value,
metadataEnabled: $('metadataEnabled').checked,
metadataFirstLineOnly: $('metadataFirstLineOnly').checked,
metadataPosition: $('metadataPosition').value,
metadataFontSize: $('metadataFontSize').value,
metadataFont: $('metadataFont').value,
metadataFontColor: $('metadataFontColor').value,
metadataBgColor: $('metadataBgColor').value,
metadataOpacity: $('metadataOpacity').value,
metadataFooterText: $('metadataFooterText').value
};
await settingsStore.setItem('formSettings', settings);
}
async function loadFormSettings() {
const settings = await settingsStore.getItem('formSettings');
if (!settings) return;
if (settings.prompt) $('prompt').value = settings.prompt;
if (settings.negative_prompt) $('negative_prompt').value = settings.negative_prompt;
if (settings.width) $('width').value = settings.width;
if (settings.height) $('height').value = settings.height;
if (settings.seed) $('seed').value = settings.seed;
if (settings.comfyUIPageUrl) $('comfyUIPageUrl').value = settings.comfyUIPageUrl;
if (settings.normalGenerateCount) $('normalGenerateCount').value = settings.normalGenerateCount;
if (settings.loopPositivePrompts) $('loopPositivePrompts').value = settings.loopPositivePrompts;
if (settings.loopNegativePrompts) $('loopNegativePrompts').value = settings.loopNegativePrompts;
if (settings.wildcardGenerateCount) $('wildcardGenerateCount').value = settings.wildcardGenerateCount;
if (settings.i2iGenerateCount) $('i2iGenerateCount').value = settings.i2iGenerateCount;
if (settings.i2iloopPositivePrompts) $('i2iloopPositivePrompts').value = settings.i2iloopPositivePrompts;
if (settings.i2iloopNegativePrompts) $('i2iloopNegativePrompts').value = settings.i2iloopNegativePrompts;
if (settings.i2ianglePrompts) $('i2ianglePrompts').value = settings.i2ianglePrompts;
if (settings.metadataEnabled !== undefined) $('metadataEnabled').checked = settings.metadataEnabled;
if (settings.metadataFirstLineOnly !== undefined) $('metadataFirstLineOnly').checked = settings.metadataFirstLineOnly;
if (settings.metadataPosition) $('metadataPosition').value = settings.metadataPosition;
if (settings.metadataFontSize) $('metadataFontSize').value = settings.metadataFontSize;
if (settings.metadataFont) { $('metadataFont').value = settings.metadataFont; $('metadataFont').style.fontFamily = settings.metadataFont; }
if (settings.metadataFontColor) $('metadataFontColor').value = settings.metadataFontColor;
if (settings.metadataBgColor) $('metadataBgColor').value = settings.metadataBgColor;
if (settings.metadataOpacity) { $('metadataOpacity').value = settings.metadataOpacity; $('metadataOpacityValue').textContent = settings.metadataOpacity + '%'; }
if (settings.metadataFooterText) $('metadataFooterText').value = settings.metadataFooterText;
}
function setupAutoSave() {
const inputs = ['prompt', 'negative_prompt', 'width', 'height', 'seed', 'comfyUIPageUrl', 'normalGenerateCount', 'loopPositivePrompts', 'loopNegativePrompts', 'wildcardGenerateCount', 'i2iGenerateCount', 'i2iloopPositivePrompts', 'i2iloopNegativePrompts', 'i2ianglePrompts', 'metadataEnabled', 'metadataFirstLineOnly', 'metadataPosition', 'metadataFontSize', 'metadataFont', 'metadataFontColor', 'metadataBgColor', 'metadataOpacity', 'metadataFooterText'];
inputs.forEach(id => {
const el = $(id);
if (el) el.addEventListener('change', saveFormSettings);
});
}
