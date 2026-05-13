import type { RegisterMode } from '../types';

interface Props {
  mode: RegisterMode;
  code: string; setCode: (v: string) => void;
  division: string; setDivision: (v: string) => void;
  day: string; setDay: (v: string) => void;
  timeFrom: string; setTimeFrom: (v: string) => void;
  timeTo: string; setTimeTo: (v: string) => void;
  onSearch: () => void;
  searchState: 'idle' | 'loading' | 'done' | 'empty' | 'error' | 'duplicate';
  resetSearch: (m: RegisterMode) => void;
  onInputChanged: () => void;
}

const DAYS = ['월', '화', '수', '목', '금'];
const PERIODS = Array.from({ length: 12 }, (_, i) => String(i + 1));

const inputStyle: React.CSSProperties = {
  height: 38,
  background: 'var(--bg-2)',
  border: '1px solid transparent',
  borderRadius: 10,
  color: 'var(--text-0)',
  fontSize: '13.8px',
  fontFamily: 'var(--sans)',
  padding: '0 12px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
  appearance: 'none',
  transition: 'all 0.2s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  textAlign: 'center',
  cursor: 'pointer',
};

export default function SearchInput(props: Props) {
  const {
    mode, code, setCode, division, setDivision,
    day, setDay, timeFrom, setTimeFrom, timeTo, setTimeTo,
    onSearch, searchState, resetSearch, onInputChanged
  } = props;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <>
      {/* 탭 */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'var(--bg-2)', borderRadius: 10, padding: 4,
        width: 'fit-content'
      }}>
        {(['course', 'timeslot'] as RegisterMode[]).map(m => (
          <button key={m} onClick={() => resetSearch(m)} style={{
            height: 30, padding: '0 16px', borderRadius: 8,
            border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 500, fontFamily: 'var(--sans)',
            transition: 'all 0.2s',
            background: mode === m ? 'var(--bg-4)' : 'transparent',
            color: mode === m ? 'var(--accent)' : 'var(--text-3)',
          }}>
            {m === 'course' ? '과목 탐색' : '시간대 탐색'}
          </button>
        ))}
      </div>

      {/* 입력 영역 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
        {mode === 'course' ? (
          <>
            <label className="field" style={{ flex: 2 }}>
              <span className="field-label">과목 코드</span>
              <input style={inputStyle} value={code}
                className="input-focus"
                onChange={e => { setCode(e.target.value); onInputChanged(); }}
                onKeyDown={handleKeyDown}
                placeholder="예: 01690" />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span className="field-label">분반</span>
              <input style={inputStyle} value={division}
                className="input-focus"
                onChange={e => { setDivision(e.target.value); onInputChanged(); }}
                onKeyDown={handleKeyDown}
                placeholder="004" />
            </label>
          </>
        ) : (
          <>
            <label className="field" style={{ flex: 1 }}>
              <span className="field-label">요일</span>
              <select style={selectStyle} value={day} className="input-focus"
                onChange={e => { setDay(e.target.value); onInputChanged(); }}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <div className="field" style={{ flex: 2 }}>
              <span className="field-label">교시</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select style={{ ...selectStyle, flex: 1 }} value={timeFrom} className="input-focus"
                  onChange={e => {
                    setTimeFrom(e.target.value);
                    if (Number(e.target.value) > Number(timeTo)) setTimeTo(e.target.value);
                    onInputChanged();
                  }}>
                  {PERIODS.map(p => <option key={p}>{p}</option>)}
                </select>
                <span style={{ color: 'var(--text-2)', fontSize: 14, flexShrink: 0 }}>—</span>
                <select style={{ ...selectStyle, flex: 1 }} value={timeTo} className="input-focus"
                  onChange={e => { setTimeTo(e.target.value); onInputChanged(); }}>
                  {PERIODS.filter(p => Number(p) >= Number(timeFrom)).map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        <button className="btn-search" onClick={onSearch} disabled={searchState === 'loading'}>
          {searchState === 'loading' ? '검색 중…' : '검색'}
        </button>
      </div>

      <style>{`
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field-label {
          font-size: 12px; color: var(--text-2);
          letter-spacing: 0.5px; font-weight: 500;
        }
        .input-focus:hover {
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
        }
        .input-focus:focus {
          border: 1px solid var(--accent) !important;
          background-color: #1e1e1e !important;
          box-shadow: 0 0 0 2px var(--accent-dim);
        }
        .btn-search {
          height: 38px; padding: 0 20px; border-radius: 10px;
          border: none; background: var(--accent-dim);
          color: var(--accent); font-size: 13px; font-weight: 600;
          font-family: var(--sans); cursor: pointer; white-space: nowrap;
          transition: all 0.2s; flex-shrink: 0; align-self: flex-end;
        }
        .btn-search:hover {
          background: rgba(56, 189, 248, 0.25);
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }
        .btn-search:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
      `}</style>
    </>
  );
}
