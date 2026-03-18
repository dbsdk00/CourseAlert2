interface Props {
  hasMonitoring: boolean;
  onTrigger: () => void;
  onReset: () => void;
}

export default function DemoBar({ hasMonitoring, onTrigger, onReset }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-2)', border: '1px solid var(--border-md)',
      borderRadius: 99, padding: '8px 10px 8px 16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
        demo
      </span>
      <button
        onClick={onTrigger}
        disabled={!hasMonitoring}
        style={{
          height: 34, padding: '0 16px', borderRadius: 99,
          border: '1px solid var(--green-brd)', background: 'var(--green-dim)',
          color: 'var(--green)', fontSize: 12, fontWeight: 500,
          fontFamily: 'var(--sans)', cursor: hasMonitoring ? 'pointer' : 'not-allowed',
          opacity: hasMonitoring ? 1 : 0.4, transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ◎ 빈자리 발생 시뮬레이션
      </button>
      <button
        onClick={onReset}
        style={{
          height: 34, padding: '0 14px', borderRadius: 99,
          border: '1px solid var(--border)', background: 'none',
          color: 'var(--text-2)', fontSize: 12,
          fontFamily: 'var(--sans)', cursor: 'pointer', transition: 'all 0.18s',
        }}
      >
        초기화
      </button>
    </div>
  );
}