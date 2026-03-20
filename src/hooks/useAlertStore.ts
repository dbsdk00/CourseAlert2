import { useState, useRef, useCallback, useEffect } from 'react';
import type { AlertItem, AlertStatus } from '../types';
import type { RegisterParams } from '../components/RegisterForm';

function ts() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map(v => String(v).padStart(2, '0')).join(':');
}

let _alertId = 0;

const API = import.meta.env.VITE_API_URL as string;
const POLL_INTERVAL = 3000; // 3초마다 폴링

export function useAlertStore() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [serverOk, setServerOk] = useState<boolean | null>(null); // null=확인중, true=연결됨, false=실패
  const [hitCount, setHitCount] = useState(0);

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 팝업 콜백 저장용
  const onVacancyRef = useRef<((item: AlertItem) => void) | null>(null);

  // 서버 연결 상태 주기적 확인
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

  // 실제 폴링: 모니터링 중인 알림들을 서버에서 체크
  const startTicker = useCallback(() => {
    if (tickerRef.current) return;
    tickerRef.current = setInterval(async () => {
      setAlerts(prev => {
        const monitoring = prev.filter(a => a.status === 'monitoring');
        if (monitoring.length === 0) return prev;

        // 각 알림에 대해 서버 데이터 fetch (비동기를 setAlerts 밖에서 처리)
        monitoring.forEach(async (alert) => {
          try {
            let url = '';
            if (alert.code !== 'TIME') {
              // 모드 A: 특정 과목
              url = `${API}/api/courses/${alert.code}`;
            } else {
              // 모드 B: 시간대 — period에서 요일/교시 파싱
              url = `${API}/api/courses?day=${alert.day}`;
            }

            const res = await fetch(url);
            if (!res.ok) return;

            if (alert.code !== 'TIME') {
              // 단일 과목
              const course = await res.json();
              if (course.remain > 0) {
                // 빈자리 발생!
                const triggered: AlertItem = {
                  ...alert,
                  current: course.enrolled,
                  max: course.limit,
                  status: 'triggered',
                };
                setAlerts(prev2 => prev2.map(a => a.id === alert.id ? triggered : a));
                setHitCount(h => h + 1);
                onVacancyRef.current?.(triggered);
              } else {
                // 현원 업데이트만
                setAlerts(prev2 => prev2.map(a =>
                  a.id === alert.id
                    ? { ...a, current: course.enrolled, max: course.limit, checks: a.checks + 1 }
                    : a
                ));
              }
            } else {
              // 시간대 모드: 해당 요일 전체 조회 후 교시 범위 매칭
              const all = await res.json();
              const [pFrom, pTo] = alert.period.replace('교시', '').split('-').map(Number);
              const matched = all.filter((c: any) => {
                const [from, to] = c.time.includes('-')
                  ? c.time.split('-').map(Number)
                  : [Number(c.time), Number(c.time)];
                return from <= pTo && to >= pFrom && c.remain > 0;
              });

              if (matched.length > 0) {
                const triggered: AlertItem = { ...alert, status: 'triggered' };
                setAlerts(prev2 => prev2.map(a => a.id === alert.id ? triggered : a));
                setHitCount(h => h + 1);
                onVacancyRef.current?.(triggered);
              } else {
                setAlerts(prev2 => prev2.map(a =>
                  a.id === alert.id ? { ...a, checks: a.checks + 1 } : a
                ));
              }
            }
          } catch {
            // 서버 일시 오류는 무시하고 다음 폴링에서 재시도
          }
        });

        return prev; // setAlerts는 위 forEach 안에서 처리
      });
    }, POLL_INTERVAL);
  }, []);

  const stopTickerIfEmpty = useCallback((nextAlerts: AlertItem[]) => {
    if (nextAlerts.filter(a => a.status === 'monitoring').length === 0) {
      if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
    }
  }, []);

  // 팝업 콜백 등록 (App.tsx에서 호출)
  const setOnVacancy = useCallback((cb: (item: AlertItem) => void) => {
    onVacancyRef.current = cb;
  }, []);

  const register = useCallback(({ mode, code, division, day, timeFrom, timeTo, name, enrolled, limit }: RegisterParams) => {
    if (mode === 'course') {
      const courseId = `${code}-${division}`;
      if (alerts.some(a => a.code === courseId)) return;

      const item: AlertItem = {
        id: ++_alertId,
        code: courseId, name,
        day: day ?? '', period: `${timeFrom}-${timeTo}교시`,
        status: 'monitoring',
        current: enrolled, max: limit,
        checks: 0, regTime: ts(),
      };
      setAlerts(prev => { const next = [item, ...prev]; startTicker(); return next; });

    } else {
      const label = `${day}요일 ${timeFrom}-${timeTo}교시`;
      if (alerts.some(a => a.day === day && a.period === `${timeFrom}-${timeTo}교시`)) return;

      const item: AlertItem = {
        id: ++_alertId,
        code: 'TIME', name: label,
        day: day!, period: `${timeFrom}-${timeTo}교시`,
        status: 'monitoring',
        current: enrolled, max: limit,
        checks: 0, regTime: ts(),
      };
      setAlerts(prev => { const next = [item, ...prev]; startTicker(); return next; });
    }
  }, [alerts, startTicker]);

  const togglePause = useCallback((id: number) => {
    setAlerts(prev => {
      const next = prev.map(a => {
        if (a.id !== id) return a;
        const newStatus: AlertStatus = a.status === 'monitoring' ? 'idle' : 'monitoring';
        return { ...a, status: newStatus };
      });
      if (next.find(a => a.id === id)?.status === 'monitoring') startTicker();
      stopTickerIfEmpty(next);
      return next;
    });
  }, [startTicker, stopTickerIfEmpty]);

  const remove = useCallback((id: number) => {
    setAlerts(prev => {
      const next = prev.filter(x => x.id !== id);
      stopTickerIfEmpty(next);
      return next;
    });
  }, [stopTickerIfEmpty]);

  const resetAll = useCallback(() => {
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
    setAlerts([]);
    setHitCount(0);
  }, []);

  const monitoringCount = alerts.filter(a => a.status === 'monitoring').length;
  const hasMonitoring = monitoringCount > 0;

  return {
    alerts, serverOk, hitCount,
    monitoringCount, hasMonitoring,
    register, togglePause, remove,
    resetAll, setOnVacancy,
  };
}