/* Qualitra · SyStudio FL-003 · DEMO pública con datos ficticios; NO backend */
(function(){
'use strict';
var M=window.QUALITRA_MODEL;if(!M){document.body.textContent='No se cargó el modelo de la demostración.';return}
var state=M.load(),ui={page:'home',role:'Administrador',field:null,preview:false,selectedRecord:null,selectedTask:null,search:'',filter:'all',columnsOpen:false,flowMode:'steps',flowSelected:null};
var types=[['text','Texto','T'],['textarea','Texto largo','¶'],['number','Número','№'],['date','Fecha','▦'],['select','Selección','⌄'],['relation','Relación entre registros','↗'],['repeater','Grupo anidado/repetible','▤'],['calculation','Resultado calculado','∑'],['conditional','Campo condicional','◇'],['file','Archivo o evidencia','▣']];
var kinds=[['form','Formulario','▤'],['page','Página','▧'],['review','Revisión','◎'],['condition','Decisión','◇'],['notice','Notificación','✉'],['signature','Acuse / firma','✎']];
var columns=[['id','Folio'],['provider','Proveedor'],['date','Fecha'],['score','Calificación'],['status','Estado'],['notes','Comentarios'],['region','Región'],['evidence','Evidencia']];
var titles={home:['Inicio','Un mismo expediente, varios departamentos.'],builder:['Diseñar formularios','Campos ricos, cálculos y relaciones desde un constructor visual.'],capture:['Capturar evaluación','El registro se relaciona con un proveedor y puede enviarse a revisión.'],results:['Listados de resultados','Una vista configurable sobre los mismos registros y relaciones.'],pending:['Mis pendientes','Trabajo por responsable sin recapturar información.'],workflow:['Procesos de trabajo','Pasos guiados y diagrama de un mismo proceso.'],documents:['Documentos y acuses','Contenido versionado vinculado a confirmaciones de lectura.']};
function $(s){return document.querySelector(s)}
function $$(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
function esc(s){return String(s===null||s===undefined?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]})}
function notify(t){var el=$('#toast');el.textContent=t;el.classList.remove('hidden');clearTimeout(notify.timer);notify.timer=setTimeout(function(){el.classList.add('hidden')},3300)}
function persist(show){var ok=M.save(state);$('#savehint').textContent=ok?'Guardado en este navegador':'Guardado sólo mientras esta página esté abierta';if(show)notify(ok?'Datos simulados guardados en este navegador.':'Este navegador bloquea el guardado local.');return ok}
function guard(role){if(ui.role!==role&&ui.role!=='Administrador'){notify('Acción simulada reservada para '+role+'. Cambia de rol en la parte superior.');return false}return true}
function typeName(t){var x=types.find(function(d){return d[0]===t});return x?x[1]:t}
function kindName(t){var x=kinds.find(function(d){return d[0]===t});return x?x[1]:t}
function pill(s){return '<span class="pill '+esc(s)+'">'+esc(M.humanStatus(s))+'</span>'}
function getRecord(id){return state.records.find(function(x){return x.id===id})}
function supplier(id){return M.provider(state,id)}
function score(r){return M.calc(r.rows)}
function saveDraft(){persist(false);$('#capturemessage').textContent='Borrador simulado guardado en este navegador. No se ha enviado a Calidad.'}
function view(page){if(!titles[page])return;ui.page=page;$$('.screen').forEach(function(el){el.classList.toggle('hidden',el.id!==page)});$$('[data-page]').forEach(function(b){b.classList.toggle('active',b.dataset.page===page)});$('#crumb').textContent='Espacio de trabajo / '+titles[page][0];$('#pagetitle').textContent=titles[page][0];$('#pagesub').textContent=titles[page][1];render();window.scrollTo({top:0,behavior:'instant'})}
function render(){renderHome();renderBuilder();renderCapture();renderResults();renderPending();renderFlow();renderDocs();renderNav()}
function renderNav(){var n=state.records.filter(function(x){return(ui.role==='Calidad'||ui.role==='Administrador')?x.status==='review':ui.role==='Compras'&&x.status==='returned'}).length;$('#navcount').textContent=n;$('#role').value=ui.role;$('#pendingrole').textContent='Vista como '+ui.role}
function renderHome(){
var approved=state.records.filter(function(r){return r.status==='approved'}).length,waiting=state.records.filter(function(r){return r.status==='review'}).length,ret=state.records.filter(function(r){return r.status==='returned'}).length;
$('#stats').innerHTML=[['Evaluaciones',state.records.length,'Expedientes ficticios'],['Por revisar',waiting,'Pendientes de Calidad'],['Aprobadas',approved,'Decisiones registradas'],['Devueltas',ret,'Requieren corrección']].map(function(x){return '<div class="stat"><strong>'+x[1]+'</strong><span>'+x[0]+'</span><br><em>'+x[2]+'</em></div>'}).join('');
$('#activity').innerHTML=state.records.slice().reverse().map(function(r){return '<div class="activityitem"><span class="fieldico">▤</span><div><b>'+esc(r.id)+' · '+esc(supplier(r.supplierId))+'</b>'+pill(r.status)+' · '+esc(score(r))+' puntos</div></div>'}).join('');
}
function palette(){var out=types.map(function(t){return '<div class="fielditem" data-addfield="'+t[0]+'" tabindex="0" role="button" draggable="true"><span class="fieldico">'+t[2]+'</span>'+t[1]+' <span style="margin-left:auto;color:#7d9aa0">＋</span></div>'}).join('');$('#fieldpalette').innerHTML=out}
function renderBuilder(){
palette();var f=state.fields.find(function(x){return x.id===ui.field});
$('#fieldcanvas').innerHTML=state.fields.map(function(x,i){return '<div class="formblock '+(ui.field===x.id?'sel':'')+'" data-editfield="'+esc(x.id)+'" tabindex="0" role="button"><div class="bar"><span class="fieldico">'+esc((types.find(function(t){return t[0]===x.type})||['','','▤'])[2])+'</span><div style="flex:1"><strong>'+esc(x.label)+'</strong><small>'+esc(x.type==='repeater'?'Criterios con peso y calificación':x.type==='calculation'?'Promedio ponderado automático':x.type==='relation'?'Proveedor registrado en el catálogo':x.required?'Obligatorio':'Opcional')+'</small></div><span class="blocktype">'+esc(typeName(x.type))+'</span><div class="actions"><button data-fieldmove="'+esc(x.id)+'" data-dir="-1" aria-label="Mover arriba">↑</button><button data-fieldmove="'+esc(x.id)+'" data-dir="1" aria-label="Mover abajo">↓</button>'+(x.fixed?'':'<button data-fieldremove="'+esc(x.id)+'" aria-label="Eliminar campo">×</button>')+'</div></div></div>'}).join('');
if(!f){$('#fieldinspector').innerHTML='<div class="empty">Selecciona un campo para editarlo.</div>'}
else{$('#fieldinspector').innerHTML='<div class="field"><label for="fieldlabel">Etiqueta visible</label><input id="fieldlabel" value="'+esc(f.label)+'"></div><div class="field"><label>Tipo</label><input value="'+esc(typeName(f.type))+'" disabled></div>'+(f.type==='select'?'<div class="field"><label for="fieldoptions">Opciones separadas por coma</label><input id="fieldoptions" value="'+esc((f.options||['Sí','No']).join(', '))+'"></div>':'')+'<label class="small"><input id="fieldrequired" type="checkbox" '+(f.required?'checked':'')+(f.fixed?' disabled':'')+'> Obligatorio</label><div class="callout">Su identificador '+esc(f.id)+' no cambia cuando modificas el nombre visible.</div>'}
if(ui.preview){
$('#preview').classList.remove('hidden');
$('#preview').innerHTML='<div class="cardtitle">Vista previa del diseño (simulada)</div>'+state.fields.map(function(x){return '<div class="field"><label>'+esc(x.label)+'</label>'+(x.type==='repeater'?'<div class="hintbox">Grupo repetible: criterio, puntaje y peso. ＋ Agregar fila</div>':x.type==='calculation'?'<div class="hintbox">Calificación calculada = Σ(puntaje × peso) / Σ(peso)</div>':x.type==='select'?'<select disabled><option>Selecciona una opción</option></select>':'<input disabled placeholder="'+esc(typeName(x.type))+'"></div>')}).join('').replace(/<\/div><\/div>/g,'</div></div>');
}else $('#preview').classList.add('hidden');
}
function addField(type){if(!guard('Administrador'))return;var id='f'+Date.now().toString(36)+state.fields.length;var n={id:id,type:type,label:'Nuevo campo: '+typeName(type),required:false};if(type==='select')n.options=['Sí','No'];state.fields.push(n);ui.field=id;persist();renderBuilder();notify('Campo agregado. Configura su etiqueta en el panel derecho.')}
function draft(){return state.draft}
function renderCapture(){
var d=draft();$('#capturetitle').textContent=d.editingId?'Corregir '+d.editingId:'Nueva evaluación';
$('#editingstatus').textContent=d.editingId?'Editando expediente '+d.editingId:'Nueva captura';
$('#supplier').innerHTML='<option value="">Selecciona proveedor…</option>'+state.providers.map(function(p){return '<option value="'+esc(p.id)+'" '+(p.id===d.supplierId?'selected':'')+'>'+esc(p.name)+'</option>'}).join('');
$('#visitdate').value=d.date||'';$('#notes').value=d.notes||'';
$('#criteriarows').innerHTML=d.rows.map(function(r,i){return '<div class="criteriarow"><div><label>Criterio</label><input data-row="'+i+'" data-prop="name" value="'+esc(r.name)+'"></div><div><label>Puntaje 0–100</label><input type="number" min="0" max="100" data-row="'+i+'" data-prop="score" value="'+esc(r.score)+'"></div><div><label>Peso</label><input type="number" min="1" max="1000" data-row="'+i+'" data-prop="weight" value="'+esc(r.weight)+'"></div><button data-removerow="'+i+'" title="Eliminar criterio">×</button></div>'}).join('');
$('#evidencelabel').textContent=d.evidence?'Archivo seleccionado (no subido): '+d.evidence:'';
$('#extras').innerHTML=state.fields.filter(function(x){return!x.fixed}).map(function(x){var val=d.extras[x.id]||'';return '<div class="field"><label for="ex-'+esc(x.id)+'">'+esc(x.label)+(x.required?' *':'')+'</label>'+(x.type==='select'?'<select id="ex-'+esc(x.id)+'" data-extra="'+esc(x.id)+'"><option value="">Selecciona…</option>'+(x.options||['Sí','No']).map(function(opt){return '<option '+(String(val)===String(opt)?'selected':'')+'>'+esc(opt)+'</option>'}).join('')+'</select>':x.type==='textarea'?'<textarea id="ex-'+esc(x.id)+'" data-extra="'+esc(x.id)+'">'+esc(val)+'</textarea>':'<input id="ex-'+esc(x.id)+'" data-extra="'+esc(x.id)+'" type="'+(x.type==='number'?'number':x.type==='date'?'date':'text')+'" value="'+esc(val)+'">')+'</div>'}).join('');
updateScore();
}
function updateScore(){
var r=draft().rows,v=M.calc(r),isValid=M.isValidRows(r),value=v===null?'—':String(v);
$('#score').textContent=value;$('#scorebar').style.width=(v===null?0:Math.max(0,Math.min(100,v)))+'%';
$('#scorestatus').textContent=!isValid?'Revisar criterios':v>=80?'Cumple (ilustrativo)':v>=60?'Condicionado':'No cumple';
$('#scorebreakdown').textContent='Fórmula: suma(puntaje × peso) / suma(pesos). '+r.length+' criterios visibles.';
}
function newCapture(){state.draft=M.fresh().draft;persist();renderCapture();notify('Nueva captura ficticia iniciada.')}
function submit(){
if(!guard('Compras'))return;var d=draft();
if(!d.supplierId||!d.date){$('#capturemessage').textContent='Falta seleccionar un proveedor o una fecha.';notify('Completa proveedor y fecha.');return}
if(!M.isValidRows(d.rows)){$('#capturemessage').textContent='Cada criterio debe tener nombre, puntaje 0–100 y peso positivo.';notify('Revisa los criterios antes de enviar.');return}
var missing=state.fields.filter(function(x){return x.required&&!x.fixed&&!String(d.extras[x.id]||'').trim()});if(missing.length){notify('Completa el campo obligatorio: '+missing[0].label);return}
var r=d.editingId?getRecord(d.editingId):null;
if(d.editingId&&(!r||r.status!=='returned')){notify('Sólo puede corregirse un expediente devuelto.');return}
if(r){r.supplierId=d.supplierId;r.date=d.date;r.notes=d.notes;r.rows=JSON.parse(JSON.stringify(d.rows));r.evidence=d.evidence;r.extras=JSON.parse(JSON.stringify(d.extras));r.status='review';r.history.push({role:'Compras',note:'Se corrigió y reenvió el mismo expediente',date:M.day()})}
else{var idx=state.records.reduce(function(m,x){return Math.max(m,Number(x.id.replace(/\D/g,''))||0)},0)+1;r={id:'EV-'+String(idx).padStart(3,'0'),supplierId:d.supplierId,date:d.date,notes:d.notes,rows:JSON.parse(JSON.stringify(d.rows)),status:'review',evidence:d.evidence,extras:JSON.parse(JSON.stringify(d.extras)),history:[{role:'Compras',note:'Evaluación enviada a Calidad',date:M.day()}]};state.records.push(r)}
state.draft=M.fresh().draft;ui.selectedRecord=r.id;persist();render();$('#capturemessage').textContent=r.id+' enviado a revisión en la simulación.';notify('Expediente '+r.id+' enviado a Calidad (simulado).');view('results');showDetail(r.id);
}
function renderResults(){
var visible=state.records.filter(function(r){return(ui.filter==='all'||r.status===ui.filter)&&(!ui.search||(r.id+' '+supplier(r.supplierId)).toLowerCase().includes(ui.search.toLowerCase()))}).slice().reverse();
$('#search').value=ui.search;$('#statusfilter').value=ui.filter;$('#matchcount').textContent=visible.length+' resultados';$('#columnspanel').classList.toggle('hidden',!ui.columnsOpen);
$('#columnspanel').innerHTML='<b>Columnas visibles:</b>'+columns.map(function(c){return '<label><input type="checkbox" data-col="'+c[0]+'" '+(state.columns.includes(c[0])?'checked':'')+'> '+c[1]+'</label>'}).join('');
$('#resulthead').innerHTML='<tr>'+state.columns.map(function(k){var c=columns.find(function(x){return x[0]===k});return'<th>'+esc(c?c[1]:k)+'</th>'}).join('')+'<th>Ver registro</th></tr>';
$('#resultrows').innerHTML=visible.length?visible.map(function(r){return '<tr>'+state.columns.map(function(c){var val={id:r.id,provider:supplier(r.supplierId),date:r.date,score:score(r),status:M.humanStatus(r.status),notes:r.notes,region:(state.providers.find(function(p){return p.id===r.supplierId})||{}).region,evidence:r.evidence||'Sin evidencia'}[c];return '<td>'+(c==='status'?pill(r.status):esc(val))+'</td>'}).join('')+'<td><button data-detail="'+esc(r.id)+'">Abrir expediente</button></td></tr>'}).join(''):'<tr><td colspan="'+(state.columns.length+1)+'"><div class="empty">No hay resultados con estos filtros.</div></td></tr>';
if(ui.selectedRecord)showDetail(ui.selectedRecord);else $('#recorddetail').classList.add('hidden');
}
function detailHTML(r){
return '<h3>'+esc(r.id)+' · '+esc(supplier(r.supplierId))+' '+pill(r.status)+'</h3><div class="detailgrid"><div class="detailcell">Proveedor relacionado<b>'+esc(supplier(r.supplierId))+'</b></div><div class="detailcell">Puntuación<b>'+esc(score(r))+'/100</b></div><div class="detailcell">Estado<b>'+esc(M.humanStatus(r.status))+'</b></div></div><div class="divider"></div><b>Criterios de evaluación</b><div class="scrolltable"><table><thead><tr><th>Criterio</th><th>Puntaje</th><th>Peso</th></tr></thead><tbody>'+r.rows.map(function(x){return'<tr><td>'+esc(x.name)+'</td><td>'+esc(x.score)+'</td><td>'+esc(x.weight)+'</td></tr>'}).join('')+'</tbody></table></div><div class="divider"></div><b>Historial</b>'+r.history.map(function(h){return'<div class="activityitem"><span class="fieldico">◷</span><div><b>'+esc(h.date)+' · '+esc(h.role)+'</b>'+esc(h.note)+'</div></div>'}).join('');
}
function showDetail(id){ui.selectedRecord=id;var r=getRecord(id);if(!r){$('#recorddetail').classList.add('hidden');return}$('#recorddetail').classList.remove('hidden');$('#recorddetail').innerHTML=detailHTML(r)}
function renderPending(){
var items=ui.role==='Calidad'||ui.role==='Administrador'?state.records.filter(function(r){return r.status==='review'}):ui.role==='Compras'?state.records.filter(function(r){return r.status==='returned'}):[];
$('#pendingrows').innerHTML=items.length?items.map(function(r){return'<div class="taskitem '+(ui.selectedTask===r.id?'selected':'')+'"><div><b>'+esc(r.id)+' · '+esc(supplier(r.supplierId))+'</b><small>'+esc(ui.role==='Compras'?'Requiere corrección':'Revisar evaluación')+' · '+esc(score(r))+' puntos</small></div><button class="btn tinybtn" data-task="'+esc(r.id)+'">Abrir</button></div>'}).join(''):'<div class="empty">No tienes tareas pendientes para este rol simulado.</div>';
var r=getRecord(ui.selectedTask);if(!r||items.indexOf(r)<0){$('#taskdetail').innerHTML='<div class="empty">Selecciona una tarea para revisar el expediente.</div>';return}
$('#taskdetail').innerHTML=detailHTML(r)+(ui.role==='Compras'?'<button class="btn primary" data-correct="'+esc(r.id)+'">Corregir este registro</button>':'<div class="field"><label for="reviewnote">Observaciones de Calidad</label><textarea id="reviewnote" rows="3" placeholder="Motivo de devolución o comentario"></textarea></div><div class="btnrow"><button class="btn" data-return="'+esc(r.id)+'">Devolver</button><button class="btn primary" data-approve="'+esc(r.id)+'">Aprobar</button></div>');
}
function decision(id,action){
if(!guard('Calidad'))return;var r=getRecord(id);if(!r||r.status!=='review'){notify('Este expediente no está en revisión.');return}
if(action==='return'){var txt=String($('#reviewnote')?$('#reviewnote').value:'').trim();if(!txt){notify('Escribe el motivo de la devolución.');return}r.status='returned';r.history.push({role:'Calidad',note:'Devuelto: '+txt,date:M.day()})}
else{r.status='approved';r.history.push({role:'Calidad',note:'Evaluación aprobada',date:M.day()})}
ui.selectedTask=null;persist();render();notify(action==='return'?'Expediente devuelto a Compras (simulado).':'Expediente aprobado (simulado).');
}
function correct(id){if(!guard('Compras'))return;var r=getRecord(id);if(!r||r.status!=='returned')return;
state.draft={supplierId:r.supplierId,date:r.date,notes:r.notes,rows:JSON.parse(JSON.stringify(r.rows)),extras:JSON.parse(JSON.stringify(r.extras||{})),evidence:r.evidence||'',editingId:r.id};
persist();view('capture');$('#capturemessage').textContent='Estás corrigiendo '+r.id+'. El historial se conservará al reenviar.'}
function flowPalette(){$('#flowpalette').innerHTML=kinds.map(function(k){return '<div class="fielditem" data-addstep="'+esc(k[0])+'" role="button" tabindex="0" draggable="true"><span class="fieldico">'+esc(k[2])+'</span>'+esc(k[1])+' <span style="margin-left:auto">＋</span></div>'}).join('')}
function renderFlow(){
flowPalette();$$('[data-flowview]').forEach(function(b){b.classList.toggle('on',b.dataset.flowview===ui.flowMode)});
var canvas=$('#flowcanvas');canvas.className='flowcanvas '+ui.flowMode;
canvas.innerHTML=state.process.map(function(s,i){return '<div class="flownode '+(ui.flowSelected===s.id?'sel':'')+'" data-flowselect="'+esc(s.id)+'" tabindex="0" role="button"><div class="actions"><button data-flowmove="'+esc(s.id)+'" data-dir="-1">↑</button><button data-flowmove="'+esc(s.id)+'" data-dir="1">↓</button><button data-flowremove="'+esc(s.id)+'">×</button></div><b>'+(i+1)+'. '+esc(s.title)+'</b><small>'+esc(kindName(s.kind))+' · '+esc(s.resource)+' · '+esc(s.role)+'</small>'+(s.kind==='condition'?'<small style="color:#aa7929">Sí → continuar · No → devolver</small>':'')+'</div>'}).join('');
var sel=state.process.find(function(s){return s.id===ui.flowSelected});if(!sel){$('#flowinspector').innerHTML='<div class="empty">Selecciona una actividad para configurarla.</div>';return}
var opts=sel.kind==='form'?['Evaluación de proveedores']:sel.kind==='page'?['Política de evaluación de proveedores']:sel.kind==='review'?['Registro de evaluación']:sel.kind==='condition'?['Calificación y estado']:sel.kind==='notice'?['Aviso de resultado']:['Confirmación de lectura'];
$('#flowinspector').innerHTML='<div class="field"><label for="flowtitle">¿Qué debe hacer?</label><input id="flowtitle" value="'+esc(sel.title)+'"></div><div class="field"><label for="flowresource">Contenido existente</label><select id="flowresource">'+opts.map(function(x){return'<option '+(sel.resource===x?'selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select></div><div class="field"><label for="flowrole">¿Quién lo realiza?</label><select id="flowrole">'+['Compras','Calidad','Empleado','Gerencia','Administrador','Sistema'].map(function(x){return'<option '+(sel.role===x?'selected':'')+'>'+x+'</option>'}).join('')+'</select></div><div class="callout">El paso referencia un elemento existente. No se duplica el formulario ni la página.</div>';
}
function addStep(kind){if(!guard('Administrador'))return;var k=kinds.find(function(x){return x[0]===kind});if(!k)return;var resource={form:'Evaluación de proveedores',page:'Política de evaluación de proveedores',review:'Registro de evaluación',condition:'Calificación y estado',notice:'Aviso de resultado',signature:'Confirmación de lectura'}[kind];
var role={form:'Compras',page:'Empleado',review:'Calidad',condition:'Calidad',notice:'Sistema',signature:'Empleado'}[kind];var x={id:'S'+Date.now(),kind:kind,title:k[1],resource:resource,role:role};
state.process.push(x);ui.flowSelected=x.id;persist();renderFlow();notify('Actividad agregada. Configúrala desde el panel derecho.')}
function renderDocs(){
$('#docver').textContent='Versión '+state.document.version;
var ack=state.document.acks.find(function(a){return a.role===ui.role&&a.version===state.document.version});
$('#ack').disabled=!!ack;$('#ack').textContent=ack?'Lectura confirmada en esta demo':'Confirmar lectura (simulado)';
$('#ackmessage').textContent=ack?'Acuse registrado para '+ack.role+' · versión '+ack.version+' · '+ack.date:'Se registrará un acuse ficticio asociado a la versión visible y al rol simulado.';
$('#acklist').innerHTML=state.document.acks.length?state.document.acks.slice().reverse().map(function(a){return'<div class="ackitem"><b>'+esc(a.role)+' · Política v'+esc(a.version)+'</b><small>Confirmación simulada · '+esc(a.date)+'</small></div>'}).join(''):'<div class="empty">Todavía no hay acuses simulados.</div>';
}
function acknowledge(){if(state.document.acks.some(function(a){return a.role===ui.role&&a.version===state.document.version})){notify('Este rol ya confirmó esta versión.');return}state.document.acks.push({role:ui.role,version:state.document.version,date:M.day()});persist();renderDocs();notify('Acuse de lectura simulado para versión '+state.document.version+'.')}
function versionDoc(){if(!guard('Administrador'))return;state.document.version++;persist();renderDocs();notify('Nueva versión ficticia publicada. Acuses anteriores conservados.')}
function reset(){if(!window.confirm('¿Restablecer todos los ejemplos ficticios y perder los cambios locales de esta demo?'))return;state=M.reset();ui.field=null;ui.selectedTask=null;ui.selectedRecord=null;ui.search='';ui.filter='all';ui.flowSelected=null;persist();view('home');notify('Escenario ficticio restablecido.')}
function bind(){
$$('[data-page]').forEach(function(b){b.addEventListener('click',function(){view(b.dataset.page)})});
$$('[data-go]').forEach(function(b){b.addEventListener('click',function(){view(b.dataset.go)})});
$('#role').addEventListener('change',function(e){ui.role=e.target.value;ui.selectedTask=null;render();notify('Rol simulado: '+ui.role+'. No representa autenticación real.')});
$('#reset').addEventListener('click',reset);
$('#builder-preview').addEventListener('click',function(){ui.preview=!ui.preview;renderBuilder()});
$('#builder-save').addEventListener('click',function(){if(!guard('Administrador'))return;persist(true)});
$('#fieldpalette').addEventListener('click',function(e){var x=e.target.closest('[data-addfield]');if(x)addField(x.dataset.addfield)});
$('#fieldpalette').addEventListener('keydown',function(e){var x=e.target.closest('[data-addfield]');if(x&&(e.key==='Enter'||e.key===' ')){e.preventDefault();addField(x.dataset.addfield)}});
$('#fieldpalette').addEventListener('dragstart',function(e){var x=e.target.closest('[data-addfield]');if(x)e.dataTransfer.setData('text/plain','field:'+x.dataset.addfield)});
var drop=$('#fielddrop');drop.addEventListener('dragover',function(e){e.preventDefault();drop.classList.add('over')});drop.addEventListener('dragleave',function(){drop.classList.remove('over')});drop.addEventListener('drop',function(e){e.preventDefault();drop.classList.remove('over');var d=e.dataTransfer.getData('text/plain');if(d.indexOf('field:')===0)addField(d.slice(6))});
$('#fieldcanvas').addEventListener('click',function(e){var x=e.target.closest('[data-fieldremove]');if(x){if(!guard('Administrador'))return;state.fields=state.fields.filter(function(f){return f.id!==x.dataset.fieldremove});if(ui.field===x.dataset.fieldremove)ui.field=null;persist();renderBuilder();return}
var y=e.target.closest('[data-fieldmove]');if(y){if(!guard('Administrador'))return;var i=state.fields.findIndex(function(z){return z.id===y.dataset.fieldmove}),j=i+Number(y.dataset.dir);if(j>=0&&j<state.fields.length){var temp=state.fields[i];state.fields[i]=state.fields[j];state.fields[j]=temp;persist();renderBuilder()}return}
var b=e.target.closest('[data-editfield]');if(b){ui.field=b.dataset.editfield;renderBuilder()}});
$('#fieldcanvas').addEventListener('keydown',function(e){if(e.key==='Enter'){var b=e.target.closest('[data-editfield]');if(b){ui.field=b.dataset.editfield;renderBuilder()}}});
$('#fieldinspector').addEventListener('change',function(e){var x=state.fields.find(function(f){return f.id===ui.field});if(!x||!guard('Administrador'))return;if(e.target.id==='fieldlabel'){if(!e.target.value.trim()){notify('La etiqueta no puede estar vacía.');return}x.label=e.target.value.trim()}if(e.target.id==='fieldoptions'){x.options=e.target.value.split(',').map(function(s){return s.trim()}).filter(Boolean)}if(e.target.id==='fieldrequired'){x.required=e.target.checked}persist();renderBuilder();renderCapture()});
$('#supplier').addEventListener('change',function(e){draft().supplierId=e.target.value;persist()});
$('#visitdate').addEventListener('change',function(e){draft().date=e.target.value;persist()});
$('#notes').addEventListener('input',function(e){draft().notes=e.target.value;persist()});
$('#extras').addEventListener('input',function(e){var x=e.target.closest('[data-extra]');if(x){draft().extras[x.dataset.extra]=x.value;persist()}});
$('#criteriarows').addEventListener('input',function(e){var x=e.target.closest('[data-row]');if(!x)return;var r=draft().rows[Number(x.dataset.row)];if(!r)return;r[x.dataset.prop]=x.dataset.prop==='name'?x.value:x.value===''?'':Number(x.value);persist();updateScore()});
$('#criteriarows').addEventListener('click',function(e){var x=e.target.closest('[data-removerow]');if(!x)return;if(draft().rows.length<=1){notify('Debe permanecer al menos un criterio.');return}draft().rows.splice(Number(x.dataset.removerow),1);persist();renderCapture()});
$('#add-criterion').addEventListener('click',function(){draft().rows.push({name:'Nuevo criterio',score:80,weight:10});persist();renderCapture()});
$('#evidence').addEventListener('change',function(e){draft().evidence=e.target.files&&e.target.files[0]?e.target.files[0].name:'';persist();$('#evidencelabel').textContent=draft().evidence?'Nombre del archivo (no subido): '+draft().evidence:''});
$('#save-draft').addEventListener('click',function(){saveDraft();notify('Borrador ficticio disponible en este navegador.')});
$('#newcapture').addEventListener('click',newCapture);
$('#submit-eval').addEventListener('click',submit);
$('#columns-toggle').addEventListener('click',function(){ui.columnsOpen=!ui.columnsOpen;renderResults()});
$('#columnspanel').addEventListener('change',function(e){var x=e.target.closest('[data-col]');if(!x)return;var key=x.dataset.col;if(x.checked){if(!state.columns.includes(key))state.columns.push(key)}else{if(state.columns.length===1){notify('Debe permanecer al menos una columna.');renderResults();return}state.columns=state.columns.filter(function(k){return k!==key})}persist();renderResults()});
$('#search').addEventListener('input',function(e){ui.search=e.target.value;renderResults()});
$('#statusfilter').addEventListener('change',function(e){ui.filter=e.target.value;renderResults()});
$('#resultrows').addEventListener('click',function(e){var x=e.target.closest('[data-detail]');if(x)showDetail(x.dataset.detail)});
$('#pendingrows').addEventListener('click',function(e){var x=e.target.closest('[data-task]');if(x){ui.selectedTask=x.dataset.task;renderPending()}});
$('#taskdetail').addEventListener('click',function(e){var x=e.target.closest('[data-approve]');if(x){decision(x.dataset.approve,'approve');return}x=e.target.closest('[data-return]');if(x){decision(x.dataset.return,'return');return}x=e.target.closest('[data-correct]');if(x)correct(x.dataset.correct)});
$$('[data-flowview]').forEach(function(b){b.addEventListener('click',function(){ui.flowMode=b.dataset.flowview;renderFlow()})});
$('#flowpalette').addEventListener('click',function(e){var x=e.target.closest('[data-addstep]');if(x)addStep(x.dataset.addstep)});
$('#flowpalette').addEventListener('keydown',function(e){var x=e.target.closest('[data-addstep]');if(x&&(e.key==='Enter'||e.key===' ')){e.preventDefault();addStep(x.dataset.addstep)}});
$('#flowpalette').addEventListener('dragstart',function(e){var x=e.target.closest('[data-addstep]');if(x)e.dataTransfer.setData('text/plain','flow:'+x.dataset.addstep)});
var fd=$('#flowdrop');fd.addEventListener('dragover',function(e){e.preventDefault();fd.classList.add('over')});fd.addEventListener('dragleave',function(){fd.classList.remove('over')});fd.addEventListener('drop',function(e){e.preventDefault();fd.classList.remove('over');var v=e.dataTransfer.getData('text/plain');if(v.indexOf('flow:')===0)addStep(v.slice(5))});
$('#flowcanvas').addEventListener('click',function(e){var x=e.target.closest('[data-flowremove]');if(x){if(!guard('Administrador'))return;state.process=state.process.filter(function(s){return s.id!==x.dataset.flowremove});ui.flowSelected=null;persist();renderFlow();return}
var mv=e.target.closest('[data-flowmove]');if(mv){if(!guard('Administrador'))return;var i=state.process.findIndex(function(s){return s.id===mv.dataset.flowmove}),j=i+Number(mv.dataset.dir);if(j>=0&&j<state.process.length){var a=state.process[i];state.process[i]=state.process[j];state.process[j]=a;persist();renderFlow()}return}
var b=e.target.closest('[data-flowselect]');if(b){ui.flowSelected=b.dataset.flowselect;renderFlow()}});
$('#flowcanvas').addEventListener('keydown',function(e){var b=e.target.closest('[data-flowselect]');if(b&&e.key==='Enter'){ui.flowSelected=b.dataset.flowselect;renderFlow()}});
$('#flowinspector').addEventListener('change',function(e){var s=state.process.find(function(x){return x.id===ui.flowSelected});if(!s||!guard('Administrador'))return;var k={flowtitle:'title',flowresource:'resource',flowrole:'role'}[e.target.id];if(k){if(!e.target.value.trim())return;s[k]=e.target.value.trim();persist();renderFlow()}});
$('#doc-version').addEventListener('click',versionDoc);$('#ack').addEventListener('click',acknowledge);
}
bind();$('#version').textContent=state.version||'FL-003';view('home');
})();