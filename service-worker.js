const CACHE_NAME = 'snowball-v1';
const ASSETS = [
  '/stock-calculator/index.html',
  '/stock-calculator/manifest.json'
];

// 설치: 핵심 파일만 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // 즉시 활성화
});

// 활성화: 이전 캐시 삭제 → 업데이트 자동 반영
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 요청: 네트워크 우선 → 실패 시 캐시 fallback
self.addEventListener('fetch', e => {
  // CDN 외부 리소스(Chart.js, 폰트 등)는 그냥 통과
  if (!e.request.url.includes(self.location.origin)) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 성공하면 캐시에도 저장
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
