let isComfyUIOnlineGlobal = false;

function updateConnectionStatus(isOnline) {
isComfyUIOnlineGlobal = isOnline;
const indicator = $('connectionIndicator');
const status = $('connectionStatus');
const labelFw = $('ExternalService_Heartbeat_Label_fw');
if (isOnline) {
indicator.classList.add('online');
status.textContent = I18nManager.t('sidebar.online');
if (labelFw) { labelFw.innerHTML = "ComfyUI ON"; labelFw.style.color = "#4caf50"; }
} else {
indicator.classList.remove('online');
status.textContent = I18nManager.t('sidebar.offline');
if (labelFw) { labelFw.innerHTML = "ComfyUI OFF"; labelFw.style.color = "#f44336"; }
}
}

function syncWorkflowEditorConnectionStatus() {
const labelFw = $('ExternalService_Heartbeat_Label_fw');
if (labelFw) {
if (isComfyUIOnlineGlobal) {
labelFw.innerHTML = "ComfyUI ON";
labelFw.style.color = "#4caf50";
} else {
labelFw.innerHTML = "ComfyUI OFF";
labelFw.style.color = "#f44336";
}
}
}
async function checkComfyUIConnection() {
try {
const response = await fetch(comfyUIUrls.settings);
if (response.ok) {
updateConnectionStatus(true);
if (firstComfyConnection) { await loadObjectInfo(); firstComfyConnection = false; }
return true;
}
} catch (error) { updateConnectionStatus(false); }
return false;
}
