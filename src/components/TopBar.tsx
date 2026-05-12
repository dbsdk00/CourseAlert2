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
      padding: '24px 0 20px',
      position: 'sticky', top: 0,
      background: 'rgba(6, 9, 19, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 50,
      borderBottom: '1px solid var(--glass-border)',
      marginBottom: '32px',
    }}>
      {/* 로고 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'var(--accent-dim)', border: '1px solid var(--accent-brd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px var(--accent-dim)'
        }}>
          <img src="/ling.png" alt="ling" style={{ width: 20, height: 20, filter: 'drop-shadow(0 0 4px rgba(255, 200, 0, 0.4))' }} />
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
          Course<span style={{ color: 'var(--accent)', textShadow: '0 0 12px var(--accent-glow)' }}>Alert</span>
        </span>
      </div>

      {/* 우측 상태 뱃지들 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* 서버 연결 상태 */}
        <span style={{
          height: 32, padding: '0 14px', borderRadius: 99,
          border: `1px solid ${serverBrd}`,
          background: serverBg,
          color: serverColor,
          fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
          whiteSpace: 'nowrap',
          transition: 'all 0.3s',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: serverColor,
            display: 'inline-block',
            boxShadow: serverOk ? `0 0 8px var(--green)` : 'none',
          }} />
          {serverLabel}
        </span>

        {/* 모니터링 카운트 */}
        <span style={{
          height: 32, padding: '0 14px', borderRadius: 99,
          border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
          color: 'var(--text-1)', fontSize: 12, fontWeight: 600,
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