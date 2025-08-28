import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp, Event } from '../App';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
  isToday,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ko } from 'date-fns/locale';

type ViewType = 'month' | 'week' | 'day';

const eventColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export default function Calendar() {
  const { events, tasks, addEvent, updateEvent, deleteEvent } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get events for display
  const displayEvents = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    switch (view) {
      case 'month':
        startDate = startOfWeek(startOfMonth(currentDate));
        endDate = endOfWeek(endOfMonth(currentDate));
        break;
      case 'week':
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
        break;
      case 'day':
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
        break;
    }

    return events.filter(event => {
      const eventStart = parseISO(event.startDate);
      return eventStart >= startDate && eventStart <= endDate;
    });
  }, [events, currentDate, view]);

  // Get tasks with due dates for calendar display
  const tasksWithDueDates = useMemo(() => {
    return tasks.filter(task => task.dueDate && task.status !== 'done');
  }, [tasks]);

  const navigate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
        break;
    }
  };

  const handleAddEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    addEvent(eventData);
    setIsAddDialogOpen(false);
    setSelectedDate(null);
  };

  const handleEditEvent = (eventData: Partial<Event>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      setEditingEvent(null);
    }
  };

  const EventForm = ({ 
    event, 
    initialDate,
    onSubmit, 
    onCancel 
  }: { 
    event?: Event;
    initialDate?: Date;
    onSubmit: (data: any) => void; 
    onCancel: () => void;
  }) => {
    const defaultStart = initialDate || new Date();
    const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);

    const [formData, setFormData] = useState({
      title: event?.title || '',
      description: event?.description || '',
      location: event?.location || '',
      startDate: event?.startDate || defaultStart.toISOString().slice(0, 16),
      endDate: event?.endDate || defaultEnd.toISOString().slice(0, 16),
      color: event?.color || eventColors[0],
      tags: event?.tags.join(', ') || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      onSubmit({
        ...formData,
        tags,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="일정 제목을 입력하세요"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="일정에 대한 설명을 입력하세요"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="location">장소</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="장소를 입력하세요"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">시작 시간</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="endDate">종료 시간</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="color">색상</Label>
          <div className="flex gap-2 mt-2">
            {eventColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-foreground' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
              />
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="업무, 개인, 중요"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          {event && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => {
                deleteEvent(event.id);
                onCancel();
              }}
            >
              삭제
            </Button>
          )}
          <Button type="submit">
            {event ? '수정' : '추가'}
          </Button>
        </div>
      </form>
    );
  };

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {/* Header */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="bg-card p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        
        {/* Calendar Grid */}
        {days.map((day) => {
          const dayEvents = displayEvents.filter(event => 
            isSameDay(parseISO(event.startDate), day)
          );
          const dayTasks = tasksWithDueDates.filter(task => 
            task.dueDate && isSameDay(parseISO(task.dueDate), day)
          );

          return (
            <motion.div
              key={day.toISOString()}
              className={`bg-card p-2 min-h-[120px] cursor-pointer hover:bg-accent transition-colors ${
                !isSameMonth(day, currentDate) ? 'opacity-50' : ''
              } ${isToday(day) ? 'ring-2 ring-primary ring-inset' : ''}`}
              onClick={() => {
                setSelectedDate(day);
                setIsAddDialogOpen(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium mb-1">
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: event.color, color: 'white' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingEvent(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                
                {dayTasks.slice(0, 1).map((task) => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded truncate bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  >
                    📋 {task.title}
                  </div>
                ))}
                
                {(dayEvents.length + dayTasks.length) > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{(dayEvents.length + dayTasks.length) - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const WeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ 
      start: weekStart, 
      end: endOfWeek(currentDate) 
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-8 gap-px bg-border rounded-t-lg overflow-hidden">
          <div className="bg-card p-2"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className={`bg-card p-2 text-center text-sm font-medium ${isToday(day) ? 'bg-primary text-primary-foreground' : ''}`}>
              <div>{format(day, 'EEE', { locale: ko })}</div>
              <div className="text-lg">{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-8 bg-border rounded-b-lg overflow-hidden max-h-96 overflow-y-auto">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="bg-card p-2 text-xs text-muted-foreground border-r">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((day) => {
                const hourEvents = displayEvents.filter(event => {
                  const eventStart = parseISO(event.startDate);
                  return isSameDay(eventStart, day) && eventStart.getHours() === hour;
                });

                return (
                  <div 
                    key={`${day.toISOString()}-${hour}`}
                    className="bg-card p-1 border-r border-b min-h-[50px] cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => {
                      const clickedDate = new Date(day);
                      clickedDate.setHours(hour, 0, 0, 0);
                      setSelectedDate(clickedDate);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded mb-1 truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: event.color, color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const DayView = () => {
    const dayEvents = displayEvents.filter(event => 
      isSameDay(parseISO(event.startDate), currentDate)
    ).sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

    const dayTasks = tasksWithDueDates.filter(task => 
      task.dueDate && isSameDay(parseISO(task.dueDate), currentDate)
    );

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>일정 ({dayEvents.length})</span>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDate(currentDate);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                일정 추가
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>오늘 일정이 없습니다</p>
              </div>
            ) : (
              dayEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setEditingEvent(event)}
                >
                  <div 
                    className="w-4 h-4 rounded-full mt-0.5"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {format(parseISO(event.startDate), 'HH:mm')} - {format(parseISO(event.endDate), 'HH:mm')}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {dayTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>마감 예정 할 일 ({dayTasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dayTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-2 p-2 rounded-lg border">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span className="text-sm">{task.title}</span>
                  <Badge variant={task.priority === 'P1' ? 'destructive' : 
                               task.priority === 'P2' ? 'default' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const getViewTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'yyyy년 M월', { locale: ko });
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'M월 d일')} - ${format(weekEnd, 'M월 d일', { locale: ko })}`;
      case 'day':
        return format(currentDate, 'M월 d일 EEEE', { locale: ko });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">{getViewTitle()}</h1>
            <Button variant="outline" size="sm" onClick={() => navigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            오늘
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={view} onValueChange={(value: ViewType) => setView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">월</SelectItem>
              <SelectItem value="week">주</SelectItem>
              <SelectItem value="day">일</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                일정 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 일정 추가</DialogTitle>
                <DialogDescription>제목과 시간을 입력한 뒤 추가를 누르세요.</DialogDescription>
              </DialogHeader>
              <EventForm 
                initialDate={selectedDate || currentDate}
                onSubmit={handleAddEvent}
                onCancel={() => {
                  setIsAddDialogOpen(false);
                  setSelectedDate(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Views */}
      <Card>
        <CardContent className="p-4">
          {view === 'month' && <MonthView />}
          {view === 'week' && <WeekView />}
          {view === 'day' && <DayView />}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>일정 수정</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <EventForm 
              event={editingEvent}
              onSubmit={handleEditEvent}
              onCancel={() => setEditingEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}