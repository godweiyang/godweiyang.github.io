/* sw.js — 颜值实验室正式版 Service Worker */
const CACHE_NAME = 'yanzhi-v90.1-20261016f'
self.addEventListener('install', () => {
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== location.origin) return
  // HTML: network-first
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('/yanzhi/') ||
    url.pathname.endsWith('index.html')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const clone = resp.clone()
          caches
            .open(CACHE_NAME)
            .then((c) => c.put(event.request, clone))
            .catch(() => {})
          return resp
        })
        .catch(() => caches.match(event.request)),
    )
    return
  }
  // Large binaries: skip SW cache (too big for Cache Storage quota)
  if (/\.(onnx|wasm|task)$/.test(url.pathname)) return
  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((resp) => {
        if (resp.ok) {
          const clone = resp.clone()
          caches
            .open(CACHE_NAME)
            .then((c) => c.put(event.request, clone))
            .catch(() => {})
        }
        return resp
      })
    }),
  )
})
