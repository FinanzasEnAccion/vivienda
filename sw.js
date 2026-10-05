/* App instalable: guarda la calculadora en el móvil para abrirla sin conexión.
   La página y los datos de mercado se piden siempre primero a internet (así nunca se queda un Euríbor viejo);
   solo si no hay conexión se usa la copia guardada. */
const CACHE='fea-vivienda-v1';
const BASE=['./','index.html','data.json','manifest.webmanifest','logo.png','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return; // librerías del PDF y fuentes: como siempre
  const red=req.mode==='navigate'||/\/(index\.html)?$/.test(url.pathname)||url.pathname.endsWith('data.json');
  if(red){
    e.respondWith(fetch(req).then(r=>{if(r.ok){const k=req.mode==='navigate'?'index.html':url.pathname.endsWith('data.json')?'data.json':req;const cp=r.clone();caches.open(CACHE).then(c=>c.put(k,cp))}return r})
      .catch(()=>caches.match(req.mode==='navigate'?'index.html':req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
    return}
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(n=>{if(n.ok){const cp=n.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return n})));
});
