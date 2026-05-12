import { useState, useRef, useCallback, useEffect } from 'react';
import type { AlertItem, VacancyLog } from '../types';
import type { RegisterParams } from '../types';

function ts() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map(v => String(v).padStart(2, '0')).join(':');
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const API = import.meta.env.VITE_API_URL as string;
const POLL_INTERVAL = 3000;

export function useAlertStore() {
  const alertIdRef = useRef(0);
  const logIdRef = useRef(0);
  const triggeredIdsRef = useRef<Set<number>>(new Set());
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onVacancyRef = useRef<((item: AlertItem) => void) | null>(null);
  const pushSubRef = useRef<PushSubscription | null>(null);

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    try { const saved = localStorage.getItem('courseAlerts'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [logs, setLogs] = useState<VacancyLog[]>(() => {
    try { const saved = localStorage.getItem('courseLogs'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [hitCount, setHitCount] = useState<number>(() => {
    try { const saved = localStorage.getItem('courseHitCount'); return saved ? Number(saved) : 0; } catch { return 0; }
  });

  // 서버 헬스체크
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/health`);
        setServerOk(res.ok);
      } catch {
        setServerOk(false);
      }
    };
    check();
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, []);

  // Web Push 초기화 및 구독
  useEffect(() => {
    async function initPush() {
      try {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          let sub = await registration.pushManager.getSubscription();
          
          if (!sub) {
            const res = await fetch(`${API}/api/vapidPublicKey`);
            if (res.ok) {
              const { publicKey } = await res.json();
              if (publicKey) {
                sub = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(publicKey)
                });
              }
            }
          }
          pushSubRef.current = sub;
          syncBackend(); // 초기 로드 시 백엔드와 동기화
        }
      } catch (err) {
        console.error('Push setup failed:', err);
      }
    }
    initPush();
  }, []);

  // 백엔드에 구독 정보 및 모니터링 과목 목록 전송
  const syncBackend = useCallback(async () => {
    try {
      let sub = pushSubRef.current;
      
      // 구독 정보가 없다면 권한 요청 및 구독 시도 (사용자 상호작용 시점에 호출됨)
      if (!sub && 'serviceWorker' in navigator && 'PushManager' in window) {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          sub = await registration.pushManager.getSubscription();
          
          if (!sub) {
            const res = await fetch(`${API}/api/vapidPublicKey`);
            if (res.ok) {
              const { publicKey } = await res.json();
              if (publicKey) {
                sub = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(publicKey)
                });
              }
            }
          }
          pushSubRef.current = sub;
        }
      }

      if (sub) {
        const courses = alerts.map(a => a.code).filter(c => c !== 'TIME');
        await fetch(`${API}/api/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub,
            courses
          })
        });
      }
    } catch (err) {
      console.error('Failed to sync subscriptions to backend', err);
    }
  }, [alerts]);

  // 알림 목록이 바뀔 때마다 백엔드 동기화
  useEffect(() => {
    syncBackend();
  }, [alerts, syncBackend]);

  const startTicker = useCallback(() => {
    if (tickerRef.current) return;
    tickerRef.current = setInterval(() => {
      setAlerts(prev => {
        if (prev.length === 0) return prev;

        prev.forEach(async (alert) => {
          try {
            const url = alert.code !== 'TIME'
              ? `${API}/api/courses/${alert.code}`
              : `${API}/api/courses?day=${alert.day}`;

            const res = await fetch(url);
            if (!res.ok) return;

            if (alert.code !== 'TIME') {
              const course = await res.json();
              if (course.remain > 0) {
                if (triggeredIdsRef.current.has(alert.id)) {
                  setAlerts(prev2 => prev2.map(a => a.id === alert.id ? { ...a, current: course.enrolled, max: course.limit, checks: a.checks + 1, lastChecked: ts() } : a));
                  return;
                }
                triggeredIdsRef.current.add(alert.id);
                const triggered: AlertItem = { ...alert, current: course.enrolled, max: course.limit, status: 'triggered', checks: alert.checks + 1, lastChecked: ts() };
                setAlerts(prev2 => prev2.map(a => a.id === alert.id ? triggered : a));
                setHitCount(h => h + 1);
                setLogs(prev2 => [{ id: ++logIdRef.current, courseId: alert.code, courseName: alert.name, triggeredAt: ts() }, ...prev2]);
                onVacancyRef.current?.(triggered);
              } else {
                triggeredIdsRef.current.delete(alert.id);
                setAlerts(prev2 => prev2.map(a => a.id === alert.id ? { ...a, current: course.enrolled, max: course.limit, status: 'monitoring', checks: a.checks + 1, lastChecked: ts() } : a));
              }
            } else {
              const all = await res.json();
              const [pFrom, pTo] = alert.period.replace('교시', '').split('-').map(Number);
              const matched = all.filter((c: any) => {
                const [from, to] = c.time.includes('-') ? c.time.split('-').map(Number) : [Number(c.time), Number(c.time)];
                return from <= pTo && to >= pFrom && c.remain > 0;
              });

              if (matched.length > 0) {
                if (triggeredIdsRef.current.has(alert.id)) {
                  setAlerts(prev2 => prev2.map(a => a.id === alert.id ? { ...a, checks: a.checks + 1, lastChecked: ts() } : a));
                  return;
                }
                triggeredIdsRef.current.add(alert.id);
                const triggered: AlertItem = { ...alert, status: 'triggered', checks: alert.checks + 1, lastChecked: ts() };
                setAlerts(prev2 => prev2.map(a => a.id === alert.id ? triggered : a));
                setHitCount(h => h + 1);
                setLogs(prev2 => [{ id: ++logIdRef.current, courseId: alert.code, courseName: alert.name, triggeredAt: ts() }, ...prev2]);
                onVacancyRef.current?.(triggered);
              } else {
                triggeredIdsRef.current.delete(alert.id);
                setAlerts(prev2 => prev2.map(a => a.id === alert.id ? { ...a, status: 'monitoring', checks: a.checks + 1, lastChecked: ts() } : a));
              }
            }
          } catch {}
        });

        return prev;
      });
    }, POLL_INTERVAL);
  }, []);

  const stopTickerIfEmpty = useCallback((nextAlerts: AlertItem[]) => {
    if (nextAlerts.length === 0) {
      if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
    }
  }, []);

  const setOnVacancy = useCallback((cb: (item: AlertItem) => void) => {
    onVacancyRef.current = cb;
  }, []);

  const register = useCallback(({ mode, code, division, day, timeFrom, timeTo, name, enrolled, limit }: RegisterParams) => {
    if (mode === 'course') {
      const courseId = `${code}-${division}`;
      if (alerts.some(a => a.code === courseId)) {
        return false;
      }
      const item: AlertItem = {
        id: ++alertIdRef.current,
        code: courseId, name,
        day: day ?? '', period: `${timeFrom}-${timeTo}교시`,
        status: 'monitoring',
        current: enrolled, max: limit,
        checks: 0, regTime: ts(), lastChecked: '-',
      };
      setAlerts(prev => { const next = [item, ...prev]; startTicker(); return next; });
      return true;
    } else {
      const label = `${day}요일 ${timeFrom}-${timeTo}교시`;
      if (alerts.some(a => a.day === day && a.period === `${timeFrom}-${timeTo}교시`)) return false;
      const item: AlertItem = {
        id: ++alertIdRef.current,
        code: 'TIME', name: label,
        day: day!, period: `${timeFrom}-${timeTo}교시`,
        status: 'monitoring',
        current: enrolled, max: limit,
        checks: 0, regTime: ts(), lastChecked: '-',
      };
      setAlerts(prev => { const next = [item, ...prev]; startTicker(); return next; });
      return true;
    }
  }, [alerts, startTicker]);

  const remove = useCallback((id: number) => {
    setAlerts(prev => {
      const next = prev.filter(x => x.id !== id);
      stopTickerIfEmpty(next);
      return next;
    });
  }, [stopTickerIfEmpty]);

  const resetAll = useCallback(() => {
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
    triggeredIdsRef.current.clear();
    setAlerts([]);
    setLogs([]);
    setHitCount(0);
  }, []);

  useEffect(() => {
    if (alerts.length > 0) alertIdRef.current = Math.max(...alerts.map(a => a.id));
    if (logs.length > 0) logIdRef.current = Math.max(...logs.map(l => l.id));
    if (alerts.length > 0) startTicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { localStorage.setItem('courseAlerts', JSON.stringify(alerts)); }, [alerts]);
  useEffect(() => { localStorage.setItem('courseLogs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('courseHitCount', hitCount.toString()); }, [hitCount]);

  const monitoringCount = alerts.length;
  const hasMonitoring = alerts.length > 0;

  return {
    alerts, logs, serverOk, hitCount,
    monitoringCount, hasMonitoring,
    register, remove,
    resetAll, setOnVacancy,
  };
}