function getText(key) {
const keyMap = {
'comfyUI_addWorkflow': 'workflowEditor.addWorkflow',
'comfyUI_testGenerate': 'workflowEditor.testGenerate',
'comfyUI_workflowHelp': 'workflowEditor.workflowHelp',
'comfyUI_workflowManagement': 'workflowEditor.workflowManagement',
'missingNode': 'workflowEditor.missingNode',
'missingDescription': 'workflowEditor.missingDescription',
'comfyUI_workflowErrorHelp': 'workflowEditor.workflowErrorHelp'
};
return I18nManager.t(keyMap[key] || key);
}
function updateLoopLineCount() {
const positiveText = $('loopPositivePrompts').value;
const negativeText = $('loopNegativePrompts').value;
const positiveLines = positiveText.trim() ? positiveText.trim().split('\n').filter(p => p.trim()).length : 0;
const negativeLines = negativeText.trim() ? negativeText.trim().split('\n').filter(p => p.trim()).length : 0;
$('loopPositiveLineCount').textContent = positiveLines + ' ' + I18nManager.t('common.lines');
$('loopNegativeLineCount').textContent = negativeLines + ' ' + I18nManager.t('common.lines');
}
function updateI2ILoopLineCount() {
const positiveText = $('i2iloopPositivePrompts').value;
const negativeText = $('i2iloopNegativePrompts').value;
const positiveLines = positiveText.trim() ? positiveText.trim().split('\n').filter(p => p.trim()).length : 0;
const negativeLines = negativeText.trim() ? negativeText.trim().split('\n').filter(p => p.trim()).length : 0;
$('i2iloopPositiveLineCount').textContent = positiveLines + ' ' + I18nManager.t('common.lines');
$('i2iloopNegativeLineCount').textContent = negativeLines + ' ' + I18nManager.t('common.lines');
}
function updateI2IAngleLineCount() {
const angleText = $('i2ianglePrompts').value;
const angleLines = angleText.trim() ? angleText.trim().split('\n').filter(p => p.trim()).length : 0;
$('i2ianglePromptLineCount').textContent = angleLines + ' ' + I18nManager.t('common.lines');
}
document.addEventListener('DOMContentLoaded', async () => {
await loadFormSettings();
setupAutoSave();
$('btnModeNormal').addEventListener('click', () => switchMode('normal'));
$('btnModeLoop').addEventListener('click', () => switchMode('loop'));
$('btnModeI2I').addEventListener('click', () => switchMode('i2i'));
$('btnModeI2ILoop').addEventListener('click', () => switchMode('i2iloop'));
$('btnModeI2IAngle').addEventListener('click', () => switchMode('i2iangle'));
$('btnModeUpscaleLoop').addEventListener('click', () => switchMode('upscaleloop'));
$('btnOpenWorkflow').addEventListener('click', openWorkflowEditor);
$('btnRandomSeed').addEventListener('click', randomSeed);
$('btnGenerateNormal').addEventListener('click', generateImageNormal);
$('btnGenerateLoop').addEventListener('click', generateImageLoop);
$('btnGenerateI2I').addEventListener('click', generateImageI2I);
$('btnGenerateI2ILoop').addEventListener('click', generateImageI2ILoop);
$('btnGenerateI2IAngle').addEventListener('click', generateImageI2IAngle);
$('btnGenerateUpscaleLoop').addEventListener('click', generateImageUpscaleLoop);
$('btnCancelNormal').addEventListener('click', cancelGeneration);
$('btnCancelLoop').addEventListener('click', cancelGeneration);
$('btnCancelI2I').addEventListener('click', cancelGeneration);
$('btnCancelI2ILoop').addEventListener('click', cancelGeneration);
$('btnCancelI2IAngle').addEventListener('click', cancelGeneration);
$('btnCancelUpscaleLoop').addEventListener('click', cancelGeneration);
$('width').addEventListener('change', (e) => normalizeImageSize(e.target));
$('height').addEventListener('change', (e) => normalizeImageSize(e.target));
$('btnTabBasic').addEventListener('click', () => switchTab('basic'));
$('btnTabAdvanced').addEventListener('click', () => switchTab('advanced'));
$('btnClearImages').addEventListener('click', clearGeneratedImages);
$('btnDownloadAll').addEventListener('click', downloadAllImages);
$('metadataOpacity').addEventListener('input', (e) => { $('metadataOpacityValue').textContent = e.target.value + '%'; });
$('metadataFont').addEventListener('change', (e) => { e.target.style.fontFamily = e.target.value; });
$('metadataFont').style.fontFamily = $('metadataFont').value;
$('imageModal').addEventListener('click', (e) => { if (e.target === $('imageModal') || e.target === $('imageModalInner')) closeImageModal(); });
$('modalImage').addEventListener('click', toggleImageZoom);
$('imageModalInner').addEventListener('wheel', handleModalWheel, { passive: false });
document.querySelector('.image-modal-close').addEventListener('click', closeImageModal);
$('loopPositivePrompts').addEventListener('input', updateLoopLineCount);
$('loopNegativePrompts').addEventListener('input', updateLoopLineCount);
$('i2iloopPositivePrompts').addEventListener('input', updateI2ILoopLineCount);
$('i2iloopNegativePrompts').addEventListener('input', updateI2ILoopLineCount);
$('i2ianglePrompts').addEventListener('input', updateI2IAngleLineCount);
updateLoopLineCount();
updateI2ILoopLineCount();
updateI2IAngleLineCount();
setupI2IImageUpload('i2iImageInput', 'i2iImagePreview', 'i2iImageUploadArea', () => i2iUploadedFileNames, (names) => { i2iUploadedFileNames = names; }, 'i2iImageCount');
setupI2IImageUpload('i2iloopImageInput', 'i2iloopImagePreview', 'i2iloopImageUploadArea', () => i2iloopUploadedFileNames, (names) => { i2iloopUploadedFileNames = names; }, 'i2iloopImageCount');
setupI2IImageUpload('i2iangleImageInput', 'i2iangleImagePreview', 'i2iangleImageUploadArea', () => i2iangleUploadedFileNames, (names) => { i2iangleUploadedFileNames = names; }, 'i2iangleImageCount');
setupI2IImageUpload('upscaleloopImageInput', 'upscaleloopImagePreview', 'upscaleloopImageUploadArea', () => upscaleloopUploadedFileNames, (names) => { upscaleloopUploadedFileNames = names; }, 'upscaleloopImageCount');
$('i2iangleImageInput').addEventListener('change', (e) => {
const file = e.target.files[0];
if (file && cameraWidgetInstance) {
const reader = new FileReader();
reader.onload = (ev) => cameraWidgetInstance.updateImage(ev.target.result);
reader.readAsDataURL(file);
}
});
$('btnAddAnglePrompt').addEventListener('click', addAnglePromptFromWidget);
initCameraWidget();
if (!$('i2ianglePrompts').value.trim()) {
$('i2ianglePrompts').value = '<sks> front view eye-level shot medium shot';
updateI2IAngleLineCount();
}
hookWorkflowRepository();
setupPromptWeightAdjustment();
promptHistoryManager.setupAllHistoryButtons();
try { await checkComfyUIConnection(); setInterval(checkComfyUIConnection, 5000); Comfyui_connect(); await updateWorkflowDisplays(); } catch (error) { createToastError(I18nManager.t('toast.initError'), I18nManager.t('toast.comfyuiConnectionFailed')); }
});
