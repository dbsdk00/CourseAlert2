# AI Handover Context

이 문서는 AI 에이전트가 CourseAlert 프로젝트를 이어서 작업할 때 반드시 숙지해야 할 핵심 컨텍스트를 담고 있습니다.

## 1. 프로젝트 정체성
* **프로젝트명**: CourseAlert (성결대학교 수강신청 빈자리 알림 서비스)
* **디자인 철학**: Minimalist Obsidian Theme. 불필요한 장식을 배제하고 면과 색상 대비만으로 정보를 전달함.

## 2. 디자인 시스템 (중요)
* **색상 팔레트**: `index.css`의 변수를 반드시 따를 것.
  - `--bg-1` (#161616): 메인 패널 배경
  - `--bg-2` (#1e1e1e): 인풋/선택창 배경
  - `--bg-3` (#2a2a2a): 헤더 경계선 등 보조선
  - `--accent` (#d4af37): 핵심 골드 컬러
* **레이아웃 규칙**: 
  - 메인 폭은 `760px`로 제한 (`.shell` 클래스).
  - 헤더는 `fixed` 상태이며 본문은 전체 스크롤 (`App.css` 참고).

## 3. 핵심 기능 로직
* **알림 권한**: `RegisterForm.tsx`에서 처리. 권한이 'denied'인 경우 `alert`을 통해 수동 설정 가이드를 제공함.
* **검색/등록**: `useAlertStore.ts` 훅을 통해 상태를 관리하며, 백엔드 서버와 폴링 방식으로 통신함.

## 4. 작업 시 주의사항 (Coding Standard)
* **No Unused Variables**: Vercel 빌드 시 `tsc` 검사가 매우 엄격함. 사용하지 않는 변수나 import가 있으면 빌드가 즉시 중단되므로 수시로 `npm run build`로 확인할 것.
* **Responsive Design**: 모바일 PWA 환경을 최우선으로 고려하며, 특히 iOS Safari의 인풋 자동 확대 현상을 막기 위해 폰트 크기는 최소 `13.8px` 이상을 유지해야 함.
