# 워크스페이스 서비스 (To-do, Calendar, Memo)

## 시스템 아키텍처

### 컴포넌트 다이어그램

graph LR
  %% Hosting & Load
  Vercel[(Vercel Static Hosting)] -->|serves| Browser[사용자 브라우저]
  Browser -->|loads| SPA["SPA (React + Vite 번들)"]

  %% SPA 내부 구성
  subgraph App["브라우저 내 SPA"]
    direction LR

    subgraph UI["UI Layer"]
      Tailwind[Tailwind CSS]
      Radix["Radix/shadcn UI"]
      Lucide[lucide-react 아이콘]
      Motion["motion/react 애니메이션"]
      Sonner["sonner 토스트"]
    end

    subgraph Features["Feature Screens (React Router)"]
      Dashboard[Dashboard]
      Tasks[Tasks]
      Calendar[Calendar]
      Notes[Notes]
      Settings[Settings]
      CmdPalette["CommandPalette (⌘/Ctrl+K)"]
      SideBar[Sidebar]
    end

    subgraph State["AppContext (React Context API)"]
      CRUD["CRUD: add/update/delete"]
      Search[searchItems]
      Theme["next-themes + prefers-color-scheme"]
      DateFns["date-fns 유틸"]
    end

    Storage[(LocalStorage)]
  end

  %% 흐름
  UI --> Features
  Features --> State
  CmdPalette --> State
  SideBar --> State
  State <--> Storage

  sequenceDiagram
  participant U as User
  participant B as Browser
  participant V as Vercel CDN
  participant SPA as React App(AppProvider)
  participant LS as LocalStorage
  participant R as React Router

  U->>B: 앱 주소 접속
  B->>V: 정적 자산 요청(HTML/CSS/JS)
  V-->>B: 번들 응답
  B->>SPA: JS 번들 부팅
  SPA->>LS: tasks/events/notes/settings 로드
  LS-->>SPA: JSON 상태 반환
  SPA->>R: startPage 라우팅(Dashboard/Tasks 등)
  U->>SPA: 작업 추가/수정/삭제
  SPA->>LS: 상태 변경 영속화
  U->>SPA: 테마 변경(light/dark/system)
  SPA->>B: &lt;html&gt;에 .dark 토글(또는 시스템 추종)

classDiagram
  class Task {
    +string id
    +string title
    +string description
    +string[] tags
    +priority priority (P1|P2|P3)
    +status status (todo|in-progress|done)
    +string dueDate
    +string createdAt
    +string updatedAt
    +boolean isRecurring
    +recurringType recurringType (daily|weekly|monthly)
  }

  class Event {
    +string id
    +string title
    +string description
    +string location
    +string startDate
    +string endDate
    +string[] tags
    +string color
    +boolean isRecurring
    +recurringType recurringType (daily|weekly|monthly)
    +string createdAt
    +string updatedAt
  }

  class Note {
    +string id
    +string title
    +string content
    +string[] tags
    +boolean isPinned
    +string createdAt
    +string updatedAt
  }

  class AppSettings {
    +theme theme (light|dark|system)
    +startPage startPage (dashboard|tasks)
    +int weekStartsOn (0|1)
    +timeFormat timeFormat (12|24)
    +boolean focusMode
  }
