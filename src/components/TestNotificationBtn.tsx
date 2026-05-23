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
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        alert('테스트 알림 발송에 실패했습니다.\n\n아이폰(iOS) 유저의 경우, "사파리(Safari) 브라우저" 하단의 [공유(↑)] 버튼을 눌러 *"홈 화면에 추가"*를 한 뒤, 바탕화면에 생성된 앱으로 접속해야만 알림을 받을 수 있습니다.');
      } else {
        alert('테스트 알림 발송에 실패했습니다.\n브라우저 알림 설정이 차단되어 있는지 확인해 주세요.');
      }
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
        fontSize: 12,
        fontWeight: 600,
        cursor: isTesting ? 'not-allowed' : 'pointer',
        padding: '0 2px',
        textDecoration: 'underline',
        textUnderlineOffset: 4,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        marginLeft: '-4px'
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
