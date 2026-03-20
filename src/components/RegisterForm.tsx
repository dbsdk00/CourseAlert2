import { useState } from 'react';

interface Props {
  onRegister: (params: RegisterParams) => void;
}

export type RegisterMode = 'course' | 'timeslot';

export interface RegisterParams {
  mode: RegisterMode;
  code?: string;
  division?: string;
  day?: string;
  timeFrom?: string;
  timeTo?: string;
  name: string;
  enrolled: number;
  limit: number;
}

export interface CourseResult {
  courseId: string;
  code: string;
  name: string;
  professor: string;
  day: string;
  time: string;
  room: string;
  limit: number;
  enrolled: number;
  remain: number;
}

const DAYS = ['월', '화', '수', '목', '금'];
const PERIODS = Array.from({ length: 12 }, (_, i) => String(i + 1));

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
  boxSizing: 'border-box',
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
  const [mode, setMode] = useState<RegisterMode>('course');

  // 모드 A
  const [code, setCode] = useState('');
  const [division, setDivision] = useState('');

  // 모드 B
  const [day, setDay] = useState('월');
  const [timeFrom, setTimeFrom] = useState('1');
  const [timeTo, setTimeTo] = useState('1');

  // 검색 상태
  const [results, setResults] = useState<CourseResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'done' | 'empty' | 'error'>('idle');

  const handleSearch = async () => {
    setResults([]);
    setSelectedId(null);
    setSearchState('loading');

    try {
      const base = import.meta.env.VITE_API_URL;

      if (mode === 'course') {
        if (!code.trim() || !division.trim()) { setSearchState('idle'); return; }
        const courseId = `${code.trim()}-${division.trim()}`;
        const res = await fetch(`${base}/api/courses/${courseId}`);
        if (!res.ok) { setSearchState('empty'); return; }
        const course: CourseResult = await res.json();
        setResults([course]);
        setSearchState('done');
      } else {
        const res = await fetch(`${base}/api/courses?day=${day}`);
        const all: CourseResult[] = await res.json();

        const filtered = all.filter(c => {
          const [from, to] = c.time.includes('-')
            ? c.time.split('-').map(Number)
            : [Number(c.time), Number(c.time)];
          return from <= Number(timeTo) && to >= Number(timeFrom);
        });

        if (filtered.length === 0) { setSearchState('empty'); return; }
        setResults(filtered);
        setSearchState('done');
      }
    } catch {
      setSearchState('error');
    }
  };

  const handleRegister = () => {
    if (!selectedId) return;
    const selected = results.find(r => r.courseId === selectedId);
    if (!selected) return;

    onRegister({
      mode,
      code: selected.code,
      division: selected.courseId.split('-')[1],
      day: selected.day,
      timeFrom: selected.time.split('-')[0],
      timeTo: selected.time.split('-')[1] ?? selected.time,
      name: selected.name,
      enrolled: selected.enrolled,
      limit: selected.limit,
    });

    setResults([]);
    setSelectedId(null);
    setSearchState('idle');
    if (mode === 'course') { setCode(''); setDivision(''); }
  };

  const resetSearch = (newMode: RegisterMode) => {
    setMode(newMode);
    setResults([]);
    setSelectedId(null);
    setSearchState('idle');
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

        {/* 탭 */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 18,
          background: 'var(--bg-2)', borderRadius: 12, padding: 4,
          width: 'fit-content',
        }}>
          {(['course', 'timeslot'] as RegisterMode[]).map(m => (
            <button key={m} onClick={() => resetSearch(m)} style={{
              height: 32, padding: '0 16px', borderRadius: 9,
              border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 500, fontFamily: 'var(--sans)',
              transition: 'all 0.18s',
              background: mode === m ? 'var(--bg-0)' : 'transparent',
              color: mode === m ? 'var(--text-0)' : 'var(--text-2)',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
            }}>
              {m === 'course' ? '특정 과목' : '시간대 탐색'}
            </button>
          ))}
        </div>

        {/* 입력 + 검색 버튼 */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 14 }}>
          {mode === 'course' ? (
            <>
              <label className="field" style={{ flex: 2 }}>
                <span className="field-label">과목 코드</span>
                <input style={inputStyle} value={code}
                  onChange={e => { setCode(e.target.value); setSearchState('idle'); setResults([]); }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="01690" />
              </label>
              <label className="field" style={{ flex: 1 }}>
                <span className="field-label">분반</span>
                <input style={inputStyle} value={division}
                  onChange={e => { setDivision(e.target.value); setSearchState('idle'); setResults([]); }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="004" />
              </label>
            </>
          ) : (
            <>
              <label className="field" style={{ flex: 1 }}>
                <span className="field-label">요일</span>
                <select style={selectStyle} value={day}
                  onChange={e => { setDay(e.target.value); setSearchState('idle'); setResults([]); }}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </label>
              <div className="field" style={{ flex: 2 }}>
                <span className="field-label">교시</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select style={{ ...selectStyle, flex: 1 }} value={timeFrom}
                    onChange={e => {
                      setTimeFrom(e.target.value);
                      if (Number(e.target.value) > Number(timeTo)) setTimeTo(e.target.value);
                      setSearchState('idle'); setResults([]);
                    }}>
                    {PERIODS.map(p => <option key={p}>{p}</option>)}
                  </select>
                  <span style={{ color: 'var(--text-2)', fontSize: 13, flexShrink: 0 }}>—</span>
                  <select style={{ ...selectStyle, flex: 1 }} value={timeTo}
                    onChange={e => { setTimeTo(e.target.value); setSearchState('idle'); setResults([]); }}>
                    {PERIODS.filter(p => Number(p) >= Number(timeFrom)).map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <button className="btn-search" onClick={handleSearch} disabled={searchState === 'loading'}>
            {searchState === 'loading' ? '검색 중…' : '검색'}
          </button>
        </div>

        {/* 검색 결과 메시지 */}
        {searchState === 'empty' && (
          <div style={{
            padding: '12px 14px', borderRadius: 12, marginBottom: 14,
            background: 'var(--bg-2)', color: 'var(--text-2)', fontSize: 12.5,
          }}>
            일치하는 수업이 없어요. 입력 정보를 다시 확인해주세요.
          </div>
        )}
        {searchState === 'error' && (
          <div style={{
            padding: '12px 14px', borderRadius: 12, marginBottom: 14,
            background: 'rgba(255,80,80,0.08)', color: '#ff6b6b', fontSize: 12.5,
          }}>
            서버 연결에 실패했어요. 서버가 켜져 있는지 확인해주세요.
          </div>
        )}

        {/* 검색 결과 리스트 */}
        {results.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontSize: 10.5, color: 'var(--text-2)', letterSpacing: '0.5px',
              fontWeight: 500, marginBottom: 8,
            }}>
              검색 결과 {results.length}건 — 알림 받을 수업을 선택하세요
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {results.map(course => {
                const isFull = course.remain === 0;
                const isSelected = selectedId === course.courseId;

                return (
                  <div
                    key={course.courseId}
                    onClick={() => isFull && setSelectedId(course.courseId)}
                    style={{
                      padding: '12px 14px', borderRadius: 12,
                      cursor: isFull ? 'pointer' : 'not-allowed',
                      opacity: isFull ? 1 : 0.38,
                      filter: isFull ? 'none' : 'saturate(0)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--accent-dim)' : 'var(--bg-2)',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 12,
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)' }}>
                          {course.name}
                        </span>
                        <span style={{
                          fontSize: 10.5, color: 'var(--text-2)',
                          background: 'var(--bg-0)', borderRadius: 6,
                          padding: '2px 7px', border: '1px solid var(--border)',
                        }}>
                          {course.code}-{course.courseId.split('-')[1]}
                        </span>
                        {!isFull && (
                          <span style={{
                            fontSize: 10, color: 'var(--text-2)',
                            background: 'var(--bg-0)', borderRadius: 6,
                            padding: '2px 7px', border: '1px solid var(--border)',
                          }}>
                            여석 있음 — 직접 신청하세요
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
                        {course.professor} · {course.day}요일 {course.time}교시 · {course.room}
                      </div>
                    </div>

                    <div style={{
                      flexShrink: 0, fontSize: 12, fontWeight: 600, textAlign: 'center',
                      color: isFull ? '#ff6b6b' : '#4cd97b',
                      background: isFull ? 'rgba(255,107,107,0.1)' : 'rgba(76,217,123,0.1)',
                      border: `1px solid ${isFull ? 'rgba(255,107,107,0.3)' : 'rgba(76,217,123,0.3)'}`,
                      borderRadius: 8, padding: '4px 10px',
                    }}>
                      {isFull ? '마감' : `여석 ${course.remain}`}
                      <div style={{ fontSize: 10, fontWeight: 400, marginTop: 1, opacity: 0.8 }}>
                        {course.enrolled}/{course.limit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 하단 */}
        <div className="form-bottom">
          <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
            {selectedId
              ? '선택된 수업에 빈자리 발생 시 즉시 알림을 보내드려요'
              : mode === 'course' ? '과목 코드와 분반을 입력하고 검색해주세요'
              : '요일과 교시를 선택하고 검색해주세요'}
          </span>
          <button className="btn-register" onClick={handleRegister} disabled={!selectedId}>
            + 알림 등록
          </button>
        </div>
      </div>

      <style>{`
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field-label {
          font-size: 10.5px; color: var(--text-2);
          letter-spacing: 0.5px; font-weight: 500;
        }
        .form-bottom {
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }
        .btn-search {
          height: 40px; padding: 0 18px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--bg-2);
          color: var(--text-0); font-size: 13px; font-weight: 500;
          font-family: var(--sans); cursor: pointer; white-space: nowrap;
          transition: background 0.18s; flex-shrink: 0; align-self: flex-end;
        }
        .btn-search:hover { background: var(--bg-0); }
        .btn-search:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-register {
          height: 38px; padding: 0 20px; border-radius: 10px;
          border: 1px solid var(--accent-brd); background: var(--accent-dim);
          color: var(--accent); font-size: 13px; font-weight: 500;
          font-family: var(--sans); cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
        }
        .btn-register:hover { background: rgba(110,126,255,0.18); }
        .btn-register:active { transform: scale(0.97); }
        .btn-register:disabled { opacity: 0.35; cursor: not-allowed; }
        @media (max-width: 600px) { .btn-register { width: 100%; } }
      `}</style>
    </>
  );
}