import type { AlertItem, VacancyLog } from '../types';
import AlertCard from './AlertCard';

interface Props {
  alerts: AlertItem[];
  logs: VacancyLog[];
  onDelete: (id: number) => void;
}

export default function AlertList({ alerts, logs, onDelete }: Props) {
  return (
    <>
      <div className="sec-label">
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent-glow)'
        }} />
        등록된 알림
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
        {alerts.length === 0 ? (
          <div className="glass-panel animate-slide-down" style={{
            borderRadius: 24, padding: '48px 24px', textAlign: 'center',
            background: 'var(--bg-1)'
          }}>
            <img src="/ling.png" style={{ width: '38.6px', height: '38.6px', marginBottom: 16, opacity: 0.4 }} />
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, fontWeight: 500 }}>
              아직 등록된 알림이 없어요<br />위 폼에서 과목을 검색하고 추가해보세요
            </div>
          </div>
        ) : (
          alerts.map(a => (
            <AlertCard
              key={a.id}
              alert={a}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {logs.length > 0 && (
        <>
          <div className="sec-label" style={{ opacity: 0.5, marginBottom: 12 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)',
            }} />
            빈자리 발생 기록
          </div>
          <div className="custom-scrollbar" style={{
            display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 36,
            maxHeight: '160px', overflowY: 'auto', paddingRight: 8, opacity: 0.8,
            background: 'var(--bg-1)', borderRadius: 12, padding: '12px'
          }}>
            {logs.map(log => (
              <div key={log.id} className="animate-slide-up" style={{
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-2)',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>{log.courseName}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{log.courseId}</span>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)' }}>
                  {log.triggeredAt}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .sec-label {
          font-size: 12px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; color: var(--text-1);
          margin-bottom: 16px; display: flex; align-items: center; gap: 12px;
        }
        .sec-label::after {
          content: ''; flex: 1; height: 1px; background: var(--border-md);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-md);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-3);
        }
      `}</style>
    </>
  );
}