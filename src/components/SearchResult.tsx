import type { CourseResult } from '../types';

interface Props {
  results: CourseResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchState: 'idle' | 'loading' | 'done' | 'empty' | 'error' | 'duplicate';
}

export default function SearchResult({ results, selectedId, onSelect, searchState }: Props) {
  return (
    <>
      {searchState === 'empty' && (
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'var(--bg-2)', color: 'var(--text-1)', fontSize: 13,
          border: '1px dashed var(--border-md)', textAlign: 'center'
        }} className="animate-slide-down">
          일치하는 수업이 없어요. 입력 정보를 다시 확인해주세요.
        </div>
      )}

      {searchState === 'duplicate' && (
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'var(--amber-dim)', color: 'var(--amber)', fontSize: 13,
          border: '1px solid var(--amber-brd)', textAlign: 'center'
        }} className="animate-slide-down">
          이미 알림이 등록된 과목입니다. 아래 목록을 확인해주세요.
        </div>
      )}

      {searchState === 'error' && (
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'var(--red-dim)', color: 'var(--red)', fontSize: 13,
          border: '1px solid var(--red-brd)', textAlign: 'center'
        }} className="animate-slide-down">
          서버 연결에 실패했어요. 서버가 켜져 있는지 확인해주세요.
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginBottom: 20 }} className="animate-slide-down">
          <div style={{
            fontSize: 12, color: 'var(--text-2)', letterSpacing: '0.5px',
            fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8
          }}>
            검색 결과 {results.length}건
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map(course => {
              const isFull = course.enrolled >= course.limit;
              const remain = Math.max(0, course.limit - course.enrolled);
              const isSelected = selectedId === course.courseId;

              return (
                <div
                  key={course.courseId}
                  onClick={() => isFull && onSelect(course.courseId)}
                  style={{
                    padding: '16px 18px', borderRadius: 16,
                    cursor: isFull ? 'pointer' : 'not-allowed',
                    opacity: isFull ? 1 : 0.5,
                    filter: isFull ? 'none' : 'grayscale(1)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--glass-border)'}`,
                    background: isSelected ? 'var(--accent-dim)' : 'var(--glass-bg)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: isSelected ? '0 0 16px rgba(56,189,248,0.2)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12,
                    userSelect: 'none',
                  }}
                  className="result-item"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-0)' }}>
                        {course.name}
                      </span>
                      <span style={{
                        fontSize: 11, color: 'var(--text-1)',
                        background: 'var(--bg-3)', borderRadius: 6,
                        padding: '3px 8px', border: '1px solid var(--border)',
                      }}>
                        {course.code}-{course.courseId.split('-')[1]}
                      </span>
                      {!isFull && (
                        <span style={{
                          fontSize: 11, color: 'var(--text-1)',
                          background: 'var(--bg-3)', borderRadius: 6,
                          padding: '3px 8px', border: '1px solid var(--border)',
                        }}>
                          여석 있음 — 직접 신청하세요
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      {course.professor} · {course.day}요일 {course.time}교시 · {course.room}
                    </div>
                  </div>

                  <div style={{
                    flexShrink: 0, fontSize: 13, fontWeight: 700, textAlign: 'center',
                    color: isFull ? 'var(--red)' : 'var(--green)',
                    background: isFull ? 'var(--red-dim)' : 'var(--green-dim)',
                    border: `1px solid ${isFull ? 'var(--red-brd)' : 'var(--green-brd)'}`,
                    borderRadius: 10, padding: '6px 14px',
                  }}>
                    {isFull ? '마감' : `여석 ${remain}`}
                    <div style={{ fontSize: 11, fontWeight: 500, marginTop: 2, opacity: 0.8 }}>
                      {course.enrolled}/{course.limit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <style>{`
        .result-item:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.2);
        }
      `}</style>
    </>
  );
}
