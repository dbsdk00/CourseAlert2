import { useEffect, useState } from 'react';
import './App.css';
import { useAlertStore } from './hooks/useAlertStore';
import TopBar from './components/TopBar';
import RegisterForm from './components/RegisterForm';
import AlertList from './components/AlertList';
import DemoBar from './components/DemoBar';
import type { AlertItem } from './types';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log('Beep failed', e);
  }
}

export default function App() {
  const store = useAlertStore();
  const [isLight, setIsLight] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [activeFooterTab, setActiveFooterTab] = useState<'terms' | 'privacy' | 'contact' | null>(null);

  const toggleTheme = () => {
    setIsLight(!isLight);
    document.documentElement.classList.toggle('light');
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      store.remove(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  useEffect(() => {
    store.setOnVacancy(async (triggered: AlertItem) => {
      console.log('Vacancy detected:', triggered.name);
      playBeep();

      // 브라우저 로컬 시스템 알림 발송부 비활성화 (백엔드 푸시 알림과의 2중 중복 수신 방지)
      /*
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const registrationUrl = 'https://sugang.sungkyul.ac.kr';
        const title = `${triggered.name} 빈자리 발견!`;
        const options: any = {
          body: `[${triggered.code}] 빈자리가 생겼습니다. 클릭하여 신청하세요!`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: `vacancy-${triggered.id}-${Date.now()}`, // 태그를 유니크하게 하여 매번 팝업 보장
          renotify: true,
          vibrate: [200, 100, 200],
          requireInteraction: true,
          data: { url: registrationUrl, timestamp: Date.now() }
        };

        try {
          if ('serviceWorker' in navigator) {
            // ready가 너무 오래 걸릴 수 있으므로 타임아웃 1초 적용
            const swPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('SW timeout'), 1000));

            const reg = await Promise.race([swPromise, timeoutPromise]) as ServiceWorkerRegistration;
            await reg.showNotification(title, options);
            console.log('SW notification sent');
          } else {
            new Notification(title, options);
            console.log('Window notification sent');
          }
        } catch (err) {
          console.warn('Notification fallback triggered:', err);
          new Notification(title, options);
        }
      } else {
        console.warn('Notification permission not granted or API missing');
      }
      */
    });
  }, [store.setOnVacancy]);

  return (
    <>
      <div className="ambient" />
      <TopBar
        serverOk={store.serverOk}
        isLight={isLight}
        onToggleTheme={toggleTheme}
        activeUsersCount={store.activeUsersCount}
      />
      <div className="shell">
        <RegisterForm onRegister={store.register} alerts={store.alerts} />
        <AlertList
          alerts={store.alerts}
          logs={store.logs}
          onDelete={(id) => setDeleteTargetId(id)}
        />

        {/* Footer */}
        <footer style={{
          marginTop: 24,
          padding: '24px 0 40px',
          borderTop: '1px solid var(--bg-3)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: 0.8
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-3)'
          }}>
            <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveFooterTab('terms'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">이용약관</a>
            <span style={{ color: 'var(--bg-3)' }}>|</span>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveFooterTab('privacy'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">개인정보처리방침</a>
            <span style={{ color: 'var(--bg-3)' }}>|</span>
            <a href="#contact" onClick={(e) => { e.preventDefault(); setActiveFooterTab('contact'); }} style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">문의하기</a>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
            © {new Date().getFullYear()} CourseAlert. All rights reserved.
          </div>
        </footer>
      </div>
      <DemoBar onReset={store.resetAll} />

      {/* 삭제 확인 모달 */}
      {deleteTargetId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: 20
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: 320, padding: '32px 24px',
            borderRadius: 24, textAlign: 'center',
            animation: 'modalIn 0.3s cubic-bezier(0.2,0.8,0.2,1)'
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', marginBottom: 8 }}>
              알림을 삭제할까요?
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28 }}>
              삭제하면 더 이상 빈자리 알림을<br />받을 수 없게 됩니다.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeleteTargetId(null)}
                style={{
                  flex: 1, height: 48, borderRadius: 14, border: '1px solid var(--border-md)',
                  background: 'var(--bg-2)', color: 'var(--text-1)', fontWeight: 600, cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1, height: 48, borderRadius: 14, border: 'none',
                  background: 'var(--accent)', color: '#000', fontWeight: 700, cursor: 'pointer'
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bottom Sheet 모달 */}
      {activeFooterTab && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 3000,
        }} onClick={() => setActiveFooterTab(null)}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: 480,
            padding: '24px 24px 32px',
            borderRadius: '24px 24px 0 0', // 바텀 시트 형태의 라운드 코너
            background: 'var(--bg-1)',
            animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-0)' }}>
                {activeFooterTab === 'terms' ? '이용약관' : activeFooterTab === 'privacy' ? '개인정보처리방침' : '문의하기'}
              </span>
              <button
                onClick={() => setActiveFooterTab(null)}
                style={{
                  border: 'none', background: 'var(--bg-2)', color: 'var(--text-2)',
                  width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                  fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto', paddingRight: 4 }} className="custom-scrollbar">
              {activeFooterTab === 'terms' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <strong style={{ color: 'var(--text-1)', fontSize: 14 }}>제1조 (목적)</strong><br />
                    본 약관은 CourseAlert(이하 "서비스")가 제공하는 수강신청 잔여 여석 실시간 알림 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-1)', fontSize: 14 }}>제2조 (서비스의 성격 및 면책사항)</strong><br />
                    1. 본 서비스는 대학 수강신청 시스템의 공개 정보 또는 가상 시뮬레이션 데이터를 실시간 조회하여 잔여석 발생 시 웹 푸시(Web Push) 알림으로 중개하는 개인 학업 보조용 오픈소스 유틸리티입니다.<br />
                    2. 서비스 제공자는 통신망 장애, 서버 다운, 학내 시스템 점검, 기기 백그라운드 제한 정책 등으로 발생한 알림 전송의 누락, 지연, 미수신에 대해 어떠한 법적 책임도 지지 않습니다. 모든 수강신청 의사결정과 결과는 전적으로 이용자 본인의 책임이며, 본 서비스는 단순 참고용 보조 수단으로만 활용하여야 합니다.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-1)', fontSize: 14 }}>제3조 (이용자의 의무 및 제한)</strong><br />
                    1. 이용자는 정상적인 수강신청 모니터링 목적에 부합하는 범위 내에서만 본 서비스를 성실히 이용해야 합니다.<br />
                    2. 악의적인 대용량 요청 생성, 비정상적 API 우회 공격(DDoS 등), 또는 매크로 등의 도구를 사용하여 학내 서버 및 본 서비스 서버의 업무를 방해하는 경우, 즉각적인 서비스 차단 및 IP 차단 등 영구적 이용 제한 조치와 함께 법적 책임이 부과될 수 있습니다.
                  </div>
                </div>
              )}
              {activeFooterTab === 'privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <strong style={{ color: 'var(--text-1)', fontSize: 14 }}>1. 개인정보 수집 및 처리의 원천 방지</strong><br />
                    본 서비스는 무가입/무인증 기반으로 설계되어 회원가입, 이메일, 학번, 성명 등 일체의 이용자 개인식별정보를 요구하거나 서버에 전송·수집하지 않습니다.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-1)', fontSize: 14 }}>2. 로컬 디바이스 내 데이터 전역 격리 (LocalStorage)</strong><br />
                    이용자가 설정한 관심 과목 코드, 알림 등록 시간, 갱신 주기 등의 모니터링 내역 데이터는 서버로 일절 전송되지 않으며, 오직 이용자 기기의 웹 브라우저 보안 샌드박스 내부(LocalStorage)에만 안전하게 암호화 보관됩니다. 해당 데이터는 브라우저 캐시 삭제 또는 직접 등록 해제 시 영구적이고 즉각적인 파기가 완료됩니다.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-1)', fontSize: 14 }}>3. 웹 푸시 암호화 기기 정보</strong><br />
                    Web Push API 구독 설정 시 암호화된 익명화된 기기 토큰(Endpoint URL 및 브라우저 공개키)이 발송 서버에 일시 연동될 수 있습니다. 이는 실시간 빈자리 알림 메시지 발송 목적에만 100% 국한되며, IP 주소 등의 접속 로그 및 기타 사용자 개인 정보와 어떠한 형태로도 연동되거나 결합되지 않습니다.
                  </div>
                </div>
              )}
              {activeFooterTab === 'contact' && (
                <>
                  서비스 이용 중 불편한 점이나 빈자리 알림 실패 등의 장애 제보는 아래 이메일로 연락해 주시면 적극 검토하겠습니다.<br /><br />
                  - 이메일: <a href="mailto:coursealert.team@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>coursealert.team@gmail.com</a><br />
                  - 운영시간: 상시 피드백 수렴 중 (24시간 자동 모니터링 엔진 가동)
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .footer-link:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </>
  );
}