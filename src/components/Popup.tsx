import { useEffect, useRef } from 'react';
import type { AlertItem } from '../types';

interface Props {
  alert: AlertItem | null;
  onClose: () => void;
}

export default function Popup({ alert, onClose }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!alert) return;

    // ── 브라우저 푸시 알림 ──
    const sendNotification = () => {
      new Notification('🔔 빈자리가 생겼어요!', {
        body: `${alert.name} · ${alert.day}요일 ${alert.period} (${alert.code})\n지금 바로 수강신청 가능해요`,
        icon: '/vite.svg',   // public 폴더 아이콘. 나중에 교체
        tag: `course-${alert.code}`,   // 같은 과목 중복 알림 방지
        requireInteraction: true,      // 사용자가 닫을 때까지 유지
      });
    };

    if (Notification.permission === 'granted') {
      sendNotification();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') sendNotification();
      });
    }

    // ── 타이머 바 ──
    if (fillRef.current) {
      fillRef.current.style.transition = 'none';
      fillRef.current.style.width = '100%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (fillRef.current) {
            fillRef.current.style.transition = 'width 7s linear';
            fillRef.current.style.width = '0%';
          }
        });
      });
    }

    timerRef.current = setTimeout(onClose, 7200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [alert, onClose]);

  if (!alert) return null;

  return (
    <div style={{
      position: 'fixed', top: 22, right: 22, zIndex: 999,
    }}>
      <div style={{
        width: 300,
        background: 'var(--bg-2)',
        border: '1px solid var(--green-brd)',
        borderRadius: 22, padding: '16px 18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        animation: 'popupIn 0.45s cubic-bezier(0.34,1.4,0.64,1) both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--green-dim)', border: '1px solid var(--green-brd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, animation: 'iconPop 0.5s 0.2s cubic-bezier(0.34,1.6,0.64,1) both',
          }}>🔔</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
              빈자리가 생겼어요!
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-1)', marginTop: 1 }}>
              지금 바로 수강신청 가능해요
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '9px 12px', marginBottom: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{alert.name}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-2)' }}>
            {alert.day} {alert.period} · {alert.code}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={() => {
            window.open('https://sugang.sungkyul.ac.kr/login/Login.jsp', '_blank');
            onClose();
            }} style={{
            flex: 1, height: 32, borderRadius: 10, border: 'none',
            background: 'var(--green)', color: '#0c0c0e',
            fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer',
            }}>
            수강신청 바로가기
            </button>
          <button onClick={onClose} style={{
            height: 32, padding: '0 14px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg-3)',
            color: 'var(--text-1)', fontSize: 12, fontFamily: 'var(--sans)', cursor: 'pointer',
          }}>
            닫기
          </button>
        </div>

        <div style={{ height: 2, background: 'var(--bg-4)', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
          <div ref={fillRef} style={{
            height: '100%', background: 'var(--green)', borderRadius: 99, width: '100%',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity:0; transform:translateY(-12px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes iconPop {
          from { transform:scale(0) rotate(-15deg); }
          to   { transform:scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}