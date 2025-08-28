import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Home, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  StickyNote, 
  Settings,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../App';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navItems = [
  { path: '/', icon: Home, label: '대시보드' },
  { path: '/tasks', icon: CheckSquare, label: '할 일' },
  { path: '/calendar', icon: CalendarIcon, label: '캘린더' },
  { path: '/notes', icon: StickyNote, label: '메모' },
  { path: '/settings', icon: Settings, label: '설정' },
];

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export default function Sidebar() {
  const location = useLocation();
  const { settings, updateSettings } = useApp();

  const ThemeIcon = themeIcons[settings.theme];

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col"
    >
      <div className="mb-8">
        <h1 className="text-xl font-semibold">My Miracle Day</h1>
        <p className="text-sm text-muted-foreground">올인원 워크스페이스</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">테마</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <ThemeIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>라이트</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>다크</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>시스템</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.aside>
  );
}