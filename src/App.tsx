import { useState, useEffect } from 'react';
import './App.css';
import { useAlertStore } from './hooks/useAlertStore';
import TopBar from './components/TopBar';
import RegisterForm from './components/RegisterForm';
import AlertList from './components/AlertList';
import DemoBar from './components/DemoBar';
import Popup from './components/Popup';
import type { AlertItem } from './types';

export default function App() {
  const store = useAlertStore();
  const [popupAlerts, setPopupAlerts] = useState<AlertItem[]>([]); // ← 배열로 변경

  useEffect(() => {
    store.setOnVacancy((triggered: AlertItem) => {
      setPopupAlerts(prev => [...prev, triggered]); // ← 스택에 추가
    });
  }, [store.setOnVacancy]);

  const handleClose = (id: number) => {
    setPopupAlerts(prev => prev.filter(a => a.id !== id)); // ← 개별 닫기
  };

  return (
    <>
      <div className="ambient" />
      {/* ← 스택으로 렌더링 */}
      {popupAlerts.map((alert, index) => (
        <Popup
          key={alert.id}
          alert={alert}
          index={index}
          onClose={() => handleClose(alert.id)}
        />
      ))}
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