import type { LogEntry } from '../hooks/useAlertStore';

interface Props {
  logs: LogEntry[];
  onClear: () => void;
}

const typeColor: Record<string, string> = {
  normal: 'var(--text-2)',
  ok:     'var(--green)',
  hit:    'var(--text-0)',
  err:    'var(--red)',
};

export default function LogPanel({ logs, onClear }: Props) {
  const isLive = logs.some(l => l.type !== 'normal' || l.msg.includes('시작'));

  return (
    <>
      <div className="sec-label">실시간 모니터링 로그</div>
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: 22, overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>
              Activity Log
            </span>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10.5, fontFamily: 'var(--mono)',
              color: 'var(--green)', background: 'var(--green-dim)',
              border: '1px solid var(--green-brd)',
              padding: '3px 8px', borderRadius: 99,
              opacity: isLive ? 1 : 0.4, transition: 'opacity 0.3s',
            }}>
              <span className="bpulse" style={{ background: 'var(--green)' }} />
              LIVE
            </span>
          </div>
          <button onClick={onClear} style={{
            fontSize: 11, color: 'var(--text-2)', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)',
          }}>지우기</button>
        </div>

        <div style={{
          padding: '4px 0', maxHeight: 220, overflowY: 'auto',
          fontFamily: 'var(--mono)', fontSize: 11.5,
        }}>
          {logs.map(l => (
            <div key={l.id} style={{
              display: 'grid',
              gridTemplateColumns: '72px 14px 1fr',
              alignItems: 'center',
              gap: 10, padding: '6px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.02)',
              animation: 'logFade 0.25s ease both',
            }}>
              <span style={{ color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                {l.time}
              </span>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: typeColor[l.type],
              }} />
              <span style={{
                color: typeColor[l.type],
                fontWeight: l.type === 'hit' ? 500 : 400,
              }}>
                {l.msg}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes logFade {
          from { opacity:0; transform:translateX(-4px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .bpulse {
          display:inline-block;
          width:5px;height:5px;border-radius:50%;
          background:currentColor;
          animation:bpulse 1.5s infinite;
        }
        @keyframes bpulse {0%,100%{opacity:1}50%{opacity:0.35}}
      `}</style>
    </>
  );
}