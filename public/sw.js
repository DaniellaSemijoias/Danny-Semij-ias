/* ===========================================================================
   DANNY SEMIJOIAS — Service worker
   Serve só para o Chrome oferecer "Instalar" e para o app abrir mais rápido.
   Regra: código novo sempre vence. Nada de versão velha presa em cache.
   =========================================================================== */

const CACHE = "danny-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   /* Supabase passa direto */

  /* Páginas: busca na rede primeiro, para nunca abrir uma versão antiga. */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => { const c = r.clone(); caches.open(CACHE).then((k) => k.put("/", c)); return r; })
        .catch(() => caches.match("/").then((r) => r || Response.error()))
    );
    return;
  }

  /* Arquivos do build já vêm com nome versionado: pode usar o cache. */
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(req).then((achou) =>
        achou || fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((k) => k.put(req, c)); return r; })
      )
    );
  }
});
