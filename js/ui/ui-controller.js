function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.menu-button[data-mode]').forEach((btn) => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.querySelectorAll('.mode-config-content').forEach((el) => el.classList.remove('active'));
    const modeNameKeys = {
        normal: 'modes.t2i',
        loop: 'modes.t2iLoop',
        wildcard: 'modes.t2i',
        i2i: 'modes.i2i',
        i2iloop: 'modes.i2iLoop',
        i2iangle: 'modes.i2iAngle',
        upscaleloop: 'modes.upscaleLoop',
        rembgloop: 'modes.rembgLoop',
        t2a: 'modes.t2a',
    };
    $('modeConfigTitle').textContent = I18nManager.t(modeNameKeys[mode]);
    const configMap = {
        normal: 'normalModeConfig',
        loop: 'loopModeConfig',
        wildcard: 'wildcardModeConfig',
        i2i: 'i2iModeConfig',
        i2iloop: 'i2iloopModeConfig',
        i2iangle: 'i2iangleModeConfig',
        upscaleloop: 'upscaleloopModeConfig',
        rembgloop: 'rembgloopModeConfig',
        t2a: 't2aModeConfig',
    };
    if (configMap[mode]) $(configMap[mode]).classList.add('active');
    updateTabDisabledStates(mode);
}
function updateTabDisabledStates(mode) {
    const disabledTabsMap = {
        normal: ['t2a'],
        loop: ['t2a'],
        i2i: ['basic', 't2a'],
        i2iloop: ['basic', 't2a'],
        i2iangle: ['basic', 't2a'],
        upscaleloop: ['basic', 't2a'],
        rembgloop: ['basic', 't2a'],
        t2a: ['basic'],
    };
    const disabled = disabledTabsMap[mode] || [];
    document.querySelectorAll('.center-tab').forEach((tab) => {
        if (disabled.includes(tab.dataset.tab)) {
            tab.classList.add('tab-disabled');
        } else {
            tab.classList.remove('tab-disabled');
        }
    });
    const activeTab = document.querySelector('.center-tab.active');
    if (activeTab && activeTab.classList.contains('tab-disabled')) {
        if (mode === 't2a') switchTab('t2a');
        else if (!disabled.includes('basic')) switchTab('basic');
        else switchTab('advanced');
    }
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
function closeWorkflowEditor() {
    if (window.comfyUIWorkflowWindow) window.comfyUIWorkflowWindow.hide();
}
function randomSeed() {
    $('seed').value = Math.floor(Math.random() * 0xffffffff);
}
function clearForm() {
    $('prompt').value = '';
    $('negative_prompt').value = '';
    $('seed').value = '-1';
    $('width').value = '1024';
    $('height').value = '1024';
}
function switchTab(tabName) {
    const tab = document.querySelector(`.center-tab[data-tab="${tabName}"]`);
    if (tab && tab.classList.contains('tab-disabled')) return;
    document.querySelectorAll('.center-tab').forEach((btn) => btn.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
    $('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Content').classList.add('active');
}
function setWorkflowDisplayName(elementId, name) {
    const element = $(elementId);
    if (!element) return;
    const nameElement = element.querySelector('.workflow-select-name') || element;
    nameElement.textContent = name;
    nameElement.title = name;
}
async function updateWorkflowDisplays() {
    try {
        const workflows = await comfyUIWorkflowRepository.getAllWorkflows();
        const t2iWorkflow = workflows.find((w) => w.type === 'T2I' && w.enabled);
        const i2iWorkflow = workflows.find((w) => w.type === 'I2I' && w.enabled);
        const i2iAngleWorkflow = workflows.find((w) => w.type === 'I2I_Angle' && w.enabled);
        const upscaleWorkflow = workflows.find((w) => w.type === 'Upscaler' && w.enabled);
        const rembgWorkflow = workflows.find((w) => w.type === 'REMBG' && w.enabled);
        const t2aWorkflow = workflows.find((w) => w.type === 'T2A' && w.enabled);
        const t2iName = t2iWorkflow ? t2iWorkflow.name : I18nManager.t('config.notSelected');
        const i2iName = i2iWorkflow ? i2iWorkflow.name : I18nManager.t('config.notSelected');
        const i2iAngleName = i2iAngleWorkflow ? i2iAngleWorkflow.name : I18nManager.t('config.notSelected');
        const upscaleName = upscaleWorkflow ? upscaleWorkflow.name : I18nManager.t('config.notSelected');
        const rembgName = rembgWorkflow ? rembgWorkflow.name : I18nManager.t('config.notSelected');
        const t2aName = t2aWorkflow ? t2aWorkflow.name : I18nManager.t('config.notSelected');
        setWorkflowDisplayName('normalWorkflowDisplay', t2iName);
        setWorkflowDisplayName('loopWorkflowDisplay', t2iName);
        setWorkflowDisplayName('i2iWorkflowDisplay', i2iName);
        setWorkflowDisplayName('i2iloopWorkflowDisplay', i2iName);
        setWorkflowDisplayName('i2iangleWorkflowDisplay', i2iAngleName);
        setWorkflowDisplayName('upscaleloopWorkflowDisplay', upscaleName);
        setWorkflowDisplayName('rembgloopWorkflowDisplay', rembgName);
        setWorkflowDisplayName('t2aWorkflowDisplay', t2aName);
        $('activeWorkflow').textContent =
            currentMode === 't2a'
                ? t2aName
                : currentMode === 'i2iangle'
                  ? i2iAngleName
                  : currentMode.startsWith('i2i')
                    ? i2iName
                    : currentMode === 'upscaleloop'
                      ? upscaleName
                      : currentMode === 'rembgloop'
                        ? rembgName
                        : t2iName;
    } catch (error) {
        console.error('ワークフロー表示更新エラー:', error);
    }
}
function hookWorkflowRepository() {
    const originalSaveWorkflow = comfyUIWorkflowRepository.saveWorkflow.bind(comfyUIWorkflowRepository);
    comfyUIWorkflowRepository.saveWorkflow = async function (...args) {
        const result = await originalSaveWorkflow(...args);
        await updateWorkflowDisplays();
        return result;
    };
}
