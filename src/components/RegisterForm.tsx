import { useState } from 'react';

interface Props {
  onRegister: (code: string, name: string, day: string, period: string) => void;
}

const DAYS = ['월', '화', '수', '목', '금'];
const PERIODS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const inputStyle: React.CSSProperties = {
  height: 40,
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text-0)',
  fontSize: 13,
  fontFamily: 'var(--sans)',
  padding: '0 12px',
  outline: 'none',
  width: '100%',
  WebkitAppearance: 'none',
  appearance: 'none',
  transition: 'border-color 0.18s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  textAlign: 'center',
  cursor: 'pointer',
};

export default function RegisterForm({ onRegister }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [day, setDay] = useState('월');
  const [periodFrom, setPeriodFrom] = useState('1');
  const [periodTo, setPeriodTo] = useState('1');

  const handleSubmit = () => {
    if (!code.trim() || !name.trim()) return;
    // "1-3" 형식으로 저장, 같으면 단일 교시
    const period = periodFrom === periodTo ? `${periodFrom}교시` : `${periodFrom}-${periodTo}교시`;
    onRegister(code.trim(), name.trim(), day, period);
  };

  return (
    <>
      <div style={{
        fontSize: 11, fontWeight: 500, letterSpacing: '0.8px',
        textTransform: 'uppercase', color: 'var(--text-2)',
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        알림 등록
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: 22, padding: '22px 24px', marginBottom: 28,
      }}>
        <div className="register-grid" style={{ marginBottom: 14 }}>

          {/* 과목 코드 */}
          <label className="field">
            <span className="field-label">과목 코드</span>
            <input style={inputStyle} value={code}
              onChange={e => setCode(e.target.value)} placeholder="00000" />
          </label>

          {/* 과목명 */}
          <label className="field">
            <span className="field-label">과목명</span>
            <input style={inputStyle} value={name}
              onChange={e => setName(e.target.value)} placeholder="과목명 입력" />
          </label>

          {/* 요일 */}
          <label className="field">
            <span className="field-label">요일</span>
            <select style={selectStyle} value={day} onChange={e => setDay(e.target.value)}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>

          {/* 교시 범위 */}
          <div className="field">
            <span className="field-label">교시</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select
                style={{ ...selectStyle, flex: 1 }}
                value={periodFrom}
                onChange={e => {
                  setPeriodFrom(e.target.value);
                  // 끝교시가 시작교시보다 작아지면 맞춰줌
                  if (Number(e.target.value) > Number(periodTo)) {
                    setPeriodTo(e.target.value);
                  }
                }}
              >
                {PERIODS.map(p => <option key={p}>{p}</option>)}
              </select>

              <span style={{ color: 'var(--text-2)', fontSize: 13, flexShrink: 0 }}>—</span>

              <select
                style={{ ...selectStyle, flex: 1 }}
                value={periodTo}
                onChange={e => setPeriodTo(e.target.value)}
              >
                {PERIODS.filter(p => Number(p) >= Number(periodFrom))
                  .map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

        </div>

        <div className="form-bottom">
          <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
            빈자리 발생 시 즉시 알림을 보내드려요
          </span>
          <button className="btn-register" onClick={handleSubmit}>
            + 알림 등록
          </button>
        </div>
      </div>

      <style>{`
        .register-grid {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 600px) {
          .register-grid { grid-template-columns: 1fr 1fr; }
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          cursor: text;
        }
        .field-label {
          font-size: 10.5px;
          color: var(--text-2);
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .form-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-register {
          height: 38px;
          padding: 0 20px;
          border-radius: 10px;
          border: 1px solid var(--accent-brd);
          background: var(--accent-dim);
          color: var(--accent);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--sans);
          cursor: pointer;
          transition: background 0.18s;
          white-space: nowrap;
        }
        .btn-register:hover { background: rgba(110,126,255,0.18); }
        .btn-register:active { transform: scale(0.97); }
        @media (max-width: 600px) {
          .btn-register { width: 100%; }
        }
      `}</style>
    </>
  );
}