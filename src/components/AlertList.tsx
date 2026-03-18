import type { AlertItem } from '../types';
import AlertCard from './AlertCard';

interface Props {
  alerts: AlertItem[];
  onTogglePause: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function AlertList({ alerts, onTogglePause, onDelete }: Props) {
  return (
    <>
      <div className="sec-label">등록된 알림</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {alerts.length === 0 ? (
          <div style={{
            background: 'var(--bg-1)', border: '1px dashed var(--border-md)',
            borderRadius: 22, padding: '36px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 10, opacity: 0.4 }}>◎</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              아직 등록된 알림이 없어요<br />위 폼에서 과목을 추가해보세요
            </div>
          </div>
        ) : (
          alerts.map(a => (
            <AlertCard
              key={a.id}
              alert={a}
              onTogglePause={onTogglePause}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
      <style>{`
        .sec-label {
          font-size:11px; font-weight:500; letter-spacing:0.8px;
          text-transform:uppercase; color:var(--text-2);
          margin-bottom:12px; display:flex; align-items:center; gap:8px;
        }
        .sec-label::after {
          content:''; flex:1; height:1px; background:var(--border);
        }
      `}</style>
    </>
  );
}