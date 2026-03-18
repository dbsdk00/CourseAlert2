interface Props { monitoringCount: number; }

export default function TopBar({ monitoringCount }: Props) {
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
      <span style={{
        height: 28, padding: '0 12px', borderRadius: 99,
        border: '1px solid var(--border)', background: 'var(--bg-2)',
        color: 'var(--text-1)', fontSize: 11.5,
        display: 'flex', alignItems: 'center', gap: 5,
        whiteSpace: 'nowrap',
      }}>
        ● {monitoringCount}개 모니터링
      </span>
    </header>
  );
}