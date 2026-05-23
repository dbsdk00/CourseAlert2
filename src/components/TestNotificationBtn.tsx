import { useState } from 'react';

export default function TestNotificationBtn() {
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification('알림 테스트 성공!', {
          body: 'CourseAlert 알림이 정상적으로 설정되었습니다. 이제 빈자리가 나면 바로 알려드릴게요!',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',

          requireInteraction: true,
          tag: 'test-' + Date.now()
        });
      } else {
        new Notification('알림 테스트 성공!', {
          body: 'CourseAlert 알림이 정상적으로 설정되었습니다.',
          icon: '/icons/icon-192.png',
        });
      }
      setIsTesting(true);
      setTimeout(() => setIsTesting(false), 5000);
    } catch (err) {
      console.error('Test notification failed:', err);
      alert('테스트 알림 발송에 실패했습니다. (지원되지 않는 환경일 수 있습니다)');
    }
  };

  return (
    <button
      onClick={handleTest}
      disabled={isTesting}
      style={{
        background: 'none',
        border: 'none',
        color: isTesting ? 'var(--text-3)' : 'var(--text-2)',
        opacity: isTesting ? 0.6 : 1,
        fontSize: 13,
        fontWeight: 600,
        cursor: isTesting ? 'not-allowed' : 'pointer',
        padding: '0 8px',
        textDecoration: 'underline',
        textUnderlineOffset: 4,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}
    >
      {isTesting ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          전송 완료
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          테스트 알림
        </>
      )}
    </button>
  );
}
