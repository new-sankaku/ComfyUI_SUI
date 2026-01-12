var currentModalImageIndex=-1;
function getImageList(){
var items=document.querySelectorAll('.generated-image-item');
var list=[];
for(var i=0;i<items.length;i++){
var url=items[i].dataset.imageUrl||items[i].querySelector('img')?.src;
if(url)list.push(url);
}
return list;
}
function displayGeneratedImage(imageUrl,index,prompt,historyConfig){
var container=$('generatedImageContainer');
var placeholder=$('noImagePlaceholder');
if(placeholder)placeholder.style.display='none';
var scrollTop=container.scrollTop;
var item=document.createElement('div');
item.className='generated-image-item';
var img=document.createElement('img');
img.alt='Generated image '+(index||'');
var metadataEnabled=$('metadataEnabled').checked;
if(metadataEnabled){
applyMetadataMarker(imageUrl,prompt).then(async function(markedUrl){
img.src=markedUrl;
item.dataset.imageUrl=markedUrl;
item.addEventListener('click',function(){openImageModal(markedUrl);});
if(historyConfig&&typeof promptHistoryManager!=='undefined'){
for(var i=0;i<historyConfig.length;i++){
var cfg=historyConfig[i];
if(cfg.text){
await promptHistoryManager.saveToHistory(cfg.fieldId,cfg.text);
await promptHistoryManager.addImageToHistory(cfg.fieldId,cfg.text,markedUrl);
}
}
}
});
}else{
img.src=imageUrl;
item.dataset.imageUrl=imageUrl;
item.addEventListener('click',function(){openImageModal(imageUrl);});
if(historyConfig&&typeof promptHistoryManager!=='undefined'){
(async()=>{
for(var i=0;i<historyConfig.length;i++){
var cfg=historyConfig[i];
if(cfg.text){
await promptHistoryManager.saveToHistory(cfg.fieldId,cfg.text);
await promptHistoryManager.addImageToHistory(cfg.fieldId,cfg.text,imageUrl);
}
}
})();
}
}
var downloadBtn=document.createElement('button');
downloadBtn.className='download-button';
downloadBtn.textContent='DL';
downloadBtn.addEventListener('click',function(e){e.stopPropagation();downloadImage(item.dataset.imageUrl||imageUrl,index);});
var info=document.createElement('div');
info.className='generated-image-info';
var timestamp=new Date().toLocaleTimeString('ja-JP');
info.textContent='#'+(index||container.querySelectorAll('.generated-image-item').length+1)+' - '+timestamp;
item.appendChild(img);
item.appendChild(downloadBtn);
item.appendChild(info);
container.insertBefore(item,container.firstChild);
if(scrollTop>0){
img.onload=function(){
container.scrollTop=scrollTop+item.offsetHeight+8;
};
}
}
var modalZoomScale=1;
function openImageModal(imageUrl){
var modal=$('imageModal');
var modalInner=$('imageModalInner');
var modalImg=$('modalImage');
modalImg.src=imageUrl;
modalImg.style.width='';
modalImg.style.height='';
modalZoomScale=1;
modalInner.classList.remove('zoomed');
modalInner.scrollTop=0;
modalInner.scrollLeft=0;
modal.classList.add('active');
var imageList=getImageList();
currentModalImageIndex=imageList.indexOf(imageUrl);
if(currentModalImageIndex===-1)currentModalImageIndex=0;
updateNavigationButtons();
}
function closeImageModal(){
var modal=$('imageModal');
var modalInner=$('imageModalInner');
modalInner.classList.remove('zoomed');
modal.classList.remove('active');
modalZoomScale=1;
currentModalImageIndex=-1;
}
function toggleImageZoom(e){
e.preventDefault();
e.stopPropagation();
var modalInner=$('imageModalInner');
var modalImg=$('modalImage');
if(modalInner.classList.contains('zoomed')){
modalInner.classList.remove('zoomed');
modalImg.style.width='';
modalImg.style.height='';
modalZoomScale=1;
}else{
var rect=modalImg.getBoundingClientRect();
var clickX=e.clientX-rect.left;
var clickY=e.clientY-rect.top;
var ratioX=clickX/rect.width;
var ratioY=clickY/rect.height;
modalZoomScale=1;
modalImg.style.width=modalImg.naturalWidth+'px';
modalImg.style.height=modalImg.naturalHeight+'px';
modalInner.classList.add('zoomed');
requestAnimationFrame(function(){
var scrollX=(modalImg.naturalWidth*ratioX)-(window.innerWidth/2);
var scrollY=(modalImg.naturalHeight*ratioY)-(window.innerHeight/2);
modalInner.scrollLeft=Math.max(0,scrollX);
modalInner.scrollTop=Math.max(0,scrollY);
});
}
}
function handleModalWheel(e){
var modalInner=$('imageModalInner');
if(!modalInner.classList.contains('zoomed'))return;
e.preventDefault();
var modalImg=$('modalImage');
var rect=modalImg.getBoundingClientRect();
var mouseX=e.clientX-rect.left;
var mouseY=e.clientY-rect.top;
var ratioX=mouseX/rect.width;
var ratioY=mouseY/rect.height;
var delta=e.deltaY>0?0.9:1.1;
var newScale=Math.max(0.1,Math.min(10,modalZoomScale*delta));
modalZoomScale=newScale;
var newWidth=modalImg.naturalWidth*modalZoomScale;
var newHeight=modalImg.naturalHeight*modalZoomScale;
modalImg.style.width=newWidth+'px';
modalImg.style.height=newHeight+'px';
requestAnimationFrame(function(){
var scrollX=(newWidth*ratioX)-e.clientX;
var scrollY=(newHeight*ratioY)-e.clientY;
modalInner.scrollLeft=Math.max(0,scrollX);
modalInner.scrollTop=Math.max(0,scrollY);
});
}
function navigateImage(direction){
var imageList=getImageList();
if(imageList.length===0)return;
currentModalImageIndex+=direction;
if(currentModalImageIndex<0)currentModalImageIndex=imageList.length-1;
if(currentModalImageIndex>=imageList.length)currentModalImageIndex=0;
var modalInner=$('imageModalInner');
var modalImg=$('modalImage');
modalImg.src=imageList[currentModalImageIndex];
modalImg.style.width='';
modalImg.style.height='';
modalZoomScale=1;
modalInner.classList.remove('zoomed');
modalInner.scrollTop=0;
modalInner.scrollLeft=0;
updateNavigationButtons();
}
function updateNavigationButtons(){
var imageList=getImageList();
var prevBtn=$('modalPrevBtn');
var nextBtn=$('modalNextBtn');
var counter=$('modalImageCounter');
if(prevBtn)prevBtn.style.display=imageList.length>1?'flex':'none';
if(nextBtn)nextBtn.style.display=imageList.length>1?'flex':'none';
if(counter){
counter.style.display=imageList.length>1?'block':'none';
counter.textContent=(currentModalImageIndex+1)+' / '+imageList.length;
}
}
function handleModalKeydown(e){
var modal=$('imageModal');
if(!modal.classList.contains('active'))return;
if(e.key==='ArrowLeft'){
e.preventDefault();
navigateImage(-1);
}else if(e.key==='ArrowRight'){
e.preventDefault();
navigateImage(1);
}else if(e.key==='Escape'){
e.preventDefault();
closeImageModal();
}
}
function initImageModalNavigation(){
var modal=$('imageModal');
if(!modal)return;
if($('modalPrevBtn'))return;
var prevBtn=document.createElement('button');
prevBtn.id='modalPrevBtn';
prevBtn.className='image-modal-nav image-modal-prev';
prevBtn.innerHTML='&#10094;';
prevBtn.addEventListener('click',function(e){
e.stopPropagation();
navigateImage(-1);
});
var nextBtn=document.createElement('button');
nextBtn.id='modalNextBtn';
nextBtn.className='image-modal-nav image-modal-next';
nextBtn.innerHTML='&#10095;';
nextBtn.addEventListener('click',function(e){
e.stopPropagation();
navigateImage(1);
});
var counter=document.createElement('div');
counter.id='modalImageCounter';
counter.className='image-modal-counter';
modal.appendChild(prevBtn);
modal.appendChild(nextBtn);
modal.appendChild(counter);
document.addEventListener('keydown',handleModalKeydown);
var modalImg=$('modalImage');
if(modalImg){
modalImg.setAttribute('draggable','false');
modalImg.style.userSelect='none';
modalImg.style.webkitUserSelect='none';
}
var modalInner=$('imageModalInner');
if(modalInner){
modalInner.style.userSelect='none';
modalInner.style.webkitUserSelect='none';
}
var style=document.createElement('style');
style.textContent='.image-modal-nav{position:fixed;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.7);color:#fff;border:none;padding:16px 12px;font-size:24px;cursor:pointer;z-index:3002;transition:background 0.2s;display:flex;align-items:center;justify-content:center;}.image-modal-nav:hover{background:rgba(0,188,212,0.9);}.image-modal-prev{left:20px;border-radius:0 4px 4px 0;}.image-modal-next{right:20px;border-radius:4px 0 0 4px;}.image-modal-counter{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#fff;padding:8px 16px;border-radius:4px;font-size:14px;z-index:3002;}#modalImage{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-user-drag:none;pointer-events:auto;}';
document.head.appendChild(style);
}
async function downloadImage(imageUrl,index){
try{
var response=await fetch(imageUrl);
var blob=await response.blob();
var url=URL.createObjectURL(blob);
var a=document.createElement('a');
a.href=url;
var timestamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
a.download='generated_'+timestamp+'_'+(index||1)+'.png';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}catch(error){console.error('ダウンロードエラー:',error);}
}
function clearGeneratedImages(){
var container=$('generatedImageContainer');
container.innerHTML='<div id="noImagePlaceholder" style="color:#666;text-align:center;padding:20px;"><div style="font-size:48px;margin-bottom:12px;">🖼️</div><div>'+I18nManager.t('status.noGeneratedImages')+'</div></div>';
}
async function downloadAllImages(){
var items=document.querySelectorAll('.generated-image-item');
if(items.length===0)return;
var timestamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
for(var i=0;i<items.length;i++){
var imgUrl=items[i].dataset.imageUrl||items[i].querySelector('img')?.src;
if(!imgUrl)continue;
try{
var response=await fetch(imgUrl);
var blob=await response.blob();
var url=URL.createObjectURL(blob);
var a=document.createElement('a');
a.href=url;
a.download='generated_'+timestamp+'_'+(items.length-i)+'.png';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
await new Promise(function(r){setTimeout(r,200);});
}catch(error){console.error('ダウンロードエラー:',error);}
}
}
document.addEventListener('DOMContentLoaded',function(){
initImageModalNavigation();
});
