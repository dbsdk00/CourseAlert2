import { useEffect } from 'react';
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

  useEffect(() => {
    store.setOnVacancy((triggered: AlertItem) => {
      playBeep();

      // 브라우저 시스템 알림 발송 (앱 외부에서도 보이도록)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const registrationUrl = 'https://sugang.sungkyul.ac.kr';
        const n = new Notification(`${triggered.name} 빈자리 발견!`, {
          body: `[${triggered.code}] 과목에 빈자리가 생겼습니다. 클릭하여 신청하세요!`,
          icon: '/icons/icon-192.png',
          tag: `vacancy-${triggered.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          renotify: true,
          data: { url: registrationUrl }
        } as any);

        n.onclick = (e) => {
          e.preventDefault();
          window.focus();
          window.open(registrationUrl, '_blank');
        };
      }
    });
  }, [store.setOnVacancy]);

  return (
    <>
      <div className="ambient" />
      <div className="shell">
        <TopBar monitoringCount={store.monitoringCount} serverOk={store.serverOk} />
        <RegisterForm onRegister={store.register} />
        <AlertList
          alerts={store.alerts}
          logs={store.logs}
          onDelete={store.remove}
        />
      </div>
      <DemoBar onReset={store.resetAll} />
    </>
  );
}