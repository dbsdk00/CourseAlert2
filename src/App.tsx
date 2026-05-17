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
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('이용약관\n\n본 서비스는 학내 수강신청 빈자리 알림용 개인 프로젝트이며, 상업적 이용 및 과도한 트래픽 유발을 금지합니다.'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">이용약관</a>
            <span style={{ color: 'var(--bg-3)' }}>|</span>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('개인정보처리방침\n\n본 서비스는 별도의 회원가입 절차가 없으며, 사용자의 브라우저 알림 권한 및 저장된 데이터는 로컬 브라우저(LocalStorage) 내에서만 처리됩니다.'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">개인정보처리방침</a>
            <span style={{ color: 'var(--bg-3)' }}>|</span>
            <a href="#contact" onClick={(e) => { e.preventDefault(); alert('문의하기\n\n서비스 관련 피드백 및 오류 제보는 개발자 이메일(support@coursealert.com)로 문의해 주세요.'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">문의하기</a>
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