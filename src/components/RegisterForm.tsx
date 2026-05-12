import { useState, useEffect } from 'react';
import type { RegisterMode, RegisterParams, CourseResult } from '../types';
import SearchInput from './SearchInput';
import SearchResult from './SearchResult';

interface Props {
  onRegister: (params: RegisterParams) => boolean;
}

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
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'done' | 'empty' | 'error' | 'duplicate'>('idle');

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
              return from <= Number(timeTo) && to >= Number(timeFrom);
            });
            setResults(filtered);
          }
        }
      } catch (err) {}
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

    // 브라우저의 엄격한 보안 정책을 맞추기 위해 사용자가 클릭한 즉시 권한을 요청합니다.
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
        fontSize: 12, fontWeight: 600, letterSpacing: '1px',
        textTransform: 'uppercase', color: 'var(--accent)',
        marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ 
          width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent-glow)'
        }} />
        알림 등록
        <div style={{ flex: 1, height: 1, background: 'var(--border-md)' }} />
      </div>

      <div className="glass-panel" style={{
        borderRadius: 24, padding: '28px 32px', marginBottom: 36,
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
        />

        {/* 하단 버튼 영역 */}
        <div className="form-bottom" style={{
          marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--glass-border)'
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {selectedId ? (
              <><span style={{ color: 'var(--accent)' }}>✨</span> 선택된 수업에 빈자리 발생 시 즉시 알림을 보내드려요</>
            ) : mode === 'course' ? (
              <><span style={{ opacity: 0.6 }}>💡</span> 과목 코드와 분반을 입력하고 검색해주세요</>
            ) : (
              <><span style={{ opacity: 0.6 }}>💡</span> 요일과 교시를 선택하고 검색해주세요</>
            )}
          </span>
          <button className="btn-register" onClick={handleRegister} disabled={!selectedId}>
            + 알림 등록
          </button>
        </div>
      </div>

      <style>{`
        .form-bottom {
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px; flex-wrap: wrap;
        }
        .btn-register {
          height: 44px; padding: 0 28px; border-radius: 12px;
          border: 1px solid var(--accent-brd); background: var(--accent-dim);
          color: var(--accent); font-size: 14px; font-weight: 700;
          font-family: var(--sans); cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .btn-register:hover:not(:disabled) { 
          background: rgba(56, 189, 248, 0.25);
          box-shadow: 0 4px 16px rgba(56, 189, 248, 0.3);
          transform: translateY(-2px);
        }
        .btn-register:active:not(:disabled) { transform: translateY(0); }
        .btn-register:disabled { 
          opacity: 0.4; cursor: not-allowed; 
          background: var(--bg-3); border-color: var(--border); color: var(--text-2);
          box-shadow: none;
        }
        @media (max-width: 600px) { .btn-register { width: 100%; } }
      `}</style>
    </>
  );
}