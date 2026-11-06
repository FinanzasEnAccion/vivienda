'use strict';

// Ejecutar: node "Pruebas ITP.cjs"
// Con informe: node "Pruebas ITP.cjs" --informe
// Sin dependencias. Lee el HTML de trabajo y la base Git 1119b19 sin alterarlos.
// Incluye los nueve casos de la auditoría 9/10 y regresiones propias adicionales.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const BASE = '1119b19';
const WEB9 = 'b23ae3ba8b6ec112cbb56cac6b47eec6b64c58a4';
const CONSULTA = '2026-11-06';
const AUDITORIA = 'Auditoría calculadora vivienda - 9 de octubre de 2026.md';
const ROOT = __dirname;
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const antiguo = execFileSync('git', ['show', BASE + ':index.html'], {cwd: ROOT, encoding: 'utf8', maxBuffer: 8e6});
const web9 = execFileSync('git', ['show', WEB9 + ':index.html'], {cwd: ROOT, encoding: 'utf8', maxBuffer: 8e6});

function entre(s, desde, hasta) {
  const a = s.indexOf(desde), b = s.indexOf(hasta, a + desde.length);
  if (a < 0 || b < 0) throw Error('No se encuentra sección: ' + desde + ' → ' + hasta);
  return s.slice(a, b);
}
function motor(s) {
  const extra = s.includes('function casoR(){') ? entre(s,'function casoR(){','/* ---------- etiqueta del caso:') + '\n' + entre(s,'function casoAj(R){','function casoIco(){') : '';
  const codigo = entre(s, 'const DATA0=', '/* formato */') + '\n' +
    entre(s, '/* formato */', 'let uid=') + '\n' +
    entre(s, '/* ---------- impuestos de compra ---------- */', s.includes('/* Selector de provincia')?'/* Selector de provincia':'/* ---------- modal ---------- */') + '\n' +
    entre(s, 'function calc1(){', 'function render1(){') + '\n' +
    extra + '\n' +
    'globalThis.api={S,impuesto,calc1,ITP,cumple,itpGen:typeof itpGen==="function"?itpGen:null,taxOf:typeof taxOf==="function"?taxOf:null,' +
    'fiscalDatos:typeof fiscalDatos==="function"?fiscalDatos:null,' +
    'standardResumen:typeof standardResumen==="function"?standardResumen:null,' +
    'rebajaRentaPendiente:typeof rebajaRentaPendiente==="function"?rebajaRentaPendiente:null,' +
    'avisoRebajaRenta:typeof avisoRebajaRenta==="function"?avisoRebajaRenta:null,' +
    'veredictoRentaPendiente:typeof veredictoRentaPendiente==="function"?veredictoRentaPendiente:null,' +
    'tarjetaRentaCondicional:typeof tarjetaRentaCondicional==="function"?tarjetaRentaCondicional:null,' +
    'avisosRentaEstandar:typeof avisosRentaEstandar==="function"?avisosRentaEstandar:null,' +
    'casoR:typeof casoR==="function"?casoR:null,casoAj:typeof casoAj==="function"?casoAj:null,casoFalta:typeof casoFalta==="function"?casoFalta:null};';
  const sandbox = {localStorage: {getItem: () => null, setItem: () => {}}, console};
  vm.runInNewContext(codigo, sandbox, {timeout: 1000, filename: 'Motor ITP extraído'});
  return sandbox.api;
}

const FUENTES = {
  'Andalucía': ['Ley 5/2021, arts. 41 y 43', 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915'],
  'Aragón': ['DL 1/2005, arts. 121-1 y 121-4', 'https://www.boe.es/buscar/act.php?id=BOA-d-2005-90006'],
  'Asturias': ['DL 2/2014, arts. 25, 26 y 32 bis', 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-945#a3-3'],
  'Baleares': ['DL 1/2014, arts. 10, 14 quater y DA 5; Orden 13/2026', 'https://www.boe.es/eli/es-ib/dlg/2014/06/06/1/con', 'https://www.atib.es/General/Novedad.aspx?idTexto=16988&idTipoTexto=1&lang=ca'],
  'Canarias': ['DL 1/2009, arts. 17, 31 y 35; nota ATC 2026', 'https://www3.gobiernodecanarias.org/tributos/atc/documents/65729/205196/Nota600V760E26.pdf/af526de3-2ec0-87e3-c9e6-99acde042e73?t=1767004598755'],
  'Cantabria': ['DL 62/2008, art. 9, reforma Ley 5/2026', 'https://www.boe.es/buscar/act.php?id=BOCT-c-2008-90028'],
  'Castilla y León': ['DL 1/2013, arts. 24, 25 y 28', 'https://www.boe.es/buscar/act.php?id=BOCL-h-2013-90254'],
  'Castilla-La Mancha': ['Ley 8/2013, arts. 19 y 22; Ley 1/2026 art. 18.Nueve', 'https://www.boe.es/ccaa/docm/2026/061/q10660-10683.pdf'],
  'Cataluña': ['DL 1/2024, arts. 641-1 y 641-5', 'https://atc.gencat.cat/es/tributs/itpajd/tpo/tarifes-tipus/'],
  'Comunidad Valenciana': ['Ley 13/1997, arts. 13 y 4.Cuatro', 'https://www.boe.es/buscar/act.php?id=BOE-A-1998-8202'],
  'Extremadura': ['DL 1/2018, arts. 36, 40, 41, 44 bis y 52', 'https://portaltributario.juntaex.es/PortalTributario/c/document_library/get_file?groupId=10136&uuid=5941531d-d901-4c1c-838a-a169e494c161'],
  'Galicia': ['DL 1/2011, arts. 14 y 16.Siete', 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-18161'],
  'La Rioja': ['Ley 10/2017, arts. 44 y 45.3', 'https://www.boe.es/buscar/act.php?id=BOE-A-2017-13750'],
  'Madrid': ['DL 1/2010, arts. 28 y 30 bis', 'https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068'],
  'Murcia': ['DL 1/2010, arts. 6 y 9', 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-10542'],
  'Navarra': ['DFL 129/1999, arts. 7 y 8', 'https://www.boe.es/buscar/act.php?id=BON-n-1999-90001'],
  'País Vasco': ['Bizkaia NF 1/2011 art. 13; Gipuzkoa NF 18/1987 art. 11; Álava NF 11/2003 art. 43 y NF 3/2025 art. 6 bis', 'https://www.gipuzkoa.eus/es/web/ogasuna/impuestos/modelo/60t/tipos-impositivos', 'https://www.araba.eus/botha/Boletines/2025/044/2025_044_01182_C.pdf', 'https://www.bizkaia.eus/documents/880307/15187815/ca_1_2011.pdf/50b78491-3852-b68f-f9d5-2db574a48917?t=1777386142905'],
  'Ceuta y Melilla': ['RDL 1/1993, arts. 11.1.a y 57 bis.3.a', 'https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359']
};

const casos = [];
function caso(nombre, ccaa, precio, verificado, opts = {}) {
  casos.push({id: 'C' + String(casos.length + 1).padStart(3, '0'), nombre, ccaa, precio, verificado, ...opts});
}
// Tipos generales: importes seleccionados para descubrir escalas marginales frente a salto de tipo.
[
  ['Andalucía',210000,14700], ['Aragón',450000,36250], ['Asturias',300001,27000.09],
  ['Baleares',500000,41000], ['Canarias',210000,13650], ['Cantabria',210000,18900],
  ['Castilla y León',300000,25000], ['Castilla-La Mancha',210000,18900],
  ['Cataluña',1000000,105000], ['Comunidad Valenciana',1000001,110000.11],
  ['Extremadura',600001,52800.11], ['Galicia',210000,16800], ['La Rioja',210000,14700],
  ['Madrid',210000,12600], ['Murcia',210000,16275], ['Navarra',210000,12600],
  ['País Vasco',210000,8400], ['Ceuta y Melilla',210000,6300]
].forEach(([ccaa,p,t])=>caso('General ' + ccaa,ccaa,p,t,{v:{rebaja:false,prov:ccaa==='País Vasco'?'Bizkaia':''}}));

caso('Asturias joven 210.000: 6 % de todo el valor','Asturias',210000,12600,{v:{edad:34}});
caso('Asturias joven límite 150.000','Asturias',150000,6000);
caso('Asturias joven un céntimo sobre el límite','Asturias',150000.01,9000.0006);
caso('Asturias edad 36 sin beneficio joven','Asturias',150000,12000,{v:{edad:36}});
caso('Andalucía edad34 y límite de valor','Andalucía',150000,5250,{v:{edad:34}});
caso('Andalucía edad35 conserva habitual6 %','Andalucía',150000,9000,{v:{edad:35}});
caso('Andalucía supera tope de valor','Andalucía',150000.01,10500.0007);
caso('Aragón joven límite','Aragón',100000,7000,{v:{edad:34}});
caso('Aragón edad35 pierde bonificación','Aragón',100000,8000,{v:{edad:35}});
caso('Baleares edad29 y renta en límite','Baleares',200000,0,{v:{edad:29,prov:'Mallorca'},f:{base1:52800}});
caso('Baleares renta sobre límite conserva2 %','Baleares',200000,4000,{v:{edad:29,prov:'Mallorca'},f:{base1:52800.01}});
caso('Baleares edad30 pasa a2 %','Baleares',200000,4000,{v:{edad:30,prov:'Mallorca'}});
caso('Baleares edad36 habitual4 % no exige primera histórica','Baleares',200000,8000,{v:{edad:36,primera:false,prov:'Mallorca'}});
caso('Baleares préstamo70 % precio pero56 % tasación','Baleares',200000,4000,{v:{edad:29,entrada:30,tasacion:250000,prov:'Mallorca'}});
caso('Baleares exceso marginal tras270151,20','Baleares',300000,7790.928,{v:{edad:30,prov:'Mallorca'}});
caso('Canarias edad40 y renta inclusiva','Canarias',200000,8000,{v:{edad:40},f:{base1:46455}});
caso('Canarias renta sobre límite conserva5 %','Canarias',200000,10000,{v:{edad:40},f:{base1:46455.01}});
caso('Canarias dependiente aumenta límite','Canarias',200000,8000,{v:{edad:40},f:{base1:53280,dependientes:1}});
caso('Cantabria joven exceso300000','Cantabria',350000,16500,{v:{edad:39}});
caso('Cantabria edad40 habitual y exceso','Cantabria',350000,25500,{v:{edad:40}});
caso('CYL rural valor estrictamente menor150000','Castilla y León',149999.99,14.999999,{v:{edad:35,rural:true},f:{base1:31500}});
caso('CYL exacto150000 conserva4 %','Castilla y León',150000,6000,{v:{edad:35,rural:true},f:{base1:31500}});
caso('CYL renta conjunta de obligados sobre tope','Castilla y León',150000,12000,{v:{edad:35,rural:true},a:{titulares:2},f:{base1:31500.01}});
caso('CLM joven240000 y préstamo mayor50 %','Castilla-La Mancha',240000,7200,{v:{edad:35,entrada:49}});
caso('CLM préstamo exactamente50 % no reduce','Castilla-La Mancha',240000,21600,{v:{edad:35,entrada:50}});
caso('CLM edad36 conserva6 %','Castilla-La Mancha',240000,14400,{v:{edad:36}});
caso('Cataluña edad35 y renta inclusiva','Cataluña',200000,10000,{v:{edad:35},f:{base1:36000}});
caso('Cataluña un céntimo sobre renta','Cataluña',200000,20000,{v:{edad:35},f:{base1:36000.01}});
caso('Cataluña renta desconocida con nómina muy baja','Cataluña',200000,20000,{a:{ingresos:600,icoDatos:false},f:{rentaOk:false}});
caso('Valenciana joven valor límite','Comunidad Valenciana',180000,10800,{v:{edad:34},f:{base1:30000}});
caso('Valenciana joven supera valor','Comunidad Valenciana',180000.01,14400.0008,{v:{edad:34},f:{base1:30000}});
caso('Valenciana conjunta en límite','Comunidad Valenciana',180000,10800,{a:{titulares:2},v:{edad:34},f:{modo:'conjunta',base1:47000}});
caso('Valenciana individual sobre límite','Comunidad Valenciana',180000,16200,{v:{edad:34},f:{base1:30000.01}});
caso('Extremadura joven valor y renta límite','Extremadura',200000,8000,{v:{edad:35},f:{base1:30000}});
caso('Extremadura edad36 conserva7 %','Extremadura',200000,14000,{v:{edad:36},f:{base1:30000}});
caso('Extremadura conjunta límite55000','Extremadura',200000,8000,{v:{edad:35},a:{titulares:2},f:{modo:'conjunta',base1:55000}});
caso('Extremadura renta sobre límite','Extremadura',200000,16000,{f:{base1:30000.01}});
caso('Galicia joven patrimonio inclusivo','Galicia',240000,7200,{v:{edad:35},f:{patrimonio:240000}});
caso('Galicia patrimonio supera límite','Galicia',240000,19200,{v:{edad:35},f:{patrimonio:240000.01}});
caso('Galicia segundo miembro familiar amplía tope','Galicia',270000,8100,{f:{miembros:2,patrimonio:270000}});
caso('Galicia precio240000 base250000 conserva3 %','Galicia',240000,7500,{f:{valor:250000,patrimonio:240000}});
caso('Galicia patrimonio desconocido sin inferencia ICO','Galicia',200000,16000,{a:{icoDatos:true,patrimonio:0},f:{patOk:false}});
caso('La Rioja edad39 primera habitual','La Rioja',210000,8400,{v:{edad:39}});
caso('La Rioja edad40 general','La Rioja',210000,14700,{v:{edad:40}});
caso('La Rioja joven municipio listado','La Rioja',210000,6300,{v:{edad:39,rural:true}});
caso('Madrid habitual valor límite','Madrid',250000,13500,{v:{edad:40}});
caso('Madrid valor un céntimo superior','Madrid',250000.01,15000.0006,{v:{edad:40}});
caso('Madrid joven municipio acreditado','Madrid',250000,0,{v:{edad:34,rural:true}});
caso('Murcia edad40 y límites exactos','Murcia',210000,6300,{v:{edad:40},f:{base1:39999.99,ahorro1:1800}});
caso('Murcia40000 excluye aunque ahorro bajo','Murcia',210000,16275,{v:{edad:40},f:{base1:40000,ahorro1:0}});
caso('Murcia ahorro1800,01 excluye','Murcia',210000,16275,{v:{edad:40},f:{base1:20000,ahorro1:1800.01}});
caso('Murcia renta desconocida no equivale cero','Murcia',210000,16275,{a:{ingresos:500},f:{rentaOk:false}});
caso('Navarra habitual municipio listado','Navarra',210000,8400,{v:{rural:true}});
['Álava','Bizkaia','Gipuzkoa'].forEach(prov=>caso('País Vasco2,5 % confirmado '+prov,'País Vasco',210000,5250,{v:{prov}}));
caso('País Vasco provincia desconocida no2,5 %','País Vasco',210000,8400,{v:{prov:''},f:{pocasViviendas:'si'}});
caso('País Vasco más de5viviendas general6 %','País Vasco',210000,12600,{v:{prov:'Álava',rebaja:false},f:{pocasViviendas:'no'}});
caso('País Vasco número viviendas pendiente general6 %','País Vasco',210000,12600,{v:{prov:'Bizkaia',rebaja:false},f:{pocasViviendas:'pendiente'}});
caso('Cataluña dos titulares sin repartir nómina','Cataluña',200000,20000,{a:{titulares:2,ingresos:1500},f:{rentaOk:false}});
caso('Cataluña dos bases desiguales no dar rebaja completa','Cataluña',200000,20000,{a:{titulares:2,ingresos:1500},f:{base1:10000,base2:50000},nota:'Motor sin cuotas individualizadas: resultado conservador general; señalar posible beneficio parcial pendiente.'});
caso('Canarias total compradores no dividir entre titulares','Canarias',200000,10000,{a:{titulares:2},f:{base1:46455.01}});
caso('Base fiscal superior al precio modifica cuota','Cataluña',200000,25000,{v:{rebaja:false},f:{valor:250000}});
// Cuota marginal sin redondear / base produce 8,235035... y 8,236058... %.
// Art. 10 balear: tercer decimal5 se trunca a8,23; tercer decimal6 sube a8,24.
caso('Baleares tipo medio con tercer decimal5 baja','Baleares',522900,43034.67,{v:{rebaja:false,prov:'Mallorca'}});
caso('Baleares tipo medio con tercer decimal6 sube','Baleares',523600,43144.64,{v:{rebaja:false,prov:'Mallorca'}});

// Reproducción identificada de la tabla 1.1. Los datos fiscales ausentes son
// supuestos de prueba explícitos; la auditoría no acredita esos datos personales.
[
  ['Galicia',30,300000,9000,24000,{miembros:1,patrimonio:60000},'Un comprador y una unidad familiar de un miembro; no parroquia rural. El precio300000 excluye el reducido aunque patrimonio sea bajo.'],
  ['Canarias',30,210000,2100,13650,{base1:20000},'Habitual primera; renta agregada20000; sin inmueble anterior. El valor210000 supera200000.'],
  ['Cantabria',40,250000,10000,17500,{},'Edad40 cumplida; vivienda habitual; no hace falta primera ni renta para7 %.'],
  ['Comunidad Valenciana',30,250000,15000,20000,{base1:20000},'Primera habitual; una declaración individual con base liquidable general+ahorro20000<=30000.'],
  ['Baleares',33,300000,24000,7790.928,{base1:20000},'Mallorca; se concreta menor36 en33 años para excluir bonificación<30; primera adquisición>=50 %, sin otra vivienda>=50 %, requisitos confirmados. Auditoría redondea7791; exacto7790,928 y al céntimo7790,93.'],
  ['Murcia',30,200000,16000,6000,{base1:20000,ahorro1:0},'Habitual; una declaración, BIG menos mínimo20000<40000 y ahorro0<=1800; la auditoría no daba esas bases.'],
  ['Castilla y León',30,200000,16000,8000,{base1:20000},'Ciudad no rural; primera habitual de todos; suma fiscal exigida20000<=31500.'],
  ['Ceuta y Melilla',40,200000,12000,6000,{},'Inmueble en Ceuta o Melilla; edad40 elegida sin efecto fiscal.'],
  ['Asturias',33,210000,16800,12600,{},'Vivienda habitual; base fiscal igual a precio; art.32bis confirmado:6 % sobre todo el valor.']
].forEach(([ccaa,edad,precio,webDeclarada,verificado,f,supuestos],i)=>caso('Auditoría1.1 · '+ccaa,ccaa,precio,verificado,{
  id:'A'+String(i+1).padStart(2,'0'),auditoria:'1.1',web9OctAudit:webDeclarada,verificadoAuditoria:ccaa==='Baleares'?7791:verificado,
  v:{edad,prov:ccaa==='Baleares'?'Mallorca':'',rural:false},f,supuestos
}));
caso('Auditoría1.2 · Cataluña renta desconocida','Cataluña',210000,21000,{id:'A10',auditoria:'1.2',web9OctAudit:10500,v:{edad:30},a:{ingresos:3200,ahorros:70000},f:{rentaOk:false},supuestos:'La auditoría aporta sueldo, no renta fiscal. Se prueba dato fiscal desconocido: no inferir elegibilidad ni descalificación por salario; resultado general hasta confirmar.'});
caso('Auditoría1.2 · Cataluña base fiscal fuera de límite','Cataluña',210000,21000,{id:'A11',auditoria:'1.2',v:{edad:30},a:{ingresos:3200,ahorros:70000},f:{base1:40000},supuestos:'40000 es supuesto fiscal explícito, no cifra suministrada por auditoría ni derivada de3200 netos.'});

[['Canarias',6120],['Cataluña',18000],['Galicia',18900]].forEach(([ccaa,importe],i)=>caso('Obra nueva conserva importe anterior · '+ccaa,ccaa,180000,importe,{
  id:'N0'+(i+1),v:{nueva:true,edad:30,entrada:20},a:{ingresos:1500},
  alcance:'Compatibilidad de obra nueva; no validación legal de IVA/IGIC/AJD',
  fuentes:['Oráculo de conservación autorizado: repositorio FinanzasEnAccion/vivienda, commit1119b19, index.html'],
  supuestos:'Regresión de compatibilidad: conservación exacta de IVA/IGIC/AJD de1119b19 autorizada; no es certificación normativa de obra nueva ni parte del recálculo de ITP usado.'
}));

function preparar(api, c) {
  const {S} = api;
  Object.assign(S.v, {ccaa:c.ccaa,precio:c.precio,prov:'',edad:33,nueva:false,segunda:false,primera:true,rural:false,rebaja:true,entrada:20,tasacion:0,ico:false,ltv:0}, c.v || {});
  Object.assign(S.a, {titulares:1,ingresos:3200,brutos:30000,icoDatos:false,patrimonio:0,menores:0}, c.a || {});
  if (api.fiscalDatos) {
    const f = api.fiscalDatos();
    Object.assign(f, {rentaOk:true,modo:'individual',base1:20000,base2:20000,base3:20000,base4:20000,ahorro1:0,ahorro2:0,ahorro3:0,ahorro4:0,dependientes:0,patOk:true,patrimonio:0,miembros:1,valor:0,pocasViviendas:'si'});
    for (let n=0;n<32;n++) f['c'+n] = true;
    Object.assign(f, c.f || {});
  }
  return api;
}
const cerca = (a,b) => Number.isFinite(a) && Math.abs(a-b) <= 0.00500001;
function ejecutarImpuesto(s,c) {
  try { return preparar(motor(s),c).impuesto(c.precio).total; }
  catch (e) { return {error:e.message}; }
}
const resultados = casos.map(c => {
  const antes=ejecutarImpuesto(antiguo,c),despues=ejecutarImpuesto(html,c),web9OctEjecutada=ejecutarImpuesto(web9,c);
  const reproduccion9Oct=c.auditoria==='1.1'?cerca(web9OctEjecutada,c.web9OctAudit):null;
  return {...c,web9OctEjecutada,reproduccion9Oct,antes,despues,estado:cerca(despues,c.verificado)&&reproduccion9Oct!==false?'OK':'FALLO',fuentes:c.fuentes||FUENTES[c.ccaa],consulta:CONSULTA};
});

function control(nombre, ccaa, fn, esperado, meta = {}) {
  let antes,despues,web9OctEjecutada;
  try { web9OctEjecutada=fn(motor(web9)); } catch(e) { web9OctEjecutada={error:e.message}; }
  try { antes=fn(motor(antiguo)); } catch(e) { antes={error:e.message}; }
  try { despues=fn(motor(html)); } catch(e) { despues={error:e.message}; }
  resultados.push({id:'I'+String(resultados.length-casos.length+1).padStart(2,'0'),nombre,ccaa,web9OctEjecutada,antes,despues,verificado:esperado,estado:JSON.stringify(despues)===JSON.stringify(esperado)?'OK':'FALLO',fuentes:FUENTES[ccaa],consulta:CONSULTA,...meta});
}

control('Renta confirmada se invalida al cambiar comunidad','Murcia',api=>{
  preparar(api,{ccaa:'Cataluña',precio:200000});
  api.S.v.ccaa='Murcia';
  return api.fiscalDatos ? api.fiscalDatos().rentaOk : 'API no disponible';
},false);
control('Confirmaciones se invalidan al cambiar provincia','País Vasco',api=>{
  preparar(api,{ccaa:'País Vasco',precio:210000,v:{prov:'Bizkaia'}});
  api.S.v.prov='Álava';
  return api.fiscalDatos ? api.fiscalDatos().c0 : 'API no disponible';
},false);
control('Renta se invalida al cambiar número de titulares','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:200000});
  api.S.a.titulares=2;
  return api.fiscalDatos ? api.fiscalDatos().rentaOk : 'API no disponible';
},false);
control('Un contexto estable conserva datos fiscales','Murcia',api=>{
  preparar(api,{ccaa:'Murcia',precio:210000,f:{base1:39999.99}});
  const f=api.fiscalDatos && api.fiscalDatos();
  return f ? [f.rentaOk,f.base1] : 'API no disponible';
},[true,39999.99]);
control('Nómina no determina el ITP si datos fiscales iguales','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:200000,f:{base1:36000}});
  api.S.a.ingresos=500;
  const x=api.impuesto(200000).total;
  api.S.a.ingresos=12000;
  const y=api.impuesto(200000).total;
  return [x,y];
},[10000,10000]);
control('CLM ajuste de entrada recalcula impuesto y desglose','Castilla-La Mancha',api=>{
  preparar(api,{ccaa:'Castilla-La Mancha',precio:200000,v:{edad:35,notaria:0,comision:0,fijos:0,tin:3,plazo:30},a:{ingresos:1200,ahorros:150000,colchon:0,deudas:0,esfuerzo:35}});
  const R=api.calc1(),im=R.aj.im || (R.aj.c&&R.aj.c.im);
  return {financiacionMenorMitad:R.aj.hip/200000<0.5,impuestoAjustado:im?Math.round(im.total):null,gastosAjustados:Math.round(R.aj.gastos),desgloseCoincide:!!im&&cerca(im.total,R.aj.gastos)};
},{financiacionMenorMitad:true,impuestoAjustado:18000,gastosAjustados:18000,desgloseCoincide:true});
control('Portada Estándar usa mismo ITP y fondos que entrada ajustada','Castilla-La Mancha',api=>{
  preparar(api,{ccaa:'Castilla-La Mancha',precio:200000,v:{edad:35,notaria:0,comision:0,fijos:0,tin:3,plazo:30},a:{ingresos:1200,ahorros:150000,colchon:0,deudas:0,esfuerzo:35}});
  const R=api.calc1();
  if(!api.standardResumen)return 'API no disponible';
  const H=api.standardResumen(R);
  return {
    maxDentroTopeJoven:H.mx>0&&H.mx<=240000,
    hipotecaMenorMitad:H.hip/H.mx<0.5,
    titularGeneral9:cerca(H.cm.imp,H.mx*0.09),
    titularDesgloseCoincide:cerca(H.cm.imp,H.cm.im.total),
    fondosPortadaCorrectos:cerca(H.need,H.entM+H.mx*0.09),
    fondosDentroAhorros:H.need<=api.S.a.ahorros+0.005,
    seleccionGeneral9:!!R.aj.c&&cerca(R.aj.c.imp,18000)&&cerca(R.aj.c.im.total,18000),
    fondosSeleccionCorrectos:cerca(R.aj.need,R.aj.ent+18000)
  };
},{maxDentroTopeJoven:true,hipotecaMenorMitad:true,titularGeneral9:true,titularDesgloseCoincide:true,fondosPortadaCorrectos:true,fondosDentroAhorros:true,seleccionGeneral9:true,fondosSeleccionCorrectos:true});
control('Presupuesto y vivienda elegida coherentes con tasación igual','Asturias',api=>{
  preparar(api,{ccaa:'Asturias',precio:210000,a:{ahorros:70000,ingresos:3200,colchon:6000}});
  const R=api.calc1();
  return R.aj.ok === (R.P <= R.max + 0.01);
},true);

control('Caché de caso cambia al modificar base fiscal y retirar confirmación','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:200000,v:{edad:33},a:{ahorros:65000,ingresos:3200},f:{base1:30000}});
  if(!api.casoR || !api.fiscalDatos)return 'API fiscal no disponible';
  const ver=()=>{const R=api.casoR();return [Math.round(R.c.im.total),Math.round(R.aj.need),R.aj.ok];};
  const f=api.fiscalDatos(),a=ver();
  f.base1=40000;const b=ver();
  f.base1=30000;const c=ver();
  f.rentaOk=false;const d=ver();
  return [a,b,c,d];
},[[10000,59750,true],[20000,69750,false],[10000,59750,true],[20000,69750,false]]);

for(const ahorros of [150000,170000])control('CLM casoFalta recalcula ITP con entrada ajustada y ahorro'+ahorros,'Castilla-La Mancha',api=>{
  preparar(api,{ccaa:'Castilla-La Mancha',precio:200000,v:{edad:33},a:{ingresos:1200,ahorros,colchon:6000}});
  const R=api.calc1();if(!api.casoFalta || !R.aj)return 'API de ajuste no disponible';
  const falta=api.casoFalta(R,80,35),red=x=>Math.round(x*100)/100;
  return {fondosSeleccion:red(R.aj.need),faltaAlternativa:red(falta),mismoDesfase:cerca(falta,R.aj.falta),viable:falta<=0};
},{fondosSeleccion:156593.19,faltaAlternativa:ahorros===150000?6593.19:-13406.81,mismoDesfase:true,viable:ahorros===170000});

control('CLM casoAj sin R.aj conserva impuesto ajustado','Castilla-La Mancha',api=>{
  preparar(api,{ccaa:'Castilla-La Mancha',precio:200000,v:{edad:33},a:{ingresos:1200,ahorros:150000,colchon:6000}});
  const R=api.calc1();if(!api.casoAj)return 'API de ajuste no disponible';
  delete R.aj;const A=api.casoAj(R);
  return {fondos:Math.round(A.need*100)/100,impuesto:A.c?Math.round(A.c.im.total):null,viable:A.ok};
},{fondos:156593.19,impuesto:18000,viable:false});

control('Auditoría1.3 · hasta171000 y casa165000 con más entrada','Asturias',api=>{
  preparar(api,{ccaa:'Asturias',precio:165000,v:{edad:40,entrada:20},a:{ahorros:70000,ingresos:1500}});
  const R=api.calc1(),A=R.aj;
  return {maximoRedondeado:Math.floor(R.max/1000)*1000,casaViable:A?A.ok:R.ok,entradaAumenta:!!A&&A.ent>R.c.entrada};
},{maximoRedondeado:171000,casaViable:true,entradaAumenta:true},{auditoria:'1.3',web9OctAudit:{maximoRedondeado:171000,casaViable:false},supuestos:'Se mantienen predeterminados de la versión: plazo30, TIN3 %, colchón6000, notaría1,5 %, fijos750, esfuerzo35 %, sin otras deudas, tasación igual al precio; la auditoría no detalla todos.'});

control('Auditoría1.3 · financiación100 % y casa160000','Asturias',api=>{
  preparar(api,{ccaa:'Asturias',precio:160000,v:{edad:40,entrada:0,ltv:100},a:{ahorros:70000,ingresos:1500}});
  const R=api.calc1(),A=R.aj;
  return {maximoAlcanzaCasa:R.max>=160000,casaViable:A?A.ok:R.ok,entradaAumenta:!!A&&A.ent>R.c.entrada};
},{maximoAlcanzaCasa:true,casaViable:true,entradaAumenta:true},{auditoria:'1.3',web9OctAudit:{titular:'hasta163000',casa160000:'cuota demasiado alta'},supuestos:'La segunda variante de la auditoría no reitera todos los ajustes. Se conserva el perfil previo y se fija financiación100 %, entrada0. Se verifica coherencia, sin afirmar reproducción exacta del máximo163000.'});

// Contrato expreso de esta revisión: los datos fiscales nuevos del ITP de usada
// no modifican IVA/IGIC/AJD. El oráculo aquí es la versión1119b19, no una norma nueva.
for(const ccaa of Object.keys(FUENTES)) {
  const fixture={ccaa,precio:180000,v:{nueva:true,edad:30,entrada:20,prov:ccaa==='País Vasco'?'Bizkaia':ccaa==='Baleares'?'Mallorca':''},a:{ingresos:1500}};
  const legacy=preparar(motor(antiguo),fixture),baja=legacy.impuesto(180000).total;
  legacy.S.a.ingresos=12000;const alta=legacy.impuesto(180000).total;
  control('Obra nueva aislada de S.f, renta baja/alta · '+ccaa,ccaa,api=>{
    preparar(api,fixture);
    const valor=()=>Math.round(api.impuesto(180000).total*100)/100;
    const cambiarFiscal=(val,confirmaciones)=>{if(!api.fiscalDatos)return;const f=api.fiscalDatos();Object.assign(f,val);for(let i=0;i<32;i++)f['c'+i]=confirmaciones;};
    const uno=valor();
    cambiarFiscal({rentaOk:false,patOk:false,pocasViviendas:'pendiente'},false);const dos=valor();
    cambiarFiscal({rentaOk:true,base1:900000,ahorro1:900000,patOk:true,patrimonio:900000,valor:900000,pocasViviendas:'no'},true);const tres=valor();
    api.S.a.ingresos=12000;const cuatro=valor();
    cambiarFiscal({rentaOk:false,patOk:false},false);const cinco=valor();
    cambiarFiscal({rentaOk:true,base1:0,ahorro1:0,patOk:true,patrimonio:0,valor:0,pocasViviendas:'si'},true);const seis=valor();
    return {bajaConfirmada:uno,bajaSinConfirmar:dos,bajaFiscalElevada:tres,altaFiscalElevada:cuatro,altaSinConfirmar:cinco,altaFiscalCero:seis};
  },{bajaConfirmada:baja,bajaSinConfirmar:baja,bajaFiscalElevada:baja,altaFiscalElevada:alta,altaSinConfirmar:alta,altaFiscalCero:alta},{
    alcance:'Compatibilidad de obra nueva; no validación legal de IVA/IGIC/AJD',
    fuentes:['Oráculo de conservación autorizado: repositorio FinanzasEnAccion/vivienda, commit1119b19, index.html; sin modificar sus reglas IVA/IGIC/AJD'],
    supuestos:'Precio180000, edad30, habitual primera, entrada20 %, un titular. Nómina baja1500 y alta12000 netos/mes. Alternar rentaOk/patOk, bases fiscales0/900000, valor fiscal0/900000 y32confirmaciones debe conservar exactamente el resultado antiguo para cada perfil.'
  });
}

control('Aviso potencial Cataluña informa sin aplicar ni mutar los datos','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:210000,v:{edad:30},f:{rentaOk:false}});
  if(!api.rebajaRentaPendiente||!api.avisoRebajaRenta)return 'API de aviso no disponible';
  const antes=JSON.stringify(api.S),pot=api.rebajaRentaPendiente(210000,42000),html=api.avisoRebajaRenta(pot,'esta vivienda');
  return {ahorro:pot&&pot.ahorro,impuestoCobrado:api.impuesto(210000).total,datosIntactos:JSON.stringify(api.S)===antes,
    etiquetaFiscalPortada:!!pot&&pot.texto.includes('base imponible del IRPF')&&pot.texto.includes('36.000 € o menos')&&!pot.texto.includes('mínimo personal'),
    mensajeCondicional:/Podrías pagar/.test(html)&&/10\.500/.test(html),botonDatos:/data-x=["']fiscal["']/.test(html)};
},{ahorro:10500,impuestoCobrado:21000,datosIntactos:true,etiquetaFiscalPortada:true,mensajeCondicional:true,botonDatos:true});

for(const [base,impuesto] of [[36000,10500],[36000.01,21000]])control('Aviso Cataluña desaparece con renta fiscal confirmada '+base,'Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:210000,v:{edad:30},f:{rentaOk:true,base1:base}});
  if(!api.rebajaRentaPendiente)return 'API de aviso no disponible';
  return {aviso:api.rebajaRentaPendiente(210000,42000),impuestoCobrado:api.impuesto(210000).total};
},{aviso:null,impuestoCobrado:impuesto});

control('Aviso Cataluña no ofrece beneficio por edad ya incumplida','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:210000,v:{edad:36},f:{rentaOk:false}});
  return api.rebajaRentaPendiente?api.rebajaRentaPendiente(210000,42000):'API de aviso no disponible';
},null);

control('Aviso de ITP nunca se muestra para obra nueva','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:180000,v:{nueva:true,edad:30},a:{ingresos:1500},f:{rentaOk:false}});
  return api.rebajaRentaPendiente?api.rebajaRentaPendiente(180000,36000):'API de aviso no disponible';
},null);

control('Aviso potencial no infiere renta a partir de nómina','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:210000,v:{edad:30},f:{rentaOk:false}});
  if(!api.rebajaRentaPendiente)return 'API de aviso no disponible';
  api.S.a.ingresos=500;const uno=api.rebajaRentaPendiente(210000,42000);
  api.S.a.ingresos=20000;const dos=api.rebajaRentaPendiente(210000,42000);
  return [uno&&uno.ahorro,dos&&dos.ahorro,api.impuesto(210000).total];
},[10500,10500,21000]);

control('Aviso Canarias mide ahorro frente a5 % ya aplicable','Canarias',api=>{
  preparar(api,{ccaa:'Canarias',precio:200000,v:{edad:30},f:{rentaOk:false}});
  if(!api.rebajaRentaPendiente)return 'API de aviso no disponible';
  const pot=api.rebajaRentaPendiente(200000,40000);
  return {ahorro:pot&&pot.ahorro,importePotencial:pot&&pot.importe,impuestoCobrado:api.impuesto(200000).total};
},{ahorro:2000,importePotencial:8000,impuestoCobrado:10000});

control('Aviso Canarias no ofrece reducción sobre tope de vivienda','Canarias',api=>{
  preparar(api,{ccaa:'Canarias',precio:210000,v:{edad:30},f:{rentaOk:false}});
  return api.rebajaRentaPendiente?api.rebajaRentaPendiente(210000,42000):'API de aviso no disponible';
},null);

control('Aviso pendiente avisa también de requisitos documentales','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:210000,v:{edad:30},a:{titulares:2},f:{rentaOk:false}});
  if(!api.rebajaRentaPendiente||!api.avisoRebajaRenta)return 'API de aviso no disponible';
  const f=api.fiscalDatos();for(let i=0;i<32;i++)f['c'+i]=false;
  const pot=api.rebajaRentaPendiente(210000,42000),html=api.avisoRebajaRenta(pot,'esta vivienda');
  return {ahorro:pot&&pot.ahorro,otrosPendientes:!!(pot&&pot.otrosPendientes),textoOtrosRequisitos:/confirmas los demás requisitos/.test(html),impuestoCobrado:api.impuesto(210000).total};
},{ahorro:10500,otrosPendientes:true,textoOtrosRequisitos:true,impuestoCobrado:21000});

// Conservación de los impuestos que llegan al cálculo hipotecario: no basta
// con comprobar impuesto(P) aislado cuando cambia la financiación efectiva.
for(const ccaa of ['Canarias','Cataluña','Galicia','Castilla-La Mancha'])for(const escenario of [
  {nombre:'tasación igual y más entrada',tasacion:0,ingresos:1200},
  {nombre:'tasación baja sin ajuste posterior',tasacion:90000,ingresos:3200},
  {nombre:'tasación baja y más entrada',tasacion:100000,ingresos:1200}
]) {
  const fixture={ccaa,precio:180000,v:{nueva:true,edad:30,entrada:20,tasacion:escenario.tasacion},a:{ingresos:escenario.ingresos,ahorros:150000,colchon:6000},f:{rentaOk:false,patOk:false,valor:900000}};
  const resumir=api=>{const R=api.calc1(),red=x=>Math.round(x*100)/100;return {
    impuestoActual:red(R.c.im.total),impuestoAjustado:red(R.aj.c?R.aj.c.imp:R.aj.gastos-R.c.not-R.c.com-R.c.fijos),
    gastosAjustados:red(R.aj.gastos),fondosActuales:red(R.need),fondosAjustados:red(R.aj.need),
    hipotecaActual:red(R.hip),hipotecaAjustada:red(R.aj.hip),masEntrada:R.aj.mas,maximo:red(R.max)
  };};
  const esperado=resumir(preparar(motor(antiguo),fixture));
  control('Obra nueva calc1 y financiación · '+ccaa+' · '+escenario.nombre,ccaa,api=>{
    preparar(api,fixture);const antes=resumir(api);
    if(api.fiscalDatos){const f=api.fiscalDatos();Object.assign(f,{rentaOk:true,base1:900000,ahorro1:900000,patOk:true,patrimonio:900000,valor:900000});for(let i=0;i<32;i++)f['c'+i]=false;}
    return {sinConfirmar:antes,datosFiscalesElevados:resumir(api)};
  },{sinConfirmar:esperado,datosFiscalesElevados:esperado},{
    alcance:'Compatibilidad hipotecaria de obra nueva; no revisión legal de IVA/IGIC/AJD',
    fuentes:['Oráculo de conservación autorizado: commit1119b19, index.html, impuesto y calc1'],
    supuestos:`Precio180000, edad30, entrada inicial20 %, tasación${escenario.tasacion||'igual al precio'}, nómina${escenario.ingresos}, ahorros150000, colchón6000. Se conservan impuestos actuales y ajustados, fondos, hipoteca y máximo de la versión anterior aun cambiando S.f.`
  });
}

const GRUPO_CONDICIONAL={grupo:'veredicto condicional'};
function prepararCondicional(api,opts={}) {
  preparar(api,{ccaa:'Cataluña',precio:210000,v:{edad:30,...opts.v},a:{ahorros:70000,ingresos:3200,...opts.a},f:{rentaOk:false,...opts.f}});
  if(!api.veredictoRentaPendiente||!api.avisosRentaEstandar||!api.tarjetaRentaCondicional)return null;
  const R=api.calc1(),resumen=api.standardResumen(R),avisos=api.avisosRentaEstandar(R,resumen);
  return {R,resumen,avisos};
}
control('Veredicto ámbar cuando confirmar renta permitiría comprar','Cataluña',api=>{
  const x=prepararCondicional(api);if(!x)return 'API condicional no disponible';
  const {R,avisos}=x,antes=JSON.stringify([api.S,R]),v=api.veredictoRentaPendiente(R,avisos.potCasa);
  return {faltaSin:v&&v.faltaSin,ahorro:v&&v.ahorro,necesidadCon:v&&v.needCon,llegaCon:!!(v&&v.llegaCon),condicionado:!!(v&&v.condicionado),
    impuestoSinAplicar:api.impuesto(210000).total,veredictoReal:R.aj.ok,datosIntactos:JSON.stringify([api.S,R])===antes};
},{faltaSin:2900,ahorro:10500,necesidadCon:62400,llegaCon:true,condicionado:true,impuestoSinAplicar:21000,veredictoReal:false,datosIntactos:true},GRUPO_CONDICIONAL);

control('Tarjeta condicional tiene un aviso, un botón y condición explícita','Cataluña',api=>{
  const x=prepararCondicional(api);if(!x)return 'API condicional no disponible';
  const html=api.tarjetaRentaCondicional(x.R,x.avisos.condicional)+x.avisos.casaHtml+x.avisos.maximoHtml;
  return {ambar:/class=["']s-verd warn["']/.test(html),condicion:/te llega si tu base imponible del IRPF/.test(html),
    limite:/36\.000/.test(html),ahorro:/10\.500/.test(html),siNo:/Si no, te faltan 2\.900/.test(html),
    avisos:(html.match(/data-renta-pendiente/g)||[]).length,botones:(html.match(/data-x=["']fiscal["']/g)||[]).length,
    avisoMaximo:x.avisos.maximoHtml,avisoExtraCasa:x.avisos.casaHtml};
},{ambar:true,condicion:true,limite:true,ahorro:true,siNo:true,avisos:1,botones:1,avisoMaximo:'',avisoExtraCasa:''},GRUPO_CONDICIONAL);

for(const [ahorros,viable] of [[60000,false],[80000,true]])control('Sin ámbar si la rebaja no cambia el veredicto · ahorros'+ahorros,'Cataluña',api=>{
  const x=prepararCondicional(api,{a:{ahorros}});if(!x)return 'API condicional no disponible';
  return {condicional:x.avisos.condicional,veredictoReal:x.R.aj.ok,tarjeta:api.tarjetaRentaCondicional(x.R,x.avisos.condicional),
    avisosCasa:(x.avisos.casaHtml.match(/data-renta-pendiente/g)||[]).length,avisoMaximo:x.avisos.maximoHtml};
},{condicional:null,veredictoReal:viable,tarjeta:'',avisosCasa:1,avisoMaximo:''},GRUPO_CONDICIONAL);

for(const [base,viable] of [[36000,true],[36000.01,false]])control('Con renta confirmada el veredicto es definitivo · base'+base,'Cataluña',api=>{
  const x=prepararCondicional(api,{f:{rentaOk:true,base1:base}});if(!x)return 'API condicional no disponible';
  return {condicional:x.avisos.condicional,veredictoReal:x.R.aj.ok,potencial:x.avisos.potCasa,avisoCasa:x.avisos.casaHtml,avisoMaximo:x.avisos.maximoHtml};
},{condicional:null,veredictoReal:viable,potencial:null,avisoCasa:'',avisoMaximo:''},GRUPO_CONDICIONAL);

control('Edad fuera de requisito no provoca veredicto condicional','Cataluña',api=>{
  const x=prepararCondicional(api,{v:{edad:36}});if(!x)return 'API condicional no disponible';
  return {condicional:x.avisos.condicional,potencial:x.avisos.potCasa,veredictoReal:x.R.aj.ok};
},{condicional:null,potencial:null,veredictoReal:false},GRUPO_CONDICIONAL);

control('Sin casa en mente solo aparece aviso del máximo','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:0,v:{edad:30},a:{ahorros:70000,ingresos:3200},f:{rentaOk:false}});
  if(!api.avisosRentaEstandar)return 'API condicional no disponible';
  const R=api.calc1(),avisos=api.avisosRentaEstandar(R,api.standardResumen(R));
  return {condicional:avisos.condicional,potencialCasa:avisos.potCasa,avisoCasa:avisos.casaHtml,
    avisosMaximo:(avisos.maximoHtml.match(/data-renta-pendiente/g)||[]).length,botones:(avisos.maximoHtml.match(/data-x=["']fiscal["']/g)||[]).length};
},{condicional:null,potencialCasa:null,avisoCasa:'',avisosMaximo:1,botones:1},GRUPO_CONDICIONAL);

control('Ahorro fiscal no subsana financiación insuficiente','Cataluña',api=>{
  preparar(api,{ccaa:'Cataluña',precio:200000,v:{edad:30,entrada:20,tin:3,plazo:30},a:{ahorros:65000,ingresos:1500},f:{rentaOk:false}});
  if(!api.avisosRentaEstandar)return 'API condicional no disponible';
  const R=api.calc1(),avisos=api.avisosRentaEstandar(R,api.standardResumen(R));
  return {condicional:avisos.condicional,veredictoReal:R.aj.ok,necesidadAjustada:Math.round(R.aj.need*100)/100,
    ahorro:avisos.potCasa&&avisos.potCasa.ahorro,masEntrada:R.aj.mas,faltaMayorAhorro:R.aj.falta>avisos.potCasa.ahorro};
},{condicional:null,veredictoReal:false,necesidadAjustada:105225.57,ahorro:10000,masEntrada:true,faltaMayorAhorro:true},GRUPO_CONDICIONAL);

for(const guarda of ['entrada','hipoteca','cuota','plazo'])control('Veredicto pendiente respeta límite de '+guarda,'Cataluña',api=>{
  const x=prepararCondicional(api);if(!x)return 'API condicional no disponible';
  const R=JSON.parse(JSON.stringify(x.R));
  if(guarda==='entrada')R.aj.ent=R.em.eur-1;
  if(guarda==='hipoteca')R.aj.hip=R.hipMax+1;
  if(guarda==='cuota')R.aj.cuota=R.cuotaMax+1;
  if(guarda==='plazo')R.aj.plazo=76-api.S.v.edad;
  return api.veredictoRentaPendiente(R,x.avisos.potCasa);
},null,GRUPO_CONDICIONAL);

control('Un desfase ya tolerado no cambia el veredicto a ámbar','Cataluña',api=>{
  const x=prepararCondicional(api,{a:{ahorros:72899.5}});if(!x)return 'API condicional no disponible';
  return {veredictoReal:x.R.aj.ok,condicional:x.avisos.condicional};
},{veredictoReal:true,condicional:null},GRUPO_CONDICIONAL);

const fallos=resultados.filter(r=>r.estado!=='OK');
console.log(`${resultados.length-fallos.length}/${resultados.length} comprobaciones correctas. Base anterior: ${BASE}.`);
for (const r of fallos) console.error(`${r.id} ${r.nombre}: actual=${JSON.stringify(r.despues)}; verificado=${JSON.stringify(r.verificado)}`);
if (process.argv.includes('--informe')) {
  const dir=path.resolve(ROOT,'..','Evidencias ITP');
  fs.mkdirSync(dir,{recursive:true});
  const cobertura=resultados.reduce((acc,r)=>{const grupo=r.grupo==='veredicto condicional'?'veredictoCondicional':/obra nueva/i.test(r.alcance||'')?'conservacionObraNueva':/^Aviso /.test(r.nombre)?'avisoPotencialRenta':'regresionesAnteriores';acc[grupo]=(acc[grupo]||0)+1;return acc;},{});
  const datos={consulta:CONSULTA,ejecucion:new Date().toISOString(),auditoria:{archivo:AUDITORIA,apartados:['1.1','1.2','1.3'],commitWeb9Oct:WEB9,casosTabla1_1:9,reproducidos:resultados.filter(r=>r.reproduccion9Oct===true).length},baseAnterior:BASE,descripcion:'Nueve casos exactos de la tabla1.1 de la auditoría, escenarios1.2/1.3 y regresiones adicionales. Incluye ahorro potencial sin aplicación automática, aislamiento de obra nueva y tarjeta ámbar solo cuando la rebaja pendiente cambia el veredicto respetando financiación, cuota y plazo. Se comprueba un solo aviso por tarjeta y ausencia de aviso de máximo con una vivienda seleccionada. Los supuestos fiscales ausentes en la auditoría se declaran caso a caso. No se transforma salario en renta fiscal para ITP usado.',cobertura,total:resultados.length,correctos:resultados.length-fallos.length,fallos:fallos.length,resultados};
  const nombre='Resultados publicación ITP · 6 noviembre 2026';
  fs.writeFileSync(path.join(dir,nombre+'.json'),JSON.stringify(datos,null,2)+'\n','utf8');
  const numero=x=>typeof x==='number'?x.toFixed(6).replace(/0+$/,'').replace(/\.$/,''):JSON.stringify(x);
  const lineas=[`PRUEBAS ITP · Consulta ${CONSULTA}`,`Ejecución: ${datos.ejecucion}`,`Web9/10: auditoría y ejecución del commit ${WEB9}. Repositorio antes de esta rama: ${BASE}. Corregido: index.html local.`,datos.descripcion,`Auditoría leída: ${AUDITORIA}`,`Resultado: ${datos.correctos}/${datos.total} correctas; ${datos.auditoria.reproducidos}/9 importes históricos de la tabla1.1 reproducidos exactamente.`,
    'Las cifras anteriores usan la interfaz y estimaciones antiguas; los datos fiscales nuevos no tenían equivalente exacto en esa versión. Los importes verificados de ITP usado proceden de reglas oficiales documentadas. Los casos de obra nueva son exclusivamente regresiones de conservación exacta respecto de1119b19: no certifican ni modifican sus reglas de IVA/IGIC/AJD.',
    'Valores por defecto salvo cambio en cada caso: vivienda usada, habitual y primera; edad33; un titular; no rural; entrada20 %; sinICO; nómina3200/mes; datos fiscales confirmados, declaración individual, magnitud fiscal20000 por titular, ahorro0, patrimonio0, un miembro familiar; requisitos documentales y especiales confirmados. En generales se desactiva rebaja. La base fiscal coincide con precio salvo valor indicado. Pocas viviendas=si. Las confirmaciones representan supuestos cumplidos, no pruebas documentales reales.',
    'Las comparaciones numéricas usan tolerancia de medio céntimo; no redondean por tramos ni corrigen silenciosamente errores. Pruebas con titulares desiguales esperan cálculo conservador y beneficio parcial pendiente cuando el motor no individualiza cuotas.',
    'SEPARACIÓN DE VERSIONES: una cifra ya corregida entre9/10 y1119b19 no se atribuye a esta rama. En las cuatro columnas, Web9/10 diferencia lo transcrito de la auditoría y lo ejecutado. Una API de integración inexistente en una versión antigua se marca como tal, no se inventa un resultado.',
    '', 'TABLA1.1 · NUEVE CASOS DE LA AUDITORÍA',
    'Caso | Web9/10 (auditoría; ejecutado) | Repositorio antes1119b19 | Corregido | Verificado'];
  for(const r of resultados.filter(r=>r.auditoria==='1.1'))lineas.push(`${r.id} ${r.ccaa} | ${numero(r.web9OctAudit)}; ${numero(r.web9OctEjecutada)} | ${numero(r.antes)} | ${numero(r.despues)} | ${numero(r.verificado)}`);
  lineas.push('Baleares: la auditoría muestra7791 al euro; cálculo exacto7790,928, liquidación al céntimo7790,93. No es un cambio normativo.','','DETALLE Y SUPUESTOS');
  for(const r of resultados){lineas.push(`${r.id} · ${r.estado} · ${r.nombre}`,`Web9/10: ${r.web9OctAudit!=null?'auditoría='+numero(r.web9OctAudit)+'; ':''}ejecutado=${numero(r.web9OctEjecutada)} | Repositorio antes: ${numero(r.antes)} | Corregido: ${numero(r.despues)} | Verificado: ${numero(r.verificado)}`,r.precio!=null?`Entrada del caso: ${JSON.stringify({precio:r.precio,v:r.v||{},a:r.a||{},f:r.f||{}})}`:'Control de integración/estado.',r.supuestos?'Supuestos: '+r.supuestos:'',`Fuente: ${r.fuentes.join(' | ')}`,`Consulta: ${CONSULTA}`,r.nota||'','');}
  fs.writeFileSync(path.join(dir,nombre+'.txt'),lineas.join('\n'),'utf8');
  console.log('Informe escrito en '+dir);
}
process.exitCode=fallos.length?1:0;
