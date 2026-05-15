import type { AlertItem } from '../types';

interface Props {
  alert: AlertItem;
  onDelete: (id: string) => void;
}

export default function AlertCard({ alert: a, onDelete }: Props) {
  const isFull = a.current >= a.max;
  const remain = Math.max(0, a.max - a.current);
  
  const borderColor = 'var(--glass-border)';
  const bg = 'var(--glass-bg)';

  const handleCardClick = () => {
    if (!isFull) {
      window.open('https://sugang.sungkyul.ac.kr', '_blank');
    }
  };

  return (
    <div className="glass-panel alert-card" 
      onClick={handleCardClick}
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: '16px 18px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both',
        cursor: !isFull ? 'pointer' : 'default',
      }}>

      {/* Main Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 15, fontWeight: 700, color: 'var(--text-0)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {a.name}
            </span>
            <span style={{
              fontSize: 10, color: 'var(--text-3)',
              background: 'transparent', flexShrink: 0, fontFamily: 'var(--mono)'
            }}>
              {a.code}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 400 }}>
            {a.day}요일 {a.period}교시
          </div>
        </div>

        <div style={{
          flexShrink: 0, fontSize: 12, fontWeight: 500, textAlign: 'center',
          color: isFull ? 'var(--red)' : 'var(--accent)',
          background: isFull ? 'var(--bg-4)' : 'var(--bg-3)',
          borderRadius: 8, padding: '6px 12px',
        }}>
          {isFull ? '마감' : `여석 ${remain}`}
          <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.6 }}>
            {a.current}/{a.max}
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--glass-border)',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '등록', val: a.regTime },
            { label: '갱신', val: a.lastChecked },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-2)' }}>
              {s.label} <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-1)', fontWeight: 500 }}>{s.val}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(a.id);
          }} 
          style={deleteBtnStyle} title="삭제" className="action-btn delete-btn"
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateY(-15px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .alert-card { transition: transform 0.2s; }
        .alert-card:hover { transform: translateY(-2px); }
        .action-btn { transition: all 0.2s; }
        .action-btn:hover { background: var(--bg-4) !important; transform: translateY(-1px); }
        .delete-btn:hover { color: var(--red) !important; }
      `}</style>
    </div>
  );
}

const deleteBtnStyle: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 6,
  border: 'none', background: 'var(--bg-2)',
  color: 'var(--text-3)', fontSize: 11, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--sans)',
};