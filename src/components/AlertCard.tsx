import type { AlertItem } from '../types';

interface Props {
  alert: AlertItem;
  onTogglePause: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function AlertCard({ alert: a, onTogglePause, onDelete }: Props) {
  const pct = (a.current / a.max) * 100;
  const fillColor = pct >= 100 ? 'var(--red)' : pct >= 85 ? 'var(--amber)' : 'var(--green)';
  const capColor  = pct >= 100 ? 'var(--red)' : pct >= 85 ? 'var(--amber)' : 'var(--green)';

  const borderColor = a.status === 'triggered'
    ? 'var(--green-brd)' : 'var(--border)';
  const bg = a.status === 'triggered'
    ? 'rgba(62,207,142,0.03)' : 'var(--bg-1)';
  const barColor = a.status === 'monitoring' ? 'var(--amber)' : a.status === 'triggered' ? 'var(--green)' : 'var(--text-3)';

  return (
    <div style={{
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: 22,
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
      animation: 'slideIn 0.35s cubic-bezier(0.34,1.2,0.64,1) both',
    }}>
      {/* left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 14, bottom: 14,
        width: 2.5, borderRadius: '0 2px 2px 0',
        background: barColor, transition: 'background 0.35s',
      }} />

      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2, marginBottom: 3 }}>
            {a.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-2)' }}>{a.code}</span>
            <div style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--text-3)' }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{a.day}요일 {a.period}</span>
          </div>
        </div>
        {a.status === 'monitoring' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99,
            background: 'var(--amber-dim)', color: 'var(--amber)',
            border: '1px solid var(--amber-brd)', whiteSpace: 'nowrap',
          }}>
            <span className="bpulse" />모니터링 중
          </span>
        )}
        {a.status === 'triggered' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99,
            background: 'var(--green-dim)', color: 'var(--green)',
            border: '1px solid var(--green-brd)', whiteSpace: 'nowrap',
          }}>
            <span className="bpulse" />빈자리 발생
          </span>
        )}
        {a.status === 'idle' && (
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99,
            background: 'var(--bg-3)', color: 'var(--text-2)',
            border: '1px solid var(--border)',
          }}>일시정지</span>
        )}
      </div>

      {/* capacity bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <div style={{ flex: 1, height: 2, background: 'var(--bg-4)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: fillColor, width: `${pct}%`,
            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: capColor, minWidth: 44, textAlign: 'right' }}>
          {a.current}/{a.max}
        </span>
      </div>

      {/* footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { label: '확인', val: `${a.checks}회` },
            { label: '등록', val: a.regTime },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-2)' }}>
              {s.label} <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-1)' }}>{s.val}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onTogglePause(a.id)} style={iconBtnStyle} title="일시정지/재개">
            {a.status === 'idle' ? '▶' : '⏸'}
          </button>
          <button onClick={() => onDelete(a.id)} style={{ ...iconBtnStyle, color: 'var(--red)' }} title="삭제">
            ✕
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateY(-10px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .bpulse {
          display:inline-block;
          width:5px; height:5px; border-radius:50%;
          background:currentColor;
          animation:bpulse 2s infinite;
        }
        @keyframes bpulse {
          0%,100%{opacity:1}50%{opacity:0.35}
        }
      `}</style>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-2)',
  color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--sans)', transition: 'all 0.18s',
};