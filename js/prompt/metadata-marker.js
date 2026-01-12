async function applyMetadataMarker(imageUrl, prompt) {
const position = $('metadataPosition').value;
const fontSize = parseInt($('metadataFontSize').value) || 14;
const font = $('metadataFont').value;
const fontColor = $('metadataFontColor').value;
const bgColor = $('metadataBgColor').value;
const opacity = parseInt($('metadataOpacity').value) / 100;
const footerText = $('metadataFooterText').value;
const firstLineOnly = $('metadataFirstLineOnly').checked;
let displayText = firstLineOnly ? prompt.split('\n')[0] : prompt;
if (footerText) displayText += '\n' + footerText;
return new Promise(async (resolve) => {
const response = await fetch(imageUrl);
const originalArrayBuffer = await response.arrayBuffer();
const originalData = new Uint8Array(originalArrayBuffer);
const isWebP = originalData[0] === 0x52 && originalData[1] === 0x49 && originalData[2] === 0x46 && originalData[3] === 0x46 && originalData[8] === 0x57 && originalData[9] === 0x45 && originalData[10] === 0x42 && originalData[11] === 0x50;
const isPNG = originalData[0] === 0x89 && originalData[1] === 0x50 && originalData[2] === 0x4E && originalData[3] === 0x47;
let originalMetadata = null;
if (isPNG) {
originalMetadata = { type: 'png', chunks: extractPngTextChunks(originalData) };
} else if (isWebP) {
originalMetadata = { type: 'webp', chunks: extractWebPMetadataChunks(originalData) };
}
const blob = new Blob([originalArrayBuffer], { type: isWebP ? 'image/webp' : 'image/png' });
const img = new Image();
img.onload = () => {
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.font = `${fontSize}px "${font}"`;
const lines = displayText.split('\n');
const lineHeight = fontSize * 1.3;
const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
const textHeight = lines.length * lineHeight;
const padding = 10;
const boxWidth = textWidth + padding * 2;
const boxHeight = textHeight + padding * 2;
let canvasWidth = img.width;
let canvasHeight = img.height;
let imgX = 0, imgY = 0;
let boxX = 0, boxY = 0;
if (position === 'top') {
canvasHeight = img.height + boxHeight;
imgY = boxHeight;
boxX = padding;
boxY = 0;
} else if (position === 'bottom') {
canvasHeight = img.height + boxHeight;
boxX = padding;
boxY = img.height;
} else if (position === 'left') {
canvasWidth = img.width + boxWidth;
imgX = boxWidth;
boxX = 0;
boxY = (canvasHeight - boxHeight) / 2;
} else if (position === 'right') {
canvasWidth = img.width + boxWidth;
boxX = img.width;
boxY = (canvasHeight - boxHeight) / 2;
} else {
boxX = padding;
boxY = (canvasHeight - boxHeight) / 2;
}
canvas.width = canvasWidth;
canvas.height = canvasHeight;
if (position !== 'overlay') {
ctx.fillStyle = bgColor;
ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}
ctx.drawImage(img, imgX, imgY);
ctx.globalAlpha = opacity;
ctx.fillStyle = bgColor;
ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
ctx.globalAlpha = 1;
ctx.fillStyle = fontColor;
ctx.font = `${fontSize}px "${font}"`;
ctx.textBaseline = 'top';
ctx.textAlign = 'left';
lines.forEach((line, i) => {
ctx.fillText(line, boxX + padding, boxY + padding + i * lineHeight);
});
canvas.toBlob(async (newBlob) => {
const newArrayBuffer = await newBlob.arrayBuffer();
let finalBlob;
if (originalMetadata && originalMetadata.type === 'webp' && originalMetadata.chunks.length > 0) {
const finalData = insertWebPMetadataChunks(new Uint8Array(newArrayBuffer), originalMetadata.chunks);
finalBlob = new Blob([finalData], { type: 'image/webp' });
} else if (originalMetadata && originalMetadata.type === 'png' && originalMetadata.chunks.length > 0) {
const finalData = insertPngTextChunks(new Uint8Array(newArrayBuffer), originalMetadata.chunks);
finalBlob = new Blob([finalData], { type: 'image/png' });
} else {
finalBlob = newBlob;
}
resolve(URL.createObjectURL(finalBlob));
}, isWebP ? 'image/webp' : 'image/png');
};
img.src = URL.createObjectURL(blob);
});
}
function extractPngTextChunks(data) {
const chunks = [];
const signature = [137, 80, 78, 71, 13, 10, 26, 10];
for (let i = 0; i < 8; i++) {
if (data[i] !== signature[i]) return chunks;
}
let offset = 8;
while (offset < data.length) {
if (offset + 8 > data.length) break;
const length = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
const type = String.fromCharCode(data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7]);
const chunkTotalLength = 4 + 4 + length + 4;
if (offset + chunkTotalLength > data.length) break;
if (type !== 'IHDR' && type !== 'IDAT' && type !== 'IEND') {
const chunkData = new Uint8Array(chunkTotalLength);
for (let j = 0; j < chunkTotalLength; j++) {
chunkData[j] = data[offset + j];
}
chunks.push({ type, data: chunkData });
}
if (type === 'IDAT' || type === 'IEND') break;
offset += chunkTotalLength;
}
return chunks;
}
function insertPngTextChunks(data, chunks) {
if (chunks.length === 0) return data;
let ihdrEndOffset = -1;
let offset = 8;
while (offset < data.length) {
if (offset + 8 > data.length) break;
const length = (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
const type = String.fromCharCode(data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7]);
const chunkTotalLength = 4 + 4 + length + 4;
if (type === 'IHDR') {
ihdrEndOffset = offset + chunkTotalLength;
break;
}
offset += chunkTotalLength;
}
if (ihdrEndOffset === -1) return data;
const beforeChunks = new Uint8Array(ihdrEndOffset);
for (let i = 0; i < ihdrEndOffset; i++) beforeChunks[i] = data[i];
const afterLength = data.length - ihdrEndOffset;
const afterChunks = new Uint8Array(afterLength);
for (let i = 0; i < afterLength; i++) afterChunks[i] = data[ihdrEndOffset + i];
let totalChunkSize = 0;
chunks.forEach(chunk => { totalChunkSize += chunk.data.length; });
const result = new Uint8Array(beforeChunks.length + totalChunkSize + afterChunks.length);
result.set(beforeChunks, 0);
let pos = beforeChunks.length;
chunks.forEach(chunk => {
result.set(chunk.data, pos);
pos += chunk.data.length;
});
result.set(afterChunks, pos);
return result;
}
function extractWebPMetadataChunks(data) {
const chunks = [];
if (data.length < 12) return chunks;
if (!(data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46)) return chunks;
if (!(data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50)) return chunks;
let offset = 12;
while (offset < data.length - 8) {
const chunkType = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
const chunkSize = data[offset + 4] | (data[offset + 5] << 8) | (data[offset + 6] << 16) | (data[offset + 7] << 24);
const paddedSize = chunkSize + (chunkSize % 2);
if (chunkType === 'EXIF' || chunkType === 'XMP ') {
const chunkData = new Uint8Array(8 + paddedSize);
for (let i = 0; i < 8 + paddedSize && offset + i < data.length; i++) {
chunkData[i] = data[offset + i];
}
chunks.push({ type: chunkType, data: chunkData, size: chunkSize });
}
offset += 8 + paddedSize;
}
return chunks;
}
function insertWebPMetadataChunks(data, chunks) {
if (chunks.length === 0) return data;
if (data.length < 12) return data;
if (!(data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46)) return data;
let totalAddSize = 0;
chunks.forEach(chunk => { totalAddSize += chunk.data.length; });
const newFileSize = data.length - 8 + totalAddSize;
const result = new Uint8Array(data.length + totalAddSize);
result.set(data.slice(0, 4), 0);
result[4] = newFileSize & 0xFF;
result[5] = (newFileSize >> 8) & 0xFF;
result[6] = (newFileSize >> 16) & 0xFF;
result[7] = (newFileSize >> 24) & 0xFF;
result.set(data.slice(8, 12), 8);
let hasVP8X = false;
let vp8xOffset = -1;
let offset = 12;
while (offset < data.length - 8) {
const chunkType = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
const chunkSize = data[offset + 4] | (data[offset + 5] << 8) | (data[offset + 6] << 16) | (data[offset + 7] << 24);
if (chunkType === 'VP8X') {
hasVP8X = true;
vp8xOffset = offset;
break;
}
offset += 8 + chunkSize + (chunkSize % 2);
}
if (hasVP8X) {
let writePos = 12;
let readPos = 12;
while (readPos < data.length - 8) {
const chunkType = String.fromCharCode(data[readPos], data[readPos + 1], data[readPos + 2], data[readPos + 3]);
const chunkSize = data[readPos + 4] | (data[readPos + 5] << 8) | (data[readPos + 6] << 16) | (data[readPos + 7] << 24);
const paddedSize = chunkSize + (chunkSize % 2);
const totalChunkSize = 8 + paddedSize;
for (let i = 0; i < totalChunkSize && readPos + i < data.length; i++) {
result[writePos + i] = data[readPos + i];
}
writePos += totalChunkSize;
readPos += totalChunkSize;
if (chunkType === 'VP8X') {
chunks.forEach(chunk => {
result.set(chunk.data, writePos);
writePos += chunk.data.length;
});
}
}
} else {
result.set(data.slice(12), 12 + totalAddSize);
let writePos = 12;
chunks.forEach(chunk => {
result.set(chunk.data, writePos);
writePos += chunk.data.length;
});
}
return result;
}
