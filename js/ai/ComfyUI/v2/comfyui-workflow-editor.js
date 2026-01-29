class ComfyUIWorkflowEditor {
constructor() {
this.tabs = new Map();
this.nodeTypes = null;
this.activeTabId = null;
}

async updateObjectInfoAndWorkflows() {
try {
const response = await fetch(comfyUIUrls.objectInfoOnly);
if (!response.ok) {
throw new Error(`ObjectInfo取得失敗: ステータス ${response.status}`);
}

this.nodeTypes = await response.json();
await objectInfoRepository.saveObjectInfo(this.nodeTypes);
workflowLogger.debug("updateObjectInfoAndWorkflows");

this.tabs.forEach((tab) => {
tab.renderNodes();
});
} catch (error) {
console.error("ObjectInfoとWorkflowの更新中にエラー:", error);
}
}


async initialize() {
this.nodeTypes = await objectInfoRepository.getObjectInfo();
// if (!this.nodeTypes) {
//   console.info("set default ObjectInfo");
//   this.nodeTypes = defaultObjectInfo;
// }

this.setupFileInput();
this.setupTabEvents();

await this.addDefaultWorkflows();
const workflows = await comfyUIWorkflowRepository.getAllWorkflows();

let enabledT2ITabId = null;
let enabledOtherTabId = null;
let firstTabId = null;

for (const workflowData of workflows) {
const { id, name, workflowJson, type, enabled } = workflowData;
const file = new File([JSON.stringify(workflowJson)], name, {
type: "application/json",
});

if (!workflowJson.id) {
workflowJson.id = id;
}

try {
await this.createTab(file, id, type, enabled);
if (enabled) {
if (type === 'T2I' && !enabledT2ITabId) {
enabledT2ITabId = id;
} else if (!enabledOtherTabId) {
enabledOtherTabId = id;
}
}
if (!firstTabId) {
firstTabId = id;
}
} catch (error) {
console.error(`ワークフロー "${name}" の読み込みに失敗しました:`, error);
}
}

const enabledTabId = enabledT2ITabId || enabledOtherTabId;


if (enabledTabId) {
this.activeTabId = enabledTabId;
const enabledTab = this.tabs.get(enabledTabId);
if (enabledTab) {
this.tabs.forEach((tab) => {
if (tab.id !== enabledTabId) {
tab.deactivate();
}
});
enabledTab.activate();
}
}else if (firstTabId) {
this.activeTabId = firstTabId;
const firstTab = this.tabs.get(firstTabId);
if (firstTab) {
firstTab.enabled = true;
firstTab.saveWorkflow();
this.onTabEnabledChanged(firstTab.type, firstTabId);

this.tabs.forEach((tab) => {
if (tab.id !== firstTabId) {
tab.deactivate();
}
});
firstTab.activate();
}
}


this.renderTabs();

comfyui_monitorConnection_v2((isOnline) => {
if (isOnline) {
this.updateObjectInfoAndWorkflows();
}
});
}

async addDefaultWorkflows() {
for (const workflow of comfyuiDefaultWorkflows) {
const exists = await comfyUIWorkflowRepository.existsByName(workflow.name);
if (!exists) {
const id = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

await comfyUIWorkflowRepository.saveWorkflow(
workflow.type,
id,
workflow.name,
workflow.workflow,
workflow.enabled
);
}
}
}

setupFileInput() {
const workflowFileInput = document.getElementById("workflowFile");
if (!workflowFileInput) {
console.log('[WorkflowEditor] setupFileInput: workflowFile element not found, skipping');
return;
}
workflowFileInput.addEventListener("change", async (e) => {
const files = Array.from(e.target.files);
for (const file of files) {
await this.createTab(file, null);
}
e.target.value = "";
this.renderTabs();
});
}

renderTabs() {
const tabList = document.getElementById("tabList");
if (!tabList) {
console.log('[WorkflowEditor] renderTabs: tabList element not found, skipping');
return;
}
tabList.innerHTML = "";
const groupedTabs = this.groupTabsByType();

// Also ensure content elements are attached to DOM
const tabContentContainer = document.getElementById("tabContentContainer");
if (tabContentContainer) {
this.tabs.forEach((tab) => {
if (tab.contentElement && !tab.contentElement.parentElement) {
tabContentContainer.appendChild(tab.contentElement);
}
});
}

Object.keys(groupedTabs).forEach((type) => {
const typeSeparator = document.createElement("div");
typeSeparator.className = "comfui-tab-type-separator";
typeSeparator.innerText = type;
tabList.appendChild(typeSeparator);
groupedTabs[type].forEach((tab) => {
const tabButton = tab.createTabButton();
tabList.appendChild(tabButton);
});
});
if (this.activeTabId) this.activateTab(this.activeTabId);
}

async createTab(file, id=null, type="T2I", enabled=false) {
try {
const text = await file.text();
const workflow = JSON.parse(text);

const tab = new ComfyUIWorkflowTab(file, workflow, this, id, type, enabled);
const content = tab.createContent();
const tabContent = document.getElementById("tabContentContainer");
if (tabContent) {
tabContent.appendChild(content);
}
this.tabs.set(tab.id, tab);
this.activateTab(tab.id);
tab.renderNodes();
this.renderTabs();
} catch (error) {
console.error("タブ作成エラー:", error);
}
}

groupTabsByType() {
return Array.from(this.tabs.values()).reduce((groups, tab) => {
const type = tab.type || "T2I";  
if (!groups[type]) groups[type] = [];
groups[type].push(tab);
return groups;
}, {});
}

onTabEnabledChanged(type, tabId) {
this.tabs.forEach((tab) => {
if (tab.workflow.type === type) {
tab.workflow.enabled = tab.id === tabId;
tab.enabled = tab.id === tabId;
}
});

this.renderTabs();
}

setupTabEvents() {
const tabList = document.getElementById("tabList");
if (!tabList) {
console.log('[WorkflowEditor] setupTabEvents: tabList element not found, skipping');
return;
}
tabList.addEventListener("click", (e) => {
const tabButton = e.target.closest(".comfui-tab-button");
if (!tabButton) return;

const tabId = tabButton.dataset.tabId;
const tab = this.tabs.get(tabId);
if (!tab) return;

if (e.target.closest(".comfui-tab-close")) {
this.closeTab(tabId);
} else if (e.target.closest(".comfui-tab-download")) {
tab.downloadWorkflow();
} else {
this.activateTab(tabId);
}
});
}

activateTab(tabId) {
const oldTab = this.tabs.get(this.activeTabId);
if (oldTab) oldTab.deactivate();
const newTab = this.tabs.get(tabId);
if (newTab) {
this.activeTabId = tabId;
newTab.activate();
}
}

async closeTab(tabId) {
const tab = this.tabs.get(tabId);
if (!tab){
workflowLogger.debug("closeTab tab is null");
return;
} 

try {
if (tabId) {
const result = await comfyUIWorkflowRepository.deleteWorkflow(tabId);
if (!result) {
console.error(`Workflow delete is fail. ${tabId}`);
return;
}
}

tab.destroy();
this.tabs.delete(tabId);

if (this.activeTabId === tabId) {
const nextTab = Array.from(this.tabs.keys())[0];
if (nextTab) {
this.activateTab(nextTab);
}
}

this.renderTabs();
} catch (error) {
console.error('タブの削除中にエラーが発生しました:', error);
}
}

getNodeType(className) {
return this.nodeTypes?.[className] || null;
}
}

let comfyUIWorkflowEditor;
document.addEventListener("DOMContentLoaded", async () => {
if (!comfyUIWorkflowEditor) {
comfyUIWorkflowEditor = new ComfyUIWorkflowEditor();
await comfyUIWorkflowEditor.initialize();
}
});