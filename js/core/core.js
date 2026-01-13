const $ = (id) => document.getElementById(id);
var socket = null;
const comfyUIuuid = crypto.randomUUID();
var firstComfyConnection = true;
var comfyObjectInfoList = [];
class ComfyUIEndpoints {
#getUrlParts() {
const serverAddress = $('comfyUIPageUrl').value;
const url = new URL(serverAddress);
return { protocol: url.protocol.replace(':', ''), domain: url.hostname, port: url.port || '', wsProtocol: url.protocol === 'https:' ? 'wss' : 'ws' };
}
constructor() { this.urls = this.setupUrlProxy(); }
setupUrlProxy() {
const self = this;
return new Proxy({}, {
get: (target, prop) => {
const { protocol, domain, port, wsProtocol } = self.#getUrlParts();
const baseUrl = `${protocol}://${domain}${port ? ':' + port : ''}`;
const wsUrl = `${wsProtocol}://${domain}${port ? ':' + port : ''}`;
const endpoint = self.getEndpoint(prop);
if (prop === 'ws') return `${wsUrl}/ws`;
return `${baseUrl}${endpoint}`;
}
});
}
getEndpoint(key) {
const endpoints = { settings: '/settings', prompt: '/prompt', history: '/history/', view: '/view', upload: '/upload/image', uploadImage: '/upload/image', objectInfo: '/object_info/', objectInfoOnly: '/object_info' };
return endpoints[key] || '';
}
}
const comfyUIEndpointsInstance = new ComfyUIEndpoints();
const comfyUIUrls = comfyUIEndpointsInstance.urls;
function Comfyui_connect() {
try {
socket = new WebSocket(comfyUIUrls.ws + '?clientId=' + comfyUIuuid);
socket.addEventListener("open", () => { logger.debug("WebSocket connection established"); });
socket.addEventListener("close", () => { socket = null; });
socket.addEventListener("error", () => { socket = null; });
} catch (error) { socket = null; }
}
