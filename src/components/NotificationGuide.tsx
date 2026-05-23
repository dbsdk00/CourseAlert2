import { useState } from 'react';

export default function NotificationGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    if (needsReload) window.location.reload();
  };

  const handleBannerClick = async () => {
    setIsOpen(true);
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNeedsReload(true);
      }
    }
  };

  return (
    <>
      {/* 배너 버튼 */}
      <div style={{ margin: 0, width: '100%' }}>
        <button
          onClick={handleBannerClick}
          style={{
            width: '100%',
            padding: '16px',
            background: 'rgba(255, 204, 0, 0.1)',
            border: '1px solid rgba(255, 204, 0, 0.2)',
            borderRadius: '16px',
            color: 'var(--accent)',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          className="guide-banner-btn"
        >
          3초 만에 알림 설정 완료하기
        </button>
      </div>

      {/* 가이드 모달 */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '28px 24px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            position: 'relative'
          }}>
            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute', top: 20, right: 20,
                background: 'none', border: 'none', color: 'var(--text-2)',
                fontSize: 24, cursor: 'pointer', padding: 4
              }}
            >
              ×
            </button>

            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 800, color: 'var(--text-0)' }}>
              알림 설정 가이드
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* iOS 가이드 */}
              <div style={{ background: 'var(--bg-2)', padding: '16px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 15, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  iOS (아이폰/아이패드)
                </h3>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>
                  애플 정책상 반드시 <b>Safari 브라우저</b>에서 <b>'홈 화면에 추가'</b>를 해야만 알림을 받을 수 있습니다.
                </p>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  <li>하단의 <b>[공유]</b> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', margin: '0 2px' }}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> 아이콘 클릭</li>
                  <li><b>'홈 화면에 추가'</b> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', margin: '0 2px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> 클릭</li>
                  <li>바탕화면에 생성된 앱 아이콘으로 접속</li>
                  <li>알림 권한 <b>'허용'</b> 클릭</li>
                  <li style={{ marginTop: 8, color: 'var(--text-2)' }}><b>설정 완료 후 반드시 화면을 새로고침 해주세요!</b></li>
                </ol>
              </div>

              {/* Android 가이드 */}
              <div style={{ background: 'var(--bg-2)', padding: '16px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 15, color: '#3ddc84', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Android (안드로이드)
                </h3>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  <li>알림 권한 팝업 시 <b>'허용'</b> 클릭</li>
                  <li>팝업이 없다면 주소창 왼쪽 <b>[자물쇠]</b> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', margin: '0 2px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 클릭</li>
                  <li><b>'권한'</b> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', margin: '0 2px' }}><polyline points="9 18 15 12 9 6"></polyline></svg> <b>'알림'</b> 스위치를 켜주세요 <br />
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px', marginTop: 6, fontSize: 12 }}>
                      <svg width="24" height="14" viewBox="0 0 36 20" fill="none" style={{ verticalAlign: 'middle', marginRight: 6 }}><rect x="1" y="1" width="34" height="18" rx="9" stroke="var(--text-2)" strokeWidth="2" fill="transparent" /><circle cx="10" cy="10" r="5" fill="var(--text-2)" /></svg>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      <svg width="24" height="14" viewBox="0 0 36 20" fill="none" style={{ verticalAlign: 'middle', marginLeft: 6 }}><rect width="36" height="20" rx="10" fill="var(--accent)" /><circle cx="26" cy="10" r="8" fill="#000" /></svg>
                    </span>
                  </li>
                  <li style={{ marginTop: 8, color: 'var(--text-2)' }}><b>설정 완료 후 반드시 화면을 새로고침 해주세요!</b></li>
                </ol>
              </div>

              {/* PC 가이드 */}
              <div style={{ background: 'var(--bg-2)', padding: '16px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 15, color: '#4285F4', display: 'flex', alignItems: 'center', gap: 6 }}>
                  PC (Chrome / Edge / Safari)
                </h3>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  <li>주소창 왼쪽 <b>[자물쇠]</b> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', margin: '0 2px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 클릭</li>
                  <li><b>'사이트 설정'</b> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', margin: '0 2px' }}><polyline points="9 18 15 12 9 6"></polyline></svg> <b>'알림'</b> 스위치를 켜주세요 <br />
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px', marginTop: 6, fontSize: 12 }}>
                      <svg width="24" height="14" viewBox="0 0 36 20" fill="none" style={{ verticalAlign: 'middle', marginRight: 6 }}><rect x="1" y="1" width="34" height="18" rx="9" stroke="var(--text-2)" strokeWidth="2" fill="transparent" /><circle cx="10" cy="10" r="5" fill="var(--text-2)" /></svg>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      <svg width="24" height="14" viewBox="0 0 36 20" fill="none" style={{ verticalAlign: 'middle', marginLeft: 6 }}><rect width="36" height="20" rx="10" fill="var(--accent)" /><circle cx="26" cy="10" r="8" fill="#000" /></svg>
                    </span>
                  </li>
                  <li style={{ marginTop: 8, color: 'var(--text-2)' }}><b>설정 완료 후 반드시 화면을 새로고침 해주세요!</b></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .guide-banner-btn:hover {
          background: rgba(255, 204, 0, 0.15) !important;
          border-color: rgba(255, 204, 0, 0.3) !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
