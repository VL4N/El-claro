// El Claro: trabajador de servicio. Guarda el juego para que abra sin conexión
// y busca la versión nueva cuando hay red.
const CACHE = "el-claro-v1";
const ARCHIVOS = ["./", "./index.html", "./motor.js", "./manifest.webmanifest",
  "./icono-192.png", "./icono-512.png", "./icono-512-maskable.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Red primero; si falla, caché. Así siempre se juega la última versión cuando hay conexión.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((resp) => {
      const copia = resp.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
      return resp;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
