import { useEffect, useRef, useState } from 'react';
import type { AlertItem } from '../types';

interface Props {
  alert: AlertItem | null;
  index: number;
  onClose: () => void;
}

export default function Popup({ alert, index, onClose }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400); // 애니메이션 시간만큼 대기 후 실제 제거
  };

  useEffect(() => {
    if (!alert) return;

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

    timerRef.current = setTimeout(handleClose, 7000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [alert]);

  if (!alert) return null;

  const isMobile = window.innerWidth <= 600;
  // 작아진 알림 크기에 맞춰 오프셋 조정 (약 90px)
  const offset = index * 90;

  const animName = isClosing 
    ? (isMobile ? 'slideDownFadeOut' : 'slideOutRight')
    : (isMobile ? 'slideUpFade' : 'slideInRight');

  return (
    <div style={{
      position: 'fixed',
      ...(isMobile
        ? { bottom: 24 + offset, left: 16, right: 16, top: 'auto' }
        : { top: 24 + offset, right: 24, left: 'auto', bottom: 'auto', width: 340 }
      ),
      zIndex: 9999 + index,
      animation: `${animName} 0.4s cubic-bezier(0.2,0.8,0.2,1) forwards`,
    }}>
      <div 
        onClick={() => {
          window.open('https://sugang.sungkyul.ac.kr/login/Login.jsp', '_blank');
          handleClose();
        }}
        style={{
        margin: '0',
        background: 'rgba(20, 24, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--green-brd)',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(52, 211, 153, 0.15)',
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }} className="toast-panel">
        
        {/* 좌측 아이콘 */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--green-dim)',
          border: '1px solid var(--green-brd)',
          boxShadow: '0 0 12px var(--green-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>🚨</div>
        
        {/* 중간 내용 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
            {alert.name} 빈자리!
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-1)' }}>
            {alert.day} {alert.period} · <span style={{ fontFamily: 'var(--mono)' }}>{alert.code}</span>
          </div>
        </div>

        {/* 우측 버튼 */}
        <button
          style={{
            padding: '8px 14px', borderRadius: 8, border: 'none',
            background: 'var(--green)', color: '#060913',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'transform 0.2s', flexShrink: 0
          }}
          className="btn-toast"
        >
          신청
        </button>

        {/* 하단 타이머 바 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, height: 3, 
          background: 'var(--bg-3)', width: '100%'
        }}>
          <div ref={fillRef} style={{
            height: '100%', background: 'var(--green)', width: '100%',
            boxShadow: '0 0 8px var(--green)'
          }} />
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(30px); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDownFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
        .toast-panel:hover {
          background: rgba(25, 30, 38, 0.98) !important;
          border-color: rgba(52, 211, 153, 0.6) !important;
        }
        .btn-toast:hover { transform: scale(1.05); }
        .btn-toast:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
}