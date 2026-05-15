# System Flow & Architecture

CourseAlert 프로젝트의 데이터 흐름과 시스템 동작 구조를 설명합니다.

## 1. 애플리케이션 진입로 (Entry Point)
* **`main.tsx`**: 앱의 시작점. 전역 스타일(`index.css`)과 PWA 등록 로직이 포함됨.
* **`App.tsx`**: 전체 레이아웃 구성 (`TopBar`, `RegisterForm`, `AlertList`, `DemoBar`).

## 2. 데이터 흐름 (Data Flow)
애플리케이션은 **중앙 집중식 상태 관리** 방식을 따릅니다.

1. **상태 관리 (`hooks/useAlertStore.ts`)**: 
   - 알림 목록(`alerts`), 발생 기록(`logs`), 서버 상태(`serverOk`) 등을 통합 관리.
   - 브라우저의 `localStorage`를 사용하여 새로고침 후에도 데이터를 보존함.
2. **검색 및 선택**:
   - `SearchInput`에서 과목/시간대 검색 -> 백엔드 API 요청 -> `SearchResult`에 표시.
   - 사용자가 결과 선택 시 `RegisterForm`에서 등록 준비 완료.
3. **알림 등록 및 모니터링**:
   - 사용자가 '알림 등록' 클릭 -> 스토어의 `register` 함수 호출 -> 실시간 모니터링 시작.

## 3. 핵심 동작 사이클 (Core Cycle)

### [수강신청 빈자리 감지]
1. **Polling**: `useAlertStore`에서 일정 간격으로 백엔드 서버에 현재 등록된 과목들의 빈자리 여부를 조회함.
2. **Detection**: 빈자리 발견 시 스토어 상태 업데이트 및 `logs`에 기록 추가.
3. **Notification**:
   - **앱 내부**: 비프음 재생 및 UI 카드 상태 변경 (`monitoring` -> `triggered`).
   - **앱 외부 (Push)**: 브라우저 Notification API와 서비스 워커(`push-sw.js`)를 통해 시스템 알림 발송.

## 4. 컴포넌트 간 역할 분담
* **`TopBar`**: 실시간 모니터링 개수 및 서버 연결 상태 시각화.
* **`RegisterForm`**: 검색 인터페이스(`SearchInput`)와 결과 리스트(`SearchResult`)를 포함한 등록 워크플로우 담당.
* **`AlertList`**: 현재 감시 중인 알림 목록과 과거 빈자리 발생 기록(`Vacancy Log`) 표시.
* **`AlertCard`**: 개별 알림의 상태(모니터링 중, 발견됨) 표시 및 삭제 기능 제공.

## 5. 외부 연동
* **Backend API**: `VITE_API_URL` 환경 변수를 통해 통신.
* **Service Worker**: PWA 오프라인 작동 및 백그라운드 푸시 알림 처리.
