interface Props {
  onReset: () => void;
}

export default function DemoBar({ onReset }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border)',
      borderRadius: 99, padding: '6px 6px 6px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
        demo
      </span>
      <button
        onClick={onReset}
        style={{
          height: 30, padding: '0 14px', borderRadius: 99,
          border: '1px solid var(--border)', background: 'var(--bg-2)',
          color: 'var(--text-1)', fontSize: 12, fontWeight: 500,
          fontFamily: 'var(--sans)', cursor: 'pointer', transition: 'all 0.2s',
        }}
        className="demo-btn"
      >
        초기화
      </button>
      <style>{`
        .demo-btn:hover {
          background: var(--bg-3);
          border-color: var(--text-2);
          color: var(--text-0);
        }
      `}</style>
    </div>
  );
}