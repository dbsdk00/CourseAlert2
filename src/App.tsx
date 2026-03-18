import { useState, useCallback } from 'react';
import './App.css';
import { useAlertStore } from './hooks/useAlertStore';
import TopBar from './components/TopBar';
import RegisterForm from './components/RegisterForm';
import AlertList from './components/AlertList';
import LogPanel from './components/LogPanel';
import DemoBar from './components/DemoBar';
import Popup from './components/Popup';
import type { AlertItem } from './types';

export default function App() {
  const store = useAlertStore();
  const [popupAlert, setPopupAlert] = useState<AlertItem | null>(null);

  const handleTrigger = useCallback(() => {
    const triggered = store.triggerVacancy();
    if (triggered) setPopupAlert(triggered);
  }, [store]);

  return (
    <>
      <div className="ambient" />
      <Popup alert={popupAlert} onClose={() => setPopupAlert(null)} />
      <div className="shell">
        <TopBar monitoringCount={store.monitoringCount} />
        <RegisterForm onRegister={store.register} />
        <AlertList
          alerts={store.alerts}
          onTogglePause={store.togglePause}
          onDelete={store.remove}
        />
        <LogPanel logs={store.logs} onClear={store.clearLogs} />
      </div>
      <DemoBar
        hasMonitoring={store.hasMonitoring}
        onTrigger={handleTrigger}
        onReset={store.resetAll}
      />
    </>
  );
}