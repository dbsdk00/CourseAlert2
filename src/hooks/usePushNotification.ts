import { useEffect } from 'react';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;
const API = import.meta.env.VITE_API_URL as string;

// base64 → Uint8Array 변환 (Web Push 스펙 요구사항)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotification() {
  useEffect(() => {
    // 브라우저가 푸시 알림을 지원하는지 확인
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const register = async () => {
      try {
        // 1. Service Worker 등록
        const reg = await navigator.serviceWorker.register('/sw.js');

        // 2. 알림 권한 요청
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('알림 권한이 거부되었습니다.');
          return;
        }

        // 3. 이미 구독 중이면 중복 등록 안 함
        const existing = await reg.pushManager.getSubscription();
        if (existing) return;

        // 4. 새 구독 생성
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // 5. 서버에 구독 정보 저장
        const subJson = subscription.toJSON();
        await fetch(`${API}/api/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: subJson.keys,
          }),
        });

        console.log('✅ 푸시 알림 구독 완료');
      } catch (err) {
        console.error('푸시 알림 등록 실패:', err);
      }
    };

    register();
  }, []);
}
