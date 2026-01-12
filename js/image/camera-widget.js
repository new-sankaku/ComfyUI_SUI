class CameraWidget {
constructor(canvasContainer, options = {}) {
this.canvasContainer = canvasContainer;
this.promptEl = options.promptEl;
this.resetBtn = options.resetBtn;
this.state = { azimuth: 0, elevation: 0, distance: 5 };
this.liveAzimuth = 0;
this.liveElevation = 0;
this.liveDistance = 5;
this.CENTER = new THREE.Vector3(0, 0.5, 0);
this.AZIMUTH_RADIUS = 1.8;
this.ELEVATION_RADIUS = 1.4;
this.ELEV_ARC_X = -0.8;
this.isDragging = false;
this.dragTarget = null;
this.hoveredHandle = null;
this.raycaster = new THREE.Raycaster();
this.mouse = new THREE.Vector2();
this.time = 0;
this.dragStartDistance = 0;
this.dragStartMouseY = 0;
this.initThreeJS();
this.bindEvents();
this.updateDisplay();
this.animate();
}
initThreeJS() {
const width = this.canvasContainer.clientWidth || 300;
const height = this.canvasContainer.clientHeight || 300;
this.scene = new THREE.Scene();
this.scene.background = new THREE.Color(0x0a0a0f);
this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
this.camera.position.set(4, 3.5, 4);
this.camera.lookAt(0, 0.3, 0);
this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
this.renderer.setSize(width, height);
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
this.canvasContainer.appendChild(this.renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
this.scene.add(ambientLight);
const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(5, 10, 5);
this.scene.add(mainLight);
const fillLight = new THREE.DirectionalLight(0xE93D82, 0.3);
fillLight.position.set(-5, 5, -5);
this.scene.add(fillLight);
this.gridHelper = new THREE.GridHelper(5, 20, 0x1a1a2e, 0x12121a);
this.gridHelper.position.y = -0.01;
this.scene.add(this.gridHelper);
this.createSubject();
this.createCameraIndicator();
this.createAzimuthRing();
this.createElevationArc();
this.createDistanceHandle();
this.updateVisuals();
}
createGridTexture() {
const canvas = document.createElement('canvas');
const size = 256;
canvas.width = size;
canvas.height = size;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#1a1a2a';
ctx.fillRect(0, 0, size, size);
ctx.strokeStyle = '#2a2a3a';
ctx.lineWidth = 1;
const gridSize = 16;
for (let i = 0; i <= size; i += gridSize) {
ctx.beginPath();
ctx.moveTo(i, 0);
ctx.lineTo(i, size);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(0, i);
ctx.lineTo(size, i);
ctx.stroke();
}
const texture = new THREE.CanvasTexture(canvas);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4);
return texture;
}
createSubject() {
const cardThickness = 0.02;
const cardGeo = new THREE.BoxGeometry(1.2, 1.2, cardThickness);
const frontMat = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });
const backMat = new THREE.MeshBasicMaterial({ map: this.createGridTexture() });
const edgeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2a });
const cardMaterials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];
this.imagePlane = new THREE.Mesh(cardGeo, cardMaterials);
this.imagePlane.position.copy(this.CENTER);
this.scene.add(this.imagePlane);
this.planeMat = frontMat;
const frameGeo = new THREE.EdgesGeometry(cardGeo);
const frameMat = new THREE.LineBasicMaterial({ color: 0xE93D82 });
this.imageFrame = new THREE.LineSegments(frameGeo, frameMat);
this.imageFrame.position.copy(this.CENTER);
this.scene.add(this.imageFrame);
const glowRingGeo = new THREE.RingGeometry(0.55, 0.58, 64);
const glowRingMat = new THREE.MeshBasicMaterial({ color: 0xE93D82, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
this.glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
this.glowRing.position.set(0, 0.01, 0);
this.glowRing.rotation.x = -Math.PI / 2;
this.scene.add(this.glowRing);
}
createCameraIndicator() {
const camGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
const camMat = new THREE.MeshStandardMaterial({ color: 0xE93D82, emissive: 0xE93D82, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 });
this.cameraIndicator = new THREE.Mesh(camGeo, camMat);
this.scene.add(this.cameraIndicator);
const camGlowGeo = new THREE.SphereGeometry(0.08, 16, 16);
const camGlowMat = new THREE.MeshBasicMaterial({ color: 0xff6ba8, transparent: true, opacity: 0.8 });
this.camGlow = new THREE.Mesh(camGlowGeo, camGlowMat);
this.scene.add(this.camGlow);
}
createAzimuthRing() {
const azRingGeo = new THREE.TorusGeometry(this.AZIMUTH_RADIUS, 0.04, 16, 100);
const azRingMat = new THREE.MeshBasicMaterial({ color: 0xE93D82, transparent: true, opacity: 0.7 });
this.azimuthRing = new THREE.Mesh(azRingGeo, azRingMat);
this.azimuthRing.rotation.x = Math.PI / 2;
this.azimuthRing.position.y = 0.02;
this.scene.add(this.azimuthRing);
const azHandleGeo = new THREE.SphereGeometry(0.16, 32, 32);
const azHandleMat = new THREE.MeshStandardMaterial({ color: 0xE93D82, emissive: 0xE93D82, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.4 });
this.azimuthHandle = new THREE.Mesh(azHandleGeo, azHandleMat);
this.scene.add(this.azimuthHandle);
const azGlowGeo = new THREE.SphereGeometry(0.22, 16, 16);
const azGlowMat = new THREE.MeshBasicMaterial({ color: 0xE93D82, transparent: true, opacity: 0.2 });
this.azGlow = new THREE.Mesh(azGlowGeo, azGlowMat);
this.scene.add(this.azGlow);
}
createElevationArc() {
const arcPoints = [];
for (let i = 0; i <= 32; i++) {
const angle = (-30 + (90 * i / 32)) * Math.PI / 180;
arcPoints.push(new THREE.Vector3(this.ELEV_ARC_X, this.ELEVATION_RADIUS * Math.sin(angle) + this.CENTER.y, this.ELEVATION_RADIUS * Math.cos(angle)));
}
const arcCurve = new THREE.CatmullRomCurve3(arcPoints);
const elArcGeo = new THREE.TubeGeometry(arcCurve, 32, 0.04, 8, false);
const elArcMat = new THREE.MeshBasicMaterial({ color: 0x00FFD0, transparent: true, opacity: 0.8 });
this.elevationArc = new THREE.Mesh(elArcGeo, elArcMat);
this.scene.add(this.elevationArc);
const elHandleGeo = new THREE.SphereGeometry(0.16, 32, 32);
const elHandleMat = new THREE.MeshStandardMaterial({ color: 0x00FFD0, emissive: 0x00FFD0, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.4 });
this.elevationHandle = new THREE.Mesh(elHandleGeo, elHandleMat);
this.scene.add(this.elevationHandle);
const elGlowGeo = new THREE.SphereGeometry(0.22, 16, 16);
const elGlowMat = new THREE.MeshBasicMaterial({ color: 0x00FFD0, transparent: true, opacity: 0.2 });
this.elGlow = new THREE.Mesh(elGlowGeo, elGlowMat);
this.scene.add(this.elGlow);
}
createDistanceHandle() {
const distHandleGeo = new THREE.SphereGeometry(0.15, 32, 32);
const distHandleMat = new THREE.MeshStandardMaterial({ color: 0xFFB800, emissive: 0xFFB800, emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.3 });
this.distanceHandle = new THREE.Mesh(distHandleGeo, distHandleMat);
this.scene.add(this.distanceHandle);
const distGlowGeo = new THREE.SphereGeometry(0.22, 16, 16);
const distGlowMat = new THREE.MeshBasicMaterial({ color: 0xFFB800, transparent: true, opacity: 0.25 });
this.distGlow = new THREE.Mesh(distGlowGeo, distGlowMat);
this.scene.add(this.distGlow);
}
updateDistanceLine(start, end) {
if (this.distanceTube) {
this.scene.remove(this.distanceTube);
this.distanceTube.geometry.dispose();
this.distanceTube.material.dispose();
}
const path = new THREE.LineCurve3(start, end);
const tubeGeo = new THREE.TubeGeometry(path, 1, 0.025, 8, false);
const tubeMat = new THREE.MeshBasicMaterial({ color: 0xFFB800, transparent: true, opacity: 0.8 });
this.distanceTube = new THREE.Mesh(tubeGeo, tubeMat);
this.scene.add(this.distanceTube);
}
updateVisuals() {
const azRad = (this.liveAzimuth * Math.PI) / 180;
const elRad = (this.liveElevation * Math.PI) / 180;
const visualDist = 2.6 - (this.liveDistance / 10) * 2.0;
const camX = visualDist * Math.sin(azRad) * Math.cos(elRad);
const camY = this.CENTER.y + visualDist * Math.sin(elRad);
const camZ = visualDist * Math.cos(azRad) * Math.cos(elRad);
this.cameraIndicator.position.set(camX, camY, camZ);
this.cameraIndicator.lookAt(this.CENTER);
this.cameraIndicator.rotateX(Math.PI / 2);
this.camGlow.position.copy(this.cameraIndicator.position);
const azX = this.AZIMUTH_RADIUS * Math.sin(azRad);
const azZ = this.AZIMUTH_RADIUS * Math.cos(azRad);
this.azimuthHandle.position.set(azX, 0.16, azZ);
this.azGlow.position.copy(this.azimuthHandle.position);
const elY = this.CENTER.y + this.ELEVATION_RADIUS * Math.sin(elRad);
const elZ = this.ELEVATION_RADIUS * Math.cos(elRad);
this.elevationHandle.position.set(this.ELEV_ARC_X, elY, elZ);
this.elGlow.position.copy(this.elevationHandle.position);
const distT = 0.15 + ((10 - this.liveDistance) / 10) * 0.7;
this.distanceHandle.position.lerpVectors(this.CENTER, this.cameraIndicator.position, distT);
this.distGlow.position.copy(this.distanceHandle.position);
this.updateDistanceLine(this.CENTER.clone(), this.cameraIndicator.position.clone());
this.glowRing.rotation.z += 0.005;
}
bindEvents() {
const canvas = this.renderer.domElement;
canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
window.addEventListener('mousemove', (e) => this.onPointerMove(e));
window.addEventListener('mouseup', () => this.onPointerUp());
canvas.addEventListener('touchstart', (e) => {
e.preventDefault();
this.onPointerDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
}, { passive: false });
window.addEventListener('touchmove', (e) => {
if (this.isDragging) {
e.preventDefault();
this.onPointerMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
}
}, { passive: false });
window.addEventListener('touchend', () => this.onPointerUp());
window.addEventListener('resize', () => this.onResize());
if (this.resetBtn) {
this.resetBtn.addEventListener('click', () => this.resetToDefaults());
}
}
getMousePos(event) {
const rect = this.renderer.domElement.getBoundingClientRect();
this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}
setHandleScale(handle, glow, scale) {
handle.scale.setScalar(scale);
if (glow) glow.scale.setScalar(scale);
}
onPointerDown(event) {
this.getMousePos(event);
this.raycaster.setFromCamera(this.mouse, this.camera);
const handles = [
{ mesh: this.azimuthHandle, glow: this.azGlow, name: 'azimuth' },
{ mesh: this.elevationHandle, glow: this.elGlow, name: 'elevation' },
{ mesh: this.distanceHandle, glow: this.distGlow, name: 'distance' }
];
for (const h of handles) {
if (this.raycaster.intersectObject(h.mesh).length > 0) {
this.isDragging = true;
this.dragTarget = h.name;
this.setHandleScale(h.mesh, h.glow, 1.3);
this.renderer.domElement.style.cursor = 'grabbing';
if (h.name === 'distance') {
this.dragStartDistance = this.liveDistance;
this.dragStartMouseY = this.mouse.y;
}
return;
}
}
}
onPointerMove(event) {
this.getMousePos(event);
this.raycaster.setFromCamera(this.mouse, this.camera);
if (!this.isDragging) {
const handles = [
{ mesh: this.azimuthHandle, glow: this.azGlow, name: 'azimuth' },
{ mesh: this.elevationHandle, glow: this.elGlow, name: 'elevation' },
{ mesh: this.distanceHandle, glow: this.distGlow, name: 'distance' }
];
let foundHover = null;
for (const h of handles) {
if (this.raycaster.intersectObject(h.mesh).length > 0) {
foundHover = h;
break;
}
}
if (this.hoveredHandle && this.hoveredHandle !== foundHover) {
this.setHandleScale(this.hoveredHandle.mesh, this.hoveredHandle.glow, 1.0);
}
if (foundHover) {
this.setHandleScale(foundHover.mesh, foundHover.glow, 1.15);
this.renderer.domElement.style.cursor = 'grab';
this.hoveredHandle = foundHover;
} else {
this.renderer.domElement.style.cursor = 'default';
this.hoveredHandle = null;
}
return;
}
const plane = new THREE.Plane();
const intersect = new THREE.Vector3();
if (this.dragTarget === 'azimuth') {
plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0));
if (this.raycaster.ray.intersectPlane(plane, intersect)) {
let angle = Math.atan2(intersect.x, intersect.z) * (180 / Math.PI);
if (angle < 0) angle += 360;
this.liveAzimuth = Math.max(0, Math.min(360, angle));
this.state.azimuth = Math.round(this.liveAzimuth);
this.updateDisplay();
this.updateVisuals();
}
} else if (this.dragTarget === 'elevation') {
const elevPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -this.ELEV_ARC_X);
if (this.raycaster.ray.intersectPlane(elevPlane, intersect)) {
const relY = intersect.y - this.CENTER.y;
const relZ = intersect.z;
let angle = Math.atan2(relY, relZ) * (180 / Math.PI);
angle = Math.max(-30, Math.min(60, angle));
this.liveElevation = angle;
this.state.elevation = Math.round(this.liveElevation);
this.updateDisplay();
this.updateVisuals();
}
} else if (this.dragTarget === 'distance') {
const deltaY = this.mouse.y - this.dragStartMouseY;
const sensitivity = 3;
const newDist = this.dragStartDistance - deltaY * sensitivity;
this.liveDistance = Math.max(0, Math.min(10, newDist));
this.state.distance = Math.round(this.liveDistance * 10) / 10;
this.updateDisplay();
this.updateVisuals();
}
}
onPointerUp() {
if (this.isDragging) {
const handles = [
{ mesh: this.azimuthHandle, glow: this.azGlow },
{ mesh: this.elevationHandle, glow: this.elGlow },
{ mesh: this.distanceHandle, glow: this.distGlow }
];
handles.forEach(h => this.setHandleScale(h.mesh, h.glow, 1.0));
}
this.isDragging = false;
this.dragTarget = null;
this.renderer.domElement.style.cursor = 'default';
}
onResize() {
const w = this.canvasContainer.clientWidth;
const h = this.canvasContainer.clientHeight;
if (w === 0 || h === 0) return;
this.camera.aspect = w / h;
this.camera.updateProjectionMatrix();
this.renderer.setSize(w, h);
}
animate() {
requestAnimationFrame(() => this.animate());
this.time += 0.01;
const pulse = 1 + Math.sin(this.time * 2) * 0.03;
this.camGlow.scale.setScalar(pulse);
this.glowRing.rotation.z += 0.003;
this.renderer.render(this.scene, this.camera);
}
generatePrompt() {
const hAngle = this.state.azimuth % 360;
let hDirection;
if (hAngle < 22.5 || hAngle >= 337.5) {
hDirection = "front view";
} else if (hAngle < 67.5) {
hDirection = "front-right quarter view";
} else if (hAngle < 112.5) {
hDirection = "right side view";
} else if (hAngle < 157.5) {
hDirection = "back-right quarter view";
} else if (hAngle < 202.5) {
hDirection = "back view";
} else if (hAngle < 247.5) {
hDirection = "back-left quarter view";
} else if (hAngle < 292.5) {
hDirection = "left side view";
} else {
hDirection = "front-left quarter view";
}
let vDirection;
if (this.state.elevation < -15) {
vDirection = "low-angle shot";
} else if (this.state.elevation < 15) {
vDirection = "eye-level shot";
} else if (this.state.elevation < 45) {
vDirection = "elevated shot";
} else {
vDirection = "high-angle shot";
}
let distance;
if (this.state.distance < 2) {
distance = "wide shot";
} else if (this.state.distance < 6) {
distance = "medium shot";
} else {
distance = "close-up";
}
return `<sks> ${hDirection} ${vDirection} ${distance}`;
}
updateDisplay() {
if (this.hValueEl) this.hValueEl.textContent = `${Math.round(this.state.azimuth)}°`;
if (this.vValueEl) this.vValueEl.textContent = `${Math.round(this.state.elevation)}°`;
if (this.zValueEl) this.zValueEl.textContent = this.state.distance.toFixed(1);
if (this.promptEl) this.promptEl.textContent = this.generatePrompt();
this.syncDropdowns();
}
syncDropdowns() {
}
resetToDefaults() {
this.state.azimuth = 0;
this.state.elevation = 0;
this.state.distance = 5;
this.liveAzimuth = 0;
this.liveElevation = 0;
this.liveDistance = 5;
this.updateVisuals();
this.updateDisplay();
}
updateImage(url) {
if (url) {
const img = new Image();
img.onload = () => {
const tex = new THREE.Texture(img);
tex.needsUpdate = true;
this.planeMat.map = tex;
this.planeMat.color.set(0xffffff);
this.planeMat.needsUpdate = true;
const ar = img.width / img.height;
const maxSize = 1.5;
let scaleX, scaleY;
if (ar > 1) {
scaleX = maxSize;
scaleY = maxSize / ar;
} else {
scaleY = maxSize;
scaleX = maxSize * ar;
}
this.imagePlane.scale.set(scaleX, scaleY, 1);
this.imageFrame.scale.set(scaleX, scaleY, 1);
};
img.src = url;
}
}
}
let cameraWidgetInstance = null;
function initCameraWidget() {
const container = $('cameraWidgetCanvas');
if (!container) return;
try {
cameraWidgetInstance = new CameraWidget(container, {
promptEl: $('cameraWidgetPrompt'),
resetBtn: $('cameraWidgetReset')
});
} catch (e) {
console.error('CameraWidget creation failed:', e);
}
}
function addAnglePromptFromWidget() {
if (!cameraWidgetInstance) return;
const prompt = cameraWidgetInstance.generatePrompt();
const textarea = $('i2ianglePrompts');
if (textarea) {
const currentValue = textarea.value.trim();
if (currentValue) {
textarea.value = currentValue + '\n' + prompt;
} else {
textarea.value = prompt;
}
textarea.dispatchEvent(new Event('input'));
textarea.dispatchEvent(new Event('change'));
}
}
