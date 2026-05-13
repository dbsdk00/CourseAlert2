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
            borderStyle: 'dashed', borderColor: 'var(--border-md)'
          }}>
            <img src="/ling.png" style={{ width: 44, height: 44, marginBottom: 16, opacity: 0.6 }} />
            <div style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.6 }}>
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
          <div className="sec-label">
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
              boxShadow: '0 0 8px var(--green-glow)'
            }} />
            빈자리 발생 기록
          </div>
          <div className="custom-scrollbar" style={{
            display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36,
            maxHeight: '210px', overflowY: 'auto', paddingRight: 8
          }}>
            {logs.map(log => (
              <div key={log.id} className="glass-panel animate-slide-up" style={{
                borderRadius: 14, padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderLeft: '3px solid var(--green)',
                background: 'linear-gradient(90deg, var(--green-dim) 0%, var(--glass-bg) 20%)',
                flexShrink: 0
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)' }}>{log.courseName}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-2)', marginLeft: 8, background: 'var(--bg-3)', padding: '2px 6px', borderRadius: 6 }}>{log.courseId}</span>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', fontWeight: 500 }}>
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