interface Props {
  monitoringCount: number;
  serverOk: boolean | null;
}

export default function TopBar({ monitoringCount, serverOk }: Props) {
  const serverColor = serverOk === null ? 'var(--text-2)' : serverOk ? '#4cd97b' : '#ff6b6b';
  const serverLabel = serverOk === null ? '연결 확인 중' : serverOk ? '서버 연결됨' : '서버 연결 실패';

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 0 20px',
      position: 'sticky', top: 0,
      background: 'rgba(12,12,14,0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 50,
      borderBottom: '1px solid var(--border)',
      marginBottom: '28px',
    }}>
      {/* 로고 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--accent-dim)', border: '1px solid var(--accent-brd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, flexShrink: 0,
        }}>◎</div>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.4 }}>
          Course<span style={{ color: 'var(--accent)' }}>Alert</span>
        </span>
      </div>

      {/* 우측 상태 뱃지들 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* 서버 연결 상태 */}
        <span style={{
          height: 28, padding: '0 12px', borderRadius: 99,
          border: `1px solid ${serverOk ? 'rgba(76,217,123,0.3)' : serverOk === false ? 'rgba(255,107,107,0.3)' : 'var(--border)'}`,
          background: serverOk ? 'rgba(76,217,123,0.08)' : serverOk === false ? 'rgba(255,107,107,0.08)' : 'var(--bg-2)',
          color: serverColor,
          fontSize: 11.5,
          display: 'flex', alignItems: 'center', gap: 5,
          whiteSpace: 'nowrap',
          transition: 'all 0.3s',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: serverColor,
            display: 'inline-block',
            boxShadow: serverOk ? `0 0 6px #4cd97b` : 'none',
          }} />
          {serverLabel}
        </span>

        {/* 모니터링 카운트 */}
        <span style={{
          height: 28, padding: '0 12px', borderRadius: 99,
          border: '1px solid var(--border)', background: 'var(--bg-2)',
          color: 'var(--text-1)', fontSize: 11.5,
          display: 'flex', alignItems: 'center', gap: 5,
          whiteSpace: 'nowrap',
        }}>
          ● {monitoringCount}개 모니터링
        </span>
      </div>
    </header>
  );
}