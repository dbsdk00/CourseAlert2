import { useState, useRef, useCallback } from 'react';
import type { AlertItem, AlertStatus } from '../types';

function ts() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map(v => String(v).padStart(2, '0')).join(':');
}

export interface LogEntry {
  id: number;
  time: string;
  msg: string;
  type: 'normal' | 'ok' | 'hit' | 'err';
}

let _alertId = 0;
let _logId = 0;

export function useAlertStore() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([{
    id: _logId++, time: '--:--:--',
    msg: '알림을 등록하면 모니터링이 시작됩니다', type: 'normal'
  }]);
  const [checkCount, setCheckCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushLog = useCallback((msg: string, type: LogEntry['type'] = 'normal') => {
    setLogs(prev => [{ id: _logId++, time: ts(), msg, type }, ...prev].slice(0, 50));
  }, []);

  const startTicker = useCallback((_currentAlerts: AlertItem[]) => {
    if (tickerRef.current) return;
    tickerRef.current = setInterval(() => {
      setAlerts(prev => {
        const monitoring = prev.filter(a => a.status === 'monitoring');
        if (monitoring.length === 0) return prev;

        const updated = prev.map(a =>
          a.status === 'monitoring' ? { ...a, checks: a.checks + 1 } : a
        );
        setCheckCount(c => {
          const next = c + monitoring.length;
          if (next % 2 === 0) {
            const a = monitoring[Math.floor(Math.random() * monitoring.length)];
            pushLog(`[${a.code}] 확인 — ${a.current}/${a.max} 마감`, 'normal');
          }
          return next;
        });
        return updated;
      });
    }, 1800);
  }, [pushLog]);

  const stopTickerIfEmpty = useCallback((nextAlerts: AlertItem[]) => {
    if (nextAlerts.filter(a => a.status === 'monitoring').length === 0) {
      if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
    }
  }, []);

  const register = useCallback((code: string, name: string, day: string, period: string) => {
    const item: AlertItem = {
      id: ++_alertId, code, name, day, period,
      status: 'monitoring', current: 40, max: 40, checks: 0, regTime: ts()
    };
    setAlerts(prev => {
      const next = [item, ...prev];
      startTicker(next);
      return next;
    });
    pushLog(`[${code}] ${name} — 모니터링 시작`, 'ok');
  }, [pushLog, startTicker]);

  const togglePause = useCallback((id: number) => {
    setAlerts(prev => {
      const next = prev.map(a => {
        if (a.id !== id) return a;
        const newStatus: AlertStatus = a.status === 'monitoring' ? 'idle' : 'monitoring';
        pushLog(`[${a.code}] ${newStatus === 'idle' ? '모니터링 일시정지' : '모니터링 재개'}`, 'normal');
        return { ...a, status: newStatus };
      });
      if (next.find(a => a.id === id)?.status === 'monitoring') startTicker(next);
      stopTickerIfEmpty(next);
      return next;
    });
  }, [pushLog, startTicker, stopTickerIfEmpty]);

  const remove = useCallback((id: number) => {
    setAlerts(prev => {
      const a = prev.find(x => x.id === id);
      if (a) pushLog(`[${a.code}] 알림 삭제됨`, 'normal');
      const next = prev.filter(x => x.id !== id);
      stopTickerIfEmpty(next);
      return next;
    });
  }, [pushLog, stopTickerIfEmpty]);

  const triggerVacancy = useCallback((): AlertItem | null => {
  // setAlerts 밖에서 현재 alerts를 직접 읽어서 처리
  const target = alerts.find(a => a.status === 'monitoring');
  if (!target) return null;

  const triggered: AlertItem = { ...target, current: 39, status: 'triggered' };

  setAlerts(prev =>
    prev.map(a => a.id === triggered.id ? triggered : a)
  );

  pushLog(`[${triggered.code}] ✓ 빈자리 감지! — 39/40`, 'hit');
  pushLog(`[${triggered.code}] 알림 발송 → ${triggered.name} ${triggered.day}요일 ${triggered.period}`, 'ok');
  setHitCount(h => h + 1);
  setCheckCount(c => c + 1);
  stopTickerIfEmpty([...alerts.filter(a => a.id !== triggered.id), triggered]);

  return triggered;
  }, [alerts, pushLog, stopTickerIfEmpty]);

  const resetAll = useCallback(() => {
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
    setAlerts([]);
    setCheckCount(0);
    setHitCount(0);
    setLogs([{ id: _logId++, time: ts(), msg: '데모가 초기화되었습니다', type: 'normal' }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([{ id: _logId++, time: ts(), msg: '로그가 초기화되었습니다', type: 'normal' }]);
  }, []);

  const monitoringCount = alerts.filter(a => a.status === 'monitoring').length;
  const hasMonitoring = monitoringCount > 0;

  return {
    alerts, logs, checkCount, hitCount,
    monitoringCount, hasMonitoring,
    register, togglePause, remove,
    triggerVacancy, resetAll, clearLogs,
  };
}