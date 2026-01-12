function removePromptComments(text){
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
function expandWildcards(prompt){
return prompt.replace(/__([^_]+)__/g,function(match,content){
var options=content.split('|').map(function(s){return s.trim();});
return options[Math.floor(Math.random()*options.length)];
});
}
function setupPromptWeightAdjustment(){
var textareas=['prompt','negative_prompt','loopPositivePrompts','loopNegativePrompts'];
textareas.forEach(function(id){
var el=$(id);
if(el){
el.addEventListener('keydown',function(e){
if(e.ctrlKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){
e.preventDefault();
var delta=e.key==='ArrowUp'?0.05:-0.05;
adjustPromptWeight(el,delta);
}
});
}
});
}
function adjustPromptWeight(textarea,delta){
var start=textarea.selectionStart;
var end=textarea.selectionEnd;
if(start===end)return;
var text=textarea.value;
var selectedText=text.substring(start,end);
if(!selectedText)return;
var newText;
var newStart=start;
var newEnd=end;
var weightedMatch=selectedText.match(/^\((.+):([0-9.]+)\)$/);
if(weightedMatch){
var innerText=weightedMatch[1];
var currentWeight=parseFloat(weightedMatch[2]);
var newWeight=Math.round((currentWeight+delta)*100)/100;
if(Math.abs(newWeight-1.0)<0.001){
newText=innerText;
newEnd=start+innerText.length;
}else{
newText='('+innerText+':'+newWeight.toFixed(2)+')';
newEnd=start+newText.length;
}
}else{
var newWeight=Math.round((1.0+delta)*100)/100;
if(Math.abs(newWeight-1.0)<0.001){
newText=selectedText;
}else{
newText='('+selectedText+':'+newWeight.toFixed(2)+')';
newEnd=start+newText.length;
}
}
textarea.value=text.substring(0,start)+newText+text.substring(end);
textarea.setSelectionRange(newStart,newEnd);
textarea.dispatchEvent(new Event('change'));
}
function getRawPromptText(){
if(promptTagify&&promptTagify.DOM&&promptTagify.DOM.input){
return wildcardGetPromptText();
}
var el=$('prompt');
return el?el.value:'';
}
function getRawNegativePromptText(){
var el=$('negative_prompt');
return el?el.value:'';
}
async function processPromptWithWildcard(text){
if(!text)return '';
text=removePromptComments(text);
if(typeof wildcardProcessPrompt==='function'){
return wildcardProcessPrompt(text,0);
}
return text;
}
async function getProcessedPromptForGeneration(){
var rawPrompt=getRawPromptText();
return processPromptWithWildcard(rawPrompt);
}
async function getProcessedNegativePromptForGeneration(){
var rawNegative=getRawNegativePromptText();
return processPromptWithWildcard(rawNegative);
}
async function getProcessedPromptsForGeneration(){
var rawPrompt=getRawPromptText();
var rawNegative=getRawNegativePromptText();
var processedPrompt=await processPromptWithWildcard(rawPrompt);
var processedNegative=await processPromptWithWildcard(rawNegative);
return{
prompt:processedPrompt,
negative_prompt:processedNegative
};
}
function getProcessedPrompt(){
if(typeof wildcardReplaceAndGetPrompt==='function'){
return wildcardReplaceAndGetPrompt();
}
return Promise.resolve($('prompt').value);
}
function getProcessedNegativePrompt(){
var negPrompt=$('negative_prompt').value;
if(typeof wildcardProcessPrompt==='function'){
return wildcardProcessPrompt(negPrompt,0);
}
return Promise.resolve(negPrompt);
}
