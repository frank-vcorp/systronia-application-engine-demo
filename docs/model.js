/* SyStudio · FL-003 demo integral · modelo ficticio.
   Sin backend ni autenticación. localStorage es exclusivamente una comodidad de la simulación. */
(function(){
'use strict';
var STORAGE='qualitra-integral-ficticio-v1';
function fresh(){
return{
version:'FL-003-review-v0.1',
providers:[{id:'PR-001',name:'Proveedor Norte',region:'Norte'},{id:'PR-002',name:'Proveedor Centro',region:'Centro'},{id:'PR-003',name:'Proveedor Sur',region:'Sur'}],
fields:[
{id:'supplier',type:'relation',label:'Proveedor',fixed:true,required:true},
{id:'visitdate',type:'date',label:'Fecha de evaluación',fixed:true,required:true},
{id:'notes',type:'textarea',label:'Comentarios',fixed:true},
{id:'criteria',type:'repeater',label:'Criterios de evaluación',fixed:true},
{id:'result',type:'calculation',label:'Calificación ponderada',fixed:true},
{id:'evidence',type:'file',label:'Evidencias',fixed:true}
],
records:[
{id:'EV-001',supplierId:'PR-001',date:'2026-11-02',notes:'Revisión trimestral',rows:[{name:'Calidad',score:92,weight:40},{name:'Entrega',score:80,weight:35},{name:'Documentos',score:90,weight:25}],status:'review',evidence:'',extras:{},history:[{role:'Compras',note:'Evaluación enviada a revisión',date:'02/11/2026'}]},
{id:'EV-002',supplierId:'PR-002',date:'2026-10-28',notes:'Documentación completa',rows:[{name:'Calidad',score:96,weight:40},{name:'Entrega',score:94,weight:35},{name:'Documentos',score:94,weight:25}],status:'approved',evidence:'acta-ejemplo.pdf',extras:{},history:[{role:'Compras',note:'Evaluación enviada a revisión',date:'28/10/2026'},{role:'Calidad',note:'Aprobado',date:'29/10/2026'}]},
{id:'EV-003',supplierId:'PR-003',date:'2026-10-30',notes:'Faltan documentos',rows:[{name:'Calidad',score:72,weight:40},{name:'Entrega',score:60,weight:35},{name:'Documentos',score:45,weight:25}],status:'returned',evidence:'',extras:{},history:[{role:'Compras',note:'Evaluación enviada a revisión',date:'30/10/2026'},{role:'Calidad',note:'Devuelto: completar documentación',date:'31/10/2026'}]}
],
draft:{supplierId:'',date:'2026-11-02',notes:'',rows:[{name:'Calidad',score:85,weight:40},{name:'Entrega',score:80,weight:35},{name:'Documentos',score:75,weight:25}],extras:{},evidence:'',editingId:null},
columns:['id','provider','date','score','status'],
process:[
{id:'S1',kind:'form',title:'Completar evaluación',resource:'Evaluación de proveedores',role:'Compras'},
{id:'S2',kind:'review',title:'Revisar información',resource:'Registro de evaluación',role:'Calidad'},
{id:'S3',kind:'condition',title:'Aprobar o devolver',resource:'Calificación y estado',role:'Calidad'},
{id:'S4',kind:'page',title:'Leer política relacionada',resource:'Política de evaluación de proveedores',role:'Empleado'}
],
document:{version:1,acks:[]}
};
}
function load(){try{var s=localStorage.getItem(STORAGE);if(s){var o=JSON.parse(s);if(o&&Array.isArray(o.records)&&Array.isArray(o.fields)&&Array.isArray(o.process)&&o.document&&o.draft)return o}}catch(e){}return fresh()}
function save(data){try{localStorage.setItem(STORAGE,JSON.stringify(data));return true}catch(e){return false}}
function reset(){try{localStorage.removeItem(STORAGE)}catch(e){}return fresh()}
function calc(rows){var sum=0,w=0;(rows||[]).forEach(function(x){var a=Number(x.score),b=Number(x.weight);if(Number.isFinite(a)&&Number.isFinite(b)&&a>=0&&a<=100&&b>0){sum+=a*b;w+=b}});return w?Math.round(sum/w*10)/10:null}
function isValidRows(rows){return Array.isArray(rows)&&rows.length>0&&rows.every(function(x){return String(x.name||'').trim()!==''&&Number.isFinite(Number(x.score))&&Number(x.score)>=0&&Number(x.score)<=100&&Number.isFinite(Number(x.weight))&&Number(x.weight)>0})}
function provider(d,id){var p=d.providers.find(function(x){return x.id===id});return p?p.name:'Proveedor no disponible'}
function day(){return new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date())}
function humanStatus(x){return {review:'Por revisar',returned:'Devuelto',approved:'Aprobado'}[x]||'Borrador'}
window.QUALITRA_MODEL={fresh:fresh,load:load,save:save,reset:reset,calc:calc,isValidRows:isValidRows,provider:provider,day:day,humanStatus:humanStatus};
})();