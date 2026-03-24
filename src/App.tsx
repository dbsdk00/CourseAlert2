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
  const [popupAlert, setPopupAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    store.setOnVacancy((triggered: AlertItem) => {
      setPopupAlert(triggered);
    });
  }, [store.setOnVacancy]);

  return (
    <>
      <div className="ambient" />
      <Popup alert={popupAlert} onClose={() => setPopupAlert(null)} />
      <div className="shell">
        <TopBar monitoringCount={store.monitoringCount} serverOk={store.serverOk} />
        <RegisterForm onRegister={store.register} />
        <AlertList
          alerts={store.alerts}
          onTogglePause={store.togglePause}
          onDelete={store.remove}
        />
      </div>
      <DemoBar onReset={store.resetAll} />
    </>
  );
}