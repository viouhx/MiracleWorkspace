import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Plus, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  StickyNote,
  TrendingUp,
  Clock,
  Pin,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { useApp } from '../App';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Dashboard() {
  const { tasks, events, notes, updateTask } = useApp();

  // Calculate today's tasks
  const todaysTasks = useMemo(() => {
    return tasks.filter(task => 
      task.dueDate && isToday(parseISO(task.dueDate)) && task.status !== 'done'
    ).sort((a, b) => {
      const priorityOrder = { P1: 3, P2: 2, P3: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [tasks]);

  // Calculate upcoming events (this week)
  const upcomingEvents = useMemo(() => {
    return events.filter(event => 
      isThisWeek(parseISO(event.startDate))
    ).sort((a, b) => 
      parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
    ).slice(0, 5);
  }, [events]);

  // Calculate recent notes
  const recentNotes = useMemo(() => {
    const pinnedNotes = notes.filter(note => note.isPinned)
      .sort((a, b) => parseISO(b.updatedAt).getTime() - parseISO(a.updatedAt).getTime());
    
    const regularNotes = notes.filter(note => !note.isPinned)
      .sort((a, b) => parseISO(b.updatedAt).getTime() - parseISO(a.updatedAt).getTime())
      .slice(0, 5 - pinnedNotes.length);

    return [...pinnedNotes, ...regularNotes];
  }, [notes]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const thisWeekTasks = tasks.filter(task => 
      task.dueDate && isThisWeek(parseISO(task.dueDate))
    );
    const thisWeekCompleted = thisWeekTasks.filter(task => task.status === 'done').length;
    const thisWeekRate = thisWeekTasks.length > 0 ? (thisWeekCompleted / thisWeekTasks.length) * 100 : 0;

    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      parseISO(task.dueDate) < new Date() && 
      task.status !== 'done'
    ).length;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      thisWeekRate,
      overdueTasks,
      totalNotes: notes.length,
      totalEvents: events.length
    };
  }, [tasks, events, notes]);

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    updateTask(taskId, { 
      status: completed ? 'done' : 'todo',
      updatedAt: new Date().toISOString()
    });
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? '좋은 아침입니다!' : 
                  now.getHours() < 18 ? '활기찬 오후입니다!' : '편안한 저녁 되세요!';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{greeting}</h1>
          <p className="text-muted-foreground">
            {format(now, 'PPPP', { locale: ko })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 완료율</p>
                <p className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">이번 주</p>
                <p className="text-2xl font-bold">{stats.thisWeekRate.toFixed(0)}%</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={stats.thisWeekRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">지연된 할 일</p>
                <p className="text-2xl font-bold text-red-500">{stats.overdueTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">메모</p>
                <p className="text-2xl font-bold">{stats.totalNotes}</p>
              </div>
              <StickyNote className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">오늘의 할 일</CardTitle>
            <Link to="/tasks">
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="mx-auto h-12 w-12 mb-2 opacity-20" />
                <p>오늘 할 일이 없습니다</p>
              </div>
            ) : (
              todaysTasks.slice(0, 5).map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Checkbox
                    id={task.id}
                    checked={task.status === 'done'}
                    onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <Badge variant={task.priority === 'P1' ? 'destructive' : 
                                   task.priority === 'P2' ? 'default' : 'secondary'}
                             className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            {todaysTasks.length > 5 && (
              <Link to="/tasks" className="block">
                <Button variant="ghost" className="w-full text-sm">
                  {todaysTasks.length - 5}개 더 보기
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">다가오는 일정</CardTitle>
            <Link to="/calendar">
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 mb-2 opacity-20" />
                <p>이번 주 일정이 없습니다</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div 
                    className="w-3 h-3 rounded-full mt-1.5"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.startDate), 'M/d', { locale: ko })}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(event.startDate), 'HH:mm', { locale: ko })} - {format(parseISO(event.endDate), 'HH:mm', { locale: ko })}
                    </p>
                    {event.location && (
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">최근 메모</CardTitle>
            <Link to="/notes">
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <StickyNote className="mx-auto h-12 w-12 mb-2 opacity-20" />
                <p>메모가 없습니다</p>
              </div>
            ) : (
              recentNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{note.title}</p>
                        {note.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {note.content.replace(/[#*`]/g, '').substring(0, 80)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(note.updatedAt), 'M/d HH:mm', { locale: ko })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}