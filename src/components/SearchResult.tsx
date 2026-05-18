import type { CourseResult, AlertItem } from '../types';

interface Props {
  results: CourseResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchState: 'idle' | 'loading' | 'done' | 'empty' | 'error' | 'duplicate' | 'empty_input';
  alerts: AlertItem[];
}

export default function SearchResult({ results, selectedId, onSelect, searchState, alerts }: Props) {
  return (
    <>
      {/* ... (생략된 에러/알림 영역) */}
      {searchState === 'empty' && (
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'var(--bg-2)', color: 'var(--text-1)', fontSize: 13,
          border: '1px dashed var(--border-md)', textAlign: 'center'
        }} className="animate-slide-down">
          일치하는 수업이 없어요. 입력 정보를 다시 확인해주세요.
        </div>
      )}

      {searchState === 'empty_input' && (
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'var(--bg-2)', color: 'var(--text-1)', fontSize: 13,
          border: '1px dashed var(--border-md)', textAlign: 'center'
        }} className="animate-slide-down">
          검색할 정보를 입력해주세요.
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
            maxHeight: '153px', overflowY: 'auto', paddingRight: 4
          }}>
            {results.map(course => {
              const isFull = course.enrolled >= course.limit;
              const isSelected = selectedId === course.courseId;
              const isRegistered = alerts.some(a => a.code === course.courseId);

              return (
                <div
                  key={course.courseId}
                  onClick={() => !isRegistered && onSelect(course.courseId)}
                  style={{
                    padding: '16px 18px', borderRadius: 12,
                    cursor: isRegistered ? 'default' : 'pointer',
                    background: isSelected ? 'var(--bg-4)' : 'var(--bg-2)',
                    opacity: isRegistered ? 0.4 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12,
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                  className={isRegistered ? "" : "result-item"}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 15, fontWeight: 700, color: 'var(--text-0)',
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
                    display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0
                  }}>
                    {isRegistered && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: 4 }} aria-label="등록됨">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                    <div style={{
                      width: 58, fontSize: 13, fontWeight: 700, textAlign: 'right',
                      letterSpacing: '-0.5px',
                      fontFamily: 'var(--mono)',
                    }}>
                      <span style={{ color: isFull ? '#8E8E93' : '#facc15' }}>{course.enrolled}</span>
                      <span style={{ color: '#8E8E93', fontWeight: 400 }}> / {course.limit}</span>
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
