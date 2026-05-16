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
const POLL_INTERVAL = 400;

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

    const checkAll = async () => {
      // 1. 현재 알림 목록 가져오기
      let currentAlerts: AlertItem[] = [];
      setAlerts(prev => {
        currentAlerts = prev;
        return prev;
      });

      if (currentAlerts.length === 0) return;

      // 2. 모든 과목 병렬 조회
      const results = await Promise.all(currentAlerts.map(async (alert) => {
        try {
          const url = alert.code !== 'TIME'
            ? `${API}/api/courses/${alert.code}`
            : `${API}/api/courses?day=${alert.day}`;

          const res = await fetch(url);
          if (!res.ok) return { id: alert.id, error: true };

          const data = await res.json();
          return { id: alert.id, data, type: alert.code !== 'TIME' ? 'course' : 'time' };
        } catch {
          return { id: alert.id, error: true };
        }
      }));

      // 3. 결과를 한 번에 배치 업데이트
      setAlerts(prev => {
        let changed = false;
        const next = prev.map(alert => {
          const res = results.find(r => r.id === alert.id);
          if (!res || res.error) return alert;

          if (res.type === 'course') {
            const course = res.data;
            const isTriggered = course.remain > 0;
            if (isTriggered) {
              if (!triggeredIdsRef.current.has(alert.id)) {
                triggeredIdsRef.current.add(alert.id);
                setHitCount(h => h + 1);
                setLogs(l => [{ id: ++logIdRef.current, courseId: alert.code, courseName: alert.name, triggeredAt: ts() }, ...l]);
                const triggered: AlertItem = { 
                  ...alert, 
                  current: course.enrolled, 
                  max: course.limit, 
                  status: 'triggered', 
                  checks: alert.checks + 1, 
                  lastChecked: ts() 
                };
                onVacancyRef.current?.(triggered);
                changed = true;
                return triggered;
              }
              changed = true;
              return { 
                ...alert, 
                current: course.enrolled, 
                max: course.limit, 
                checks: alert.checks + 1, 
                lastChecked: ts() 
              } as AlertItem;
            } else {
              triggeredIdsRef.current.delete(alert.id);
              changed = true;
              return { 
                ...alert, 
                current: course.enrolled, 
                max: course.limit, 
                status: 'monitoring', 
                checks: alert.checks + 1, 
                lastChecked: ts() 
              } as AlertItem;
            }
          } else {
            const all = res.data;
            const [pFrom, pTo] = alert.period.replace('교시', '').split('-').map(Number);
            const matched = all.filter((c: any) => {
              const [from, to] = c.time.includes('-') ? c.time.split('-').map(Number) : [Number(c.time), Number(c.time)];
              return from <= pTo && to >= pFrom && c.remain > 0;
            });

            if (matched.length > 0) {
              if (!triggeredIdsRef.current.has(alert.id)) {
                triggeredIdsRef.current.add(alert.id);
                setHitCount(h => h + 1);
                setLogs(l => [{ id: ++logIdRef.current, courseId: alert.code, courseName: alert.name, triggeredAt: ts() }, ...l]);
                const triggered: AlertItem = { 
                  ...alert, 
                  status: 'triggered', 
                  checks: alert.checks + 1, 
                  lastChecked: ts() 
                };
                onVacancyRef.current?.(triggered);
                changed = true;
                return triggered;
              }
              changed = true;
              return { 
                ...alert, 
                checks: alert.checks + 1, 
                lastChecked: ts() 
              } as AlertItem;
            } else {
              triggeredIdsRef.current.delete(alert.id);
              changed = true;
              return { 
                ...alert, 
                status: 'monitoring', 
                checks: alert.checks + 1, 
                lastChecked: ts() 
              } as AlertItem;
            }
          }
        });
        return changed ? next : prev;
      });
    };

    checkAll();
    tickerRef.current = setInterval(checkAll, POLL_INTERVAL);
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