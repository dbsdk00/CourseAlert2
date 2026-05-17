import { useEffect, useState } from 'react';
import './App.css';
import { useAlertStore } from './hooks/useAlertStore';
import TopBar from './components/TopBar';
import RegisterForm from './components/RegisterForm';
import AlertList from './components/AlertList';
import DemoBar from './components/DemoBar';
import type { AlertItem } from './types';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log('Beep failed', e);
  }
}

export default function App() {
  const store = useAlertStore();
  const [isLight, setIsLight] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [activeFooterTab, setActiveFooterTab] = useState<'terms' | 'privacy' | 'contact' | null>(null);

  const toggleTheme = () => {
    setIsLight(!isLight);
    document.documentElement.classList.toggle('light');
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      store.remove(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  useEffect(() => {
    store.setOnVacancy(async (triggered: AlertItem) => {
      console.log('Vacancy detected:', triggered.name);
      playBeep();

      // 브라우저 시스템 알림 발송 (앱 외부에서도 보이도록)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const registrationUrl = 'https://sugang.sungkyul.ac.kr';
        const title = `${triggered.name} 빈자리 발견!`;
        const options: any = {
          body: `[${triggered.code}] 빈자리가 생겼습니다. 클릭하여 신청하세요!`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: `vacancy-${triggered.id}-${Date.now()}`, // 태그를 유니크하게 하여 매번 팝업 보장
          renotify: true,
          vibrate: [200, 100, 200],
          requireInteraction: true,
          data: { url: registrationUrl, timestamp: Date.now() }
        };

        try {
          if ('serviceWorker' in navigator) {
            // ready가 너무 오래 걸릴 수 있으므로 타임아웃 1초 적용
            const swPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('SW timeout'), 1000));
            
            const reg = await Promise.race([swPromise, timeoutPromise]) as ServiceWorkerRegistration;
            await reg.showNotification(title, options);
            console.log('SW notification sent');
          } else {
            new Notification(title, options);
            console.log('Window notification sent');
          }
        } catch (err) {
          console.warn('Notification fallback triggered:', err);
          new Notification(title, options);
        }
      } else {
        console.warn('Notification permission not granted or API missing');
      }
    });
  }, [store.setOnVacancy]);

  return (
    <>
      <div className="ambient" />
      <div className="shell">
        <TopBar 
          serverOk={store.serverOk} 
          isLight={isLight}
          onToggleTheme={toggleTheme}
        />
        <RegisterForm onRegister={store.register} alerts={store.alerts} />
        <AlertList
          alerts={store.alerts}
          logs={store.logs}
          onDelete={(id) => setDeleteTargetId(id)}
        />

        {/* Footer */}
        <footer style={{
          marginTop: 24,
          padding: '24px 0 40px',
          borderTop: '1px solid var(--bg-3)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: 0.8
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-3)'
          }}>
            <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveFooterTab('terms'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">이용약관</a>
            <span style={{ color: 'var(--bg-3)' }}>|</span>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveFooterTab('privacy'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">개인정보처리방침</a>
            <span style={{ color: 'var(--bg-3)' }}>|</span>
            <a href="#contact" onClick={(e) => { e.preventDefault(); setActiveFooterTab('contact'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">문의하기</a>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
            © {new Date().getFullYear()} CourseAlert. All rights reserved.
          </div>
        </footer>
      </div>
      <DemoBar onReset={store.resetAll} />

      {/* 삭제 확인 모달 */}
      {deleteTargetId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: 20
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: 320, padding: '32px 24px',
            borderRadius: 24, textAlign: 'center',
            animation: 'modalIn 0.3s cubic-bezier(0.2,0.8,0.2,1)'
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', marginBottom: 8 }}>
              알림을 삭제할까요?
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28 }}>
              삭제하면 더 이상 빈자리 알림을<br />받을 수 없게 됩니다.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setDeleteTargetId(null)}
                style={{
                  flex: 1, height: 48, borderRadius: 14, border: '1px solid var(--border-md)',
                  background: 'var(--bg-2)', color: 'var(--text-1)', fontWeight: 600, cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  flex: 1, height: 48, borderRadius: 14, border: 'none',
                  background: 'var(--accent)', color: '#000', fontWeight: 700, cursor: 'pointer'
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bottom Sheet 모달 */}
      {activeFooterTab && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 3000,
        }} onClick={() => setActiveFooterTab(null)}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: 480,
            padding: '24px 24px 32px',
            borderRadius: '24px 24px 0 0', // 바텀 시트 형태의 라운드 코너
            background: 'var(--bg-1)',
            animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-0)' }}>
                {activeFooterTab === 'terms' ? '이용약관' : activeFooterTab === 'privacy' ? '개인정보처리방침' : '문의하기'}
              </span>
              <button
                onClick={() => setActiveFooterTab(null)}
                style={{
                  border: 'none', background: 'var(--bg-2)', color: 'var(--text-2)',
                  width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                  fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto', paddingRight: 4 }} className="custom-scrollbar">
              {activeFooterTab === 'terms' && (
                <>
                  본 서비스는 학내 수강신청 빈자리 알림용 개인 프로젝트입니다.<br /><br />
                  1. 이용자는 본 서비스를 정상적인 목적으로만 사용해야 하며, 악의적인 다중 요청이나 비정상적인 접근을 금지합니다.<br />
                  2. 서비스 오작동 또는 지연으로 인한 불이익에 대해 책임을 지지 않으므로 보조 수단으로 활용하시기 바랍니다.
                </>
              )}
              {activeFooterTab === 'privacy' && (
                <>
                  본 서비스는 개인정보 침해를 원천 차단하기 위해 회원가입을 받지 않습니다.<br /><br />
                  - **수집 정보**: 없음 (별도의 서버 저장을 하지 않습니다.)<br />
                  - **데이터 보관**: 이용자의 알림 신청 내역은 브라우저 로컬 저장소(LocalStorage)에 보관되며, 브라우저 캐시를 지우거나 직접 삭제할 시 완전히 파기됩니다.
                </>
              )}
              {activeFooterTab === 'contact' && (
                <>
                  서비스 이용 중 불편한 점이나 빈자리 알림 실패 등의 장애 제보는 아래 이메일로 연락해 주시면 적극 검토하겠습니다.<br /><br />
                  - **이메일**: <a href="mailto:support@coursealert.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>support@coursealert.com</a><br />
                  - **운영시간**: 상시 피드백 수렴 중
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .footer-link:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </>
  );
}