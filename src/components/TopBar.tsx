interface Props {
  monitoringCount: number;
  serverOk: boolean | null;
}

export default function TopBar({ monitoringCount, serverOk }: Props) {
  const serverColor = serverOk === null ? 'var(--text-2)' : serverOk ? 'var(--green)' : 'var(--red)';
  const serverLabel = serverOk === null ? '연결 확인 중' : serverOk ? '서버 연결됨' : '서버 연결 실패';
  const serverBg = serverOk === null ? 'var(--glass-bg)' : serverOk ? 'var(--green-dim)' : 'var(--red-dim)';
  const serverBrd = serverOk === null ? 'var(--glass-border)' : serverOk ? 'var(--green-brd)' : 'var(--red-brd)';

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0 14px',
      position: 'sticky', top: 0,
      background: 'rgba(6, 9, 19, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 50,
      borderBottom: '1px solid var(--glass-border)',
      marginBottom: '24px',
    }}>
      {/* 로고 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <img src="/ling.png" alt="ling" style={{ width: 16, height: 16 }} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>
          Course<span style={{ color: 'var(--accent)' }}>Alert</span>
        </span>
      </div>

      {/* 우측 상태 뱃지들 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* 서버 연결 상태 */}
        <span style={{
          height: 28, padding: '0 12px', borderRadius: 99,
          border: `1px solid ${serverBrd}`,
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
          border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
          color: 'var(--text-1)', fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(8px)'
        }}>
          ● {monitoringCount}개 모니터링
        </span>
      </div>
    </header>
  );
}