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
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
      playBeep();

      // 브라우저 시스템 알림 발송 (앱 외부에서도 보이도록)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const registrationUrl = 'https://sugang.sungkyul.ac.kr';
        const title = `${triggered.name} 빈자리 발견!`;
        const options = {
          body: `[${triggered.code}] 빈자리가 생겼습니다. 클릭하여 신청하세요!`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: `vacancy-${triggered.id}`, 
          renotify: true,
          vibrate: [200, 100, 200],
          data: { url: registrationUrl }
        };

        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(title, options);
        } else {
          new Notification(title, options);
        }
      }
    });
  }, [store.setOnVacancy]);

  return (
    <>
      <div className="ambient" />
      <div className="shell">
        <TopBar 
          monitoringCount={store.monitoringCount} 
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
                  background: 'var(--red)', color: 'var(--text-0)', fontWeight: 700, cursor: 'pointer'
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
      `}</style>
    </>
  );
}