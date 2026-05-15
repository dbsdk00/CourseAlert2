# UI Design System Guide

CourseAlert의 프리미엄 미니멀 디자인 가이드입니다.

## 1. Interaction Styles
* **Input/Select Hover**: `border: 1px solid rgba(212, 175, 55, 0.3)`. 부드러운 반응을 위해 `transition: 0.15s` 적용.
* **Input/Select Focus**: `border: 1px solid #d4af37`. 배경색은 `#1e1e1e` 고정.
* **Button Styles**:
  - `btn-register`: 옐로우 배경, 화이트 텍스트 (주요 액션)
  - `btn-direct-link`: 다크 배경, 톤 다운된 텍스트 (보조 액션)

## 2. Global Styling
* **No Borders**: 기본적으로 모든 패널과 요소는 테두리가 없음 (`border: none`). 상호작용 시에만 테두리가 나타남.
* **Header Boundary**: 고정 헤더 하단에만 실선(`1px solid #2a2a2a`)을 사용하여 콘텐츠와 구분함.
* **Panel Radius**: 메인 패널은 `20px`, 리스트 아이템은 `12px`의 곡률을 사용함.

## 3. UI Tokens (Hex Codes)
* **Gold**: `#d4af37`
* **Red (Alert)**: `#fb7185` (톤 다운된 레드)
* **Green (Status)**: `#4ade80` (톤 다운된 그린)
* **Main Dark**: `#0a0a0a`
* **Panel Dark**: `#161616`
