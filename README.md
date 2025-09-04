# My Miracle Day — 3 in 1 워크스페이스 서비스<img width="10" height="10" alt="image" src="https://github.com/user-attachments/assets/4cc4a72b-bc4e-4c60-bb26-2397b07cf2c0" />

로컬에서 돌아가는 할 일(To-do) · 캘린더 · 메모를 통합한 워크스페이스

## 🧭 Project Overview

My Miracle Day는 개인 생산성을 위한 올인원 웹 앱입니다.
하루 일정을 캘린더로 훑고, 중요한 태스크를 체크하며, 필요한 아이디어를 메모까지—모두 한 화면 흐름으로 다룹니다. 데이터는 LocalStorage 기반으로 저장되어 가볍고 즉각적입니다.

## 🎯 Project Motivation

복잡한 툴 대신, 빠른 입력 → 즉시 반영 → 바로 실행의 사이클을 만들고 싶었습니다.
무거운 동기화나 팀 협업 기능보다, 개인의 루틴을 견고하게 만드는 기본기에 집중했습니다.

명령 팔레트(Cmd/Ctrl + K)로 즉시 전환/추가

로컬 퍼스트(Local-first) 저장으로 지연 없는 반응성

키보드 중심 UX와 최소한의 애니메이션(포커스 모드)

## 🛠 Tech Stack

Frontend: React, TypeScript, Vite, React Router

UI: Tailwind CSS, Radix UI Primitives, shadcn/ui 패턴, lucide-react

State & Storage: React Context, LocalStorage

UX: cmdk(명령 팔레트), date-fns(날짜 유틸), motion/react(애니메이션), sonner(토스트)

Deploy: Vercel (✔️ vercel.json SPA rewrite 포함)

## ✨ Key Features
1) 대시보드 (Dashboard)

오늘 날짜/인사, 주요 지표(완료율, 이번 주 진행률, 지연된 할 일, 메모 수)

이번 주 다가오는 일정, 오늘의 할 일, 최근 메모를 한눈에

2) 할 일 (Tasks)

CRUD, 우선순위(P1/P2/P3), 상태(todo/in-progress/done), 태그, 마감일

필터/검색(텍스트, 태그, 우선순위, 상태)

칸반 보드(상태별 칼럼), Today/Overdue 뷰

리스트에서 원클릭 상태 토글, 지연 항목 하이라이트

3) 캘린더 (Calendar)

월/주/일 3가지 뷰

클릭만으로 빠른 일정 추가/수정(다이얼로그)

색상 태그로 일정 구분, 주간 뷰 시간 그리드, 일간 상세 카드

일간 뷰에서 마감 예정 할 일 함께 확인

4) 메모 (Notes)

태그 필터, 고정(Pin), 최신순 정렬

로컬 초안 → 저장 시 실제 추가(빈 메모 방지)

간단 마크다운 미리보기(볼드/이탤릭/코드/헤딩/리스트)

자동 저장(편집 중 딜레이 저장)

5) 명령 팔레트 (Cmd/Ctrl + K)

페이지 이동(대시보드/할 일/캘린더/메모/설정)

빠른 추가(할 일/일정/메모)

테마 전환(라이트/다크/시스템)

전역 검색: 할 일/일정/메모 통합 검색 & 즉시 이동

6) 설정 (Settings)

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

