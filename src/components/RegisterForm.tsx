import { useState, useEffect } from 'react';
import type { RegisterMode, RegisterParams, CourseResult, AlertItem } from '../types';
import SearchInput from './SearchInput';
import SearchResult from './SearchResult';

interface Props {
  onRegister: (params: RegisterParams) => boolean;
  alerts: AlertItem[];
}

export default function RegisterForm({ onRegister, alerts }: Props) {
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
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'done' | 'empty' | 'error' | 'duplicate' | 'empty_input'>('idle');

  const handleSearch = async () => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      alert('검색 전 먼저 알림 권한을 허용해 주세요!');
      return;
    }

    setResults([]);
    setSelectedId(null);
    setSearchState('loading');

    try {
      const base = import.meta.env.VITE_API_URL;

      if (mode === 'course') {
        if (!code.trim() || !division.trim()) { setSearchState('empty_input'); return; }
        const courseId = `${code.trim()}-${division.trim()}`;
        const res = await fetch(`${base}/api/courses/${courseId}`);
        if (!res.ok) { setSearchState('empty'); return; }
        const course: CourseResult = await res.json();
        setResults([course]);
        setSearchState('done');
      } else {
        // 시간대 탐색은 항상 값이 있음 (기본값 존재)
        const res = await fetch(`${base}/api/courses?day=${day}`);
        const all: CourseResult[] = await res.json();

        const filtered = all.filter(c => {
          const [from, to] = c.time.includes('-')
            ? c.time.split('-').map(Number)
            : [Number(c.time), Number(c.time)];
          return c.day === day && from <= Number(timeTo) && to >= Number(timeFrom);
        });

        if (filtered.length === 0) { setSearchState('empty'); return; }
        setResults(filtered);
        setSearchState('done');
      }
    } catch {
      setSearchState('error');
    }
  };

  // 검색 결과 실시간 반영 (검색 완료 상태일 때 폴링)
  useEffect(() => {
    if (searchState !== 'done' || results.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const base = import.meta.env.VITE_API_URL;
        if (mode === 'course') {
          const courseId = results[0].courseId;
          const res = await fetch(`${base}/api/courses/${courseId}`);
          if (res.ok) {
            const course = await res.json();
            setResults(prev => prev.map(c => c.courseId === courseId ? course : c));
          }
        } else {
          const res = await fetch(`${base}/api/courses?day=${day}`);
          if (res.ok) {
            const all: CourseResult[] = await res.json();
            const filtered = all.filter(c => {
              const [from, to] = c.time.includes('-')
                ? c.time.split('-').map(Number)
                : [Number(c.time), Number(c.time)];
              return c.day === day && from <= Number(timeTo) && to >= Number(timeFrom);
            });
            setResults(filtered);
          }
        }
      } catch (err) { }
    }, 2000); // 2초마다 갱신

    return () => clearInterval(interval);
  }, [searchState, mode, day, timeFrom, timeTo, results.length]);

  const handleRegister = async () => {
    if (!selectedId) return;
    const selected = results.find(r => r.courseId === selectedId);
    if (!selected) return;

    if (selected.enrolled < selected.limit) {
      alert('이미 여석이 있는 강의입니다.\n직접 수강신청하세요.');
      return;
    }

    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          alert('푸시 알림 권한을 허용해야 빈자리 알림을 받을 수 있습니다!');
          return;
        }
      } else if (Notification.permission === 'denied') {
        alert('알림이 차단되어 있습니다. 주소창 왼쪽 자물쇠를 눌러 알림 권한을 [허용]으로 변경해주세요.');
        return;
      }
    }

    const success = onRegister({
      mode: 'course', // 시간대 검색이든 과목 검색이든 특정 과목으로 등록
      code: selected.code,
      division: selected.courseId.split('-')[1],
      day: selected.day,
      timeFrom: selected.time.split('-')[0],
      timeTo: selected.time.split('-')[1] ?? selected.time,
      name: selected.name,
      enrolled: selected.enrolled,
      limit: selected.limit,
    });

    if (success === false) {
      setSearchState('duplicate');
      setResults([]);
      setSelectedId(null);
      return;
    }

    setResults([]);
    setSelectedId(null);
    setSearchState('idle');
    if (mode === 'course') {
      setCode(''); setDivision('');
    }
  };

  const resetSearch = (newMode: RegisterMode) => {
    setMode(newMode);
    setResults([]);
    setSelectedId(null);
    setSearchState('idle');
  };

  const onInputChanged = () => {
    setSearchState('idle');
    setResults([]);
  };

  return (
    <>
      <div style={{
        fontSize: '16.6px', fontWeight: 700, letterSpacing: '1px',
        textTransform: 'uppercase', color: 'var(--text-0)',
        marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        알림 등록
      </div>

      <div className="glass-panel" style={{
        borderRadius: 20, padding: '20px 24px', marginBottom: 28,
      }}>
        <SearchInput
          mode={mode}
          code={code} setCode={setCode}
          division={division} setDivision={setDivision}
          day={day} setDay={setDay}
          timeFrom={timeFrom} setTimeFrom={setTimeFrom}
          timeTo={timeTo} setTimeTo={setTimeTo}
          onSearch={handleSearch}
          searchState={searchState}
          resetSearch={resetSearch}
          onInputChanged={onInputChanged}
        />

        <SearchResult
          results={results}
          selectedId={selectedId}
          onSelect={setSelectedId}
          searchState={searchState}
          alerts={alerts}
        />

        {/* 하단 버튼 영역 */}
        <div className="form-bottom" style={{
          marginTop: 20, paddingTop: 16
        }}>
          <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'flex-end' }}>
            {typeof Notification !== 'undefined' && Notification.permission !== 'granted' ? (
              <button
                className="btn-permission"
                onClick={async () => {
                  if (Notification.permission === 'denied') {
                    alert('알림 권한이 차단되어 있습니다.\n\n[해제 방법]\n1. 브라우저 주소창 왼쪽의 아이콘(자물쇠 또는 설정) 클릭\n2. 알림 권한을 "허용"으로 변경\n3. 페이지를 새로고침 해주세요.');
                    return;
                  }
                  const perm = await Notification.requestPermission();
                  if (perm === 'granted') window.location.reload();
                }}
              >
                알림 권한 허용하기
              </button>
            ) : (
              <>
                <button
                  className="btn-direct-link"
                  onClick={() => window.open('https://sugang.sungkyul.ac.kr', '_blank')}
                  disabled={!selectedId || (results.find(r => r.courseId === selectedId)?.enrolled! >= results.find(r => r.courseId === selectedId)?.limit!)}
                >
                  신청하러 가기
                </button>
                <button
                  className="btn-register"
                  onClick={handleRegister}
                  disabled={!selectedId || (results.find(r => r.courseId === selectedId)?.enrolled! < results.find(r => r.courseId === selectedId)?.limit!)}
                >
                  알림 등록
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .form-bottom {
          display: flex; flex-direction: column; gap: 16px;
        }
        @media (min-width: 601px) {
          .form-bottom { flex-direction: row; align-items: center; justify-content: space-between; }
        }
        .btn-permission {
          height: 42px; padding: 0 24px; border-radius: 12px; width: 100%;
          border: 1px solid var(--accent-brd); background: var(--accent);
          color: #000; font-size: 14px; font-weight: 800;
          font-family: var(--sans); cursor: pointer; transition: all 0.2s;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .btn-direct-link {
          height: 38px; padding: 0 20px; border-radius: 10px;
          border: none; background: var(--accent);
          color: #1a1a1a; font-size: 13px; font-weight: 700;
          font-family: var(--sans); cursor: pointer; transition: all 0.2s; white-space: nowrap;
          flex: 1; max-width: 160px;
        }
        .btn-direct-link:hover:not(:disabled) {
          filter: brightness(0.8);
        }
        .btn-direct-link:disabled {
          opacity: 0.5; cursor: not-allowed;
          background: var(--bg-4); color: var(--text-2);
        }
        .btn-register {
          height: 38px; padding: 0 24px; border-radius: 10px;
          border: none; background: var(--accent);
          color: #1a1a1a; font-size: 13px; font-weight: 700;
          font-family: var(--sans); cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          flex: 1; max-width: 160px;
        }
        .btn-register:hover:not(:disabled) { 
          filter: brightness(0.8);
        }
        .btn-register:active:not(:disabled) { opacity: 0.8; }
        .btn-register:disabled { 
          opacity: 0.5; cursor: not-allowed; 
          background: var(--bg-4); color: var(--text-2);
        }
        @media (max-width: 600px) { .btn-register { width: 100%; } }
      `}</style>
    </>
  );
}