let currentMode = 'normal';
let isGenerating = false;
let isCancelled = false;
let workflowEditorInitialized = false;
let i2iUploadedFileNames = [];
let i2iloopUploadedFileNames = [];
let i2iangleUploadedFileNames = [];
let upscaleloopUploadedFileNames = [];
function showCancelButton(mode) {
const btnId = 'btnCancel' + mode.charAt(0).toUpperCase() + mode.slice(1);
const btn = $(btnId);
if (btn) btn.style.display = 'block';
}
function hideCancelButton(mode) {
const btnId = 'btnCancel' + mode.charAt(0).toUpperCase() + mode.slice(1);
const btn = $(btnId);
if (btn) btn.style.display = 'none';
}
function setGenerateButtonGenerating(mode, generating) {
const btnId = 'btnGenerate' + mode.charAt(0).toUpperCase() + mode.slice(1);
const btn = $(btnId);
if (!btn) return;
if (generating) {
btn.classList.add('generating');
btn.dataset.originalText = btn.textContent;
btn.textContent = I18nManager.t('status.generating');
} else {
btn.classList.remove('generating');
btn.textContent = btn.dataset.originalText || I18nManager.t('config.generate');
}
}
function cancelGeneration() {
if (isGenerating) {
isCancelled = true;
$('generationStatus').textContent = I18nManager.t('status.cancelling');
$('generationStatus').style.color = '#ff9800';
}
}
function normalizeImageSize(inputElement) {
let value = parseInt(inputElement.value) || 512;
if (value < 512) value = 512;
value = Math.round(value / 8) * 8;
inputElement.value = value;
}
let generationTimes = [];
function updateGenerationTimeStats(timeMs) {
generationTimes.push(timeMs);
const avg = Math.round(generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length);
$('generationTimeStats').textContent = I18nManager.t('status.avgTime').replace('{avg}', avg).replace('{count}', generationTimes.length);
}
function resetGenerationTimeStats() {
generationTimes = [];
$('generationTimeStats').textContent = '-';
}
function generateImageNormal() { generateImage(parseInt($('normalGenerateCount').value) || 1); }
async function generateImageLoop() {
const positivePrompts = $('loopPositivePrompts').value.trim().split('\n').filter(p => p.trim());
const negativePrompts = $('loopNegativePrompts').value.trim().split('\n');
const position = document.querySelector('input[name="loopPromptPosition"]:checked').value;
const basePositive = getRawPromptText();
const baseNegative = getRawNegativePromptText();
if (positivePrompts.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.enterPositivePrompt')); return; }
generateImageLoopExec(positivePrompts, negativePrompts, position, basePositive, baseNegative);
}
function generateImageWildcard() { generateImageWildcardExec(parseInt($('wildcardGenerateCount').value) || 1); }
function generateImageI2I() { generateImageI2IExec(parseInt($('i2iGenerateCount').value) || 1); }
async function generateImageI2ILoop() {
const positivePrompts = $('i2iloopPositivePrompts').value.trim().split('\n').filter(p => p.trim());
const negativePrompts = $('i2iloopNegativePrompts').value.trim().split('\n');
const position = document.querySelector('input[name="i2iloopPromptPosition"]:checked').value;
const basePositive = getRawPromptText();
const baseNegative = getRawNegativePromptText();
if (positivePrompts.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.enterPositivePrompt')); return; }
if (i2iloopUploadedFileNames.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.uploadImage')); return; }
generateImageI2ILoopExec(positivePrompts, negativePrompts, position, basePositive, baseNegative);
}
async function loadObjectInfo() {
try {
const response = await fetch(comfyUIUrls.objectInfoOnly);
if (!response.ok) return;
const objectInfo = await response.json();
comfyObjectInfoList = Object.keys(objectInfo);
await objectInfoRepository.saveObjectInfo(objectInfo);
} catch (error) { console.error('ObjectInfo load error:', error); }
}
async function generateImage(count) {
if (isGenerating) return;
isGenerating = true;
isCancelled = false;
count = count || 1;
showCancelButton('normal');
setGenerateButtonGenerating('normal', true);
try {
const baseWorkflow = await comfyUIWorkflowRepository.getEnabledWorkflowByType("T2I");
if (!baseWorkflow) {
ErrorGuideDialog.show(ErrorGuideDialog.ERROR_TYPES.WORKFLOW_NOT_FOUND, { workflowType: 'T2I' });
$('generationStatus').textContent = I18nManager.t('status.workflowNotSet');
$('generationStatus').style.color = '#f44336';
return;
}
const width = parseInt($('width').value);
const height = parseInt($('height').value);
const baseSeed = parseInt($('seed').value);
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', 1).replace('{total}', count);
$('generationStatus').style.color = '#ff9800';
resetGenerationTimeStats();
for (let i = 0; i < count; i++) {
if (isCancelled) { $('generationStatus').textContent = I18nManager.t('status.cancelled'); $('generationStatus').style.color = '#ff9800'; break; }
const prompt = await getProcessedPromptForGeneration();
const negativePrompt = await getProcessedNegativePromptForGeneration();
const currentSeed = baseSeed === -1 ? Math.floor(Math.random() * 0xFFFFFFFF) : baseSeed + i;
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', i + 1).replace('{total}', count);
const requestData = { prompt: prompt, negative_prompt: negativePrompt, seed: currentSeed, width: width, height: height };
const workflow = comfyuiReplacePlaceholders(baseWorkflow, requestData, 'T2I');
console.log('Generated Workflow JSON:', JSON.stringify(workflow, null, 2));
const startTime = performance.now();
const result = await executeWorkflow(workflow);
const endTime = performance.now();
updateGenerationTimeStats(Math.round(endTime - startTime));
if (result && result.image) {
const historyConfig = [
{ fieldId: 'prompt', text: $('prompt')?.value?.trim() },
{ fieldId: 'negative_prompt', text: $('negative_prompt')?.value?.trim() }
];
displayGeneratedImage(result.image, i + 1, prompt, historyConfig);
}
}
if (!isCancelled) { $('generationStatus').textContent = I18nManager.t('status.completed'); $('generationStatus').style.color = '#4caf50'; }
} catch (error) {
ErrorGuideDialog.showForError(error, { errorDetail: error.message });
$('generationStatus').textContent = I18nManager.t('status.error');
$('generationStatus').style.color = '#f44336';
} finally { isGenerating = false; isCancelled = false; hideCancelButton('normal'); setGenerateButtonGenerating('normal', false); }
}
async function generateImageLoopExec(positivePrompts, negativePrompts, position, basePositive, baseNegative) {
if (isGenerating) return;
isGenerating = true;
isCancelled = false;
showCancelButton('loop');
setGenerateButtonGenerating('loop', true);
try {
const baseWorkflow = await comfyUIWorkflowRepository.getEnabledWorkflowByType("T2I");
if (!baseWorkflow) {
ErrorGuideDialog.show(ErrorGuideDialog.ERROR_TYPES.WORKFLOW_NOT_FOUND, { workflowType: 'T2I' });
$('generationStatus').textContent = I18nManager.t('status.workflowNotSet');
$('generationStatus').style.color = '#f44336';
return;
}
const width = parseInt($('width').value);
const height = parseInt($('height').value);
const baseSeed = parseInt($('seed').value);
const total = Math.max(positivePrompts.length, negativePrompts.length);
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', 0).replace('{total}', total);
$('generationStatus').style.color = '#ff9800';
resetGenerationTimeStats();
for (let i = 0; i < total; i++) {
if (isCancelled) { $('generationStatus').textContent = I18nManager.t('status.cancelled'); $('generationStatus').style.color = '#ff9800'; break; }
const currentSeed = baseSeed === -1 ? Math.floor(Math.random() * 0xFFFFFFFF) : baseSeed + i;
let positive = positivePrompts[i] || '';
let negative = negativePrompts[i] || '';
if (position === 'start' && basePositive) {
positive = positive + '\n' + basePositive;
} else if (position === 'end' && basePositive) {
positive = basePositive + ', ' + positive;
}
if (position === 'start' && baseNegative) {
negative = negative + '\n' + baseNegative;
} else if (position === 'end' && baseNegative) {
negative = baseNegative + ', ' + negative;
}
positive = await processPromptWithWildcard(positive.trim());
negative = await processPromptWithWildcard(negative.trim());
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', i + 1).replace('{total}', total);
const requestData = { prompt: positive, negative_prompt: negative, seed: currentSeed, width: width, height: height };
const workflow = comfyuiReplacePlaceholders(baseWorkflow, requestData, 'T2I');
console.log('Generated Workflow JSON:', JSON.stringify(workflow, null, 2));
const startTime = performance.now();
const result = await executeWorkflow(workflow);
const endTime = performance.now();
updateGenerationTimeStats(Math.round(endTime - startTime));
if (result && result.image) {
const historyConfig = [
{ fieldId: 'loopPositivePrompts', text: $('loopPositivePrompts')?.value?.trim() },
{ fieldId: 'loopNegativePrompts', text: $('loopNegativePrompts')?.value?.trim() }
];
displayGeneratedImage(result.image, i + 1, positive, historyConfig);
}
}
if (!isCancelled) { $('generationStatus').textContent = I18nManager.t('status.completed'); $('generationStatus').style.color = '#4caf50'; }
} catch (error) {
ErrorGuideDialog.showForError(error, { errorDetail: error.message });
$('generationStatus').textContent = I18nManager.t('status.error');
$('generationStatus').style.color = '#f44336';
} finally { isGenerating = false; isCancelled = false; hideCancelButton('loop'); setGenerateButtonGenerating('loop', false); }
}
async function generateImageWildcardExec(count) {
if (isGenerating) return;
isGenerating = true;
isCancelled = false;
showCancelButton('wildcard');
setGenerateButtonGenerating('wildcard', true);
try {
const baseWorkflow = await comfyUIWorkflowRepository.getEnabledWorkflowByType("T2I");
if (!baseWorkflow) {
ErrorGuideDialog.show(ErrorGuideDialog.ERROR_TYPES.WORKFLOW_NOT_FOUND, { workflowType: 'T2I' });
$('generationStatus').textContent = I18nManager.t('status.workflowNotSet');
$('generationStatus').style.color = '#f44336';
return;
}
const width = parseInt($('width').value);
const height = parseInt($('height').value);
const baseSeed = parseInt($('seed').value);
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', 1).replace('{total}', count);
$('generationStatus').style.color = '#ff9800';
resetGenerationTimeStats();
for (let i = 0; i < count; i++) {
if (isCancelled) { $('generationStatus').textContent = I18nManager.t('status.cancelled'); $('generationStatus').style.color = '#ff9800'; break; }
const prompt = await getProcessedPromptForGeneration();
const negativePrompt = await getProcessedNegativePromptForGeneration();
const currentSeed = baseSeed === -1 ? Math.floor(Math.random() * 0xFFFFFFFF) : baseSeed + i;
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', i + 1).replace('{total}', count);
const requestData = { prompt: prompt, negative_prompt: negativePrompt, seed: currentSeed, width: width, height: height };
const workflow = comfyuiReplacePlaceholders(baseWorkflow, requestData, 'T2I');
console.log('Generated Workflow JSON:', JSON.stringify(workflow, null, 2));
const startTime = performance.now();
const result = await executeWorkflow(workflow);
const endTime = performance.now();
updateGenerationTimeStats(Math.round(endTime - startTime));
if (result && result.image) {
const historyConfig = [
{ fieldId: 'prompt', text: $('prompt')?.value?.trim() },
{ fieldId: 'negative_prompt', text: $('negative_prompt')?.value?.trim() }
];
displayGeneratedImage(result.image, i + 1, prompt, historyConfig);
}
}
if (!isCancelled) { $('generationStatus').textContent = I18nManager.t('status.completed'); $('generationStatus').style.color = '#4caf50'; }
} catch (error) {
ErrorGuideDialog.showForError(error, { errorDetail: error.message });
$('generationStatus').textContent = I18nManager.t('status.error');
$('generationStatus').style.color = '#f44336';
} finally { isGenerating = false; isCancelled = false; hideCancelButton('wildcard'); setGenerateButtonGenerating('wildcard', false); }
}
async function executeWorkflow(workflow) {
if (!socket) Comfyui_connect();
const fixedWorkflow = await comfyui_fixWorkflowTypes_v2(workflow);
const response = await fetch(comfyUIUrls.prompt, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ prompt: fixedWorkflow, client_id: comfyUIuuid })
});
if (!response.ok) {
const errorText = await response.text();
createToastError(I18nManager.t('toast.comfyuiError'), errorText);
throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();
const promptId = data.prompt_id;
await waitForCompletion(promptId);
const history = await fetch(comfyUIUrls.history + promptId);
const historyData = await history.json();
const outputs = historyData[promptId]?.outputs || {};
const imageOutput = Object.values(outputs)[0]?.images?.[0];
if (!imageOutput) throw new Error('No image output found');
return { image: await getImageUrl(imageOutput) };
}
async function getImageUrl(imageData) {
const params = new URLSearchParams({ filename: imageData.filename, subfolder: imageData.subfolder || '', type: imageData.type || 'output' });
return comfyUIUrls.view + '?' + params.toString();
}
function waitForCompletion(promptId) {
return new Promise((resolve, reject) => {
const checkInterval = setInterval(async () => {
try {
const response = await fetch(comfyUIUrls.history + promptId);
const data = await response.json();
if (data[promptId]) {
const status = data[promptId].status;
if (status && (status.completed || status.status_str === 'success')) { clearInterval(checkInterval); resolve(); }
else if (status && status.status_str === 'error') { clearInterval(checkInterval); reject(new Error('Workflow execution failed')); }
}
} catch (error) { clearInterval(checkInterval); reject(error); }
}, 1000);
});
}
async function uploadImageToComfyUI(file) {
const formData = new FormData();
formData.append('image', file);
formData.append('overwrite', 'true');
const response = await fetch(comfyUIUrls.upload, {
method: 'POST',
body: formData
});
if (!response.ok) throw new Error(I18nManager.t('toast.uploadFailed'));
const result = await response.json();
return result.name;
}
function setupI2IImageUpload(inputId, previewId, areaId, getFileNames, setFileNames, countId) {
const input = $(inputId);
const preview = $(previewId);
const area = $(areaId);
area.addEventListener('click', () => input.click());
area.addEventListener('dragover', (e) => { e.preventDefault(); preview.classList.add('dragover'); });
area.addEventListener('dragleave', () => preview.classList.remove('dragover'));
area.addEventListener('drop', async (e) => {
e.preventDefault();
preview.classList.remove('dragover');
const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
if (files.length > 0) await handleI2IImageFiles(files, preview, getFileNames, setFileNames, countId);
});
input.addEventListener('change', async (e) => {
const files = Array.from(e.target.files);
if (files.length > 0) await handleI2IImageFiles(files, preview, getFileNames, setFileNames, countId);
});
}
async function handleI2IImageFiles(files, preview, getFileNames, setFileNames, countId) {
const currentNames = getFileNames();
const uploadPromises = files.map(async (file) => {
try {
const uploadedName = await uploadImageToComfyUI(file);
return { name: uploadedName, file: file };
} catch (error) {
createToastError(I18nManager.t('toast.uploadError'), I18nManager.t('toast.uploadFailed'));
return null;
}
});
const results = await Promise.all(uploadPromises);
const successfulUploads = results.filter(r => r !== null);
if (successfulUploads.length === 0) {
preview.innerHTML = '<div class="i2i-image-placeholder">' + I18nManager.t('status.uploadError') + '</div>';
return;
}
const newNames = [...currentNames, ...successfulUploads.map(r => r.name)];
setFileNames(newNames);
updateI2IPreview(preview, successfulUploads.map(r => r.file), newNames, getFileNames, setFileNames, countId);
updateI2IImageCount(countId, newNames.length);
}
function updateI2IPreview(preview, newFiles, allNames, getFileNames, setFileNames, countId) {
if (allNames.length === 0) {
preview.innerHTML = '<div class="i2i-image-placeholder">' + I18nManager.t('status.dropImageHint') + '</div>';
preview.classList.remove('has-image');
return;
}
const placeholder = preview.querySelector('.i2i-image-placeholder');
if (placeholder) placeholder.remove();
newFiles.forEach((file, index) => {
const reader = new FileReader();
reader.onload = (e) => {
const itemDiv = document.createElement('div');
itemDiv.className = 'i2i-preview-item';
itemDiv.innerHTML = `
<img src="${e.target.result}" alt="input image">
<button class="i2i-preview-remove" data-index="${allNames.length - newFiles.length + index}">&times;</button>
`;
itemDiv.querySelector('.i2i-preview-remove').addEventListener('click', (ev) => {
ev.stopPropagation();
const idx = parseInt(ev.target.dataset.index);
const names = getFileNames();
names.splice(idx, 1);
setFileNames(names);
rebuildI2IPreview(preview, getFileNames, setFileNames, countId);
});
preview.appendChild(itemDiv);
};
reader.readAsDataURL(file);
});
preview.classList.add('has-image');
}
function rebuildI2IPreview(preview, getFileNames, setFileNames, countId) {
const names = getFileNames();
preview.innerHTML = '';
if (names.length === 0) {
preview.innerHTML = '<div class="i2i-image-placeholder">' + I18nManager.t('status.dropImageHint') + '</div>';
preview.classList.remove('has-image');
} else {
names.forEach((name, idx) => {
const itemDiv = document.createElement('div');
itemDiv.className = 'i2i-preview-item';
const imgUrl = comfyUIUrls.view + '?filename=' + encodeURIComponent(name) + '&type=input';
itemDiv.innerHTML = `
<img src="${imgUrl}" alt="input image">
<button class="i2i-preview-remove" data-index="${idx}">&times;</button>
`;
itemDiv.querySelector('.i2i-preview-remove').addEventListener('click', (ev) => {
ev.stopPropagation();
const names = getFileNames();
names.splice(idx, 1);
setFileNames(names);
rebuildI2IPreview(preview, getFileNames, setFileNames, countId);
});
preview.appendChild(itemDiv);
});
preview.classList.add('has-image');
}
updateI2IImageCount(countId, names.length);
}
function updateI2IImageCount(countId, count) {
const countEl = $(countId);
if (countEl) {
countEl.textContent = count > 0 ? `(${count}${I18nManager.t('common.imageCount')})` : '';
}
}
async function generateImageI2IExec(countPerImage) {
if (isGenerating) return;
if (i2iUploadedFileNames.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.uploadImage')); return; }
isGenerating = true;
isCancelled = false;
countPerImage = countPerImage || 1;
showCancelButton('i2I');
setGenerateButtonGenerating('i2I', true);
try {
const baseWorkflow = await comfyUIWorkflowRepository.getEnabledWorkflowByType("I2I");
if (!baseWorkflow) {
ErrorGuideDialog.show(ErrorGuideDialog.ERROR_TYPES.WORKFLOW_NOT_FOUND, { workflowType: 'I2I' });
$('generationStatus').textContent = I18nManager.t('status.workflowNotSet');
$('generationStatus').style.color = '#f44336';
return;
}
const width = parseInt($('width').value);
const height = parseInt($('height').value);
const baseSeed = parseInt($('seed').value);
const totalImages = i2iUploadedFileNames.length;
const totalGenerations = totalImages * countPerImage;
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', 1).replace('{total}', totalGenerations);
$('generationStatus').style.color = '#ff9800';
resetGenerationTimeStats();
let generationIndex = 0;
for (let imgIdx = 0; imgIdx < totalImages; imgIdx++) {
const uploadFileName = i2iUploadedFileNames[imgIdx];
for (let i = 0; i < countPerImage; i++) {
if (isCancelled) { $('generationStatus').textContent = I18nManager.t('status.cancelled'); $('generationStatus').style.color = '#ff9800'; break; }
const prompt = await getProcessedPromptForGeneration();
const negativePrompt = await getProcessedNegativePromptForGeneration();
const currentSeed = baseSeed === -1 ? Math.floor(Math.random() * 0xFFFFFFFF) : baseSeed + generationIndex;
generationIndex++;
$('generationStatus').textContent = I18nManager.t('status.generatingWithImage').replace('{current}', generationIndex).replace('{total}', totalGenerations).replace('{imgCurrent}', imgIdx + 1).replace('{imgTotal}', totalImages);
const requestData = { prompt: prompt, negative_prompt: negativePrompt, seed: currentSeed, width: width, height: height, uploadFileName: uploadFileName };
const workflow = comfyuiReplacePlaceholders(baseWorkflow, requestData, 'I2I');
console.log('Generated I2I Workflow JSON:', JSON.stringify(workflow, null, 2));
const startTime = performance.now();
const result = await executeWorkflow(workflow);
const endTime = performance.now();
updateGenerationTimeStats(Math.round(endTime - startTime));
if (result && result.image) {
const historyConfig = [
{ fieldId: 'prompt', text: $('prompt')?.value?.trim() },
{ fieldId: 'negative_prompt', text: $('negative_prompt')?.value?.trim() }
];
displayGeneratedImage(result.image, generationIndex, prompt, historyConfig);
}
}
if (isCancelled) break;
}
if (!isCancelled) { $('generationStatus').textContent = I18nManager.t('status.completed'); $('generationStatus').style.color = '#4caf50'; }
} catch (error) {
ErrorGuideDialog.showForError(error, { errorDetail: error.message });
$('generationStatus').textContent = I18nManager.t('status.error');
$('generationStatus').style.color = '#f44336';
} finally { isGenerating = false; isCancelled = false; hideCancelButton('i2I'); setGenerateButtonGenerating('i2I', false); }
}
async function generateImageI2ILoopExec(positivePrompts, negativePrompts, position, basePositive, baseNegative) {
if (isGenerating) return;
if (i2iloopUploadedFileNames.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.uploadImage')); return; }
isGenerating = true;
isCancelled = false;
showCancelButton('i2ILoop');
setGenerateButtonGenerating('i2ILoop', true);
try {
const baseWorkflow = await comfyUIWorkflowRepository.getEnabledWorkflowByType("I2I");
if (!baseWorkflow) {
ErrorGuideDialog.show(ErrorGuideDialog.ERROR_TYPES.WORKFLOW_NOT_FOUND, { workflowType: 'I2I' });
$('generationStatus').textContent = I18nManager.t('status.workflowNotSet');
$('generationStatus').style.color = '#f44336';
return;
}
const width = parseInt($('width').value);
const height = parseInt($('height').value);
const baseSeed = parseInt($('seed').value);
const promptCount = Math.max(positivePrompts.length, negativePrompts.length);
const imageCount = i2iloopUploadedFileNames.length;
const total = imageCount * promptCount;
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', 0).replace('{total}', total);
$('generationStatus').style.color = '#ff9800';
resetGenerationTimeStats();
let generationIndex = 0;
for (let imgIdx = 0; imgIdx < imageCount; imgIdx++) {
const uploadFileName = i2iloopUploadedFileNames[imgIdx];
for (let i = 0; i < promptCount; i++) {
if (isCancelled) { $('generationStatus').textContent = I18nManager.t('status.cancelled'); $('generationStatus').style.color = '#ff9800'; break; }
const currentSeed = baseSeed === -1 ? Math.floor(Math.random() * 0xFFFFFFFF) : baseSeed + generationIndex;
let positive = positivePrompts[i] || '';
let negative = negativePrompts[i] || '';
if (position === 'start' && basePositive) {
positive = positive + '\n' + basePositive;
} else if (position === 'end' && basePositive) {
positive = basePositive + ', ' + positive;
}
if (position === 'start' && baseNegative) {
negative = negative + '\n' + baseNegative;
} else if (position === 'end' && baseNegative) {
negative = baseNegative + ', ' + negative;
}
positive = await processPromptWithWildcard(positive.trim());
negative = await processPromptWithWildcard(negative.trim());
generationIndex++;
$('generationStatus').textContent = I18nManager.t('status.generatingWithImage').replace('{current}', generationIndex).replace('{total}', total).replace('{imgCurrent}', imgIdx + 1).replace('{imgTotal}', imageCount);
const requestData = { prompt: positive, negative_prompt: negative, seed: currentSeed, width: width, height: height, uploadFileName: uploadFileName };
const workflow = comfyuiReplacePlaceholders(baseWorkflow, requestData, 'I2I');
console.log('Generated I2I Loop Workflow JSON:', JSON.stringify(workflow, null, 2));
const startTime = performance.now();
const result = await executeWorkflow(workflow);
const endTime = performance.now();
updateGenerationTimeStats(Math.round(endTime - startTime));
if (result && result.image) {
const historyConfig = [
{ fieldId: 'i2iloopPositivePrompts', text: $('i2iloopPositivePrompts')?.value?.trim() },
{ fieldId: 'i2iloopNegativePrompts', text: $('i2iloopNegativePrompts')?.value?.trim() }
];
displayGeneratedImage(result.image, generationIndex, positive, historyConfig);
}
}
if (isCancelled) break;
}
if (!isCancelled) { $('generationStatus').textContent = I18nManager.t('status.completed'); $('generationStatus').style.color = '#4caf50'; }
} catch (error) {
ErrorGuideDialog.showForError(error, { errorDetail: error.message });
$('generationStatus').textContent = I18nManager.t('status.error');
$('generationStatus').style.color = '#f44336';
} finally { isGenerating = false; isCancelled = false; hideCancelButton('i2ILoop'); setGenerateButtonGenerating('i2ILoop', false); }
}
async function generateImageI2IAngle() {
const anglePrompts = $('i2ianglePrompts').value.trim().split('\n').filter(p => p.trim());
if (anglePrompts.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.enterAnglePrompt')); return; }
if (i2iangleUploadedFileNames.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.uploadImage')); return; }
generateImageI2IAngleExec(anglePrompts);
}
async function generateImageI2IAngleExec(anglePrompts) {
if (isGenerating) return;
if (i2iangleUploadedFileNames.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.uploadImage')); return; }
isGenerating = true;
isCancelled = false;
showCancelButton('i2IAngle');
setGenerateButtonGenerating('i2IAngle', true);
try {
const baseWorkflow = await comfyUIWorkflowRepository.getEnabledWorkflowByType("I2I");
if (!baseWorkflow) {
ErrorGuideDialog.show(ErrorGuideDialog.ERROR_TYPES.WORKFLOW_NOT_FOUND, { workflowType: 'I2I' });
$('generationStatus').textContent = I18nManager.t('status.workflowNotSet');
$('generationStatus').style.color = '#f44336';
return;
}
const width = parseInt($('width').value);
const height = parseInt($('height').value);
const baseSeed = parseInt($('seed').value);
const imageCount = i2iangleUploadedFileNames.length;
const angleCount = anglePrompts.length;
const total = imageCount * angleCount;
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', 0).replace('{total}', total);
$('generationStatus').style.color = '#ff9800';
resetGenerationTimeStats();
let generationIndex = 0;
for (let imgIdx = 0; imgIdx < imageCount; imgIdx++) {
const uploadFileName = i2iangleUploadedFileNames[imgIdx];
for (let i = 0; i < angleCount; i++) {
if (isCancelled) { $('generationStatus').textContent = I18nManager.t('status.cancelled'); $('generationStatus').style.color = '#ff9800'; break; }
const currentSeed = baseSeed === -1 ? Math.floor(Math.random() * 0xFFFFFFFF) : baseSeed + generationIndex;
const anglePrompt = anglePrompts[i].trim();
const prompt = await getProcessedPromptForGeneration();
const negativePrompt = await getProcessedNegativePromptForGeneration();
generationIndex++;
$('generationStatus').textContent = I18nManager.t('status.generatingWithImage').replace('{current}', generationIndex).replace('{total}', total).replace('{imgCurrent}', imgIdx + 1).replace('{imgTotal}', imageCount);
const requestData = { prompt: prompt, negative_prompt: negativePrompt, seed: currentSeed, width: width, height: height, uploadFileName: uploadFileName, anglePrompt: anglePrompt };
const workflow = comfyuiReplacePlaceholders(baseWorkflow, requestData, 'I2I');
console.log('Generated I2I Angle Workflow JSON:', JSON.stringify(workflow, null, 2));
const startTime = performance.now();
const result = await executeWorkflow(workflow);
const endTime = performance.now();
updateGenerationTimeStats(Math.round(endTime - startTime));
if (result && result.image) {
const historyConfig = [
{ fieldId: 'i2ianglePrompts', text: $('i2ianglePrompts')?.value?.trim() }
];
displayGeneratedImage(result.image, generationIndex, `${prompt} [${anglePrompt}]`, historyConfig);
}
}
if (isCancelled) break;
}
if (!isCancelled) { $('generationStatus').textContent = I18nManager.t('status.completed'); $('generationStatus').style.color = '#4caf50'; }
} catch (error) {
ErrorGuideDialog.showForError(error, { errorDetail: error.message });
$('generationStatus').textContent = I18nManager.t('status.error');
$('generationStatus').style.color = '#f44336';
} finally { isGenerating = false; isCancelled = false; hideCancelButton('i2IAngle'); setGenerateButtonGenerating('i2IAngle', false); }
}
function generateImageUpscaleLoop() {
if (upscaleloopUploadedFileNames.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.uploadImage')); return; }
generateImageUpscaleLoopExec();
}
async function generateImageUpscaleLoopExec() {
if (isGenerating) return;
if (upscaleloopUploadedFileNames.length === 0) { createToastError(I18nManager.t('toast.inputError'), I18nManager.t('toast.uploadImage')); return; }
isGenerating = true;
isCancelled = false;
showCancelButton('upscaleLoop');
setGenerateButtonGenerating('upscaleLoop', true);
try {
const baseWorkflow = await comfyUIWorkflowRepository.getEnabledWorkflowByType("Upscaler");
if (!baseWorkflow) {
ErrorGuideDialog.show(ErrorGuideDialog.ERROR_TYPES.WORKFLOW_NOT_FOUND, { workflowType: 'Upscaler' });
$('generationStatus').textContent = I18nManager.t('status.workflowNotSet');
$('generationStatus').style.color = '#f44336';
return;
}
const imageCount = upscaleloopUploadedFileNames.length;
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', 0).replace('{total}', imageCount);
$('generationStatus').style.color = '#ff9800';
resetGenerationTimeStats();
for (let imgIdx = 0; imgIdx < imageCount; imgIdx++) {
if (isCancelled) { $('generationStatus').textContent = I18nManager.t('status.cancelled'); $('generationStatus').style.color = '#ff9800'; break; }
const uploadFileName = upscaleloopUploadedFileNames[imgIdx];
$('generationStatus').textContent = I18nManager.t('status.generatingProgress').replace('{current}', imgIdx + 1).replace('{total}', imageCount);
const requestData = { uploadFileName: uploadFileName };
const workflow = comfyuiReplacePlaceholders(baseWorkflow, requestData, 'Upscaler');
console.log('Generated Upscale Loop Workflow JSON:', JSON.stringify(workflow, null, 2));
const startTime = performance.now();
const result = await executeWorkflow(workflow);
const endTime = performance.now();
updateGenerationTimeStats(Math.round(endTime - startTime));
if (result && result.image) {
const historyConfig = [];
displayGeneratedImage(result.image, imgIdx + 1, 'Upscale: ' + uploadFileName, historyConfig);
}
}
if (!isCancelled) { $('generationStatus').textContent = I18nManager.t('status.completed'); $('generationStatus').style.color = '#4caf50'; }
} catch (error) {
ErrorGuideDialog.showForError(error, { errorDetail: error.message });
$('generationStatus').textContent = I18nManager.t('status.error');
$('generationStatus').style.color = '#f44336';
} finally { isGenerating = false; isCancelled = false; hideCancelButton('upscaleLoop'); setGenerateButtonGenerating('upscaleLoop', false); }
}
