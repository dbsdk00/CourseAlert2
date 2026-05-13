interface Props {
  monitoringCount: number;
  serverOk: boolean | null;
}

export default function TopBar({ monitoringCount, serverOk }: Props) {
  const serverColor = serverOk === null ? 'var(--text-2)' : serverOk ? 'var(--text-2)' : 'var(--red)';
  const serverLabel = serverOk === null ? '연결 확인 중' : serverOk ? '서버 연결됨' : '서버 연결 실패';
  const serverBg = serverOk === null ? 'var(--bg-2)' : serverOk ? 'var(--bg-3)' : 'var(--red-dim)';
  const serverBrd = 'none';

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
            fontSize: '16.3px',
            fontWeight: 800,
            letterSpacing: '0.8px',
            color: 'var(--text-0)',
            fontFamily: 'var(--sans)'
          }}>
            Course<span style={{ color: 'var(--accent)' }}>Alert</span>
          </span>
        </div>

        {/* 우측 상태 뱃지들 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

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
              boxShadow: serverOk ? `0 0 6px var(--green)` : 'none',
            }} />
            {serverLabel}
          </span>

          {/* 모니터링 카운트 */}
          <span style={{
            height: 28, padding: '0 12px', borderRadius: 99,
            border: 'none', background: 'var(--bg-2)',
            color: 'var(--text-1)', fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap',
          }}>
            ● {monitoringCount}개 모니터링
          </span>
        </div>
      </div>
    </header>
  );
}