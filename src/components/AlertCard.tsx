import type { AlertItem } from '../types';

interface Props {
  alert: AlertItem;
  onDelete: (id: number) => void;
}

export default function AlertCard({ alert: a, onDelete }: Props) {
  const pct = (a.current / a.max) * 100;
  const fillColor = pct >= 100 ? 'var(--red)' : pct >= 85 ? 'var(--amber)' : 'var(--green)';
  const capColor = pct >= 100 ? 'var(--red)' : pct >= 85 ? 'var(--amber)' : 'var(--green)';

  const borderColor = a.status === 'triggered' ? 'var(--green-glow)' : 'var(--glass-border)';
  const shadow = a.status === 'triggered' ? '0 0 20px rgba(52, 211, 153, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.3)';
  const bg = a.status === 'triggered' ? 'linear-gradient(135deg, var(--green-dim), var(--glass-bg))' : 'var(--glass-bg)';
  const barColor = a.status === 'monitoring' ? 'var(--amber)' : a.status === 'triggered' ? 'var(--green)' : 'var(--text-3)';

  return (
    <div className="glass-panel alert-card" style={{
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: 16,
      padding: '18px 22px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: shadow,
      animation: 'slideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both',
    }}>
      {/* left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 16, bottom: 16,
        width: 3, borderRadius: '0 4px 4px 0',
        background: barColor, transition: 'background 0.4s',
        boxShadow: `0 0 6px ${barColor}`
      }} />

      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              fontSize: 16, fontWeight: 400, color: 'var(--text-0)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {a.name}
            </div>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-1)',
              background: 'var(--bg-3)', padding: '1px 6px', borderRadius: 4,
              flexShrink: 0
            }}>
              {a.code}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 300 }}>
            {a.day}요일 {a.period}
          </div>
        </div>
        {a.status === 'monitoring' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontWeight: 400, padding: '4px 10px', borderRadius: 8,
            background: 'var(--accent-dim)', color: 'var(--accent)',
            whiteSpace: 'nowrap',
          }}>
            <span className="bpulse" style={{ background: 'var(--accent)' }} />모니터링
          </span>
        )}
        {a.status === 'triggered' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontWeight: 400, padding: '4px 10px', borderRadius: 8,
            background: 'var(--green-dim)', color: 'var(--green)',
            whiteSpace: 'nowrap',
          }}>
            <span className="bpulse" style={{ background: 'var(--green)' }} />빈자리 발견
          </span>
        )}
      </div>

      {/* capacity bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
        <div style={{ flex: 1, height: 4, background: 'var(--bg-3)', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: fillColor, width: `${pct}%`,
            transition: 'width 1s cubic-bezier(0.2,0.8,0.2,1)',
            boxShadow: `0 0 8px ${fillColor}`
          }} />
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: capColor, minWidth: 40, textAlign: 'right' }}>
          {a.current}/{a.max}
        </span>
      </div>

      {/* footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--glass-border)',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '확인', val: `${a.checks}회` },
            { label: '등록', val: a.regTime },
            { label: '갱신', val: a.lastChecked },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-2)' }}>
              {s.label} <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-1)', fontWeight: 500 }}>{s.val}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onDelete(a.id)} style={{ ...iconBtnStyle, color: 'var(--red)', borderColor: 'var(--red-brd)', background: 'var(--red-dim)' }} title="삭제" className="action-btn delete-btn">
            ✕
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateY(-15px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .bpulse {
          display:inline-block;
          width:6px; height:6px; border-radius:50%;
          animation:bpulse 2s infinite;
        }
        @keyframes bpulse {
          0%,100%{opacity:1; transform: scale(1);}
          50%{opacity:0.4; transform: scale(0.8);}
        }
        .alert-card { transition: transform 0.2s, box-shadow 0.2s; }
        .alert-card:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }
        .action-btn { transition: all 0.2s; }
        .action-btn:hover { background: var(--bg-3); transform: translateY(-1px); }
        .delete-btn:hover { background: var(--red) !important; color: white !important; box-shadow: 0 0 10px var(--red-glow); }
      `}</style>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8,
  border: '1px solid var(--border-md)', background: 'var(--bg-2)',
  color: 'var(--text-1)', fontSize: 12, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--sans)',
};