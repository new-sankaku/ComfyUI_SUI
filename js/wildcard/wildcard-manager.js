var wildcardStore=localforage.createInstance({name:'ComfyUIWildcard',storeName:'wildcards'});
var wildcardList=[];
var wildcardEditing=null;
var promptTagify=null;
function wildcardUid(){
return Date.now().toString(36)+Math.random().toString(36).substr(2,9);
}
function wildcardInit(){
wildcardStore.keys().then(function(keys){
if(keys.length===0){
var promises=[];
for(var n in wildcardDefaults){
if(wildcardDefaults.hasOwnProperty(n)){
var entry={id:wildcardUid(),name:n,values:wildcardDefaults[n],createdAt:Date.now(),updatedAt:Date.now()};
promises.push(wildcardStore.setItem(n,entry));
}
}
Promise.all(promises).then(function(){
wildcardRefresh().then(function(){
wildcardInitTagify();
});
});
}else{
wildcardRefresh().then(function(){
wildcardInitTagify();
});
}
});
}
function wildcardRefresh(){
wildcardList=[];
return wildcardStore.iterate(function(v){
wildcardList.push(v);
}).then(function(){
wildcardList.sort(function(a,b){return a.name.localeCompare(b.name)});
wildcardRender();
wildcardUpdateTagifyWhitelist();
return wildcardList;
});
}
function wildcardUpdateTagifyWhitelist(){
if(promptTagify){
var wl=[];
for(var i=0;i<wildcardList.length;i++){
wl.push('__'+wildcardList[i].name+'__');
}
promptTagify.whitelist=wl;
}
}
function wildcardRender(){
var c=$('wildcardListContainer');
if(!c)return;
var q=$('wildcardSearchInput')?$('wildcardSearchInput').value.toLowerCase():'';
var list=wildcardList.filter(function(w){return w.name.toLowerCase().indexOf(q)!==-1});
if(list.length===0){
c.innerHTML='<div style="padding:20px;text-align:center;color:#666;">'+I18nManager.t('status.noWildcards')+'</div>';
return;
}
var html='';
for(var i=0;i<list.length;i++){
var w=list[i];
html+='<div class="wildcard-item" onclick="wildcardOpenEditor(\''+w.name+'\')">';
html+='<div class="wildcard-item-name">__'+w.name+'__</div>';
html+='<div class="wildcard-item-count">'+w.values.length+' values</div>';
html+='</div>';
}
c.innerHTML=html;
}
function wildcardFilterList(){
wildcardRender();
}
function wildcardOpenEditor(name){
var modal=$('wildcardEditorModal');
if(!modal)return;
if(name){
var w=null;
for(var i=0;i<wildcardList.length;i++){
if(wildcardList[i].name===name){w=wildcardList[i];break;}
}
if(!w)return;
wildcardEditing=w;
$('wildcardEditName').value=w.name;
$('wildcardEditValues').value=w.values.join('\n');
$('wildcardEditorTitle').textContent=I18nManager.t('wildcard.editWildcard');
$('wildcardDeleteBtn').style.display='inline-flex';
}else{
wildcardEditing=null;
$('wildcardEditName').value='';
$('wildcardEditValues').value='';
$('wildcardEditorTitle').textContent=I18nManager.t('wildcard.newWildcard');
$('wildcardDeleteBtn').style.display='none';
}
modal.classList.add('active');
setTimeout(function(){$('wildcardEditName').focus()},100);
}
function wildcardCloseEditor(){
var modal=$('wildcardEditorModal');
if(modal)modal.classList.remove('active');
wildcardEditing=null;
}
function wildcardSave(){
var name=$('wildcardEditName').value.trim();
var valuesText=$('wildcardEditValues').value;
var lines=valuesText.split('\n');
var values=[];
for(var i=0;i<lines.length;i++){
var v=lines[i].trim();
if(v.length>0)values.push(v);
}
if(!name){
wildcardToast(I18nManager.t('toast.wildcardEnterName'),'error');
return;
}
if(values.length===0){
wildcardToast(I18nManager.t('toast.wildcardEnterValues'),'error');
return;
}
var oldName=wildcardEditing?wildcardEditing.name:null;
var p=Promise.resolve();
if(oldName&&oldName!==name){
p=wildcardStore.removeItem(oldName);
}
p.then(function(){
var entry={
id:wildcardEditing?wildcardEditing.id:wildcardUid(),
name:name,
values:values,
createdAt:wildcardEditing?wildcardEditing.createdAt:Date.now(),
updatedAt:Date.now()
};
return wildcardStore.setItem(name,entry);
}).then(function(){
wildcardCloseEditor();
return wildcardRefresh();
}).then(function(){
wildcardToast(I18nManager.t('toast.wildcardSaved'),'success');
}).catch(function(e){
wildcardToast(I18nManager.t('toast.wildcardSaveFailed')+': '+e.message,'error');
});
}
function wildcardDelete(){
if(!wildcardEditing)return;
if(!confirm(I18nManager.t('confirm.deleteWildcard').replace('{name}',wildcardEditing.name)))return;
wildcardStore.removeItem(wildcardEditing.name).then(function(){
wildcardCloseEditor();
return wildcardRefresh();
}).then(function(){
wildcardToast(I18nManager.t('toast.wildcardDeleted'),'success');
}).catch(function(){
wildcardToast(I18nManager.t('toast.wildcardDeleteFailed'),'error');
});
}
function wildcardInitTagify(){
var input=$('prompt');
if(!input||promptTagify)return;
var wl=[];
for(var i=0;i<wildcardList.length;i++){
wl.push('__'+wildcardList[i].name+'__');
}
promptTagify=new Tagify(input,{
mode:'mix',
pattern:/__/,
tagTextProp:'value',
duplicates:true,
whitelist:wl,
enforceWhitelist:false,
placeholder:input.getAttribute('placeholder')||'',
dropdown:{
enabled:1,
position:'text',
highlightFirst:true,
maxItems:Infinity,
closeOnSelect:true,
placeAbove:false
}
});
promptTagify.on('input',function(e){
if(e.detail.prefix==='__'){
promptTagify.dropdown.show(e.detail.value);
}
});
}
function wildcardGetItem(name){
return wildcardStore.getItem(name);
}
function wildcardSearch(pattern){
var regexStr='^'+pattern.replace(/\*\*/g,'.*').replace(/\*/g,'[^/]*')+'$';
var re=new RegExp(regexStr);
var result=[];
for(var i=0;i<wildcardList.length;i++){
if(re.test(wildcardList[i].name))result.push(wildcardList[i]);
}
return result;
}
function wildcardReloadList(){
wildcardList=[];
return wildcardStore.iterate(function(v){
wildcardList.push(v);
}).then(function(){
wildcardList.sort(function(a,b){return a.name.localeCompare(b.name)});
wildcardUpdateTagifyWhitelist();
return wildcardList;
});
}
function wildcardRemoveComments(text){
if(!text)return '';
var lines=text.split('\n');
var result=[];
for(var i=0;i<lines.length;i++){
var line=lines[i];
var hashIndex=line.indexOf('#');
if(hashIndex!==-1){
line=line.substring(0,hashIndex);
}
result.push(line);
}
return result.join('\n');
}
function wildcardProcessPrompt(text,depth){
if(depth>20)return Promise.reject(new Error('Max depth exceeded'));
return wildcardReloadList().then(function(){
var result=wildcardRemoveComments(text);
result=result.replace(/\{([^{}]+)\}/g,function(match,content){
var options=content.split('|');
return options[Math.floor(Math.random()*options.length)];
});
var wcRegex=/__([a-zA-Z0-9_*\/]+)__/g;
var matches=[];
var m;
while((m=wcRegex.exec(result))!==null){
matches.push({full:m[0],name:m[1],index:m.index});
}
if(matches.length===0){
return result;
}
var promises=[];
for(var i=0;i<matches.length;i++){
(function(match){
var p=match.name;
if(p.indexOf('*')!==-1){
var found=wildcardSearch(p);
var vals=[];
for(var j=0;j<found.length;j++){
vals=vals.concat(found[j].values);
}
promises.push(Promise.resolve({match:match,values:vals}));
}else{
promises.push(wildcardGetItem(p).then(function(w){
return{match:match,values:w?w.values:[]};
}));
}
})(matches[i]);
}
return Promise.all(promises).then(function(results){
for(var i=results.length-1;i>=0;i--){
var r=results[i];
if(r.values.length>0){
var selected=r.values[Math.floor(Math.random()*r.values.length)];
result=result.replace(r.match.full,selected);
}
}
if(result!==text&&(result.indexOf('__')!==-1||result.indexOf('{')!==-1)){
return wildcardProcessPrompt(result,depth+1);
}
return result;
});
});
}
function wildcardGetPromptText(){
if(!promptTagify||!promptTagify.DOM||!promptTagify.DOM.input){
var el=$('prompt');
return el?el.value:'';
}
var inputEl=promptTagify.DOM.input;
var result='';
var nodes=inputEl.childNodes;
for(var i=0;i<nodes.length;i++){
var node=nodes[i];
if(node.nodeType===3){
result+=node.textContent.replace(/\u200B/g,'');
}else if(node.classList&&node.classList.contains('tagify__tag')){
var tagText=node.querySelector('.tagify__tag-text');
if(tagText){
result+=tagText.textContent+', ';
}
}
}
return result.trim().replace(/,\s*$/,'');
}
function wildcardReplaceAndGetPrompt(){
var text=wildcardGetPromptText();
if(!text)return Promise.resolve('');
return wildcardProcessPrompt(text,0);
}
function wildcardImportData(){
var modal=$('wildcardImportModal');
if(modal)modal.classList.add('active');
}
function wildcardCloseImport(){
var modal=$('wildcardImportModal');
if(modal)modal.classList.remove('active');
if($('wildcardImportData'))$('wildcardImportData').value='';
}
function wildcardDoImport(){
try{
var json=$('wildcardImportData').value;
var data=JSON.parse(json);
if(!data.wildcards)throw new Error('Invalid format');
var promises=[];
var count=0;
for(var name in data.wildcards){
if(data.wildcards.hasOwnProperty(name)){
var values=data.wildcards[name];
var entry={
id:wildcardUid(),
name:name,
values:Array.isArray(values)?values:[values],
createdAt:Date.now(),
updatedAt:Date.now()
};
promises.push(wildcardStore.setItem(name,entry));
count++;
}
}
Promise.all(promises).then(function(){
wildcardCloseImport();
return wildcardRefresh();
}).then(function(){
wildcardToast(I18nManager.t('toast.wildcardImported').replace('{count}',count),'success');
});
}catch(e){
wildcardToast(I18nManager.t('toast.wildcardImportFailed')+': '+e.message,'error');
}
}
function wildcardExportData(){
var data={version:1,wildcards:{}};
wildcardStore.iterate(function(v,k){
data.wildcards[k]=v.values;
}).then(function(){
var json=JSON.stringify(data,null,2);
var blob=new Blob([json],{type:'application/json'});
var url=URL.createObjectURL(blob);
var a=document.createElement('a');
a.href=url;
a.download='wildcards.json';
a.click();
URL.revokeObjectURL(url);
wildcardToast(I18nManager.t('toast.wildcardExported'),'success');
});
}
function wildcardClearAll(){
if(!confirm(I18nManager.t('confirm.deleteAllWildcards')))return;
wildcardStore.clear().then(function(){
return wildcardRefresh();
}).then(function(){
wildcardToast(I18nManager.t('toast.wildcardAllDeleted'),'success');
});
}
function wildcardToast(msg,type){
var t=$('wildcardToast');
if(!t)return;
t.textContent=msg;
t.className='wildcard-toast '+type+' active';
setTimeout(function(){t.classList.remove('active')},2500);
}
