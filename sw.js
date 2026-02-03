const CACHE_NAME = "buffet-checklist-cache-v2";
const ASSETS = ["./","./index.html","./app.js","./manifest.webmanifest","./icon-192.png","./icon-512.png"];

self.addEventListener("install",(event)=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate",(event)=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>(k!==CACHE_NAME?caches.delete(k):null))))
  );
  self.clients.claim();
});

self.addEventListener("fetch",(event)=>{
  event.respondWith(
    caches.match(event.request).then(cached=>{
      return cached || fetch(event.request).then(resp=>{
        if(event.request.method==="GET"){
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request, copy));
        }
        return resp;
      }).catch(()=>cached);
    })
  );
});
