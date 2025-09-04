# My Miracle Day — 3 in 1 워크스페이스 서비스📆

할 일(To-do) · 캘린더 · 메모를 통합한 워크스페이스

## 🧭 Project Overview

My Miracle Day는 개인 생산성을 위한 올인원 웹 서비스입니다.
나의 일정을 캘린더에 저장하고, 중요한 태스크를 체크하며, 기가 막힌 아이디어나 중요한 일들을 적어두는 메모까지!
모두 한 화면에서 편리하게 다룰 수 있습니다. My Miracle Day의 데이터는 LocalStorage 기반으로 저장되어 언제나 확인할 수 있습니다.

## 🎯 Project Motivation

복잡한 툴 대신, 빠른 입력 → 즉시 반영 → 바로 실행의 사이클을 만들고 싶었습니다.
무거운 동기화나 팀 협업 기능보다, 개인의 루틴을 견고하게 만드는 기본기에 집중했습니다.

## 🛠 Tech Stack

**Frontend**  
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)


**UI**  
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge)
![lucide-react](https://img.shields.io/badge/lucide--react-18181B?style=for-the-badge&logo=lucide&logoColor=white)


**State & Storage**  
![React Context](https://img.shields.io/badge/React%20Context-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![LocalStorage](https://img.shields.io/badge/LocalStorage-9E9E9E?style=for-the-badge)


**UX**  
![cmdk](https://img.shields.io/badge/cmdk-111827?style=for-the-badge)
![date-fns](https://img.shields.io/badge/date--fns-008F62?style=for-the-badge&logo=date-fns&logoColor=white)
![motion/react](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![sonner](https://img.shields.io/badge/sonner-0F172A?style=for-the-badge)


**Deploy**  
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)


## ✨ Key Features
### 1) 대시보드 (Dashboard)

오늘 날짜/인사, 주요 지표(완료율, 이번 주 진행률, 지연된 할 일, 메모 수)

이번 주 다가오는 일정, 오늘의 할 일, 최근 메모를 한눈에

### 2) 할 일 (Tasks)

CRUD, 우선순위(P1/P2/P3), 상태(todo/in-progress/done), 태그, 마감일

필터/검색(텍스트, 태그, 우선순위, 상태)

칸반 보드(상태별 칼럼), Today/Overdue 뷰

리스트에서 원클릭 상태 토글, 지연 항목 하이라이트

### 3) 캘린더 (Calendar)

월/주/일 3가지 뷰

클릭만으로 빠른 일정 추가/수정(다이얼로그)

색상 태그로 일정 구분, 주간 뷰 시간 그리드, 일간 상세 카드

일간 뷰에서 마감 예정 할 일 함께 확인

### 4) 메모 (Notes)

태그 필터, 고정(Pin), 최신순 정렬

로컬 초안 → 저장 시 실제 추가(빈 메모 방지)

간단 마크다운 미리보기(볼드/이탤릭/코드/헤딩/리스트)

자동 저장(편집 중 딜레이 저장)

### 5) 명령 팔레트 (Cmd/Ctrl + K)

페이지 이동(대시보드/할 일/캘린더/메모/설정)

빠른 추가(할 일/일정/메모)

테마 전환(라이트/다크/시스템)

전역 검색: 할 일/일정/메모 통합 검색 & 즉시 이동

### 6) 설정 (Settings)

테마(라이트/다크/시스템), 포커스 모드(애니메이션 최소화)

시작 페이지(대시보드/할 일), 주 시작 요일(일/월), 시간 형식(12/24h)

데이터 관리: JSON 내보내기/가져오기, 전체 초기화

## ⌨️ Keyboard Shortcuts

| 액션        | 단축키        |
| --------- | ---------- |
| 명령 팔레트 열기 | ⌘/Ctrl + K |
| 새 할 일     | ⌘/Ctrl + T |
| 새 일정      | ⌘/Ctrl + E |
| 새 메모      | ⌘/Ctrl + N |

