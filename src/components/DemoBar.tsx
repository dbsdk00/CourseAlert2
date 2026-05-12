interface Props {
  onReset: () => void;
}

export default function DemoBar({ onReset }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--glass-bg)', border: '1px solid var(--glass-border-glow)',
      borderRadius: 99, padding: '10px 12px 10px 20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)', textShadow: '0 0 8px var(--accent-glow)' }}>
        demo
      </span>
      <button
        onClick={onReset}
        style={{
          height: 36, padding: '0 18px', borderRadius: 99,
          border: '1px solid var(--border-md)', background: 'var(--bg-2)',
          color: 'var(--text-0)', fontSize: 13, fontWeight: 600,
          fontFamily: 'var(--sans)', cursor: 'pointer', transition: 'all 0.2s',
        }}
        className="demo-btn"
      >
        초기화
      </button>
      <style>{`
        .demo-btn:hover {
          background: var(--bg-3) !important;
          border-color: var(--text-2) !important;
        }
      `}</style>
    </div>
  );
}