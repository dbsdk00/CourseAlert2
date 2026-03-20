// public/sw.js
// 이 파일은 브라우저 백그라운드에서 실행되는 Service Worker입니다.
// 서버에서 푸시가 오면 OS 알림을 띄워줍니다.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.courseId,           // 같은 과목은 알림 하나만 유지
      requireInteraction: true,     // 사용자가 직접 닫을 때까지 유지
      data: { courseId: data.courseId },
    })
  );
});

// 알림 클릭 시 웹앱으로 이동
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://coursealert.netlify.app')
  );
});
