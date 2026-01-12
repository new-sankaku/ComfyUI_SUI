function switchMode(mode) {
currentMode = mode;
document.querySelectorAll('.menu-button[data-mode]').forEach(btn => btn.classList.remove('active'));
document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
document.querySelectorAll('.mode-config-content').forEach(el => el.classList.remove('active'));
const modeNameKeys = { 'normal': 'modes.t2i', 'loop': 'modes.t2iLoop', 'wildcard': 'modes.t2i', 'i2i': 'modes.i2i', 'i2iloop': 'modes.i2iLoop', 'i2iangle': 'modes.i2iAngle', 'upscaleloop': 'modes.upscaleLoop' };
$('modeConfigTitle').textContent = I18nManager.t(modeNameKeys[mode]);
const configMap = { 'normal': 'normalModeConfig', 'loop': 'loopModeConfig', 'wildcard': 'wildcardModeConfig', 'i2i': 'i2iModeConfig', 'i2iloop': 'i2iloopModeConfig', 'i2iangle': 'i2iangleModeConfig', 'upscaleloop': 'upscaleloopModeConfig' };
if (configMap[mode]) $(configMap[mode]).classList.add('active');
}
async function openWorkflowEditor() {
if (!window.comfyUIWorkflowWindow) {
window.comfyUIWorkflowWindow = new ComfyUIWorkflowWindow();
}
window.comfyUIWorkflowWindow.show();
syncWorkflowEditorConnectionStatus();
if (!workflowEditorInitialized) {
if (!comfyUIWorkflowEditor) {
comfyUIWorkflowEditor = new ComfyUIWorkflowEditor();
comfyUIWorkflowEditor.initialize();
comfyui_monitorConnection_v2();
}
workflowEditorInitialized = true;
} else {
if (isComfyUIOnlineGlobal && comfyUIWorkflowEditor) {
comfyUIWorkflowEditor.updateObjectInfoAndWorkflows();
}
}
}
function closeWorkflowEditor() { if (window.comfyUIWorkflowWindow) window.comfyUIWorkflowWindow.hide(); }
function randomSeed() { $('seed').value = Math.floor(Math.random() * 0xFFFFFFFF); }
function clearForm() {
$('prompt').value = '';
$('negative_prompt').value = '';
$('seed').value = '-1';
$('width').value = '1024';
$('height').value = '1024';
}
function switchTab(tabName) {
document.querySelectorAll('.center-tab').forEach(btn => btn.classList.remove('active'));
document.querySelector(`.center-tab[data-tab="${tabName}"]`).classList.add('active');
document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
$('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Content').classList.add('active');
}
async function updateWorkflowDisplays() {
try {
const workflows = await comfyUIWorkflowRepository.getAllWorkflows();
const t2iWorkflow = workflows.find(w => w.type === 'T2I' && w.enabled);
const i2iWorkflow = workflows.find(w => w.type === 'I2I' && w.enabled);
const upscaleWorkflow = workflows.find(w => w.type === 'Upscaler' && w.enabled);
const t2iName = t2iWorkflow ? t2iWorkflow.name : I18nManager.t('config.notSelected');
const i2iName = i2iWorkflow ? i2iWorkflow.name : I18nManager.t('config.notSelected');
const upscaleName = upscaleWorkflow ? upscaleWorkflow.name : I18nManager.t('config.notSelected');
$('normalWorkflowDisplay').textContent = t2iName;
$('loopWorkflowDisplay').textContent = t2iName;
$('i2iWorkflowDisplay').textContent = i2iName;
$('i2iloopWorkflowDisplay').textContent = i2iName;
$('i2iangleWorkflowDisplay').textContent = i2iName;
$('upscaleloopWorkflowDisplay').textContent = upscaleName;
$('activeWorkflow').textContent = currentMode.startsWith('i2i') ? i2iName : (currentMode === 'upscaleloop' ? upscaleName : t2iName);
} catch (error) { console.error('ワークフロー表示更新エラー:', error); }
}
function hookWorkflowRepository() {
const originalSaveWorkflow = comfyUIWorkflowRepository.saveWorkflow.bind(comfyUIWorkflowRepository);
comfyUIWorkflowRepository.saveWorkflow = async function(...args) {
const result = await originalSaveWorkflow(...args);
await updateWorkflowDisplays();
return result;
};
}
