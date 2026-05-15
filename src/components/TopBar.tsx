interface Props {
  monitoringCount: number;
  serverOk: boolean | null;
  isLight: boolean;
  onToggleTheme: () => void;
}

export default function TopBar({ monitoringCount, serverOk, isLight, onToggleTheme }: Props) {
  const serverColor = serverOk === null ? 'var(--text-3)' : serverOk ? 'var(--text-2)' : 'var(--text-2)';
  const serverLabel = serverOk === null ? '연결 확인 중' : serverOk ? '서버 연결됨' : '서버 연결 실패';
  const serverBg = serverOk === null ? 'var(--bg-2)' : serverOk ? 'var(--bg-2)' : 'var(--bg-3)';

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 20px',
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 64,
      background: 'var(--bg-gradient-start)',
      zIndex: 1000,
      borderBottom: '1px solid var(--bg-3)',
    }}>
      <div style={{
        width: '100%', maxWidth: 760,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3.5px' }}>
          <img
            src="/ling.png"
            alt="ling"
            style={{ width: '20.4px', height: '20.4px', flexShrink: 0 }}
          />
          <span style={{
            fontSize: '17.3px',
            fontWeight: 800,
            letterSpacing: '0.8px',
            color: 'var(--text-0)',
            fontFamily: 'var(--sans)'
          }}>
            Course<span style={{ color: 'var(--accent)' }}>Alert</span>
          </span>
        </div>

        {/* 우측 상태 뱃지들 및 테마 토글 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={onToggleTheme}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: 'none', background: 'var(--bg-3)',
              color: 'var(--text-2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: 0
            }}
          >
            {isLight ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          {/* 서버 연결 상태 */}
          <span style={{
            height: 28, padding: '0 12px', borderRadius: 99,
            border: 'none',
            background: serverBg,
            color: serverColor,
            fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap',
            transition: 'all 0.3s',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: serverColor,
              display: 'inline-block',
              boxShadow: 'none',
            }} />
            {serverLabel}
          </span>
        </div>
      </div>
    </header>
  );
}