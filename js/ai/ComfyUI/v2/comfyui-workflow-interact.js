class ComfyUIWorkflowWindow {
constructor() {
this.element = null;
this.x = 0;
this.y = 0;
}


initializeWindow() {
if (this.element) return;

this.element = document.createElement("div");
this.element.style.position = "fixed";
this.element.style.top = "50%";
this.element.style.left = "50%";
this.element.style.transform = "translate(-50%, -50%)";
this.element.style.backgroundColor = "var(--background-color-A)";
this.element.style.boxShadow = "0 0 0 1px var(--color-border), 0 4px 30px rgba(0, 0, 0, 0.7)";
this.element.style.border = "2px solid var(--color-accent)";
this.element.style.borderRadius = "8px";
this.element.style.display = "none";
this.element.style.width = "97vw";
this.element.style.height = "97vh";
this.element.style.zIndex = "1000";
this.element.style.flexDirection = "column";

const addWorkflowLabel = getText("comfyUI_addWorkflow");
const testGenerate = getText("comfyUI_testGenerate");
const workflowHelp = getText("comfyUI_workflowHelp");
const workflowManagement = getText("comfyUI_workflowManagement");

this.element.innerHTML = `
<div class="comfui-modal-header">
<span class="comfui-modal-title">${workflowManagement}</span>
<button id="closeButton" class="comfui-modal-close">✕</button>
</div>
<div class="comfui-container">
<div class="comfui-sidebar">
<div class="comfui-sidebar-header">
<label class="comfui-file-input-button">
+ ${addWorkflowLabel}
<input type="file" id="workflowFile" accept=".json,.txt" multiple>
</label>
</div>
<div class="comfui-tab-list" id="tabList"></div>
</div>
<div class="comfui-main-content">
<div class="comfui-tab-content-container" id="tabContentContainer"></div>
</div>
<div class="comfui-right-sidebar">
<div id="apiSettingsUrlHelpe">
<label id="ExternalService_Heartbeat_Label_fw">Connection:</label>
</div>
<div id="missingNodesSection" class="comfui-missing-nodes-section" style="display:none;margin-bottom:12px;padding:8px;background:var(--color-error-bg, #3d1f1f);border:1px solid var(--color-error, #ff6b6b);border-radius:4px;">
<div style="font-weight:bold;margin-bottom:6px;color:var(--color-error, #ff6b6b);">${I18nManager.t('workflowEditor.missingNodesTitle')}</div>
<div id="missingNodesList" style="font-size:var(--font-size-small);color:var(--component-text-color);margin-bottom:8px;max-height:100px;overflow-y:auto;"></div>
<button id="autoInstallNodesBtn" class="comfui-sidebar-button" style="background:var(--color-accent);margin-bottom:4px;">${I18nManager.t('errorGuide.autoInstallNodes')}</button>
<button id="rebootComfyUIBtn" class="comfui-sidebar-button" style="display:none;background:var(--color-warning, #f0ad4e);">${I18nManager.t('errorGuide.rebootComfyUI')}</button>
</div>
<div class="comfui-workflow-notice" style="margin-bottom:12px;padding:8px;background:var(--background-color-B);border:var(--boader-color-1px-solid-B);border-radius:4px;font-size:var(--font-size-small);color:var(--component-text-color);line-height:1.5;">
<div style="font-weight:bold;margin-bottom:6px;color:var(--color-accent);">${I18nManager.t('workflowEditor.noticeTitle')}</div>
<div style="margin-bottom:4px;">${I18nManager.t('workflowEditor.noticeItem1')}</div>
<div style="margin-bottom:4px;">${I18nManager.t('workflowEditor.noticeItem2')}</div>
<div style="margin-bottom:4px;">${I18nManager.t('workflowEditor.noticeItem3')}</div>
<div>${I18nManager.t('workflowEditor.noticeItem4')}</div>
</div>
<button id="comfyUIFwGenerateButton" class="comfui-sidebar-button">${testGenerate}</button>
<div id="generatedImageContainer" class="comfui-generated-image-container">
<img id="generatedImage" class="comfui-preview-image hidden">
</div>
<div style="margin-top:12px;padding:8px;background:var(--background-color-B);border:var(--boader-color-1px-solid-B);border-radius:4px;">
<label style="color:var(--component-text-color);font-size:var(--font-size-small);">${workflowHelp}</label>
</div>
</div>
</div>`;

document.body.appendChild(this.element);

const closeButton = this.element.querySelector("#closeButton");
closeButton.addEventListener("click", () => this.hide());

this.setupEventListeners();
}




setupEventListeners() {
interact(this.element)
.draggable({
enabled: false,
ignoreFrom: 'textarea, input[type="text"]',
inertia: true,
modifiers: [
interact.modifiers.restrictRect({
restriction: "parent",
endOnly: true,
}),
],
listeners: {
start: () => {
const rect = this.element.getBoundingClientRect();
this.x = rect.left;
this.y = rect.top;
},
move: (event) => {
this.x += event.dx;
this.y += event.dy;

this.element.style.transform = `translate(0, 0)`;
this.element.style.top = `${this.y}px`;
this.element.style.left = `${this.x}px`;
},
},
})
.resizable({
edges: { left: true, right: true, bottom: true, top: true },
restrictEdges: {
outer: "parent",
endOnly: true,
},
restrictSize: {
min: { width: 400, height: 300 },
},
inertia: true,
})
.on("resizemove", (event) => {
Object.assign(event.target.style, {
width: `${event.rect.width}px`,
height: `${event.rect.height}px`,
});
});

// Auto-install nodes button
const autoInstallBtn = this.element.querySelector("#autoInstallNodesBtn");
const rebootBtn = this.element.querySelector("#rebootComfyUIBtn");
const missingNodesSection = this.element.querySelector("#missingNodesSection");
const missingNodesList = this.element.querySelector("#missingNodesList");

autoInstallBtn.addEventListener("click", async () => {
const nodes = autoInstallBtn.dataset.missingNodes ? JSON.parse(autoInstallBtn.dataset.missingNodes) : [];
if (nodes.length === 0) return;

autoInstallBtn.disabled = true;
autoInstallBtn.textContent = I18nManager.t('errorGuide.installing');

try {
const isAvailable = await ComfyUIManagerAPI.isManagerAvailable();
if (!isAvailable) {
createToastError(
I18nManager.t('errorGuide.managerNotAvailable'),
I18nManager.t('errorGuide.managerNotAvailableDesc')
);
autoInstallBtn.disabled = false;
autoInstallBtn.textContent = I18nManager.t('errorGuide.autoInstallNodes');
return;
}

const result = await ComfyUIManagerAPI.installMissingNodesAndReboot(nodes, false);

if (result.success) {
let msg = I18nManager.t('errorGuide.installQueued').replace('{count}', result.installed.length);
if (result.notFound.length > 0) {
msg += '\n' + I18nManager.t('errorGuide.nodesNotFound').replace('{nodes}', result.notFound.join(', '));
}
createToast(I18nManager.t('errorGuide.installSuccess'), msg);

autoInstallBtn.style.display = 'none';
rebootBtn.style.display = 'block';
} else {
createToastError(
I18nManager.t('errorGuide.installFailed'),
result.message || I18nManager.t('errorGuide.installFailedDesc')
);
autoInstallBtn.disabled = false;
autoInstallBtn.textContent = I18nManager.t('errorGuide.autoInstallNodes');
}
} catch (error) {
console.error('Auto-install error:', error);
createToastError(I18nManager.t('errorGuide.installFailed'), error.message);
autoInstallBtn.disabled = false;
autoInstallBtn.textContent = I18nManager.t('errorGuide.autoInstallNodes');
}
});

rebootBtn.addEventListener("click", async () => {
rebootBtn.disabled = true;
rebootBtn.textContent = I18nManager.t('errorGuide.rebooting');
await ComfyUIManagerAPI.rebootComfyUI();
createToast(
I18nManager.t('errorGuide.rebootInitiated'),
I18nManager.t('errorGuide.rebootInitiatedDesc')
);
setTimeout(() => {
missingNodesSection.style.display = 'none';
rebootBtn.style.display = 'none';
rebootBtn.disabled = false;
rebootBtn.textContent = I18nManager.t('errorGuide.rebootComfyUI');
autoInstallBtn.style.display = 'block';
autoInstallBtn.disabled = false;
autoInstallBtn.textContent = I18nManager.t('errorGuide.autoInstallNodes');
}, 3000);
});

const comfyUIFwGenerateButton = this.element.querySelector("#comfyUIFwGenerateButton");
comfyUIFwGenerateButton.addEventListener("click", async () => {
const tabId = comfyUIWorkflowEditor.activeTabId;
if (!tabId) return;

const tab = comfyUIWorkflowEditor.tabs.get(tabId);
if (!tab) return;

const originalText = comfyUIFwGenerateButton.textContent;
comfyUIFwGenerateButton.classList.add("generating");
comfyUIFwGenerateButton.textContent = I18nManager.t('status.generating');

try {
const prompt = await getProcessedPromptForGeneration();
const negativePrompt = await getProcessedNegativePromptForGeneration();
const width = parseInt($('width').value);
const height = parseInt($('height').value);
const baseSeed = parseInt($('seed').value);
const currentSeed = baseSeed === -1 ? Math.floor(Math.random() * 0xFFFFFFFF) : baseSeed;

const requestData = { prompt: prompt, negative_prompt: negativePrompt, seed: currentSeed, width: width, height: height };
const replacedWorkflow = comfyuiReplacePlaceholders(tab.workflow, requestData, tab.type || 'T2I');

const img = await comfyui_put_queue_v2(replacedWorkflow);
if (!img) return;

const generatedImage = this.element.querySelector("#generatedImage");
generatedImage.src = img;
generatedImage.classList.remove("hidden");
} finally {
comfyUIFwGenerateButton.classList.remove("generating");
comfyUIFwGenerateButton.textContent = originalText;
}
});
}

show() {
if (!this.element) {
this.initializeWindow();
}
this.element.style.display = "flex";
this.checkMissingNodes();
}

checkMissingNodes() {
if (!this.element) return;

const tabId = comfyUIWorkflowEditor?.activeTabId;
if (!tabId) return;

const tab = comfyUIWorkflowEditor.tabs.get(tabId);
if (!tab || !tab.workflow) return;

const missingNodesSection = this.element.querySelector("#missingNodesSection");
const missingNodesList = this.element.querySelector("#missingNodesList");
const autoInstallBtn = this.element.querySelector("#autoInstallNodesBtn");
const rebootBtn = this.element.querySelector("#rebootComfyUIBtn");

if (!missingNodesSection || !missingNodesList) return;

// Get missing nodes from workflow
const missingNodes = [];
for (const [nodeId, node] of Object.entries(tab.workflow)) {
if (node.class_type && notExistsWorkflowNodeVsComfyUI(node.class_type)) {
if (!missingNodes.includes(node.class_type)) {
missingNodes.push(node.class_type);
}
}
}

if (missingNodes.length > 0) {
missingNodesList.innerHTML = missingNodes.map(n => `<div style="padding:2px 0;">• ${n}</div>`).join('');
autoInstallBtn.dataset.missingNodes = JSON.stringify(missingNodes);
autoInstallBtn.style.display = 'block';
autoInstallBtn.disabled = false;
autoInstallBtn.textContent = I18nManager.t('errorGuide.autoInstallNodes');
rebootBtn.style.display = 'none';
missingNodesSection.style.display = 'block';
} else {
missingNodesSection.style.display = 'none';
}
}

hide() {
if (this.element) {
this.element.style.display = "none";
}
}
}
let comfyUIWorkflowWindow = null;