<<<<<<< HEAD
# 워크스페이스 서비스(To-do, Calendar, Memo)
=======
#워크스페이스(To-do, Calendar, Memo)
>>>>>>> e1dca4b (chore: add vercel SPA rewrite + local changes)
graph LR
  %% Hosting & Load
  Vercel[(Vercel Static Hosting)] -->|serves| Browser[사용자 브라우저]
  Browser -->|loads| SPA[SPA (React + Vite 번들)]

  %% SPA 내부 구성
  subgraph App["브라우저 내 SPA"]
    direction LR

    subgraph UI["UI Layer"]
      Tailwind[Tailwind CSS]
      Radix[Radix/shadcn UI (Radix Primitives)]
      Lucide[lucide-react 아이콘]
      Motion[motion/react 애니메이션]
      Sonner[sonner 토스트]
    end

    subgraph Features["Feature Screens (React Router)"]
      Dashboard[Dashboard]
      Tasks[Tasks]
      Calendar[Calendar]
      Notes[Notes]
      Settings[Settings]
      CmdPalette[CommandPalette (⌘/Ctrl+K)]
      SideBar[Sidebar]
    end

    subgraph State["AppContext (React Context API)"]
      CRUD[CRUD: add/update/delete]
      Search[searchItems]
      Theme[next-themes + prefers-color-scheme]
      DateFns[date-fns 유틸]
    end

    Storage[(LocalStorage)]
  end

  %% 흐름
  UI --> Features
  Features --> State
  CmdPalette --> State
  SideBar --> State
  State <--> Storage
