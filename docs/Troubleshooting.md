# Troubleshooting & Deployment

프로젝트 배포 및 빌드 과정에서 발생했던 문제와 해결책입니다.

## 1. Vercel Build Failure (Exit Code 2)
* **문제**: 배포 시 `npm run build` 단계에서 에러 발생.
* **원인**: `tsc`(TypeScript Compiler)의 엄격한 설정 때문. 
  - 사용하지 않는 변수(Unused variables)가 단 하나라도 있으면 빌드 실패.
  - 예: `const serverBrd = 'none';` 선언 후 사용하지 않음.
* **해결**: 미사용 변수를 모두 제거하거나, 필요 시 `// @ts-ignore` 또는 `_` 접두사 사용. (가급적 변수 제거 권장)

## 2. PWA Notification Permission
* **문제**: 사용자가 한 번 '차단'하면 브라우저 팝업이 다시 뜨지 않음.
* **해결**: `RegisterForm.tsx`에서 `Notification.permission === 'denied'` 상태를 체크하여, 사용자에게 브라우저 설정에서 수동으로 해제하는 법을 알리는 커스텀 안내창을 제공함.

## 3. iOS Input Zoom Issue
* **문제**: 인풋 클릭 시 화면이 자동으로 확대되어 UI가 깨짐.
* **해결**: 모든 인풋 요소의 `font-size`를 `13.8px` 이상으로 설정하고, `index.html`의 viewport meta 태그를 최적화함.

## 4. Vercel - GitHub Webhook 연결 끊김 (자동 배포 먹통)
* **문제**: `git push`를 해도 Vercel에서 배포가 시작되지 않고, "No attribution data available" 또는 "The provided GitHub repository does not contain the requested branch..." 에러 발생.
* **원인**: 깃허브 레포지토리의 공개 범위(Private -> Public)를 변경하거나 권한 토큰이 만료되어 Vercel 계정과 깃허브 간의 OAuth 연결이 끊어짐.
* **해결**: Vercel 대시보드 우측 상단 프로필 👉 **Account Settings** 👉 **Authentication(Login Connections)** 에서 기존 GitHub 연동을 끊고 다시 연결(`Connect`)한 뒤, 프로젝트 설정에서 레포지토리를 다시 매핑해줌. 급할 때는 `npx vercel --prod` 로 로컬 강제 배포 가능.
