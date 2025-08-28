import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  StickyNote, 
  CheckSquare,
  Settings,
  Moon,
  Sun,
  Monitor,
  Hash,
  Clock
} from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { Badge } from './ui/badge';
import { useApp } from '../App';

interface CommandAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  action: () => void;
  group: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { searchItems, updateSettings, settings, addTask, addEvent, addNote } = useApp();

  // Toggle command palette with Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const commands: CommandAction[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: '대시보드로 이동',
      icon: CheckSquare,
      action: () => {
        navigate('/');
        setOpen(false);
      },
      group: '네비게이션'
    },
    {
      id: 'nav-tasks',
      label: '할 일로 이동',
      icon: CheckSquare,
      action: () => {
        navigate('/tasks');
        setOpen(false);
      },
      group: '네비게이션'
    },
    {
      id: 'nav-calendar',
      label: '캘린더로 이동',
      icon: CalendarIcon,
      action: () => {
        navigate('/calendar');
        setOpen(false);
      },
      group: '네비게이션'
    },
    {
      id: 'nav-notes',
      label: '메모로 이동',
      icon: StickyNote,
      action: () => {
        navigate('/notes');
        setOpen(false);
      },
      group: '네비게이션'
    },
    {
      id: 'nav-settings',
      label: '설정으로 이동',
      icon: Settings,
      action: () => {
        navigate('/settings');
        setOpen(false);
      },
      group: '네비게이션'
    },
    // Quick Actions
    {
      id: 'add-task',
      label: '할 일 추가',
      icon: Plus,
      action: () => {
        addTask({
          title: '새 할 일',
          description: '',
          tags: [],
          priority: 'P2',
          status: 'todo'
        });
        navigate('/tasks');
        setOpen(false);
      },
      group: '빠른 작업'
    },
    {
      id: 'add-event',
      label: '일정 추가',
      icon: CalendarIcon,
      action: () => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        addEvent({
          title: '새 일정',
          description: '',
          startDate: now.toISOString(),
          endDate: oneHourLater.toISOString(),
          tags: [],
          color: '#3b82f6'
        });
        navigate('/calendar');
        setOpen(false);
      },
      group: '빠른 작업'
    },
    {
      id: 'add-note',
      label: '메모 추가',
      icon: StickyNote,
      action: () => {
        addNote({
          title: '새 메모',
          content: '',
          tags: [],
          isPinned: false
        });
        navigate('/notes');
        setOpen(false);
      },
      group: '빠른 작업'
    },
    // Theme
    {
      id: 'theme-light',
      label: '라이트 모드',
      icon: Sun,
      action: () => {
        updateSettings({ theme: 'light' });
        setOpen(false);
      },
      group: '테마'
    },
    {
      id: 'theme-dark',
      label: '다크 모드',
      icon: Moon,
      action: () => {
        updateSettings({ theme: 'dark' });
        setOpen(false);
      },
      group: '테마'
    },
    {
      id: 'theme-system',
      label: '시스템 테마',
      icon: Monitor,
      action: () => {
        updateSettings({ theme: 'system' });
        setOpen(false);
      },
      group: '테마'
    },
  ];

  const searchResults = search ? searchItems(search) : { tasks: [], events: [], notes: [] };
  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const hasResults = searchResults.tasks.length > 0 || 
                    searchResults.events.length > 0 || 
                    searchResults.notes.length > 0 ||
                    filteredCommands.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="검색하거나 명령을 입력하세요..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {!hasResults && <CommandEmpty>결과가 없습니다.</CommandEmpty>}
        
        {/* Search Results */}
        {search && (
          <>
            {searchResults.tasks.length > 0 && (
              <CommandGroup heading="할 일">
                {searchResults.tasks.slice(0, 5).map((task) => (
                  <CommandItem
                    key={task.id}
                    onSelect={() => {
                      navigate('/tasks');
                      setOpen(false);
                    }}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{task.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchResults.events.length > 0 && (
              <CommandGroup heading="일정">
                {searchResults.events.slice(0, 5).map((event) => (
                  <CommandItem
                    key={event.id}
                    onSelect={() => {
                      navigate('/calendar');
                      setOpen(false);
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{event.title}</span>
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-xs text-muted-foreground">
                          {event.location}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchResults.notes.length > 0 && (
              <CommandGroup heading="메모">
                {searchResults.notes.slice(0, 5).map((note) => (
                  <CommandItem
                    key={note.id}
                    onSelect={() => {
                      navigate('/notes');
                      setOpen(false);
                    }}
                  >
                    <StickyNote className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{note.title}</span>
                        {note.isPinned && (
                          <Badge variant="outline" className="text-xs">
                            고정됨
                          </Badge>
                        )}
                      </div>
                      {note.content && (
                        <p className="text-xs text-muted-foreground truncate">
                          {note.content.replace(/[#*`]/g, '').substring(0, 50)}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {(searchResults.tasks.length > 0 || searchResults.events.length > 0 || searchResults.notes.length > 0) && filteredCommands.length > 0 && (
              <CommandSeparator />
            )}
          </>
        )}

        {/* Commands */}
        {filteredCommands.length > 0 && (
          <>
            {Object.entries(
              filteredCommands.reduce((groups, cmd) => {
                if (!groups[cmd.group]) groups[cmd.group] = [];
                groups[cmd.group].push(cmd);
                return groups;
              }, {} as Record<string, CommandAction[]>)
            ).map(([group, commands]) => (
              <CommandGroup key={group} heading={group}>
                {commands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <CommandItem
                      key={command.id}
                      onSelect={command.action}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{command.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </>
        )}

        {/* Show all commands when no search */}
        {!search && (
          <>
            {Object.entries(
              commands.reduce((groups, cmd) => {
                if (!groups[cmd.group]) groups[cmd.group] = [];
                groups[cmd.group].push(cmd);
                return groups;
              }, {} as Record<string, CommandAction[]>)
            ).map(([group, commands]) => (
              <CommandGroup key={group} heading={group}>
                {commands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <CommandItem
                      key={command.id}
                      onSelect={command.action}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{command.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}