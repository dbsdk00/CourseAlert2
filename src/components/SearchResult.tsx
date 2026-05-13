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

          <div className="custom-scrollbar" style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            maxHeight: '280px', overflowY: 'auto', paddingRight: 4
          }}>
            {results.map(course => {
              const isFull = course.enrolled >= course.limit;
              const remain = Math.max(0, course.limit - course.enrolled);
              const isSelected = selectedId === course.courseId;

              return (
                <div
                  key={course.courseId}
                  onClick={() => onSelect(course.courseId)}
                  style={{
                    padding: '16px 18px', borderRadius: 12,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-4)' : 'var(--bg-2)',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12,
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                  className="result-item"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 15, fontWeight: 500, color: 'var(--text-0)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {course.name}
                      </span>
                      <span style={{
                        fontSize: 10, color: 'var(--text-3)',
                        background: 'var(--bg-4)', borderRadius: 4,
                        padding: '2px 6px',
                        flexShrink: 0, fontWeight: 400, fontFamily: 'var(--mono)'
                      }}>
                        {course.code}-{course.courseId.split('-')[1]}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4, fontWeight: 400 }}>
                      {course.professor} · {course.day}요일 {course.time}교시
                    </div>
                  </div>

                  <div style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 500, textAlign: 'center',
                    color: isFull ? 'var(--red)' : 'var(--accent)',
                    background: isFull ? 'var(--red-dim)' : 'var(--accent-dim)',
                    borderRadius: 8, padding: '6px 12px',
                  }}>
                    {isFull ? '마감' : `여석 ${remain}`}
                    <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.6 }}>
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
