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

    const sendNotification = () => {
      try {
        new Notification('🔔 빈자리가 생겼어요!', {
          body: `${alert.name} · ${alert.day}요일 ${alert.period} (${alert.code})`,
          icon: '/icons/icon-192.png',
          tag: `course-${alert.code}`,
        });
      } catch (e) {
        console.log('notification error', e);
      }
    };

    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        sendNotification();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => {
          if (p === 'granted') sendNotification();
        });
      }
    }

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
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [alert, onClose]);

  if (!alert) return null;

  const isMobile = window.innerWidth <= 600;

  return (
    <div style={{
      position: 'fixed',
      // 모바일: 하단 / 데스크탑: 우상단
      ...(isMobile
        ? { bottom: 0, left: 0, right: 0, top: 'auto' }
        : { top: 22, right: 22, left: 'auto', bottom: 'auto', width: 300 }
      ),
      zIndex: 9999,
    }}>
      <div style={{
        margin: isMobile ? '0' : '0',
        background: '#18181c',
        border: '1px solid rgba(62,207,142,0.25)',
        borderRadius: isMobile ? '22px 22px 0 0' : '22px',
        padding: '20px 18px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(62,207,142,0.09)',
            border: '1px solid rgba(62,207,142,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>🔔</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#3ecf8e' }}>
              빈자리가 생겼어요!
            </div>
            <div style={{ fontSize: 11.5, color: '#a0a0aa', marginTop: 1 }}>
              지금 바로 수강신청 가능해요
            </div>
          </div>
        </div>

        {/* 과목 태그 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#202025',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '9px 12px', marginBottom: 14,
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f2' }}>
            {alert.name}
          </span>
          <span style={{ fontSize: 11, color: '#606068' }}>
            {alert.day} {alert.period} · {alert.code}
          </span>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              window.open('https://sugang.sungkyul.ac.kr/login/Login.jsp', '_blank');
              onClose();
            }}
            style={{
              flex: 1,
              height: isMobile ? 44 : 32,
              borderRadius: 10, border: 'none',
              background: '#3ecf8e', color: '#0c0c0e',
              fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            수강신청 바로가기
          </button>
          <button
            onClick={onClose}
            style={{
              height: isMobile ? 44 : 32,
              padding: '0 16px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              background: '#202025', color: '#a0a0aa',
              fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </div>

        {/* 타이머 바 */}
        <div style={{
          height: 2, background: '#28282f',
          borderRadius: 99, marginTop: 14, overflow: 'hidden',
        }}>
          <div ref={fillRef} style={{
            height: '100%', background: '#3ecf8e',
            borderRadius: 99, width: '100%',
          }} />
        </div>
      </div>
    </div>
  );
}