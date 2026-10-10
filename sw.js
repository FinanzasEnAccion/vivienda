/* App instalable (v3: las tipografías se sirven desde el propio sitio y se guardan con la página, para que sin conexión se vea igual;
   v2: la página y los datos se revalidan siempre con el servidor, sin esperar a la caché de 10 minutos).
   App instalable: guarda la calculadora en el móvil para abrirla sin conexión.
   La página y los datos de mercado se piden siempre primero a internet (así nunca se queda un Euríbor viejo);
   solo si no hay conexión se usa la copia guardada.
   Si cambias un fichero de BASE (iconos, tipografías), sube el número de CACHE para que se renueve la copia guardada. */
const CACHE='fea-vivienda-v3';
const BASE=['./','index.html','data.json','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png',
  'fonts/instrument-sans-latin-wght-normal.woff2','fonts/instrument-sans-latin-ext-wght-normal.woff2',
  'fonts/bricolage-grotesque-latin-opsz-normal.woff2','fonts/bricolage-grotesque-latin-ext-opsz-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return; // librerías del PDF (otro dominio): como siempre
  const red=req.mode==='navigate'||/\/(index\.html)?$/.test(url.pathname)||url.pathname.endsWith('data.json');
  if(red){
    e.respondWith(fetch(req.mode==='navigate'?req.url:req,{cache:'no-cache'}).then(r=>{if(r.ok){const k=req.mode==='navigate'?'index.html':url.pathname.endsWith('data.json')?'data.json':req;const cp=r.clone();caches.open(CACHE).then(c=>c.put(k,cp))}return r})
      .catch(()=>caches.match(req.mode==='navigate'?'index.html':req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
    return}
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(n=>{if(n.ok){const cp=n.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return n})));
});
