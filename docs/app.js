
(function(){
'use strict';
var resources={
 form:[{id:'f-ins',name:'Registro de inspección',version:'v1'},{id:'f-alt',name:'Solicitud interna',version:'v2'}],
 page:[{id:'p-pol',name:'Política de seguridad',version:'v1'},{id:'p-org',name:'Organigrama',version:'v3'}],
 document:[{id:'d-proc',name:'Procedimiento operativo',version:'v2'}],
 list:[{id:'l-pend',name:'Registros pendientes',version:'v1'}]
};
var types=[
{id:'form',name:'Formulario',ico:'▤',defaultAction:'Completar formulario',role:'Empleado'},
{id:'page',name:'Página',ico:'▧',defaultAction:'Leer y confirmar',role:'Empleado'},
{id:'document',name:'Documento',ico:'▣',defaultAction:'Leer y confirmar',role:'Empleado'},
{id:'list',name:'Listado',ico:'▦',defaultAction:'Consultar resultados',role:'Supervisor'},
{id:'review',name:'Revisión',ico:'◎',defaultAction:'Revisar y aprobar',role:'Supervisor'},
{id:'condition',name:'Decisión',ico:'◇',defaultAction:'¿Se aprueba?',role:'Supervisor'},
{id:'notice',name:'Notificación',ico:'✉',defaultAction:'Enviar aviso simulado',role:'Sistema'},
{id:'signature',name:'Acuse / firma',ico:'✎',defaultAction:'Confirmar recepción',role:'Empleado'}
];
var steps=[],selected=null,view='steps',activeTab='editor',published=false,sim={pos:0,role:'Empleado',history:[],returned:false,done:false};
var sequence=1;
var $=function(id){return document.getElementById(id)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})};
function toast(message){var t=$('toast');t.textContent=message;t.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(function(){t.style.display='none'},2900)}
function def(id){return types.find(function(t){return t.id===id})||types[0]}
function res(step){return (resources[step.type]||[]).find(function(r){return r.id===step.resource})}
function catalog(){
$('catalog').innerHTML='<div class="section">Contenido del portal</div>'+types.map(function(t,i){return(i===4?'<div class="section">Acciones del proceso</div>':'')+'<div class="asset" role="button" tabindex="0" draggable="true" data-add="'+esc(t.id)+'"><span class="ic">'+t.ico+'</span>'+esc(t.name)+'<small>＋</small></div>'}).join('');
document.querySelectorAll('[data-add]').forEach(function(el){
el.addEventListener('click',function(){add(el.dataset.add)});
el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();add(el.dataset.add)}});
el.addEventListener('dragstart',function(e){e.dataTransfer.setData('text/plain',el.dataset.add);e.dataTransfer.effectAllowed='copy'});
});
}
function add(type){
var t=def(type),r=(resources[type]||[])[0],step={id:'s'+sequence++,type:type,title:t.defaultAction,role:t.role,resource:r?r.id:null,required:true};
steps.push(step);selected=step.id;published=false;render();toast('Paso agregado. Selecciona su contenido y responsable.');
}
function sample(){
steps=[];sequence=1;
['page','form','review','condition','notice'].forEach(function(t){addSilent(t)});
steps[0].resource='p-pol';steps[0].title='Leer política de seguridad';steps[1].title='Completar inspección';steps[2].title='Validar información';steps[3].title='¿Información correcta?';steps[4].title='Avisar resultado';
selected=steps[1].id;published=false;render();toast('Ejemplo ficticio cargado, sin datos de producción.');
}
function addSilent(type){var t=def(type),r=(resources[type]||[])[0];steps.push({id:'s'+sequence++,type:type,title:t.defaultAction,role:t.role,resource:r?r.id:null,required:true})}
function getSelected(){return steps.find(function(s){return s.id===selected})}
function setTab(tab){
activeTab=tab;['editor','simulation','review'].forEach(function(p){$(p).classList.toggle('hide',p!==tab)});
document.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tab)});
if(tab==='simulation'){renderSim()}if(tab==='review'){checks()}
}
function render(){
$('save-status').textContent=published?'Publicación simulada':'Borrador de demostración';
$('step-count').textContent=steps.length+' pasos · '+(view==='steps'?'edición guiada':'diagrama');
document.querySelectorAll('[data-view]').forEach(function(b){b.classList.toggle('active',b.dataset.view===view)});
$('flow').className='flow '+(view==='diagram'?'diagram':'steps');
var rows=steps.map(function(s,i){
var t=def(s.type),r=res(s);
return '<div class="step '+(selected===s.id?'selected ':'')+(s.type==='condition'?'condition':'')+'" data-step="'+esc(s.id)+'" tabindex="0" role="button" aria-label="Editar paso '+(i+1)+' '+esc(s.title)+'"><div class="row"><span class="number">'+(i+1)+'</span><span class="ic">'+t.ico+'</span><div style="min-width:0;flex:1"><h3>'+esc(s.title)+'</h3><p>'+esc(r?r.name+' · '+r.version:t.name)+' · '+esc(s.role)+'</p></div><div class="act"><button data-move="'+esc(s.id)+'" data-dir="-1" title="Mover arriba">↑</button><button data-move="'+esc(s.id)+'" data-dir="1" title="Mover abajo">↓</button><button data-remove="'+esc(s.id)+'" title="Quitar paso">×</button></div></div>'+(s.type==='condition'?'<div class="branch"><span>✓ Sí → siguiente paso</span><span>↶ No → devolver</span></div>':'')+'</div>';
}).join('');
$('flow').innerHTML=rows+'<div class="drop" id="drop">＋ Arrastra un elemento aquí o selecciónalo en la biblioteca</div>';
document.querySelectorAll('[data-step]').forEach(function(el){el.addEventListener('click',function(e){if(e.target.closest('button'))return;selected=el.dataset.step;render()});el.addEventListener('keydown',function(e){if(e.target===el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selected=el.dataset.step;render()}})});
document.querySelectorAll('[data-move]').forEach(function(el){el.addEventListener('click',function(e){e.stopPropagation();var i=steps.findIndex(function(s){return s.id===el.dataset.move});var j=i+Number(el.dataset.dir);if(j<0||j>=steps.length)return;var temp=steps[i];steps[i]=steps[j];steps[j]=temp;published=false;render()})});
document.querySelectorAll('[data-remove]').forEach(function(el){el.addEventListener('click',function(e){e.stopPropagation();steps=steps.filter(function(s){return s.id!==el.dataset.remove});if(selected===el.dataset.remove)selected=steps.length?steps[0].id:null;published=false;render()})});
var d=$('drop');d.addEventListener('dragover',function(e){e.preventDefault();d.classList.add('over')});d.addEventListener('dragleave',function(){d.classList.remove('over')});d.addEventListener('drop',function(e){e.preventDefault();d.classList.remove('over');var t=e.dataTransfer.getData('text/plain');if(types.some(function(x){return x.id===t}))add(t)});
inspector();
}
function inspector(){
var s=getSelected();if(!s){$('inspector').innerHTML='<div class="empty">Selecciona o agrega un paso de la biblioteca.</div>';return;}
var rr=resources[s.type]||[];var roles=['Empleado','Supervisor','Responsable de calidad','Administrador','Sistema'];
$('inspector').innerHTML='<div class="field"><label for="step-title">¿Qué debe hacer?</label><input id="step-title" value="'+esc(s.title)+'" maxlength="110"></div>'+
(rr.length?'<div class="field"><label for="step-resource">Contenido existente</label><select id="step-resource">'+rr.map(function(x){return '<option value="'+esc(x.id)+'" '+(s.resource===x.id?'selected':'')+'>'+esc(x.name+' · '+x.version)+'</option>'}).join('')+'</select><div class="mini" style="padding-top:5px">Reutiliza el original. No crea copias.</div></div>':'')+
'<div class="field"><label for="step-role">¿Quién lo realiza?</label><select id="step-role">'+roles.map(function(x){return'<option '+(s.role===x?'selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select></div>'+
'<div class="field"><label class="checkline"><input id="step-required" type="checkbox" '+(s.required?'checked':'')+'> Obligatorio para continuar</label></div>'+
'<div class="callout">En producción, roles, referencias y condiciones se validarán en el servidor. La demo sólo representa su comportamiento.</div>';
$('step-title').addEventListener('input',function(e){s.title=e.target.value;published=false;refreshCanvasOnly()});
$('step-role').addEventListener('change',function(e){s.role=e.target.value;published=false;render()});
$('step-required').addEventListener('change',function(e){s.required=e.target.checked;published=false;toast('Obligatoriedad actualizada')});
if(rr.length)$('step-resource').addEventListener('change',function(e){s.resource=e.target.value;published=false;render()});
}
function refreshCanvasOnly(){var k=selected;var input=$('step-title'),a=input.selectionStart,b=input.selectionEnd;render();var newInput=$('step-title');newInput.focus();newInput.setSelectionRange(a,b);selected=k}
function validate(){
var issues=[];
if(!steps.length)issues.push('Agrega al menos un paso.');
steps.forEach(function(s,i){if(!s.title.trim())issues.push('Paso '+(i+1)+': escribe la actividad.');if(!s.role)issues.push('Paso '+(i+1)+': asigna responsable.');if(resources[s.type]&&!res(s))issues.push('Paso '+(i+1)+': selecciona un contenido existente válido.')});
if(steps.some(function(s){return s.type==='condition'})&&!steps.some(function(s){return s.type==='review'}))issues.push('Para este ejemplo, agrega una revisión antes de la decisión.');
return issues;
}
function checks(){
var errors=validate(),list=errors.length?errors.map(function(x){return '<li class="err">✕ '+esc(x)+'</li>'}).join(''):'<li class="ok">✓ Definiciones básicas válidas en la demo local.</li>';
$('checks').innerHTML=list+'<li>○ Pendiente: autorización real de usuarios, concurrencia, publicación en servidor y pruebas de navegador.</li>';
}
function restart(){sim={pos:0,role:'Empleado',history:['Expediente EXP-DEMO-001 iniciado con contenido ficticio.'],returned:false,done:false};renderSim()}
function renderSim(){
$('roles').innerHTML=['Empleado','Supervisor','Responsable de calidad','Administrador','Sistema'].map(function(r){return '<button class="btn '+(r===sim.role?'on':'')+'" data-role-pick="'+esc(r)+'">'+esc(r)+'</button>'}).join('');
document.querySelectorAll('[data-role-pick]').forEach(function(el){el.addEventListener('click',function(){sim.role=el.dataset.rolePick;renderSim()})});
var s=steps[sim.pos];var isDone=sim.done||!s;
$('sim-step').textContent=isDone?'Proceso terminado':s.title+' · Responsable: '+s.role;
$('sim-route').textContent=isDone?'Expediente completado':(sim.pos+1)+' de '+steps.length+' pasos · '+(res(s)?res(s).name:'Acción de proceso');
$('advance').disabled=isDone;
$('return').style.display=!isDone&&s.type==='condition'&&!sim.returned?'inline-block':'none';
$('history').innerHTML=sim.history.map(function(x){return '<li>'+esc(x)+'</li>'}).join('');
if(!isDone&&s.role!==sim.role&&s.role!=='Sistema')$('sim-feedback').innerHTML='<span class="err">Este paso corresponde al rol '+esc(s.role)+'. Cambia de rol para completarlo.</span>';
else $('sim-feedback').textContent=isDone?'Proceso ficticio completado.':'Puedes completar la actividad simulada.';
}
function advance(){
var s=steps[sim.pos];if(!s||sim.done)return;
if(sim.role!==s.role&&s.role!=='Sistema'){toast('Rol incorrecto: corresponde a '+s.role);return;}
sim.history.push(s.role+': '+s.title+(res(s)?' ['+res(s).name+' '+res(s).version+']':'')+' · completado (simulado).');
sim.pos++;if(sim.pos>=steps.length)sim.done=true;
if(!sim.done&&steps[sim.pos].role==='Sistema')sim.role='Sistema';
renderSim();
}
function returnBack(){
var s=steps[sim.pos];if(!s||s.type!=='condition'||sim.returned)return;
if(sim.role!==s.role){toast('Este paso pertenece a '+s.role);return;}
sim.history.push('Supervisor: devolvió para corrección el expediente ficticio.');
var idx=steps.findIndex(function(x){return x.type==='form'});sim.pos=idx>=0?idx:0;sim.role=steps[sim.pos].role;sim.returned=true;renderSim();
}
function publish(){
var errors=validate();setTab('review');if(errors.length){toast('Hay validaciones pendientes. Revisa los errores.');return;}
published=true;render();checks();toast('Publicación SIMULADA en esta sesión. No se activó nada real.');
}
document.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){setTab(b.dataset.tab)})});
document.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){view=b.dataset.view;render()})});
$('sample').addEventListener('click',sample);
$('save').addEventListener('click',function(){toast('Borrador simulado: disponible sólo en esta sesión.');published=false;render()});
$('test').addEventListener('click',function(){if(!steps.length){toast('Primero añade al menos un paso.');return;}restart();setTab('simulation')});
$('publish').addEventListener('click',publish);
$('check').addEventListener('click',checks);
$('back-editor').addEventListener('click',function(){setTab('editor')});
$('advance').addEventListener('click',advance);
$('return').addEventListener('click',returnBack);
$('restart').addEventListener('click',restart);
catalog();sample();restart();setTab('editor');
})();
